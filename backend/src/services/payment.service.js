/**
 * 支付服务 - 微信支付/支付宝预留接口
 * 
 * TODO: 商户号申请后对接真实支付
 * - 微信支付 V3: https://pay.weixin.qq.com/docs/v3/
 * - 支付宝当面付: https://opendocs.alipay.com/open/194
 */

class PaymentService {
  /**
   * 创建微信支付订单
   * @param {string} orderId - 我们的订单号
   * @param {number} amount - 金额（分）
   * @param {string} description - 商品描述
   * @returns {Promise<object>} 支付参数
   */
  async createWechatPayOrder(orderId, amount, description) {
    // TODO: 对接微信支付 V3 API
    // const { WechatPay } = require('wechatpay-node-v3');
    // const wechatPay = new WechatPay({
    //   mchid: process.env.WECHAT_MCH_ID,
    //   serial: process.env.WECHAT_SERIAL_NO,
    //   privateKey: fs.readFileSync(process.env.WECHAT_PRIVATE_KEY_PATH),
    //   certs: { ... }
    // });
    
    console.log(`[Payment] 微信支付预留: orderId=${orderId}, amount=${amount}, description=${description}`);
    
    return {
      code: 'PAY_PENDING',
      message: '微信支付接口预留，商户号申请后对接',
      data: {
        orderId,
        simulated: true,
        prepayId: `SIM_WX_${Date.now()}`
      }
    };
  }

  /**
   * 创建支付宝支付订单
   * @param {string} orderId - 我们的订单号
   * @param {number} amount - 金额（元）
   * @param {string} subject - 商品名称
   * @returns {Promise<object>} 支付参数
   */
  async createAlipayOrder(orderId, amount, subject) {
    // TODO: 对接支付宝当面付
    // const AlipaySDK = require('alipay-sdk').default;
    // const alipay = new AlipaySDK({
    //   appId: process.env.ALIPAY_APP_ID,
    //   privateKey: process.env.ALIPAY_PRIVATE_KEY,
    //   alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY
    // });
    
    console.log(`[Payment] 支付宝支付预留: orderId=${orderId}, amount=${amount}, subject=${subject}`);
    
    return {
      code: 'PAY_PENDING',
      message: '支付宝支付接口预留，商户号申请后对接',
      data: {
        orderId,
        simulated: true,
        qrCode: `SIM_ALIPAY_${Date.now()}`
      }
    };
  }

  /**
   * 处理微信支付回调
   * @param {object} notifyData - 回调数据
   * @returns {Promise<object>} 处理结果
   */
  async handleWechatCallback(notifyData) {
    // TODO: 验证签名、处理回调
    // 1. 验证签名 WechatPay.verifyNotification()
    // 2. 更新订单状态
    // 3. 更新账户余额
    // 4. 记录流水
    
    console.log('[Payment] 微信支付回调预留:', notifyData);
    throw new Error('微信支付回调接口预留，商户号申请后对接');
  }

  /**
   * 处理支付宝回调
   * @param {object} notifyData - 回调数据
   * @returns {Promise<object>} 处理结果
   */
  async handleAlipayCallback(notifyData) {
    // TODO: 验证签名、处理回调
    // 1. 验证签名 alipay.checkNotificationV2()
    // 2. 更新订单状态
    // 3. 更新账户余额
    // 4. 记录流水
    
    console.log('[Payment] 支付宝回调预留:', notifyData);
    throw new Error('支付宝回调接口预留，商户号申请后对接');
  }

  /**
   * 查询微信支付订单状态
   * @param {string} tradeNo - 交易单号
   * @returns {Promise<object>} 订单状态
   */
  async queryWechatOrder(tradeNo) {
    // TODO: 对接微信支付查询接口
    console.log(`[Payment] 查询微信订单预留: tradeNo=${tradeNo}`);
    return {
      status: 'pending',
      message: '微信支付查询接口预留'
    };
  }

  /**
   * 查询支付宝订单状态
   * @param {string} tradeNo - 交易单号
   * @returns {Promise<object>} 订单状态
   */
  async queryAlipayOrder(tradeNo) {
    // TODO: 对接支付宝查询接口
    console.log(`[Payment] 查询支付宝订单预留: tradeNo=${tradeNo}`);
    return {
      status: 'pending',
      message: '支付宝查询接口预留'
    };
  }
}

module.exports = new PaymentService();
