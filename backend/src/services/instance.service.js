const prisma = require('../db/prisma');
const { v4: uuidv4 } = require('uuid');

class InstanceService {
  // 获取用户所有实例
  async getInstances(userId) {
    const instances = await prisma.instance.findMany({
      where: { userId, status: { not: 'deleted' } },
      include: { plan: true },
      orderBy: { createdAt: 'desc' }
    });

    return instances.map(inst => ({
      id: inst.id,
      name: inst.name,
      status: inst.status,
      ipAddress: inst.ipAddress,
      specs: inst.specs,
      expiresAt: inst.expiresAt,
      createdAt: inst.createdAt,
      plan: inst.plan ? {
        id: inst.plan.id,
        name: inst.plan.name,
        category: inst.plan.category,
        price: Number(inst.plan.price),
        specs: inst.plan.specs
      } : null
    }));
  }

  // 获取单个实例
  async getInstance(userId, instanceId) {
    const instance = await prisma.instance.findFirst({
      where: { id: instanceId, userId, status: { not: 'deleted' } },
      include: { plan: true }
    });

    if (!instance) {
      throw new Error('实例不存在');
    }

    return {
      id: instance.id,
      name: instance.name,
      status: instance.status,
      ipAddress: instance.ipAddress,
      specs: instance.specs,
      expiresAt: instance.expiresAt,
      createdAt: instance.createdAt,
      plan: instance.plan ? {
        id: instance.plan.id,
        name: instance.plan.name,
        category: instance.plan.category,
        price: Number(instance.plan.price),
        specs: instance.plan.specs
      } : null
    };
  }

  // 创建实例（模拟）
  async createInstance(userId, data) {
    const { name, planId } = data;

    // 获取套餐
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw new Error('套餐不存在');
    }

    // 模拟生成 IP 和密码
    const ipAddress = `10.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
    const rootPassword = Math.random().toString(36).substr(2, 12);

    const instance = await prisma.instance.create({
      data: {
        userId,
        name,
        planId,
        status: 'pending',
        ipAddress,
        specs: plan.specs,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后
      }
    });

    // 模拟创建成功，1秒后变为 running
    setTimeout(async () => {
      await prisma.instance.update({
        where: { id: instance.id },
        data: { status: 'running' }
      });
    }, 1000);

    return {
      id: instance.id,
      name: instance.name,
      status: 'pending',
      ipAddress,
      specs: plan.specs,
      expiresAt: instance.expiresAt
    };
  }

  // 删除实例
  async deleteInstance(userId, instanceId) {
    const instance = await prisma.instance.findFirst({
      where: { id: instanceId, userId, status: { not: 'deleted' } }
    });

    if (!instance) {
      throw new Error('实例不存在');
    }

    await prisma.instance.update({
      where: { id: instanceId },
      data: { status: 'deleted' }
    });

    return { success: true };
  }

  // 实例操作（开机/关机/重启/重装）
  async operateInstance(userId, instanceId, action) {
    const instance = await prisma.instance.findFirst({
      where: { id: instanceId, userId, status: { not: 'deleted' } }
    });

    if (!instance) {
      throw new Error('实例不存在');
    }

    const validActions = ['start', 'stop', 'reboot', 'reinstall'];
    if (!validActions.includes(action)) {
      throw new Error('无效的操作');
    }

    // 模拟操作
    const statusMap = {
      start: 'running',
      stop: 'stopped',
      reboot: 'running',
      reinstall: 'reinstalling'
    };

    await prisma.instance.update({
      where: { id: instanceId },
      data: { status: statusMap[action] }
    });

    // reinstall 模拟完成后变为 running
    if (action === 'reinstall') {
      setTimeout(async () => {
        await prisma.instance.update({
          where: { id: instanceId },
          data: { status: 'running' }
        });
      }, 3000);
    }

    return {
      id: instanceId,
      action,
      status: statusMap[action]
    };
  }

  // 获取监控数据（模拟）
  async getMetrics(instanceId) {
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId }
    });

    if (!instance) {
      throw new Error('实例不存在');
    }

    // 模拟监控数据
    const randomValue = (min, max) => Math.random() * (max - min) + min;

    return {
      cpu: Math.round(randomValue(5, 85) * 100) / 100,
      memory: Math.round(randomValue(20, 90) * 100) / 100,
      disk: Math.round(randomValue(10, 70) * 100) / 100,
      networkIn: Math.round(randomValue(100, 10000)),
      networkOut: Math.round(randomValue(50, 5000)),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new InstanceService();
