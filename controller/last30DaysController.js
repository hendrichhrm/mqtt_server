const express = require('express');
const router = express.Router();
const getLast30Days = require('../apis/getLast30Days');

router.get('/last30days', getLast30Days);

module.exports = router;
