// CloudServerManager Console API Module

const API_BASE = 'http://110.42.134.33:3000/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.accessToken = localStorage.getItem('accessToken');
    this.user = null;
  }

  setToken(token) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  setUser(user) {
    this.user = user;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }

  getUser() {
    if (!this.user) {
      const stored = localStorage.getItem('user');
      if (stored) {
        this.user = JSON.parse(stored);
      }
    }
    return this.user;
  }

  clearUser() {
    this.user = null;
    localStorage.removeItem('user');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Handle 401 - token expired or invalid
      if (response.status === 401) {
        this.setToken(null);
        this.clearUser();
        window.location.hash = '#/login';
        throw new Error('登录已过期，请重新登录');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '请求失败');
      }

      return data;
    } catch (error) {
      if (error.message === '登录已过期，请重新登录') {
        throw error;
      }
      throw new Error(error.message || '网络错误');
    }
  }

  // Auth APIs
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.accessToken);
    // Fetch user info after login
    try {
      const userData = await this.me();
      this.setUser(userData.user);
    } catch (e) {
      // ignore
    }
    return data;
  }

  async register(email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
      this.clearUser();
    }
  }

  async sendSmsCode(phone) {
    return this.request('/auth/send-sms', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  }

  async verifySmsCode(phone, code) {
    const data = await this.request('/auth/verify-sms', {
      method: 'POST',
      body: JSON.stringify({ phone, code })
    });
    this.setToken(data.accessToken);
    // Fetch user info after login
    try {
      const userData = await this.me();
      this.setUser(userData.user);
    } catch (e) {
      // ignore
    }
    return data;
  }

  async phoneRegister(phone, code) {
    const data = await this.request('/auth/phone-register', {
      method: 'POST',
      body: JSON.stringify({ phone, code })
    });
    this.setToken(data.accessToken);
    return data;
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });
  }

  async oauthAuthorize(provider) {
    return this.request(`/auth/oauth/${provider}`, { method: 'POST' });
  }

  async me() {
    return this.request('/auth/me');
  }

  // Account APIs
  async getAccount() {
    return this.request('/account');
  }

  async recharge(amount) {
    return this.request('/account/recharge', {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
  }

  // Instance APIs
  async getInstances() {
    return this.request('/instances');
  }

  async createInstance(planId) {
    return this.request('/instances', {
      method: 'POST',
      body: JSON.stringify({ planId })
    });
  }

  async deleteInstance(instanceId) {
    return this.request(`/instances/${instanceId}`, {
      method: 'DELETE'
    });
  }

  async startInstance(instanceId) {
    return this.request(`/instances/${instanceId}/start`, {
      method: 'POST'
    });
  }

  async stopInstance(instanceId) {
    return this.request(`/instances/${instanceId}/stop`, {
      method: 'POST'
    });
  }

  // Plan APIs
  async getPlans() {
    return this.request('/plans');
  }

  // Payment APIs
  async createOrder(planId) {
    return this.request('/pay/create', {
      method: 'POST',
      body: JSON.stringify({ planId })
    });
  }

  // Check if logged in
  isLoggedIn() {
    return !!this.accessToken;
  }
}

// Export singleton instance to window
window.api = new ApiClient(API_BASE);
