const express = require('express');
const router = express.Router();

const pw_hash = require('password-hash');
const mysql = require('mysql');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const jwt_check = require('../../utils/jwt_check');
const nodemailer = require('nodemailer');
const mail = require('../../template/email');

// CONNECT TO DATABASE
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

// PRE-REGISTER
router.post('/preregister', (req, res) => {
  let info = {
    email: req.body.email,
    password: req.body.password,
    confirm: req.body.confirm
  };
  let response = {};
  let error = false;

  //Check is password is long and good enough
  if (typeof info.password === 'undefined' || !info.password.match('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,64}$')) {
    response = {
      ...response,
      password: "Mật khẩu phải từ 8 đến 64 ký tự, bao gồm ít nhất 1 chữ hoa và 1 số."
    };
    error = true;
  }

  //Check if passwords are both equal
  else if (typeof info.password === 'undefined' || typeof info.password === 'undefined' || info.password !== info.confirm) {
    response = {
      ...response,
      confirm: "Mật khẩu bạn nhập không khớp."
    };
    error = true;
  }

  //Check if email has right format
  if (typeof info.email === 'undefined' || !info.email.match('^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$')) {
    response = {
      ...response,
      email: "Địa chỉ email không hợp lệ."
    };
    error = true;
  }

  //Send json if there is an error and quit
  if (error === true) {
    res.status(400);
    res.end(JSON.stringify(response));
  } else {
    res.end();
  }
});

function isValidVietnameseName(name) {
  const regex = /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*(?:[ ][A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*)*$/;

  return typeof name === "string" && name.length >= 2 && name.length <= 100 && regex.test(name.trim());
}

// REGISTER
router.post('/register', (req, res) => {
  let info = {
    email: req.body.email,
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    gender: req.body.gender,
    password: req.body.password,
    confirm: req.body.confirm,
    nomail: req.body.nomail
  };
  let response = {};
  let error = false;

  //Check if username is unique
  let sql = `SELECT username from users WHERE username = ?;`;
  connection.query(sql, [info.username],(err, result) => {
    if (err) throw err;
    if (result.length !== 0) {
      response = {
        ...response,
        username: "Đã tồn tại tên người dùng này."
      };
      error = true;
    }

    //Check if username is long enough
    if (typeof info.username === 'undefined' || !info.username.match('^[a-zA-Z0-9]{4,30}$')) {
      response = {
        ...response,
        username: "Username phải từ 4 đến 30 ký tự."
      };
      error = true;
    }

    //Check is password is long and good enough
    if (typeof info.password === 'undefined' || !info.password.match('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,64}$')) {
      response = {
        ...response,
        password: "Mật khẩu phải từ 8 đến 64 ký tự, bao gồm ít nhất 1 chữ hoa và 1 số."
      };
      error = true;
    }

    //Check if passwords are both equal
    else if (typeof info.password === 'undefined' || typeof info.password === 'undefined' || info.password != info.confirm) {
      response = {
        ...response,
        confirm: "Mật khẩu bạn nhập không khớp."
      };
      error = true;
    }

    //Check if gender is either Male or female
    if (typeof info.gender === 'undefined' || info.gender !== 'male' && info.gender !== 'female' && info.gender !== 'other') {
      response = {
        ...response,
        gender: "Giới tính không hợp lệ."
      };
      error = true;
    }

    //Check if both names are incorrect
    if (typeof info.firstName === 'undefined' || typeof info.lastName === 'undefined' || !isValidVietnameseName(info.firstName+" "+info.lastName)) {
      response = {
          ...response,
          name: "Họ và tên không hợp lệ. Tên phải từ 2 đến 30 ký tự, chỉ chứa chữ cái, khoảng trắng, dấu nháy (') hoặc dấu gạch ngang (-)."
      };
      error = true;
  }

    //Check if firstname is correct
    else if (typeof info.firstName === 'undefined' || !isValidVietnameseName(info.firstName)) {
      response = {
        ...response,
        firstName: "Họ không hợp lệ."
      };
      error = true;
    }

    //Check if lastname is correct
    else if (typeof info.lastName === 'undefined' ||!isValidVietnameseName(info.lastName)) {
      response = {
        ...response,
        lastName: "Tên không hợp lệ."
      };
      error = true;
    }

    //Check if email has right format
    if (typeof info.email === 'undefined' || !info.email.match('^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$') || info.email.length > 50) {
      response = {
        ...response,
        email: "Địa chỉ email không hợp lệ."
      };
      error = true;
    }

    //Send json if there is an error and quit
    if (error === true) {
      res.status(400);
      res.end(JSON.stringify(response));
      return;
    }

    //hash pw
    let hashed_pw = pw_hash.generate(info.password);

    //insert user in db
    const sql2 = "INSERT INTO users(username, email, password) " +
      `VALUES(?, ?, ?);`;

    connection.query(sql2, [
      info.username,
      info.email,
      hashed_pw
    ],(err, result) => {
      if (err) throw err;
      const sql3 = "INSERT INTO infos(gender, user_id, popularity, firstName, lastName)" +
        `VALUES(?, ?, 0, ?, ?)`;
      const id = result.insertId;
      connection.query(sql3, [
        info.gender,
        result.insertId,
        info.firstName,
        info.lastName
      ],(err, result) => {
        const code = uuid.v4();
        const content = mail.templateEmail(
          `Yo ${info.username}!`,
          "Check lẹ cái mail liền tay - Xác nhận ngay nè!",
          "Chào mừng bro đến với Dadder!",
          "Cảm ơn bạn đã gia nhập hội Dadder! Để không bỏ lỡ những cú match đỉnh kout, bấm vào link bên dưới để xác nhận email nha!",
          `https://dating.leducanh.name.vn?action=verify-email&id=${id}&code=${code}`
      );
      
        const sql4 = "INSERT INTO verified(user_id, code, status)" +
          `VALUES (?, ?, false);`;
        //Send an email if everything is alright
        connection.query(sql4, [
          id,
          code
        ],(err, result) => {
          if (err) throw err;
          const sql5 = "INSERT INTO connection(user_id) " +
            `VALUES(?);`;
          connection.query(sql5, [id],(err) => {
            if (err) throw err;
            const sql6 = "INSERT INTO settings(user_id) " +
              `VALUES(?);`;
            connection.query(sql6, [id], (err) => {
              if (err) throw err;
              const sql7 = "INSERT INTO photos(user_id) " +
                `VALUES(?);`;
              connection.query(sql7, [id], (err) => {
                if (err) throw err;
                //send mail if everything went fine
                if (!info.nomail) {
                  let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'leducanh1290@gmail.com',
                      pass: 'hvse hrww wuob gzog'
                    }
                  });
                  let mailOptions = {
                    from: 'Ohh bạn vừa đăng ký tài khoản tại Dadder <no-reply@Dadder.com>',
                    to: info.email,
                    subject: 'Xác thực người dùng',
                    html: content
                  };
                  transporter.sendMail(mailOptions);
                }
                res.end(String(id));
              });
            });
          });
        });
      })
    })
  })
});

router.post('/resetPassword', (req, res) => {
  const request = {
    password: req.body.password,
    confirm: req.body.confirm,
    code: req.body.code,
    id: req.body.id
  };
  if (typeof request.code == 'undefined' || request.code === '' || typeof request.id == 'undefined' || request.password === 0) {
    return res.status(400).json({
      password: "Có vẻ như bạn đã bị lạc hãy kiểm tra lại email của mình"
    })
  }

  if ( typeof request.password == 'undefined' || request.password === '' || typeof request.confirm == 'undefined' || request.confirm === '') {
    return res.status(400).json({
      password: "Mật khẩu không được để trống nhé baybi!"
    })
  }

  if (request.password != request.confirm) {
   return res.status(400).json({
     confirm: "Mật khẩu không khớp nhau bạn ơi!"
   })
  }

  if (!request.password.match('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,64}$')) {
    return res.status(400).json({
      password: "Mật khẩu phải từ 8 đến 64 ký tự, bao gồm ít nhất 1 chữ hoa và 1 số chứ không phải đùa đâu!"
    })
  }

  let sql = "SELECT user_id from verified " +
    `WHERE code = ? AND user_id = ?;`;
  connection.query(sql, [
    request.code,
    request.id
  ],(err, result) => {
    if (err) throw err;
    if (!result.length)
      return res.status(400).json({
        password: "Có vẻ như bạn đã bị lạc hãy kiểm tra lại email của mình"
      });
    let hashed_pw = pw_hash.generate(request.password);
    sql = `UPDATE users set password = ? WHERE id = ?;`;
    connection.query(sql, [
      hashed_pw,
      request.id
    ],err => {
      if (err) throw err;
      return res.json();
    })
  })
});

router.post('/forgotPassword', (request, result) => {
  const sql = "SELECT v.code, u.email, u.username, u.id from verified v INNER JOIN users u on v.user_id = u.id " +
    `WHERE email = ?;`;
  connection.query(sql, [
    request.body.email
  ],(err, res) => {
    if (!res.length)
      return result.json();
    if (err) throw err;
    const content = mail.templateEmail(`Bonjour ${res[0].username},`, "Changer mot de passe", "Réinitialiser votre mot de passe ?", "Vous avez demandé à réinitialiser votre mot de passe. Veuillez cliquer sur le bouton ci-dessous. Si vous n'êtes pas à l'origine de cette demande, contactez immédiatement un webmestre.", `http://localhost:3000?action=forgot-password&id=${res[0].id}&code=${res[0].code}`);
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'leducanh1290@gmail.com',
        pass: 'hvse hrww wuob gzog'
      }
    });
    let mailOptions = {
      from: 'Dadder <no-reply@Dadder.com>',
      to: res[0].email,
      subject: 'Ohh fen vừa yêu cầu đổi mật khẩu tại Dadder',
      html: content
    };
    transporter.sendMail(mailOptions);
    return result.json();
  });
});

router.post('/login', (req, res) => {
 
  let info = {
    username: req.body.username,
    password: req.body.password,
    position: req.body.position
  };
  let response = {};
  let error = false;

  if (!info.position || !info.position.latitude || !info.position.longitude || isNaN(info.position.latitude) || isNaN(info.position.longitude)) {
    return res.status(400).json({
      position: "Cho xin cái vị trí đi bạn ơi"
    });}

  //Check if password and username are not empty and defined
    if (typeof info.username == 'undefined' || info.username == "") {
        response = {
            ...response,
            username: "Email hoặc tên đăng nhập là bắt buộc"
        };
        error = true;
    }
    if (typeof info.password == 'undefined' || info.password == "") {
        response = {
            ...response,
            password: "Mật khẩu là bắt buộc"
        };
        error = true;
    }

    //If both fields are full, keep going with the connection
    if (!error) {
        //Check if username matches a user
        let sql = `SELECT u.username, u.password, u.id, u.email, v.status FROM users u INNER JOIN verified v ON u.id = v.user_id WHERE username = ? OR email = ?;`;
        connection.query(sql, [
          info.username,
          info.username
        ],(err, result) => {
            if (err) throw err;
            if (result.length === 0) {
                response = {
                    ...response,
                    login: "Sai tài khoản hoặc mật khẩu rồi bạn ơi suy nghĩ lại đi"
                };
                error = true;
            }
            else if ( result[0].status === 0) {
              response = {
                ...response,
                login: "Tài khoản của bạn chưa được xác thực =] Cay không?"
              };
              error = true;
            }
            //Check if password is wrong
            else if (!pw_hash.verify(info.password, result[0].password)) {
                response = {
                    ...response,
                    login: "Sai tài khoản hoặc mật khẩu rồi bạn ơi suy nghĩ lại đi"
                };
                error = true;
            }
      //if everything is good, connect the guy by creating token
      if (!error) {

        const payload = {
          id: result[0].id,
          email: result[0].email,
          username: result[0].username
        };

        const sql_pos = "UPDATE infos " +
          `SET latitude= ?, longitude= ? ` +
          `WHERE user_id = ? AND address_modified=false;`;

        connection.query(sql_pos, [
          info.position.latitude,
          info.position.longitude,
          result[0].id
        ], (err) => {
          if (err) throw err;
        });
        jwt.sign(payload, 'Mortparequipe', { expiresIn: 21600 }, (err, token) => {
          res.json({
              success: true,
              token
          })
        });

      }
      else {
        res.status(400);
        return res.json(response);
      }
    })
  }
  else {
    res.status(400);
    return res.json(response);
  }
});


router.patch('/password', (req, res) => {
  const user = jwt_check.getUsersInfos(req.headers.authorization);
  if (user.id === -1) {
    return res.status(401).json({error: 'unauthorized access'});
  }
  let res_err = {};
  let error = false;

  const request = {
    old_pw: req.body.oldPassword,
    new_pw: req.body.newPassword,
    re_new: req.body.newConfirm,
  };

  if (typeof request.old_pw == 'undefined' || request.old_pw == '') {
    return res.status(400).json({
      outcome: "error",
      message: "Yêu cầu mật khẩu cũ"
    })
  }
  //Check if old pw is good
  let sql = `SELECT password FROM users WHERE id = ?;`;
  connection.query(sql, [user.id], (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      return res.status(400).json({
        outcome: "error",
        message: "Mât khẩu không đúng"
      });
    }
    //Check if password is wrong
    else if (!pw_hash.verify(request.old_pw, result[0].password)) {
      return res.status(400).json({
        outcome: "error",
        message: "Mât khẩu không đúng"
      });
    }
    if (error)
      return res.status(400).json(res_err);

    if (
      typeof request.new_pw === "undefined" || 
      !request.new_pw.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/)
    ) {
      return res.status(400).json({
        outcome: "error",
        message: "Mật khẩu phải từ 8 đến 64 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 số."
      });
    }    
    if (request.new_pw !== request.re_new) {
      return res.status(400).json({
        outcome: "error",
        message: "Mật khẩu không khớp"
      });
    }
      let hashed_pw = pw_hash.generate(request.new_pw);
      sql = "UPDATE users " +
        `SET password = ? WHERE id = ?;`;
      connection.query(sql, [
        hashed_pw,
        user.id
      ],(err) => {
        if (err) throw err;
        return res.json({
          outcome: "success",
          message: "Mật khẩu đã được thay đổi"
        });
      })
  })
});

router.patch('/email', (req, res) => {
  const user = jwt_check.getUsersInfos(req.headers.authorization);
  if (user.id === -1) {
    return res.status(401).json({error: 'unauthorized access'});
  }

  const new_email = req.body.email;

  //Check if email has right format
  if (typeof new_email === 'undefined' || !new_email.match('^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$') || new_email.length > 50) {
    return res.status(400).json({
      outcome: "error",
      message: "Email không hợp lệ"
    });
  }

  const sql = "UPDATE users " +
    `SET email = ? WHERE id = ?;`;
  connection.query(sql, [
    new_email,
    user.id
  ],(err) => {
    if (err) throw err;
    return res.json({
      outcome: "success",
      message: "Email đã được thay đổi"
    })
  })
});

router.post('/update', (req, res) => {
  const user = jwt_check.getUsersInfos(req.headers.authorization);
  if (user.id === -1) {
    return res.status(401).json({error: 'unauthorized access'});
  }

  const request = {
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    bio: req.body.bio,
    sexuality: req.body.sexuality,
    gender: req.body.gender,
    interests: req.body.interests,
    age: req.body.age,
    latitude: req.body.latitude,
    longitude: req.body.longitude
  };
  let response = {};
  let error = false;

  if (typeof request.sexuality == 'undefined' || (request.sexuality != "bisexual" && request.sexuality != "heterosexual" && request.sexuality != "homosexual")) {
    response = {
      ...response,
      sexuality: "Gu thích không hợp lệ"
    };
    error = true
  }

  if (typeof request.interests == 'undefined') {
    response = {
      ...response,
      interests: "Tags không hợp lệ"
    };
    error = true
  }

  for (let i = 0; i < request.interests.length; i++) {
    if (request.interests[i].name.length > 24) {
      response = {
        ...response,
        interests: "Tags phải ít hơn 24 ký tự"
      };
      error = true
    }
  }

  if (typeof request.age == 'undefined' || request.age == "" || isNaN(request.age) || request.age < 18 || request.age > 99) {
    response = {
      ...response,
      age: "Tuổi không hợp lệ"
    };
    error = true
  }

  //Check if username is unique and different from previous
  let sql = `SELECT username from users WHERE username = ? AND id != ?;`;
  connection.query(sql, [
    request.username,
    user.id
  ],(err, result) => {
    if (err) throw err;
    if (result.length !== 0) {
      response = {
        ...response,
        username: "Tên người dùng đã tồn tại"
      };
      error = true;
    }

    //Check if username is long enough
    if (typeof request.username === 'undefined' || !request.username.match('^[a-zA-Z0-9]{4,30}$')) {
      response = {
        ...response,
        username: "Tên người dùng phải từ 4 đến 30 ký tự."
      };
      error = true;
    }

    //Check if gender is either Male or female
    if (typeof request.gender === 'undefined' || request.gender !== 'male' && request.gender !== 'female' && request.gender !== 'other') {
      response = {
        ...response,
        gender: "Giới tính không hợp lệ."
      };
      error = true;
    }

    //Check if both names are incorrect
    if (!isValidVietnameseName(request.firstName) || !isValidVietnameseName(request.lastName)) {
      response = {
        ...response,
        name: "Họ và tên không hợp lệ"
      };
      error = true;
    }

    //Check if firstname is correct
    else if (typeof request.firstName === 'undefined' || !isValidVietnameseName(request.firstName)) {
      response = {
        ...response,
        firstName: "Họ không hợp lệ."
      };
      error = true;
    }

    //Check if lastname is correct
    else if (typeof request.lastName === 'undefined' || !isValidVietnameseName(request.lastName)) {
      response = {
        ...response,
        lastName: "Tên không hợp lệ."
      };
      error = true;
    }

    else if (typeof request.bio === 'undefined' || !request.bio || request.bio.length === 0 || request.bio.length > 460) {
      response = {
        ...response,
        bio: "Bio không hợp lệ"
      };
      error = true;
    }

    //Send json if there is an error and quit
    if (error === true) {
      res.status(400);
      res.end(JSON.stringify(response));
      return;
    }
    else {
      const sql_user_update = `UPDATE users SET username = ? WHERE id = ?;`;
      connection.query(sql_user_update, [
        request.username,
        user.id
      ],(err) => {
        if (err) throw err;
        let sql_infos_update;
        if (request.latitude && request.longitude && !isNaN(request.latitude) && !isNaN(request.longitude)) {
          sql_infos_update = `UPDATE infos SET gender = ?, age=?, sexuality = ?, bio = ?, firstName = ?, lastName =?, latitude=${request.latitude}, longitude=${request.longitude}, address_modified=1 WHERE user_id = ?;`;}
        else {
          sql_infos_update = `UPDATE infos SET gender = ?, age=?, sexuality = ?, bio = ?, firstName = ?, lastName =? WHERE user_id = ?;`;}
        connection.query(sql_infos_update, [
          request.gender,
          request.age,
          request.sexuality,
          request.bio,
          request.firstName,
          request.lastName,
          user.id
        ],(err) => {
          if (err) throw err;
          const sql_delete_interests = `DELETE FROM interests WHERE user_id = ?;`;
          connection.query(sql_delete_interests, [user.id],(err) => {
            if (err) throw err;
            if (!request.interests.length)
              return res.json();
            for (let i = 0; i < request.interests.length; i++) {
              let sql_add_interest = "INSERT INTO interests(user_id, tag)" +
                ` VALUES(?, ?);`;
              connection.query(sql_add_interest, [
                user.id,
                request.interests[i].name
              ],(err) => {
                if (err) throw err;
                if (i === request.interests.length -1) {
                  return res.json();
                }
              })
            }
          })
        })
      })
    }
  });
});
router.post('/delete', (req, resp) => {
  const user = jwt_check.getUsersInfos(req.headers.authorization);
  if (user.id === -1) {
    return res.status(401).json({error: 'unauthorized access'});
  }

  const pw = req.body.password;
  let sql = "Select password from users " +
      `WHERE id = ?;`;
  connection.query(sql, [user.id],(err, result) => {
    if (err) throw err;
    if (!result || !result[0] || !result[0].password || !pw_hash.verify(pw, result[0].password))
      return resp.status(400).json({
        outcome: "error",
        message: "Mật khẩu không đúng"
      });
    sql = "DELETE users, infos, verified, likes, connection, photos, settings, interests " +
        "FROM users " +
        "LEFT JOIN infos ON users.id = infos.user_id " +
        "LEFT JOIN verified ON users.id = verified.user_id " +
        "LEFT JOIN likes ON users.id = likes.liker_id " +
        "LEFT JOIN connection ON users.id = connection.user_id " +
        "LEFT JOIN photos ON users.id = photos.user_id " +
        "LEFT JOIN settings ON users.id = settings.user_id " +
        "LEFT JOIN interests ON users.id = interests.user_id " +
        `WHERE users.id = ?;`;
    connection.query(sql, [user.id],(err) => {
      if (err) throw err;
      return resp.json({
        outcome: "success",
        message: "Tài khoản đã được xóa"
      });
    })
  })
});

router.get('/getMaxPopAndAge', (req, res) => {
  const sql = "SELECT MAX(popularity) as max_pop, Max(age) as max_age FROM infos";
  connection.query(sql, (err, resp) => {
    if (err) throw err;
    if (resp.length > 0 && resp[0] && resp[0].max_age !== null && resp[0].max_pop !== null)
      return res.json(resp);
    else {
      return res.json([{
        max_pop: 200,
        max_age: 77
      }])
    }
  })
});

router.get('/email', (req, res) => {
  const user = jwt_check.getUsersInfos(req.headers.authorization);
  if (user.id === -1) {
    return res.status(401).json({error: 'unauthorized access'});
  }

  let sql = `SELECT email FROM users WHERE users.id=?`;
  connection.query(sql, [user.id],(err, result) => {
    if (err) throw err;

    return res.json({
      email: result[0].email
    });
  });
});

module.exports = router;