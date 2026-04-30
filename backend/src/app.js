const express = require('express');
const cors = require('cors');
const config = require('./config');

// 路由
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/account');
const instanceRoutes = require('./routes/instance');
const planRoutes = require('./routes/plan');
const paymentRoutes = require('./routes/payment');

const app = express();

// 中间件
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/instances', instanceRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/pay', paymentRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

module.exports = app;
