const prisma = require('./prisma');

const plans = [
  // 性能云
  {
    name: 'Ryzen Pro',
    category: 'performance',
    price: 149,
    specs: { cpu: 'AMD Ryzen 9 9950X', cores: '4核 4.5GHz', memory: '16GB DDR5', bandwidth: '5Mbps', storage: '100GB NVMe' },
    status: 'active'
  },
  {
    name: 'Core Elite',
    category: 'performance',
    price: 199,
    specs: { cpu: 'Intel i9-14900K', cores: '8核 5.6GHz', memory: '32GB DDR5', bandwidth: '10Mbps', storage: '200GB NVMe' },
    status: 'active'
  },
  {
    name: 'EPYC Max',
    category: 'performance',
    price: 299,
    specs: { cpu: 'AMD EPYC 9684X', cores: '12核 4.0GHz', memory: '64GB DDR5', bandwidth: '20Mbps', storage: '500GB NVMe' },
    status: 'active'
  },
  // 普惠云
  {
    name: 'Xeon Basic',
    category: 'budget',
    price: 39,
    specs: { cpu: 'Intel Xeon E-22xx', cores: '2核 3.5GHz', memory: '4GB DDR4', bandwidth: '2Mbps', storage: '80GB SSD' },
    status: 'active'
  },
  {
    name: 'EPYC Value',
    category: 'budget',
    price: 69,
    specs: { cpu: 'AMD EPYC 7302', cores: '4核 3.0GHz', memory: '8GB DDR4', bandwidth: '5Mbps', storage: '150GB SSD' },
    status: 'active'
  },
  {
    name: 'Xeon Power',
    category: 'budget',
    price: 129,
    specs: { cpu: 'Intel Xeon Gold', cores: '8核 3.8GHz', memory: '16GB DDR4', bandwidth: '10Mbps', storage: '300GB SSD' },
    status: 'active'
  },
  // GPU云
  {
    name: 'RTX 推理版',
    category: 'gpu',
    price: 299,
    specs: { gpu: 'NVIDIA RTX 4090', cpu: '8核', memory: '32GB DDR5', storage: '200GB NVMe' },
    status: 'active'
  },
  {
    name: 'A100 训练版',
    category: 'gpu',
    price: 599,
    specs: { gpu: 'NVIDIA A100 40GB', cpu: '16核', memory: '64GB DDR4', storage: '500GB NVMe' },
    status: 'active'
  },
  {
    name: 'H100 旗舰版',
    category: 'gpu',
    price: 1299,
    specs: { gpu: 'NVIDIA H100 80GB', cpu: '32核', memory: '128GB DDR5', storage: '1TB NVMe' },
    status: 'active'
  },
  // IDC 机房托管
  {
    name: '入门型机柜',
    category: 'idc',
    price: 1999,
    specs: { cabinet: '1/2机柜', power: '4KW', bandwidth: '10Mbps', ip: '2个IP', protection: '100Gbps DDoS防护' },
    status: 'active'
  },
  {
    name: '标准型机柜',
    category: 'idc',
    price: 3999,
    specs: { cabinet: '1机柜', power: '8KW', bandwidth: '50Mbps', ip: '5个IP', protection: '200Gbps DDoS防护' },
    status: 'active'
  },
  {
    name: '旗舰型机柜',
    category: 'idc',
    price: 5999,
    specs: { cabinet: '2机柜', power: '16KW', bandwidth: '100Mbps', ip: '10个IP', protection: '无限防护' },
    status: 'active'
  }
];

async function seed() {
  console.log('🌱 开始初始化数据...');

  try {
    // 清理现有数据
    await prisma.transaction.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.instance.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️  已清理现有数据');

    // 创建套餐
    for (const plan of plans) {
      await prisma.plan.create({ data: plan });
    }
    console.log(`[INFO] Created ${plans.length} plans`);

    console.log('[INFO] Data initialization complete');
  } catch (error) {
    console.error('[ERROR] Initialization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
