const prisma = require('../db/prisma');

class PlanService {
  async getPlans(category = null) {
    const where = { status: 'active' };
    if (category) {
      where.category = category;
    }

    const plans = await prisma.plan.findMany({
      where,
      orderBy: { price: 'asc' }
    });

    return plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      category: plan.category,
      price: Number(plan.price),
      specs: plan.specs
    }));
  }

  async getPlan(planId) {
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      throw new Error('套餐不存在');
    }

    return {
      id: plan.id,
      name: plan.name,
      category: plan.category,
      price: Number(plan.price),
      specs: plan.specs
    };
  }
}

module.exports = new PlanService();
