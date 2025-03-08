const mysql = require('mysql');

let connection = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'leducanh2004',
  database: 'matcha',
});

const tags = [
  "Phượt_thủ_gió",
  "Đi_bụi_nắng",
  "Leo_núi_mây",
  "Cày_phim_sáng",
  "Fan_cứng",
  "Xem_phim_tết",
  "Nghiện_phim",
  "Đạo_diễn_đỉnh",
  "Thể_thao_mồ_hôi",
  "Bóng_đá",
  "Bóng_ném",
  "Bóng_rổ",
  "Đánh_golf",
  "Giết_quái",
  "Bắn_súng_đêm",
  "Đá_banh_hạng",
  "Ăn_uống",
  "Nhậu_xuyên_lục",
  "Hóng_chuyện",
  "Xoay_kèo",
  "Sát_phạt",
  "Diễn_viên",
  "Tốc_độ_gió",
  "Độ_xe",
  "Hội_vẽ",
  "Mọt_sách",
  "Truyện_tranh",
  "Cày_truyện",
  "Học_hành",
  "Đánh_cờ",
  "Công_nghệ",
  "Lập_trình",
  "Sách_vở",
  "Bắn_phép",
  "Đánh_quái",
  "Xây_nhà",
  "Bàn_cờ",
  "Chơi_đồ",
  "Nghe_nhạc",
  "Ca_sĩ",
  "Nhảy_nhót",
  "Thánh_nhạc",
  "Sống_ảo",
  "Chụp_hình",
  "Tay_máy",
  "Đạo_diễn",
  "Sống_chất",
  "Chơi_gay",
  "Thích_màu_hồng"
];




function create_tags(user_id) {
  return new Promise((resolve) => {
    const nb_pics = Math.floor(Math.random() * 10) + 1;
    const arr_tags = [];

    while (arr_tags.length === 0) {
      for (let i = 0; i < nb_pics; i++) {
        let r = Math.floor(Math.random() * tags.length);
        if (!arr_tags.includes(r)) arr_tags.push(r);
      }
    }

    console.log(`User ID:${user_id} will get ${nb_pics} new interests.`);

    const insertPromises = arr_tags.map(tagIndex => {
      return new Promise((resolveInsert, reject) => {
        let sql = `INSERT INTO INTERESTS(user_id, tag) VALUES (${user_id}, "${tags[tagIndex]}")`;
        console.log("Executing SQL:", sql);
        connection.query(sql, (err) => {
          if (err) {
            console.error(`Lỗi khi insert user ID ${user_id}:`, err.message);
            reject(err);
          } else {
            resolveInsert();
          }
        });
      });
    });

    Promise.all(insertPromises)
      .then(() => {
        console.log(`User ID:${user_id} got ${nb_pics} new interests.`);
        resolve(0);
      })
      .catch((err) => resolve(err));
  });
}


connection.connect((err) => {
  if (err) throw err;

  let promises = [];
  const sql = "SELECT COUNT(id) AS tot FROM users";
  connection.query(sql, (err, result) => {
    for (let i = 1; i <= result[0].tot; i++) {
      promises.push(create_tags(i));
    }

    Promise.all(promises)
      .then(() => {
        connection.end();
      })
      .catch((err) => {
      });
  });
});