const express = require('express');
const router = express.Router();
const db = require("../models");

router.get('/', async (req, res) => {
  try {
    const categories = await db.Category.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
