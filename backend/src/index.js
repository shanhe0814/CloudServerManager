const app = require('./app');
const config = require('./config');
const prisma = require('./db/prisma');

const PORT = config.port;

async function main() {
  try {
    // 测试数据库连接
    await prisma.$connect();
    console.log('[INFO] Database connected');

    app.listen(PORT, () => {
      console.log(`[INFO] CloudServerManager API started: http://localhost:${PORT}`);
      console.log(`[INFO] Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('[ERROR] Startup failed:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('[INFO] Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[INFO] Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

main();
