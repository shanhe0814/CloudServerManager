const accountService = require('../services/account.service');

const getAccount = async (req, res) => {
  try {
    const account = await accountService.getAccount(req.user.id);
    res.json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const result = await accountService.getTransactions(
      req.user.id,
      parseInt(page),
      parseInt(pageSize)
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const recharge = async (req, res) => {
  try {
    const { amount, channel } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: '请输入正确的充值金额' });
    }

    if (!['wechat', 'alipay'].includes(channel)) {
      return res.status(400).json({ error: '请选择支付方式' });
    }

    const result = await accountService.recharge(req.user.id, amount, channel);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAccount,
  getTransactions,
  recharge
};
