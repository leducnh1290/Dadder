const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const jwt_check = require('../../utils/jwt_check');

// Connect to db
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

  const sql = "SELECT id, user_id,  type, notifier_name, content, `read` from notifs " +
    `WHERE user_id = ? ORDER BY time DESC ; `;
  connection.query(sql, [user.id], (err, result) => {
    if (err) throw err;
    res.json(result);
  })
});

router.patch('/readAll', (req, res) => {
  const user = jwt_check.getUsersInfos(req.headers.authorization);
  if (user.id === -1) {
    return res.status(401).json({error: 'unauthorized access'});
  }

  const sql = "UPDATE notifs SET `read`=true " +
    `WHERE user_id = ?;`;
  connection.query(sql, [user.id], (err) => {
    if (err) throw err;
    return res.json({});
  })
});

router.patch('/settings', (req, res) => {
  const user = jwt_check.getUsersInfos(req.headers.authorization);
  if (user.id === -1) {
    return res.status(401).json({error: 'unauthorized access'});
  }

  const request = {
    visit: req.body.notifVisit,
    like: req.body.notifLike,
    unlike: req.body.notifUnlike,
    match: req.body.notifMatch,
    message: req.body.notifMessage,
  };

  if (!request || request.visit === null || request.like === null || request.unlike === null || request.match === null || request.message === null) {
    return res.json({
      outcome: "error",
      message: "Thiếu thông tin"
    })
  }

  const sql = "UPDATE settings " +
    `SET visit = ?, ` + "`like`" + ` = ?, unlike = ?, \`match\` = ?, message = ? `+
    `WHERE user_id = ?;`;
  connection.query(sql, [request.visit, request.like, request.unlike, request.match, request.message, user.id], (err) => {
    if (err) throw err;
    return res.json({
      outcome: "success",
      message: "Cập nhật thành công"
    });
  })
});

router.get('/settings', (req, res) => {
  const user = jwt_check.getUsersInfos(req.headers.authorization);
  if (user.id === -1) {
    return res.status(401).json({error: 'unauthorized access'});
  }

  const sql = "SELECT * from settings " +
      `WHERE user_id = ?;`;
  connection.query(sql, [user.id], (err, result) => {
    if (err) throw err;
    return res.json({
      notifVisit: result[0].visit,
      notifLike: result[0].like,
      notifUnlike: result[0].unlike,
      notifMatch: result[0].match,
      notifMessage: result[0].message
    });
  })
});

module.exports = router;