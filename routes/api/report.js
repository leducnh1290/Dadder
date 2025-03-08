const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const mysql = require('mysql');
const jwt_check = require('../../utils/jwt_check');
const mail = require('../../template/email');

//Connect to db
let connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'leducanh2004',
    database: 'matcha'
});

connection.connect(function (err) {
    if (err) throw err
});



router.post('/', (req, res) => {

    const user = jwt_check.getUsersInfos(req.headers.authorization);
    if (user.id === -1) {
        return res.status(401).json({ error: 'unauthorized access' });
    }

    let infos = {
        reported: req.body.reported
    };

    let response = {};

    if (typeof infos.reported === 'undefined' || infos.reported === "") {
        response = {
            ...response,
            reported: "Compte à bloquer requis"
        };
        return res.status(400).json(response);
    }
    else {
        //Check if 2 users are the same
        if (user.id === infos.reported) {
            response = {
                ...response,
                reported: "Vous ne pouvez pas vous bloquer vous-même"
            };
            return res.status(400).json(response);
        }
        else {
            //Check if reported exists
            sql = `SELECT id, username from users WHERE id = ?`;
            connection.query(sql, [infos.reported], (err, result0) => {
                if (result0 && result0.length == 0) {
                    if (user.id === infos.reported) {
                        response = {
                            ...response,
                            reported: "Utilisateur à bloquer non trouvé"
                        };
                        return res.status(400).json(response);
                    }
                }
                else {
                    //Check if already reported
                    sql = `SELECT * FROM reports WHERE reporter_id = ? AND reported_id = ?`;
                    connection.query(sql, [
                        user.id,
                        infos.reported
                    ], (err, result) => {
                        if (result && result.length !== 0) { //If already reported, do nothing
                            res.end();
                        }
                        else {  //Else, report
                            sql = `INSERT INTO reports(reporter_id, reported_id) VALUES(?, ?)`;
                            connection.query(sql, [
                                user.id,
                                infos.reported
                            ], (err, result) => {
                                const content = mail.templateEmail(`Đức Anh,`, "Cảnh báo tài khoản giả mạo", "Đồng chí", `${user.username} vừa F11 đồng chí ${result0[0].username} vì tội giả mạo xem xét ngay ?.`, `https://dating.leducanh.name.vn/profile/${infos.reported}`);
                                let transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: 'leducanh1290@gmail.com',
                                        pass: 'hvse hrww wuob gzog'
                                    }
                                });
                                let mailOptions = {
                                    from: 'Dadder <no-reply@Dadder.com>',
                                    to: 'leducanh1290@gmail.com',
                                    subject: 'Signalement',
                                    html: content
                                };
                                transporter.sendMail(mailOptions);
                                res.end();
                            })
                        }
                    })
                }
            })
        }
    }
});

module.exports = router;