# CloudServerManager 云服务商平台

## 项目概述

CloudServerManager 是一个完整的云服务商平台，提供云服务器、GPU 计算、IDC 机房托管服务。包含面向客户的前端主页、用户控制台，以及完整的后端 API 服务。

## 技术栈

### 前端

| 模块 | 技术 | 说明 |
|------|------|------|
| 主页 | HTML + Vue 3 (CDN) | 樱花粉主题（#FEDFE1），响应式设计 |
| 控制台 | Vue 3 SPA | 用户管理控制台 |

### 后端

- **运行时**: Node.js 18+
- **框架**: Express.js 4.18
- **数据库**: PostgreSQL 15 + Prisma ORM
- **认证**: JWT (jsonwebtoken) + bcrypt 密码加密
- **支付**: 微信支付 V3 / 支付宝（预留接口）

## 功能模块

### 主页 (`index.html`)

- **导航栏**: 主页、云服务器（性能云/普惠云/GPU云）、机房托管、联系我们、控制台
- **Hero 区域**: 主标题 + 副标题
- **热门活动**: 自动轮播卡片，支持触摸滑动和导航按钮（移动端）
- **统计数据**: SLA 99.99%、10+ 数据中心、7×24 技术支持、5 万+ 企业用户
- **产品页**:
  - 性能云（Ryzen Pro/Core Elite/EPYC Max）
  - 普惠云（Xeon Basic/EPYC Value/Xeon Power）
  - GPU 云（RTX 4090/A100/H100）
- **IDC 托管**: 机柜托管套餐 + T3+ 数据中心特色介绍
- **联系我们**: 售前/技术支持/商务合作入口
- **响应式**: 768px 断点，移动端汉堡菜单

### 后端 API (`backend/`)

| 路由 | 服务 | 功能 |
|------|------|------|
| `/api/auth` | auth.service | 注册、登录、刷新令牌 |
| `/api/account` | account.service | 账户余额查询、充值 |
| `/api/instances` | instance.service | 实例创建/删除/启停/重装系统 |
| `/api/plans` | plan.service | 套餐查询 |
| `/api/pay` | payment.service | 微信/支付宝支付回调 |

### 数据模型

```
User          - 用户账户
Account       - 账户余额/消费
Plan          - 产品套餐（性能云/普惠云/GPU云/IDC托管）
Instance      - 云服务器实例
Order         - 订单记录
Transaction   - 账户流水
Payment       - 支付记录
```

## 部署架构

```
┌─────────────────────────────────────┐
│           Nginx (反向代理)           │
├─────────────┬─────────────────────┤
│  主页 (8080) │    控制台 (8081)     │
├─────────────┴─────────────────────┤
│         Express Backend (3000)     │
├───────────────────────────────────┤
│         PostgreSQL (5432)          │
└───────────────────────────────────┘
```

- `docker-compose.yml` 编排 db + backend 服务
- `nginx.conf` 提供静态文件服务与 SPA 路由 fallback
- 数据持久化: `postgres_data` Docker 音量

## 快速启动

```bash
# 启动所有服务
docker-compose up -d

# 初始化数据库
cd backend && npx prisma migrate deploy
```

## 目录结构

```
/workspace
├── index.html          # CloudServerManager 主页 (Vue 3 SPA)
├── nginx.conf          # Nginx 配置
├── Dockerfile          # 主页镜像构建
├── docker-compose.yml  # 服务编排
├── SPEC.md             # 页面规格文档
├── backend/
│   ├── src/
│   │   ├── controllers/  # 路由控制器
│   │   ├── services/     # 业务逻辑
│   │   ├── routes/       # API 路由
│   │   ├── middlewares/  # 中间件 (JWT 认证)
│   │   ├── utils/        # 工具函数
│   │   └── db/           # Prisma 客户端
│   └── prisma/           # 数据模型
├── console/             # 用户控制台 (Vue 3 SPA)
└── img/                 # 静态资源
```
