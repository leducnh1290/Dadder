const mysql = require('mysql');
const faker = require('faker');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const IMAGE_DIR = "D:\\WindowsMonitor\\Dadder\\client\\public\\photos\\demo";

const cities = [
  [16.047199, 108.219955], // Hải Châu, Đà Nẵng
  [20.984068, 105.862511], // Hoàng Mai, Hà Nội
  [21.027256, 105.832703], // Quốc Tử Giám, Hà Nội
  [21.010559, 105.800362], // Thung Hóa, Hà Nội
  [16.118069, 108.273956], // Thọ Quang, Đà Nẵng
  [18.247768, 105.644531], // Hương Khê, Hà Tĩnh
  [10.817141, 106.707954], // Thạnh Đa, TP.HCM
  [10.787884, 106.698402], // Đa Kao, Quận 1, TP.HCM
  [10.720010, 106.670395], // Bình Hưng, TP.HCM
  [18.787203, 105.605202], // Hưng Trung, Nghệ An
  [10.027254, 105.769806], // Ninh Kiều, Cần Thơ
  [21.030653, 105.847130], // Hoàn Kiếm, Hà Nội
  [21.038412, 105.780716], // Mai Dịch, Hà Nội
  [10.863731, 106.779495], // Linh Trung, Thủ Đức, TP.HCM
  [10.802029, 106.649307], // Tân Bình, TP.HCM
  [10.815623, 106.780685], // Phước Long B, Quận 9, TP.HCM
  [10.771423, 106.698471], // Chợ Bến Thành, Quận 1, TP.HCM
  [10.731839, 106.702827], // Tân Phong, Quận 7, TP.HCM
  [10.810583, 106.709145], // Bình Thạnh, TP.HCM
  [21.002771, 105.815361], // KĐT Royal City, Hà Nội
  [10.773599, 106.694420], // Bến Thành, TP.HCM
  [22.356464, 103.873802], // Sa Pa, Lào Cai
  [11.111134, 106.794243], // Tân Uyên, Bình Dương
  [10.801913, 106.764748], // An Phú, Quận 2, TP.HCM
  [10.723695, 106.668060], // Bình Hưng, TP.HCM
  [10.745030, 106.697075], // Tân Hưng, TP.HCM
  [21.027266, 105.855453], // Hoàn Kiếm, Hà Nội
  [20.993776, 105.811417]  // Thanh Xuân, Hà Nội
];

let connection = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'leducanh2004',
  database: 'matcha',
});

function additional_infos(id, bio, sexuality, age, latitude, longitude, popularity, profilePic) {
  return new Promise((resolve) => {
  //Set user infos
    let info = {
      bio,
      sexuality,
      age,
      latitude,
      longitude,
      popularity,
      profilePic,
    };
    let res_err = {};
    let error = false;

    const sql = `SELECT id from users WHERE id = ${id}`;
    connection.query(sql, (err, result) => {
      if (result && result.length == 0) {
        res_err = {
          ...res_err,
          id: "Utilisateur non trouvé"
        };
        resolve(res_err);
      }
      else {
        if (typeof info.bio == 'undefined' || info.bio == "") {
          res_err = {
            ...res_err,
            bio: "La bio est requise"
          };
          error = true
        }
        else if (info.bio.length > 420) {
          res_err = {
            ...res_err,
            bio: "La bio doit faire moins de 420 caractères"
          };
          error = true
        }
      }
      if (typeof info.sexuality == 'undefined' || (info.sexuality != "bisexual" && info.sexuality != "heterosexual" && info.sexuality != "homosexual")) {
        res_err = {
          ...res_err,
          sexuality: "La sexualité est incorrecte"
        };
        error = true
      }
      if (typeof info.age == 'undefined' || info.age == "" || isNaN(info.age)) {
        res_err = {
          ...res_err,
          age: "L'age est incorrect"
        };
        error = true
      }
      if (typeof info.latitude == 'undefined' || info.latitude == "") {
        res_err = {
          ...res_err,
          latitude: "La latitude est incorrecte"
        };
        error = true
      }
      if (typeof info.longitude == 'undefined' || info.longitude == "") {
        res_err = {
          ...res_err,
          longitude: "La longitude est incorrecte"
        };
        error = true
      }
      if (typeof info.popularity == 'undefined' || info.popularity == "") {
        res_err = {
          ...res_err,
          popularity: "La popularité est incorrecte"
        };
        error = true
      }
      if (typeof info.profilePic == 'undefined' || info.profilePic == "") {
        res_err = {
          ...res_err,
          profilePic: "La photo de profil est requise"
        };
        error = true
      }
      if (error) {
        resolve(res_err);
      }
      else {
        const sql2 = `UPDATE infos SET bio = "${info.bio}", address_modified = 1, sexuality = "${info.sexuality}", age = ${info.age} , latitude = ${info.latitude}, longitude = ${info.longitude}, popularity = ${info.popularity}, profile_pic = "${info.profilePic}"` +
          `WHERE user_id = ${id}`;
        connection.query(sql2, (err) => {
          if (err) throw (err);
        })
      }
      resolve(id);
    })
  });
}
function getRandomImageUrl() {
  try {
      // Lấy danh sách file ảnh (lọc chỉ lấy .jpg, .png, .gif,...)
      const files = fs.readdirSync(IMAGE_DIR).filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

      if (files.length === 0) return null; // Không có ảnh nào

      // Chọn ngẫu nhiên một file
      const randomFile = files[Math.floor(Math.random() * files.length)];

      // Trả về URL đầy đủ
      return `/photos/demo/${randomFile}`;
  } catch (error) {
      console.error('Lỗi khi lấy ảnh:', error);
      return null;
  }
}
function generateVietnameseName() {
  const ho = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Phan", "Vũ", "Đặng", "Bùi", "Đỗ"];
  const tenDem = ["Văn", "Hữu", "Tiến", "Thị", "Minh", "Thanh", "Trung", "Anh", "Ngọc", "Quốc"];
  const ten = ["An", "Anh", "Bình", "Châu", "Dương", "Hà", "Hùng", "Khoa", "Linh", "Mai", "Nam", "Phong", "Quỳnh", "Sơn", "Tâm", "Tuấn", "Việt"];

  const lastName = ho[Math.floor(Math.random() * ho.length)];
  const middleName = tenDem[Math.floor(Math.random() * tenDem.length)];
  const firstName = ten[Math.floor(Math.random() * ten.length)];

  return {
    firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
    lastName: (middleName + " " + lastName).split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
  };
}
function fill_db(data) {
  return new Promise((resolve, reject) => {
    const userFake = generateVietnameseName();
    const firstName = userFake.firstName;
    const lastName = userFake.lastName;
    const username = data.name.first.charAt(0).toUpperCase() + data.name.first.slice(1) + data.name.last.charAt(0).toUpperCase() + data.name.last.slice(1);
    const email = faker.internet.email();
    const password = "Qwerty123";
    const confirm = password;
    const bio = faker.lorem.sentences();
    const gender = Math.random() > 0.9 ? 'other' : data.gender;
    const sexuality = (Math.random() > 0.8 ? "bisexual" : Math.random() > 0.8 ? "homosexual" : "heterosexual");

    const age = Math.floor(Math.random() * 40) + 18;
    const popularity = Math.random() * 100;
    const profilePic = getRandomImageUrl();
    const pic2 = getRandomImageUrl();
    const pic3 = getRandomImageUrl();
    const pic4 = getRandomImageUrl();
    const pic5 = getRandomImageUrl();
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const latitude = randomCity[0] + (Math.random() > 0.5 ? 0.02 : -0.02) * Math.random();
    const longitude = randomCity[1] + (Math.random() > 0.5 ? 0.02 : -0.02) * Math.random();

    axios.post('http://localhost:5000/api/user/register', {
      email,
      lastName,
      firstName,
      username,
      password,
      confirm,
      gender,
      nomail: true
    })
      .then(response => {
        const id = response.data;
        additional_infos(id, bio, sexuality, age, latitude, longitude, popularity, profilePic)
          .then(response2 => {
            console.log('ID:' + id + ' user created.');

            let sql = "Update photos " +
              `SET pic1 = "${profilePic}", pic2 = "${pic2}", pic3 = "${pic3}", pic4 = "${pic4}", pic5 = "${pic5}" 
            WHERE user_id = ${id};`;
            connection.query(sql, (err, res) => {
              if (err) throw err;
              connection.query("UPDATE verified SET status = 1 WHERE user_id = " + id, err => {
                if (err) throw err;
                resolve(response2);
              });
            });
          })
          .catch((error) => {
            resolve(error);
          })
      })
      .catch((error) => {
        resolve(error);
      })
  })
}

connection.connect((err) => {
  if (err) throw err;
  let promises = [];
  axios.get(`https://randomuser.me/api?nat=us&results=1000`)
    .then(res => {
      for (let i = 0; i < 1000; i++) {
        promises.push(fill_db(res.data.results[i]));
      }
      Promise.all(promises)
        .then(() => {
          connection.end();
        })
        .catch((err) => {
        });
    })
    .catch(err => {
    });
});