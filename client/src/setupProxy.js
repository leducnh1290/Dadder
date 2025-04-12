const proxy = require('http-proxy-middleware');
const { web } = require('webpack');

module.exports = function (app) {
  app.use(proxy('/api', {target: 'http://localhost:5000/',websocket:true,ws:true, changeOrigin: true,secure: false,}));

  app.use(
    '/socket.io',
    proxy({
      target: 'http://localhost:5000/',
      changeOrigin: true,
      ws: true, // Chuyển giao kết nối WebSocket
      secure: false, 
      websocket: true, // Chuyển giao kết nối WebSocket
    })
  );
};
