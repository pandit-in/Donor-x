const express = require('express');
const { getBanks } = require('../controllers/bankController');

const router = express.Router();

router.get('/', getBanks);

module.exports = router;
