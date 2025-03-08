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


router.get('/', (req, res) => {
  const user = jwt_check.getUsersInfos(req.headers.authorization);
  if (user.id === -1) {
    return res.status(401).json({error: 'unauthorized access'});
  }
  let match_id = req.query.id;
  let response = [];

  if (typeof match_id === 'undefined' || isNaN(match_id) || match_id == 0)
    return res.status(400).json({error: "ID là bắt buộc."});
  const sql = "SELECT id, sender_id, receiver_id, message , DATE_FORMAT(`time`, '%k:%i') AS `date` FROM messages " +
    `WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ` +
    "ORDER BY time DESC;";
  connection.query(sql, [match_id, user.id, user.id, match_id], (err, resp) => {
    if (err) throw err;
    resp.map((message) => {
      response.push({
        ...message,
        whose: (message.sender_id === user.id ? "mine" : "yours")
      })
    });
    return res.json(response);
  })
});

router.post('/', (req, res) => {
  const user = jwt_check.getUsersInfos(req.headers.authorization);
  if (user.id === -1) {
    return res.status(401).json({error: 'unauthorized access'});
  }
  let match_id = req.body.id;
  let message = req.body.message;
  let room = 'r' + (user.id > req.body.id ? (user.id + '-' + match_id) : (match_id + '-' + user.id));

  if (message.length > 256)
    return res.status(400).json({error: "Tin nhắn quá dài"});

  if (typeof match_id === 'undefined' || isNaN(match_id) || match_id == 0 || typeof message === 'undefined' ||  message === '')
    return res.status(400).json({error: "ID và tin nhắn là bắt buộc."});

  let sql = "SELECT id FROM likes " +
    `WHERE (liker_id = ? AND liked_id = ?) OR (liked_id = ? AND liker_id = ?);`;
  connection.query(sql, [match_id, user.id, match_id, user.id], (err, result) => {
    if (err) throw err;
    if (result.length !== 2)
      return res.status(400).json({id: "Bạn không thể gửi tin nhắn cho người chưa thích bạn."});
    sql = "SELECT id from blocks " +
      `WHERE (blocker_id = ? AND blocked_id = ?) OR (blocked_id = ? AND blocker_id = ?);`;
    connection.query(sql, [match_id, user.id, match_id, user.id], (err, result) => {
      if (err) throw err;
      if (result.length)
        return res.status(400).json({id: "Bạn không thể gửi tin nhắn cho người đã chặn bạn."});

      sql = "INSERT INTO messages(sender_id, receiver_id, message, time) " +
        `VALUES(?, ?, ?, now());`;
      connection.query(sql, [user.id, match_id, message], (err, resp) => {
        if (err) throw err;
        io.to(room).emit('newMessage', {
          sender_id: user.id,
          message: message,
          time: new Date(),
        });
        notifs.postNotif(match_id, 'message', `${user.username} đã gửi cho bạn một tin nhắn mới.`, user.id, user.username);
        return res.json({});
      })
    })
  });
});

module.exports = router;