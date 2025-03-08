const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const jwt_check = require('../../utils/jwt_check');
const notifs = require('../../utils/notifs');

//Connect to db
let connection = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'leducanh2004',
  database: 'matcha'
});

connection.connect(function (err) {
  if (err) throw err;
});

router.post('/', (req, res) => {

  const user = jwt_check.getUsersInfos(req.headers.authorization);
  if (user.id === -1) {
    return res.status(401).json({ error: 'unauthorized access' });
  }

  let response = {
    liked: req.body.liked
  };
  let errors = {};

  if (typeof response.liked === 'undefined' || response.liked === "") {
    errors = {
      ...errors,
      liked: "Utilisateur requis"
    };
    return res.status(400).json(errors);
  }

  //Check if 2 users are the same
  if (user.id === response.liked) {
    errors = {
      ...errors,
      liked: "Không thể thích chính mình"
    };
    return res.status(400).json(errors);
  }

  //Check if user has profile pic
  let sql = "Select profile_pic from infos " +
    `WHERE user_id = ?;`;
  connection.query(sql, [user.id], (err, mypic) => {
    if (err) throw err;
    if (mypic[0].profile_pic === "/photos/default.png") {
      return res.status(400).json({
        liked: "Bạn phải có ảnh đại diện mới được thả tym nha!"
      });
    }
    //Check if liked exists
    sql = `SELECT u.id, u.username, i.profile_pic  from users u INNER JOIN infos i ON u.id = i.user_id WHERE id = ?`;
    connection.query(sql, [response.liked], (err, result0) => {
      if (result0 && result0.length === 0) {
        errors = {
          ...errors,
          liked: "Người dùng này không tồn tại nha!"
        };
        return res.status(400).json(errors);
      }
      if (result0 && result0[0].profile_pic === '/photos/default.png') {
        errors = {
          ...errors,
          liked: "Bạn không thể thích người không có ảnh đại diện đâu!"
        };
        return res.status(400).json(errors);
      }
      sql = `SELECT * FROM likes WHERE liked_id = ? AND liker_id = ?`;
      connection.query(sql, [user.id, response.liked], (err, result) => {
        if (err) throw err;
        const is_liked = (!!result.length);

        //Check if already liked
        sql = `SELECT * FROM likes WHERE liker_id = ? AND liked_id = ?`;
        connection.query(sql, [user.id, response.liked], (err, result) => {
          if (result && result.length !== 0) { //If already liked, unlike
            sql = `DELETE FROM likes WHERE liker_id = ? AND liked_id = ?`;
            connection.query(sql, [user.id, response.liked], (err, result) => {
              sql = "UPDATE infos SET popularity = popularity - 5 " +
                `WHERE user_id = ?;`;
              connection.query(sql, [response.liked], (err) => {
                if (err) throw err;
                if (is_liked) {
                  notifs.postNotif(response.liked, 'unlike', `${user.username} đã bỏ tym bạn rồi nè`, user.id, user.username);
                }
                return res.json({ like: (is_liked ? "you" : "no") });
              });
            });
          } else {  //Else, like
            sql = `INSERT INTO likes(liker_id, liked_id) VALUES(?, ?)`;
            connection.query(sql, [user.id, response.liked], (err, result) => {
              //Give 5 popularity points when liked
              sql = "UPDATE infos SET popularity = popularity + 5 " +
                `WHERE user_id = ?;`;
              connection.query(sql, [response.liked], (err, resp) => {
                if (err) throw err;
                if (!is_liked)
                  notifs.postNotif(response.liked, 'like', `${user.username} đã thả tym bạn nè!`, user.id, user.username);
                else {
                  notifs.postNotif(response.liked, 'match', `Chúc mừng! Bạn đã match với ${user.username}.`, user.id, user.username);
                  notifs.postNotif(user.id, 'match', `Chúc mừng! Bạn đã match với ${result0[0].username}.`, response.liked, result0[0].username);
                }
                return res.json({ like: (is_liked ? "both" : "me") });
              });
            });
          }
        });
      });
    });
  });
});

module.exports = router;