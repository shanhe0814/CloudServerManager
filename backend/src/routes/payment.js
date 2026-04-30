/**
 * 支付路由 - 微信/支付宝回调预留接口
 */
const express = require('express');
const router = express.Router();
const paymentService = require('../services/payment.service');

// 微信支付回调
router.post('/wechat/callback', async (req, res) => {
  try {
    await paymentService.handleWechatCallback(req.body);
    res.json({ code: 'SUCCESS', message: '处理成功' });
  } catch (error) {
    console.error('微信支付回调错误:', error);
    res.status(400).json({ error: error.message });
  }
});

// 支付宝回调
router.post('/alipay/callback', async (req, res) => {
  try {
    await paymentService.handleAlipayCallback(req.body);
    res.json({ code: 'SUCCESS', message: '处理成功' });
  } catch (error) {
    console.error('支付宝回调错误:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
