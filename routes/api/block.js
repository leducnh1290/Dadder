const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const jwt_check = require('../../utils/jwt_check');

//Connect to db
let connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'leducanh2004',
    database: 'matcha'
});

connection.connect(function(err) {
    if (err) throw err
});



router.post('/', (req, res) => {

  const user = jwt_check.getUsersInfos(req.headers.authorization);
  if (user.id === -1) {
    return res.status(401).json({error: 'unauthorized access'});
  }

    let infos = {
        blocked: req.body.blocked
    }

    let response = {};

    if (typeof infos.blocked == 'undefined' || infos.blocked == "") {
        response = {
            ...response,
            blocked: "Tài khoản bị chặn là bắt buộc"
        };
        return res.status(400).json(response);
    }
    else {
        //Check if 2 users are the same
        if (user.id === infos.blocked) {
            response = {
                ...response,
                blocked: "Bạn không thể chặn chính mình"
            };
            return res.status(400).json(response);
        }
        else {
            //Check if blocked exists
            sql = `SELECT id from users WHERE id = ?`;
            connection.query(sql, [infos.blocked], (err, result) => {
                if (result && result.length == 0) {
                    if (user.id === infos.blocked) {
                        response = {
                            ...response,
                            blocked: "Không tìm thấy người dùng bị chặn"
                        };
                        return res.status(400).json(response);
                    }
                }
                else {
                    //Check if already liked
                    sql = `SELECT * FROM blocks WHERE blocker_id = ? AND blocked_id = ?`;
                    connection.query(sql, [user.id, infos.blocked], (err, result) => {
                        if (result && result.length != 0) { //If already liked, unlike
                            //Check if already blocked
                            sql = `DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?`;
                            connection.query(sql, [user.id, infos.blocked], (err, result) => {
                                res.end("");
                            })
                        }
                        else {  //Else, like
                            sql = `INSERT INTO blocks(blocker_id, blocked_id) VALUES(?, ?)`;
                            connection.query(sql, [user.id, infos.blocked], (err, result) => {
                                res.end("");
                            })
                        }
                    })
                }
            })
        }
    }
});

module.exports = router;
