# CloudServerManager 技术架构

## 项目概述
CloudServerManager 云服务商平台，提供云服务器、GPU计算、IDC机房托管服务。

## 技术栈

### 后端
- **运行环境**: Node.js 18+
- **框架**: Express.js 4.18
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcrypt
- **支付接口**: 微信支付 V3 / 支付宝（预留对接）

### 前端
- **控制台**: Vue 3 (SPA)
- **主页**: HTML + CSS (樱花粉主题)

### 数据库模型
```
User          - 用户账户
Account       - 账户余额/消费
Plan          - 产品套餐（性能云/普惠云/GPU云/IDC托管）
Instance      - 云服务器实例
Order         - 订单记录
Transaction   - 账户流水
Payment       - 支付记录
```

### API 路由
```
/api/auth        - 用户注册、登录、刷新令牌
/api/account     - 账户查询、充值
/api/instances   - 实例管理（创建/删除/启停/重装）
/api/plans       - 套餐查询
/api/pay         - 支付回调（微信/支付宝）
```

### 环境变量
| 变量 | 说明 |
|------|------|
| DATABASE_URL | PostgreSQL 连接地址 |
| JWT_SECRET | JWT 签名密钥 |
| CORS_ORIGIN | 允许的跨域来源 |
| PORT | 服务端口 |

## 部署架构
- Docker Compose 编排
- Nginx 反向代理
- PostgreSQL 数据持久化
