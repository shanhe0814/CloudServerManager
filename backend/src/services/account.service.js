const prisma = require('../db/prisma');
const { Decimal } = require('@prisma/client/runtime/library');

class AccountService {
  async getAccount(userId) {
    const account = await prisma.account.findUnique({
      where: { userId }
    });

    if (!account) {
      throw new Error('账户不存在');
    }

    return {
      balance: Number(account.balance),
      frozenAmount: Number(account.frozenAmount),
      totalCharged: Number(account.totalCharged),
      totalConsumed: Number(account.totalConsumed),
      availableBalance: Number(account.balance) - Number(account.frozenAmount)
    };
  }

  async getTransactions(userId, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.transaction.count({ where: { userId } })
    ]);

    return {
      data: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        balanceBefore: t.balanceBefore ? Number(t.balanceBefore) : null,
        balanceAfter: t.balanceAfter ? Number(t.balanceAfter) : null,
        remark: t.remark,
        createdAt: t.createdAt
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  async recharge(userId, amount, channel) {
    // TODO: 对接微信/支付宝支付
    // 此处预留，模拟充值成功
    if (amount <= 0) {
      throw new Error('充值金额必须大于 0');
    }

    const account = await prisma.account.findUnique({ where: { userId } });
    if (!account) {
      throw new Error('账户不存在');
    }

    // 创建充值订单（模拟直接成功）
    const order = await prisma.order.create({
      data: {
        userId,
        amount: new Decimal(amount),
        periodMonths: 0,
        status: 'paid',
        payChannel: channel,
        paidAt: new Date(),
        payment: {
          create: {
            channel,
            status: 'success',
            totalAmount: new Decimal(amount),
            actualAmount: new Decimal(amount),
            tradeNo: `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
        }
      }
    });

    // 更新余额
    const newBalance = new Decimal(account.balance).plus(amount);
    await prisma.account.update({
      where: { userId },
      data: {
        balance: newBalance,
        totalCharged: new Decimal(account.totalCharged).plus(amount)
      }
    });

    // 记录流水
    await prisma.transaction.create({
      data: {
        userId,
        type: 'recharge',
        amount: new Decimal(amount),
        balanceBefore: account.balance,
        balanceAfter: newBalance,
        orderId: order.id,
        remark: `${channel === 'wechat' ? '微信' : channel === 'alipay' ? '支付宝' : '余额'}充值`
      }
    });

    return {
      orderId: order.id,
      amount,
      status: 'success'
    };
  }
}

module.exports = new AccountService();
