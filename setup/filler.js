const mysql = require('mysql');
const faker = require('faker');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const IMAGE_DIR = "D:\\WindowsMonitor\\Dadder\\client\\public\\photos\\demo";

let cities = require('./cities');


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
function fill_db(data, pos_array) {
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
    const random_city_pos = Math.floor(Math.random() * pos_array.length);
    const longitude = pos_array[random_city_pos][pos_array[random_city_pos].length - 1] + (Math.bool ? 0.02 : -0.02) * Math.random();
    const latitude = pos_array[random_city_pos][pos_array[random_city_pos].length - 2] + (Math.bool ? 0.02 : -0.02) * Math.random();;

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
  let position_array = [];
  let cities_list = cities.cities;

  cities_list = cities_list.split("\n");
  for (let j = 0; j < cities_list.length; j++)
    position_array[j] = cities_list[j].split("\t");
  axios.get(`https://randomuser.me/api?nat=us&results=1000`)
    .then(res => {
      for (let i = 0; i < 1000; i++) {
        promises.push(fill_db(res.data.results[i], position_array));
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