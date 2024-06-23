const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const { DataValue } = require('../model/data');
const authMiddleware = require('../middleware/authMiddleware');
require('dotenv').config();
let lastLoggedInUser = ''; 

router.get('/last30days', authMiddleware, getLast30Days,  async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        console.log('Querying data from MongoDB...');
        const data = await DataValue.find({
            waktu: { $gte: thirtyDaysAgo }
        })
        .sort({ waktu: -1 })
        .populate('user', 'username'); 

        console.log('Data received from MongoDB:', data);

        const validData = data.filter(entry => {
            const { Unit, Setpoint, Temperature } = entry.nilai;
            return Unit !== undefined && Unit !== null ||
                    Setpoint !== undefined && Setpoint !== null ||
                    Temperature !== undefined && Temperature !== null;
        });

        const dataWithTimezone = validData.map(entry => {
            const localizedTime = moment(entry.waktu).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
            return {
                ...entry.toObject(),
                waktu: localizedTime
            };
        });

        const responseObject = {
            data: dataWithTimezone,
            lastLoggedInUser: lastLoggedInUser 
        };

        console.log('Response to be sent to frontend:', JSON.stringify(responseObject, null, 2)); 
        res.status(200).json(responseObject);
    } catch (error) {
        console.error('Error getting last 30 days data:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
