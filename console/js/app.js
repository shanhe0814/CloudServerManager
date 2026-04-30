// CloudServerManager Console App

const { createApp } = Vue
const { createRouter, createWebHashHistory } = VueRouter

// Import API
// Note: api.js should be loaded before app.js in HTML
// <script src="js/api.js"></script>
// <script src="js/app.js"></script>

// Mock Data (used when not logged in)
const mockUser = {
  name: '张三',
  balance: 1280.50
}

const mockServers = [
  { id: 1, name: 'Web Server 1', ip: '123.45.67.89', plan: '标准型', status: 'running', created: '2026-01-15' },
  { id: 2, name: 'DB Server', ip: '123.45.67.90', plan: '旗舰型', status: 'running', created: '2026-02-20' },
  { id: 3, name: 'Test Server', ip: '123.45.67.91', plan: '入门型', status: 'stopped', created: '2026-03-10' },
  { id: 4, name: 'Backup Server', ip: '123.45.67.92', plan: '标准型', status: 'suspended', created: '2025-12-01' }
]

const mockBillingRecords = [
  { id: 1, type: '消费', desc: '云服务器 - 旗舰型', amount: -199, date: '2026-04-01' },
  { id: 2, type: '消费', desc: '云服务器 - 旗舰型', amount: -199, date: '2026-03-01' },
  { id: 3, type: '消费', desc: '云服务器 - 标准型', amount: -79, date: '2026-02-01' },
  { id: 4, type: '充值', desc: '账户充值', amount: 500, date: '2026-02-15' },
  { id: 5, type: '消费', desc: '云服务器 - 入门型', amount: -29, date: '2026-01-01' },
  { id: 6, type: '充值', desc: '账户充值', amount: 1000, date: '2026-01-10' }
]

// Page Components

// Login Page
const LoginPage = {
  template: `
    <div class="login-page">
      <div class="login-container">
        <div class="login-header">
          <h1>CloudServerManager</h1>
          <p>登录到您的账户</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label class="form-label">邮箱</label>
            <input
              type="email"
              class="form-input"
              v-model="email"
              placeholder="请输入邮箱"
              required
            >
          </div>

          <div class="form-group">
            <label class="form-label">密码</label>
            <input
              type="password"
              class="form-input"
              v-model="password"
              placeholder="请输入密码"
              required
            >
          </div>

          <div class="form-actions">
            <router-link to="/forgot" class="forgot-link">忘记密码？</router-link>
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <div class="divider">
          <span>或其他方式登录</span>
        </div>

        <div class="oauth-buttons">
          <button class="oauth-btn passkey" @click="handlePasskey" :disabled="loading">
            <span class="oauth-icon">🔐</span>
            <span>Passkey</span>
          </button>
          <button class="oauth-btn wechat" @click="handleWechat" :disabled="loading">
            <span class="oauth-icon">💬</span>
            <span>微信</span>
          </button>
          <button class="oauth-btn feishu" @click="handleFeishu" :disabled="loading">
            <span class="oauth-icon">✈️</span>
            <span>飞书</span>
          </button>
        </div>

        <div class="login-footer">
          <span>没有账户？</span>
          <router-link to="/register" class="register-link">立即注册</router-link>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      email: '',
      password: '',
      error: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.error = '';
      this.loading = true;

      try {
        const data = await api.login(this.email, this.password);
        console.log('[Login] Success:', data);
        const redirect = this.$route.query.redirect || '/';
        this.$router.push(redirect);
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    handlePasskey() {
      alert('Passkey 登录功能预留');
    },
    handleWechat() {
      this.oauthLogin('wechat');
    },
    handleFeishu() {
      this.oauthLogin('feishu');
    },
    async oauthLogin(provider) {
      this.error = '';
      this.loading = true;

      try {
        const data = await api.oauthAuthorize(provider);
        console.log('[OAuth] Authorize URL:', data.authUrl);
        alert(`${provider} 登录功能预留，请配置真实的 OAuth App`);
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
}

// Phone Login Page
const PhoneLoginPage = {
  template: `
    <div class="login-page">
      <div class="login-container">
        <div class="login-header">
          <h1>CloudServerManager</h1>
          <p>手机验证码登录</p>
        </div>

        <form @submit.prevent="handlePhoneLogin" class="login-form">
          <div class="form-group">
            <label class="form-label">手机号</label>
            <input
              type="tel"
              class="form-input"
              v-model="phone"
              placeholder="请输入手机号"
              required
            >
          </div>

          <div class="form-group">
            <label class="form-label">验证码</label>
            <div class="sms-input-group">
              <input
                type="text"
                class="form-input"
                v-model="code"
                placeholder="请输入验证码"
                maxlength="6"
                required
              >
              <button
                type="button"
                class="btn btn-secondary sms-btn"
                @click="sendSms"
                :disabled="countdown > 0 || sending"
              >
                {{ countdown > 0 ? countdown + 's' : '获取验证码' }}
              </button>
            </div>
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>
          <div v-if="success" class="success-message">{{ success }}</div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <div class="login-footer">
          <span>使用其他方式？</span>
          <router-link to="/login" class="register-link">账号密码登录</router-link>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      phone: '',
      code: '',
      error: '',
      success: '',
      loading: false,
      sending: false,
      countdown: 0
    }
  },
  methods: {
    async sendSms() {
      if (!/^1[3-9]\d{9}$/.test(this.phone)) {
        this.error = '请输入正确的手机号';
        return;
      }

      this.error = '';
      this.sending = true;

      try {
        await api.sendSmsCode(this.phone);
        this.success = '验证码已发送';
        this.countdown = 60;
        const timer = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) clearInterval(timer);
        }, 1000);
      } catch (err) {
        this.error = err.message;
      } finally {
        this.sending = false;
      }
    },
    async handlePhoneLogin() {
      this.error = '';
      this.loading = true;

      try {
        await api.verifySmsCode(this.phone, this.code);
        this.$router.push('/');
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
}

// Register Page
const RegisterPage = {
  template: `
    <div class="login-page">
      <div class="login-container">
        <div class="login-header">
          <h1>CloudServerManager</h1>
          <p>创建新账户</p>
        </div>

        <form @submit.prevent="handleRegister" class="login-form">
          <div class="form-group">
            <label class="form-label">邮箱</label>
            <input
              type="email"
              class="form-input"
              v-model="email"
              placeholder="请输入邮箱"
              required
            >
          </div>

          <div class="form-group">
            <label class="form-label">密码</label>
            <input
              type="password"
              class="form-input"
              v-model="password"
              placeholder="请输入密码（至少6位）"
              required
            >
            <div class="password-strength">
              <div class="strength-bar" :class="passwordStrength.class" :style="{ width: passwordStrength.width }"></div>
            </div>
            <small class="strength-text" :class="passwordStrength.class">{{ passwordStrength.text }}</small>
          </div>

          <div class="form-group">
            <label class="form-label">确认密码</label>
            <input
              type="password"
              class="form-input"
              v-model="confirmPassword"
              placeholder="请再次输入密码"
              required
            >
          </div>

          <div class="form-group">
            <label class="form-label">手机号（可选）</label>
            <input
              type="tel"
              class="form-input"
              v-model="phone"
              placeholder="请输入手机号"
            >
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </form>

        <div class="login-footer">
          <span>已有账户？</span>
          <router-link to="/login" class="register-link">立即登录</router-link>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      error: '',
      loading: false
    }
  },
  computed: {
    passwordStrength() {
      const p = this.password;
      if (!p) return { class: '', width: '0%', text: '' };

      let score = 0;
      if (p.length >= 6) score++;
      if (p.length >= 10) score++;
      if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
      if (/\d/.test(p)) score++;
      if (/[^a-zA-Z0-9]/.test(p)) score++;

      if (score <= 2) return { class: 'weak', width: '33%', text: '弱' };
      if (score <= 3) return { class: 'medium', width: '66%', text: '中' };
      return { class: 'strong', width: '100%', text: '强' };
    }
  },
  methods: {
    async handleRegister() {
      this.error = '';

      if (this.password !== this.confirmPassword) {
        this.error = '两次密码输入不一致';
        return;
      }

      if (this.password.length < 6) {
        this.error = '密码至少6位';
        return;
      }

      this.loading = true;

      try {
        await api.register(this.email, this.password);
        alert('注册成功，请登录');
        this.$router.push('/login');
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
}

// Forgot Password Page
const ForgotPage = {
  template: `
    <div class="login-page">
      <div class="login-container">
        <div class="login-header">
          <h1>CloudServerManager</h1>
          <p>重置密码</p>
        </div>

        <form @submit.prevent="handleForgot" class="login-form">
          <div class="form-group">
            <label class="form-label">邮箱</label>
            <input
              type="email"
              class="form-input"
              v-model="email"
              placeholder="请输入注册邮箱"
              required
            >
          </div>

          <div v-if="tokenSent" class="form-group">
            <label class="form-label">重置令牌</label>
            <input
              type="text"
              class="form-input"
              v-model="token"
              placeholder="请输入邮箱中收到的令牌"
              required
            >
          </div>

          <div v-if="tokenSent" class="form-group">
            <label class="form-label">新密码</label>
            <input
              type="password"
              class="form-input"
              v-model="newPassword"
              placeholder="请输入新密码（至少6位）"
              required
            >
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>
          <div v-if="success" class="success-message">{{ success }}</div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? '处理中...' : (tokenSent ? '重置密码' : '发送重置链接') }}
          </button>
        </form>

        <div class="login-footer">
          <span>想起密码了？</span>
          <router-link to="/login" class="register-link">立即登录</router-link>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      email: '',
      token: '',
      newPassword: '',
      error: '',
      success: '',
      loading: false,
      tokenSent: false
    }
  },
  methods: {
    async handleForgot() {
      this.error = '';
      this.loading = true;

      try {
        if (!this.tokenSent) {
          const data = await api.forgotPassword(this.email);
          this.success = data.message;
          this.tokenSent = true;
        } else {
          await api.resetPassword(this.token, this.newPassword);
          alert('密码重置成功，请使用新密码登录');
          this.$router.push('/login');
        }
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
}

// Dashboard Page
const DashboardPage = {
  template: `
    <div class="dashboard">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">我的服务器</div>
          <div class="stat-value primary">{{ servers.length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">运行中</div>
          <div class="stat-value">{{ runningCount }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">本月消费</div>
          <div class="stat-value">¥{{ monthlySpend }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">账户余额</div>
          <div class="stat-value">¥{{ user.balance.toFixed(2) }}</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-title">快捷操作</div>
          <div class="quick-actions">
            <router-link to="/servers" class="btn btn-primary">购买服务器</router-link>
            <router-link to="/billing" class="btn btn-secondary">账户充值</router-link>
            <router-link to="/settings" class="btn btn-secondary">账户设置</router-link>
          </div>
        </div>
        <div class="card">
          <div class="card-title">服务器状态</div>
          <div class="status-summary">
            <div class="status-item">
              <span class="status-badge running">
                <span class="status-dot"></span>
                运行中 {{ runningCount }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-badge stopped">
                <span class="status-dot"></span>
                已停止 {{ stoppedCount }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-badge suspended">
                <span class="status-dot"></span>
                已暂停 {{ suspendedCount }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 24px;">
        <div class="card-title">我的服务器</div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>服务器名称</th>
                <th>IP 地址</th>
                <th>套餐</th>
                <th>状态</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="server in servers.slice(0, 3)" :key="server.id">
                <td>{{ server.name }}</td>
                <td>{{ server.ip }}</td>
                <td>{{ server.plan }}</td>
                <td>
                  <span class="status-badge" :class="server.status">
                    <span class="status-dot"></span>
                    {{ statusText(server.status) }}
                  </span>
                </td>
                <td>{{ server.created }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="servers.length === 0" class="empty-state">
          <div class="icon">🖥️</div>
          <div class="message">暂无服务器</div>
          <router-link to="/servers" class="btn btn-primary">立即购买</router-link>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      user: mockUser,
      servers: mockServers
    }
  },
  computed: {
    runningCount() {
      return this.servers.filter(s => s.status === 'running').length
    },
    stoppedCount() {
      return this.servers.filter(s => s.status === 'stopped').length
    },
    suspendedCount() {
      return this.servers.filter(s => s.status === 'suspended').length
    },
    monthlySpend() {
      return Math.abs(mockBillingRecords
        .filter(r => r.type === '消费' && r.date.startsWith('2026-04'))
        .reduce((sum, r) => sum + r.amount, 0))
    }
  },
  methods: {
    statusText(status) {
      const map = { running: '运行中', stopped: '已停止', suspended: '已暂停' }
      return map[status] || status
    }
  }
}

// Servers Page
const ServersPage = {
  template: `
    <div class="servers-page">
      <div class="page-header">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2>我的服务器</h2>
            <p>管理您所有的云服务器</p>
          </div>
          <button class="btn btn-primary">购买新服务器</button>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>服务器名称</th>
                <th>IP 地址</th>
                <th>套餐</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="server in servers" :key="server.id">
                <td>{{ server.name }}</td>
                <td>{{ server.ip }}</td>
                <td>{{ server.plan }}</td>
                <td>
                  <span class="status-badge" :class="server.status">
                    <span class="status-dot"></span>
                    {{ statusText(server.status) }}
                  </span>
                </td>
                <td>{{ server.created }}</td>
                <td>
                  <div class="server-actions">
                    <button v-if="server.status === 'running'" class="btn btn-secondary btn-sm" @click="toggleServer(server, 'stopped')">停止</button>
                    <button v-if="server.status === 'stopped'" class="btn btn-primary btn-sm" @click="toggleServer(server, 'running')">启动</button>
                    <button class="btn btn-secondary btn-sm">管理</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="servers.length === 0" class="empty-state">
          <div class="icon">🖥️</div>
          <div class="message">暂无服务器</div>
          <button class="btn btn-primary">立即购买</button>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      servers: [...mockServers]
    }
  },
  methods: {
    statusText(status) {
      const map = { running: '运行中', stopped: '已停止', suspended: '已暂停' }
      return map[status] || status
    },
    toggleServer(server, newStatus) {
      server.status = newStatus
    }
  }
}

// Billing Page
const BillingPage = {
  template: `
    <div class="billing-page">
      <div class="balance-card">
        <div class="label">账户余额</div>
        <div class="amount">¥{{ user.balance.toFixed(2) }}</div>
        <button class="btn">立即充值</button>
      </div>

      <div class="card">
        <div class="card-title">消费记录</div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>日期</th>
                <th>类型</th>
                <th>描述</th>
                <th>金额</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in records" :key="record.id">
                <td>{{ record.date }}</td>
                <td>
                  <span :style="{ color: record.type === '充值' ? '#2E7D32' : '#C62828' }">
                    {{ record.type }}
                  </span>
                </td>
                <td>{{ record.desc }}</td>
                <td :style="{ color: record.amount > 0 ? '#2E7D32' : '#C62828' }">
                  {{ record.amount > 0 ? '+' : '' }}{{ record.amount.toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="records.length === 0" class="empty-state">
          <div class="icon">💳</div>
          <div class="message">暂无账单记录</div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      user: mockUser,
      records: [...mockBillingRecords]
    }
  }
}

// Settings Page
const SettingsPage = {
  template: `
    <div class="settings-page">
      <div class="grid-2">
        <div class="card">
          <div class="settings-section">
            <h3>基本信息</h3>
            <div class="form-group">
              <label class="form-label">用户名</label>
              <input type="text" class="form-input" :value="user.name" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">邮箱</label>
              <input type="email" class="form-input" value="zhangsan@example.com">
            </div>
            <div class="form-group">
              <label class="form-label">手机号</label>
              <input type="tel" class="form-input" value="138****8888">
            </div>
            <button class="btn btn-primary">保存修改</button>
          </div>
        </div>

        <div class="card">
          <div class="settings-section">
            <h3>安全设置</h3>
            <div class="form-group">
              <label class="form-label">当前密码</label>
              <input type="password" class="form-input" placeholder="请输入当前密码">
            </div>
            <div class="form-group">
              <label class="form-label">新密码</label>
              <input type="password" class="form-input" placeholder="请输入新密码">
            </div>
            <div class="form-group">
              <label class="form-label">确认新密码</label>
              <input type="password" class="form-input" placeholder="请再次输入新密码">
            </div>
            <button class="btn btn-primary">修改密码</button>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 24px;">
        <div class="settings-section">
          <h3>API 密钥</h3>
          <div class="form-group">
            <label class="form-label">API 密钥</label>
            <input type="text" class="form-input" value="sk-xxxxxxxxxxxxx" readonly>
          </div>
          <div style="display: flex; gap: 12px;">
            <button class="btn btn-secondary">重新生成</button>
            <button class="btn btn-secondary">复制</button>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      user: mockUser
    }
  }
}

// Routes
const routes = [
  { path: '/', component: DashboardPage },
  { path: '/login', component: LoginPage },
  { path: '/login/phone', component: PhoneLoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/forgot', component: ForgotPage },
  { path: '/servers', component: ServersPage },
  { path: '/billing', component: BillingPage },
  { path: '/settings', component: SettingsPage }
]

// Router
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Navigation guard for auth
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/login/phone', '/register', '/forgot'];

  if (!publicPages.includes(to.path) && !window.api.isLoggedIn()) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
})

// App
const app = createApp({
  data() {
    return {
      user: mockUser,
      pageTitle: '仪表盘',
      sidebarOpen: false
    }
  },
  computed: {
    isAuthPage() {
      const authPages = ['/login', '/login/phone', '/register', '/forgot'];
      return authPages.includes(this.$route.path);
    }
  },
  watch: {
    '$route.path': {
      immediate: true,
      handler(path) {
        const titles = {
          '/': '仪表盘',
          '/login': '登录',
          '/login/phone': '手机登录',
          '/register': '注册',
          '/forgot': '忘记密码',
          '/servers': '我的服务器',
          '/billing': '账单中心',
          '/settings': '账户设置'
        }
        this.pageTitle = titles[path] || '控制台'
        this.sidebarOpen = false
      }
    }
  }
})

app.use(router)
app.mount('#app')
