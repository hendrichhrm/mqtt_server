const express = require('express');
const moment = require('moment-timezone'); // Pastikan moment-timezone diimpor
const { DataValue } = require('../model/data');
const getLast30Days = require('../apis/getLast30Days');
require('dotenv').config();

const router = express.Router();

router.get('/data', async (res) => {
    try {
        const data = await DataValue.find();
        // Convert waktu to GMT+7 for each data entry
        const dataWithTimezone = data.map(entry => {
            const localizedTime = moment(entry.waktu).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
            return {
                ...entry.toObject(),
                waktu: localizedTime
            };
        });

        res.status(200).json(dataWithTimezone);
    } catch (error) {
        console.error('Error getting data:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/last30days', getLast30Days);

module.exports = router;
