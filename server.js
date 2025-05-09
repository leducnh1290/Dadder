const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors({
  origin:  ['http://localhost:3000', 'https://dating.leducanh.name.vn','http://dating.leducanh.name.vn'],// Đổi thành domain frontend của bạn
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức được phép
  allowedHeaders: ['Content-Type', 'Authorization'], // Các header cho phép
  credentials: true // Nếu có sử dụng cookies
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/img', express.static(path.join(__dirname, 'img')));

app.use('/api/user', require('./routes/api/user'));
app.use('/api/admin', require('./routes/api/admin'));

app.use('/api/like', require('./routes/api/like'));
app.use('/api/block', require('./routes/api/block'));
app.use('/api/interests', require('./routes/api/interests'));
app.use('/api/verify', require('./routes/api/verify'));
app.use('/api/soulmatcher', require('./routes/api/soulmatcher'));
app.use('/api/search', require('./routes/api/search'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/visit', require('./routes/api/visit'));
app.use('/api/report', require('./routes/api/report'));
app.use('/api/dislike', require('./routes/api/dislike'));
app.use('/api/picture', require('./routes/api/picture'));
app.use('/api/locations', require('./routes/api/locations'));
app.use('/api/match', require('./routes/api/match'));
app.use('/api/chat', require('./routes/api/chat'));
app.use('/api/notifs', require('./routes/api/notifs'));
app.use('/api/connection', require('./routes/api/connection'));


const port = 5000;

let server = app.listen(port);
global.io = require('socket.io')(server, {
  cors: {
    origin:  ['http://localhost:3000', 'https://dating.leducanh.name.vn'],
    methods: ['GET', 'POST']
  },
  pingTimeout: 30000,
});
require("./sockets/socketIO")(io);