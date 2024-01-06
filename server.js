const express = require('express');
const path = require('path');

const app = express();

// 静态文件中间件
app.use(express.static(path.resolve(__dirname, 'dist')));

// 所有请求都返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

// 监听端口
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
