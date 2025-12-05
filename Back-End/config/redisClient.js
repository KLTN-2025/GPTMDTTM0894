const { createClient } = require('redis');

const client = createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379
  }
});

client.on('error', (err) => console.error('❌ Redis Client Error', err));

// Không tự động connect ở đây, để server.js quản lý kết nối
// client.connect();

module.exports = client;
