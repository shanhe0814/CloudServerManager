const planService = require('../services/plan.service');

const getPlans = async (req, res) => {
  try {
    const { category } = req.query;
    const plans = await planService.getPlans(category);
    res.json({ data: plans });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPlan = async (req, res) => {
  try {
    const plan = await planService.getPlan(req.params.id);
    res.json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getPlans,
  getPlan
};
