
const jwt_check = require('../utils/jwt_check');
const onlineUsers = new Map();
// Kết nối database


module.exports = (io) => {
  io.sockets.on("connection", (socket) => {
    console.log(`🔵 Người dùng kết nối: ${socket.id}`);
     // Đăng ký người dùng
  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });
    // Khi user tham gia phòng chat
    socket.on("room", (room) => {
      socket.join(room);
      console.log(`✅ User tham gia phòng: ${room}`);
    });

    // Gửi tin nhắn trong phòng
    socket.on("send message", ({ room, messageData }) => {
      io.sockets.in(room).emit("new message", messageData);
      console.log(`💬 Tin nhắn mới trong phòng ${room}:, messageData`);
    });
    // Xử lý yêu cầu gọi điện
  socket.on('callRequest', ({ caller, receiver }) => {
    const receiverSocketId = onlineUsers.get(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('incomingCall', { callerId: caller });
      console.log(`Call request from ${caller} to ${receiver}`);
    } else {
      socket.emit('callRejected', { message: 'User is offline' });
    }
  });

  // Xử lý chấp nhận cuộc gọi
  socket.on('acceptCall', ({ caller, receiver }) => {
    const callerSocketId = onlineUsers.get(caller);
    if (callerSocketId) {
      io.to(callerSocketId).emit('callAccepted', { receiverId: receiver });
      console.log(`Call accepted by ${receiver}`);
    }
  });

  // Xử lý từ chối cuộc gọi
  socket.on('rejectCall', ({ caller, receiver }) => {
    const callerSocketId = onlineUsers.get(caller);
    if (callerSocketId) {
      io.to(callerSocketId).emit('callRejected', { receiverId: receiver });
      console.log(`Call rejected by ${receiver}`);
    }
  });

  // Xử lý kết thúc cuộc gọi
  socket.on('endCall', ({ caller, receiver }) => {
    const callerSocketId = onlineUsers.get(caller);
    const receiverSocketId = onlineUsers.get(receiver);
    
    if (callerSocketId) {
      io.to(callerSocketId).emit('callEnded', { receiverId: receiver });
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('callEnded', { receiverId: caller });
    }
    console.log(`Call ended between ${caller} and ${receiver}`);
  });
  // Xử lý tín hiệu ICE candidate
  socket.on('candidate', ({ targetUserId, candidate }) => {
    const receiverSocketId = onlineUsers.get(targetUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('candidate', { candidate });
      console.log(`ICE candidate sent to ${targetUserId}`);
    }
  });

  // Xử lý tín hiệu SDP offer
  socket.on('offer', ({ offer, targetUserId }) => {
    const receiverSocketId = onlineUsers.get(targetUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('offer', { offer });
      console.log(`SDP offer sent to ${targetUserId}`);
    }
  });

  // Xử lý tín hiệu SDP answer  
  socket.on('answer', ({ answer, targetUserId }) => {
    const receiverSocketId = onlineUsers.get(targetUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('answer', { answer });
      console.log(`SDP answer sent to ${targetUserId}`);
    }
  });

  // Xử lý ngắt kết nối
  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
  });
};
