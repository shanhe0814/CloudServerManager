const express = require('express');
const router = express.Router();
const instanceController = require('../controllers/instance.controller');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', instanceController.getInstances);
router.get('/:id', instanceController.getInstance);
router.post('/', instanceController.createInstance);
router.delete('/:id', instanceController.deleteInstance);
router.post('/:id/operate', instanceController.operateInstance);
router.get('/:id/metrics', instanceController.getMetrics);

module.exports = router;
