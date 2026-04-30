const authService = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少6位' });
    }

    const result = await authService.register(email, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' });
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh Token 不能为空' });
    }

    const result = await authService.refresh(refreshToken);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await authService.logout(token);
    }

    res.json({ message: '已退出登录' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sendSmsCode = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: '手机号不能为空' });
    }

    // Simple phone validation
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: '手机号格式不正确' });
    }

    const result = await authService.sendSmsCode(phone);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifySmsCode = async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: '手机号和验证码不能为空' });
    }

    const result = await authService.verifySmsCode(phone, code);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const phoneRegister = async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: '手机号和验证码不能为空' });
    }

    const result = await authService.phoneRegister(phone, code);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: '邮箱不能为空' });
    }

    const result = await authService.forgotPassword(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: '令牌和新密码不能为空' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: '密码至少6位' });
    }

    const result = await authService.resetPassword(token, newPassword);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const oauthAuthorize = async (req, res) => {
  try {
    const { provider } = req.params;

    const result = await authService.oauthAuthorize(provider);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const oauthCallback = async (req, res) => {
  try {
    const { provider } = req.params;
    const { code } = req.body;

    const result = await authService.oauthCallback(provider, code);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const me = async (req, res) => {
  try {
    const user = await authService.userInfo(req.user.id);
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  sendSmsCode,
  verifySmsCode,
  phoneRegister,
  forgotPassword,
  resetPassword,
  oauthAuthorize,
  oauthCallback,
  me
};
