const express = require('express');
const router = express.Router();
const jwt_check = require('../../utils/jwt_check');
const mysql = require('mysql');
const path = require('path');
const photos = require('../../utils/photos');
const fs = require('fs');

//Connect to db
let connection = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'leducanh2004',
  database: 'matcha'
});

const multer = require('multer');
const upload = multer({
  dest: 'client/public/photos',
  limits: {
    fileSize: 5000000
  },
  fileFilter: function (req, file, cb) {
    if (path.extname(file.originalname) !== ".png" && path.extname(file.originalname) !== ".jpg" && path.extname(file.originalname) !== ".jpeg")
      cb(null, false);
    else
      cb(null, true);
  }
});
const uuid = require('uuid');

connection.connect(function (err) {
  if (err) throw err;
});


router.delete('/:pic_nb', (req, res) => {
  const user = jwt_check.getUsersInfos(req.headers.authorization);
  if (user.id === -1) {
    return res.status(401).json({error: 'unauthorized access'});
  }

  if (!req.params.pic_nb || req.params.pic_nb > 5 || isNaN(req.params.pic_nb)) {
    return res.status(400).json({pic_nb: "ID hình không chính xác"});
  }

  let which_pic = parseInt(req.params.pic_nb);
  if (which_pic < 1 && which_pic > 5) {
    which_pic = 5;
  }

  let sql = `SELECT pic${which_pic} as pic FROM photos ` +
    `WHERE user_id = ?;`;
  connection.query(sql, [user.id], (err, pic) => {
    if (err) throw err;
    sql = `UPDATE photos set pic${req.params.pic_nb} = NULL WHERE user_id = ${user.id};`;
    connection.query(sql, (err) => {
      if (pic[0].pic.substring(0, 1) === '/')
        fs.unlink('client/public' + pic[0].pic, () => {
        });
      if (err) throw err;
      let pic_to_del = pic[0].pic;
      sql = `UPDATE infos set profile_pic = '/photos/default.png' WHERE user_id = ? and profile_pic = ?;`;
      connection.query(sql, [user.id, pic_to_del], (err) => {
        if (err) throw err;
        return res.json();
      })
    })
  })
});

router.post('/', upload.single('picture'), (req, res) => {
  const user = jwt_check.getUsersInfos(req.headers.authorization);
  if (user.id === -1) {
    return res.status(401).json({error: 'unauthorized access'});
  }

  if (req.file) {
    const magicNb = fs.readFileSync(req.file.path).toString('hex', 0, 4);
    if (!magicNb.match("ffd8") && magicNb !== "89504e47") {
      fs.unlink(req.file.path, () => {
      });
      return res.status(400).json({
        photo: "Ảnh phải là ảnh JPEG hoặc PNG"
      })
    }
    photos.moveLeftPhotos(user.id)
      .then(pic_nb => {
        if (pic_nb > 5)
          return res.json({
            picture: "Tối đa chỉ được 5 ảnh"
          });
        const sql = "UPDATE photos " +
          `SET pic${pic_nb + 1} = ? WHERE user_id = ?;`;
        connection.query(sql, ['/photos/' + req.file.filename, user.id], (err) => {
          if (err) throw err;
          return res.json();
        })
      });
  } else return res.status(400).json({
    photo: "Lỗi ảnh"
  });
});

router.post('/profile_pic/:pic_nb', (req, res) => {
  const user = jwt_check.getUsersInfos(req.headers.authorization);
  if (user.id === -1) {
    return res.status(401).json({error: 'unauthorized access'});
  }
  if (!req.params.pic_nb || req.params.pic_nb > 5 || isNaN(req.params.pic_nb)) {
    return res.status(400).json({pic_nb: "Số thứ tự ảnh không hợp lệ!"});
}

  let which_pic = parseInt(req.params.pic_nb);
  if (which_pic < 1 && which_pic > 5) {
    which_pic = 5;
  }

  let sql = `SELECT pic${which_pic} as pic FROM photos ` +
    `WHERE user_id = ?;`;
  connection.query(sql, [user.id], (err, pic) => {
    if (err) throw err;
    if (pic[0].pic !== null) {
      sql = `UPDATE infos SET profile_pic = ? WHERE user_id = ?;`;
      connection.query(sql, [pic[0].pic, user.id], (err) => {
        if (err) throw err;
        return res.json();
      })
    } else {
      return res.status(400).json({pic: "Hình ảnh đã chọn không tồn tại"});
    }
  })
});

module.exports = router;
