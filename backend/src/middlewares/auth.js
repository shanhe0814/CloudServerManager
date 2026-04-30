const { verifyToken } = require('../utils/jwt');
const authService = require('../services/auth.service');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const token = authHeader.split(' ')[1];

  // Check if token is blacklisted
  if (authService.isTokenBlacklisted(token)) {
    return res.status(401).json({ error: '令牌已失效，请重新登录' });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: '无效或过期的令牌' });
  }

  if (decoded.type === 'refresh') {
    return res.status(401).json({ error: '不能使用 Refresh Token 访问受保护资源' });
  }

  req.user = { id: decoded.userId };
  next();
};

module.exports = { authenticate };
