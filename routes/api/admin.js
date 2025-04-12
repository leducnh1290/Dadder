const express = require('express');
const router = express.Router();
const jwt_check = require('../../utils/jwt_check');
const mysql = require('mysql');
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

router.get('/prouser', (req, res) => {
    const user = jwt_check.getUsersInfos(req.headers.authorization);
  
    if (user.id === -1) {
      return res.status(401).json({ error: 'unauthorized access' });
    }
  const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

  const offset = (page - 1) * limit;
  
  // Xây dựng câu truy vấn
  let query = `SELECT * FROM prouser WHERE name LIKE ? OR email LIKE ?`;
  let queryParams = [`%${search}%`, `%${search}%`];

  // Thêm bộ lọc trạng thái nếu có
  if (status !== 'all') {
    query += ' AND status = ?';
    queryParams.push(status);
  }

  query += ' LIMIT ? OFFSET ?';
  queryParams.push(Number(limit), offset);

  connection.query(query, queryParams, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi khi truy vấn dữ liệu' });
    }

    const countQuery = 'SELECT COUNT(*) AS total FROM prouser WHERE name LIKE ? OR email LIKE ?';
    connection.query(countQuery, [`%${search}%`, `%${search}%`], (countErr, countResult) => {
      if (countErr) {
        return res.status(500).json({ error: 'Lỗi khi đếm số lượng người dùng' });
      }

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        users: result,
        pagination: {
          currentPage: Number(page),
          totalPages: totalPages,
          totalUsers: total,
          limit: Number(limit),
        }
      });
    });
  });
});
router.get('/status', (req, res) => {
    const user = jwt_check.getUsersInfos(req.headers.authorization);
  
    if (user.id === -1) {
      return res.status(401).json({ error: 'unauthorized access' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Not admin' });
    }
  
    // Kiểm tra quyền admin từ bảng user_roles
    const roleCheckSql = 'SELECT * FROM user_roles WHERE user_id = ? AND role_id = 2';
    connection.query(roleCheckSql, [user.id], (err, roleResult) => {
      if (err) return res.status(500).json({ error: 'Database error' });
  
      if (roleResult.length === 0) {
        return res.status(403).json({ error: 'Access denied. Not admin' });
      }
  
      // Truy vấn tất cả thống kê cần thiết
      const sql = `
        SELECT 
          (SELECT COUNT(*) FROM users) AS total_users,
          (SELECT COUNT(*) FROM connection WHERE last_connection >= NOW() - INTERVAL 10 MINUTE) AS active_users,
          (SELECT COUNT(*) FROM likes l1 
           INNER JOIN likes l2 ON l1.liker_id = l2.liked_id AND l1.liked_id = l2.liker_id
           WHERE l1.liker_id < l1.liked_id) AS total_matches,
          (SELECT COUNT(*) FROM infos WHERE gender = 'male') AS total_male,
          (SELECT COUNT(*) FROM infos WHERE gender = 'female') AS total_female,
          (SELECT COUNT(*) FROM infos WHERE gender = 'other') AS total_other
      `;
  
      connection.query(sql, (err, statsResult) => {
        if (err) return res.status(500).json({ error: 'Failed to get stats' });
  
        // Truy vấn phân bố độ tuổi
        const ageSql = `
          SELECT 
            CASE 
              WHEN age BETWEEN 18 AND 25 THEN '18-25'
              WHEN age BETWEEN 26 AND 35 THEN '26-35'
              WHEN age BETWEEN 36 AND 45 THEN '36-45'
              ELSE '46+' 
            END AS age_group,
            COUNT(*) AS total
          FROM infos
          GROUP BY age_group
        `;
  
        connection.query(ageSql, (err, ageResult) => {
          if (err) return res.status(500).json({ error: 'Failed to get age stats' });
  
          // Truy vấn sở thích phổ biến
          const interestsSql = `
            SELECT tag, COUNT(*) AS total 
            FROM interests 
            GROUP BY tag 
            ORDER BY total DESC 
            LIMIT 10
          `;
  
          connection.query(interestsSql, (err, interestsResult) => {
            if (err) return res.status(500).json({ error: 'Failed to get interests stats' });
  
            // Lượt truy cập theo ngày (7 ngày gần nhất)
            const visitsSql = `
            SELECT visited_id AS user_id, COUNT(*) AS total_views
            FROM visits
            GROUP BY visited_id;
          `;
          
  
            connection.query(visitsSql, (err, visitsResult) => {
              if (err) return res.status(500).json({ error: 'Failed to get visits stats' });
  
              // Lượt gửi tin nhắn theo ngày (7 ngày gần nhất)
              const messagesSql = `
              SELECT 
                DATE(time) AS date, 
                COUNT(*) AS message_count
              FROM messages
              WHERE time >= CURDATE() - INTERVAL 6 DAY
              GROUP BY DATE(time)
              ORDER BY date;
            `;
            
  
              connection.query(messagesSql, (err, messagesResult) => {
                if (err) return res.status(500).json({ error: 'Failed to get messages stats' });
  
                // Trả về tất cả kết quả trong 1 JSON object
                res.json({
                  ...statsResult[0],
                  age_distribution: ageResult,
                  popular_interests: interestsResult,
                  daily_visits: visitsResult,
                  daily_messages: messagesResult
                });
              });
            });
          });
        });
      });
    });
  });
  
  router.get('/users', (req, res) => {
    const user = jwt_check.getUsersInfos(req.headers.authorization);
  
    if (!user || user.id === -1) {
      return res.status(401).json({ error: 'unauthorized access' });
    }
  
    // Check quyền admin
    const roleCheckSql = 'SELECT * FROM user_roles WHERE user_id = ? AND role_id = 2';
  
    connection.query(roleCheckSql, [user.id], (err, roleResult) => {
      if (err) return res.status(500).json({ error: 'Database error (role check)' });
  
      if (roleResult.length === 0) {
        return res.status(403).json({ error: 'Access denied. Not admin' });
      }
  
      // Phân trang
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
  
      const search = req.query.search || '';
      const statusFilter = req.query.status || 'all';
  
      // WHERE clause động
      const conditions = [];
      const params = [];
  
      if (search) {
        conditions.push(`(i.firstName LIKE ? OR i.lastName LIKE ? OR u.email LIKE ?)`);
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
      }
  
      if (statusFilter !== 'all') {
        if (statusFilter === 'active') {
          conditions.push(`v.status = 1`);
        } else if (statusFilter === 'inactive') {
          conditions.push(`(v.status IS NULL OR v.status = 0)`);
        }
      }
  
      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  
      const userQuery = `
      SELECT 
        u.id,
        CONCAT(i.firstName, ' ', i.lastName) AS name,
        u.email,
        IF(r.name IS NOT NULL, 'admin', 'user') AS role,
        CASE 
          WHEN v.status = 1 THEN 'Active'
          ELSE 'Inactive'
        END AS status,
        CASE
          WHEN b.user_id IS NOT NULL THEN 'Banned'  -- Kiểm tra nếu người dùng có trong bảng banned
          ELSE 'Not Banned'
        END AS ban_status  -- Cột mới hiển thị trạng thái "Banned" hay "Not Banned"
      FROM users u
      LEFT JOIN infos i ON u.id = i.user_id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN verified v ON u.id = v.user_id
      LEFT JOIN banned b ON u.id = b.user_id  -- Kết nối bảng banned
      ${whereClause}
      LIMIT ? OFFSET ?
    `;
    
  
      connection.query(userQuery, [...params, limit, offset], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch users' });
  
        const countQuery = `
          SELECT COUNT(*) AS total
          FROM users u
          LEFT JOIN infos i ON u.id = i.user_id
          LEFT JOIN verified v ON u.id = v.user_id
          ${whereClause}
        `;
  
        connection.query(countQuery, params, (err, countResult) => {
          if (err) return res.status(500).json({ error: 'Failed to count users' });
  
          const total = countResult[0].total;
          const totalPages = Math.ceil(total / limit);
  
          res.json({
            users: result,
            pagination: {
              currentPage: page,
              totalPages,
              totalUsers: total,
              limit
            }
          });
        });
      });
    });
  });
  router.delete('/users/:id', (req, res) => {
    const user = jwt_check.getUsersInfos(req.headers.authorization);
  
    if (!user || user.id === -1) {
      return res.status(401).json({ error: 'unauthorized access' });
    }
  
    // Check quyền admin
    const roleCheckSql = 'SELECT * FROM user_roles WHERE user_id = ? AND role_id = 2';
  
    connection.query(roleCheckSql, [user.id], (err, roleResult) => {
      if (err) return res.status(500).json({ error: 'Database error (role check)' });
  
      if (roleResult.length === 0) {
        return res.status(403).json({ error: 'Access denied. Not admin' });
      }
  
      // Thực hiện xoá user
      const userIdToDelete = req.params.id;
  
      const deleteSql = 'DELETE FROM users WHERE id = ?';
  
      connection.query(deleteSql, [userIdToDelete], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to delete user' });
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
  
        res.json({ message: 'User deleted successfully' });
      });
    });
  });
  router.post('/users/:id/ban', (req, res) => {
    const admin = jwt_check.getUsersInfos(req.headers.authorization);
  
    if (!admin || admin.id === -1) {
      return res.status(401).json({ error: 'unauthorized access' });
    }
  
    // Kiểm tra quyền admin
    const roleCheckSql = 'SELECT * FROM user_roles WHERE user_id = ? AND role_id = 2';
    connection.query(roleCheckSql, [admin.id], (err, roleResult) => {
      if (err) return res.status(500).json({ error: 'Database error (role check)' });
      if (roleResult.length === 0) {
        return res.status(403).json({ error: 'Access denied. Not admin' });
      }
  
      const userIdToBan = req.params.id;
      const reason = req.body.reason || 'Vi phạm chưa xác định';
  
      // Kiểm tra user đã bị ban chưa
      const checkSql = 'SELECT * FROM banned WHERE user_id = ?';
      connection.query(checkSql, [userIdToBan], (err, checkResult) => {
        if (err) return res.status(500).json({ error: 'Database error (check banned)' });
  
        if (checkResult.length > 0) {
          return res.status(400).json({ error: 'Người dùng này đã bị ban trước đó' });
        }
  
        // Thêm bản ghi ban
        const insertSql = 'INSERT INTO banned (user_id, reason, banned_by) VALUES (?, ?, ?)';
        connection.query(insertSql, [userIdToBan, reason, admin.id], (err, result) => {
          if (err) return res.status(500).json({ error: 'Không thể ban người dùng' });
  
          res.json({ message: `Đã ban user ${userIdToBan}`, ban_id: result.insertId });
        });
      });
    });
  });
  
  router.post('/users/:id/unban', (req, res) => {
    const user = jwt_check.getUsersInfos(req.headers.authorization);
  
    if (!user || user.id === -1) {
      return res.status(401).json({ error: 'unauthorized access' });
    }
  
    // Check quyền admin
    const roleCheckSql = 'SELECT * FROM user_roles WHERE user_id = ? AND role_id = 2';
    connection.query(roleCheckSql, [user.id], (err, roleResult) => {
      if (err) return res.status(500).json({ error: 'Database error (role check)' });
  
      if (roleResult.length === 0) {
        return res.status(403).json({ error: 'Access denied. Not admin' });
      }
  
      const userIdToUnban = req.params.id;
  
      // Xóa bản ghi khỏi bảng banned
      const deleteSql = 'DELETE FROM banned WHERE user_id = ?';
      connection.query(deleteSql, [userIdToUnban], (err, result) => {
        if (err) return res.status(500).json({ error: 'Không thể gỡ ban người dùng' });
  
        res.json({ message: 'Người dùng đã được gỡ ban' });
      });
    });
  });
  
module.exports = router;
