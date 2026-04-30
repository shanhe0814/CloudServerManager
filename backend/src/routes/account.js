const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', accountController.getAccount);
router.get('/transactions', accountController.getTransactions);
router.post('/recharge', accountController.recharge);

module.exports = router;
