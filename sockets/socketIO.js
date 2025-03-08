const mysql = require('mysql');
const jwt_check = require('../utils/jwt_check');
const notifs = require('../utils/notifs');

// Kết nối database
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
const users = {}; // Danh sách người dùng đang online

module.exports = (io) => {
  io.sockets.on('connection', (socket) => {
    console.log(`🔵 Người dùng kết nối: ${socket.id}`);
    socket.on("register", (userId) => {
      users[userId] = socket.id;
      console.log(`✅ User ${userId} online với socket ID: ${socket.id}`);
  });
    // Khi user tham gia phòng chat
    socket.on('room', (room) => {
      socket.join(room);
      console.log(`✅ User tham gia phòng: ${room}`);
    });


    // Gửi tin nhắn trong phòng
    socket.on('send message', ({ room, messageData }) => {
      io.sockets.in(room).emit('new message', messageData);
      console.log(`💬 Tin nhắn mới trong phòng ${room}:`, messageData);
    });

    // Xử lý sự kiện gọi điện
    socket.on("startCall", ({ caller, receiver }) => {
      console.log("📞 Gửi cuộc gọi từ", caller, "đến", receiver);
      console.log("Danh sách users hiện tại:", users);
  
      const receiverSocketId = users[receiver];  // Kiểm tra socket ID của receiver
  
      if (receiverSocketId) {  
          io.to(receiverSocketId).emit("incomingCall", { caller });
          console.log(`📞 Gửi tín hiệu cuộc gọi đến ${receiver}`);
      } else {
          io.to(users[caller]).emit("callFailed", { message: "Người nhận không online!" });
          console.log(`❌ Gọi thất bại: User ${receiver} không online.`);
      }
  });
  

    // Khi user ngắt kết nối
    socket.on("disconnect", () => {
      // Xóa user khi họ rời đi
      const userId = Object.keys(users).find((key) => users[key] === socket.id);
      if (userId) {
          delete users[userId];
          console.log(`🔴 User ${userId} đã ngắt kết nối`);
      }
  });
  });
};
