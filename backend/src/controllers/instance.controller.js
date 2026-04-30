const instanceService = require('../services/instance.service');

const getInstances = async (req, res) => {
  try {
    const instances = await instanceService.getInstances(req.user.id);
    res.json({ data: instances });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getInstance = async (req, res) => {
  try {
    const instance = await instanceService.getInstance(req.user.id, req.params.id);
    res.json(instance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createInstance = async (req, res) => {
  try {
    const { name, planId } = req.body;

    if (!name) {
      return res.status(400).json({ error: '实例名称不能为空' });
    }

    if (!planId) {
      return res.status(400).json({ error: '请选择套餐' });
    }

    const instance = await instanceService.createInstance(req.user.id, { name, planId });
    res.json(instance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteInstance = async (req, res) => {
  try {
    const result = await instanceService.deleteInstance(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const operateInstance = async (req, res) => {
  try {
    const { action } = req.body;
    const result = await instanceService.operateInstance(req.user.id, req.params.id, action);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMetrics = async (req, res) => {
  try {
    const metrics = await instanceService.getMetrics(req.params.id);
    res.json(metrics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getInstances,
  getInstance,
  createInstance,
  deleteInstance,
  operateInstance,
  getMetrics
};
