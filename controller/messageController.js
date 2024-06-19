const express = require('express');
const moment = require('moment-timezone');
const { DataValue } = require('../model/data');

const router = express.Router();

router.post('/send-message', async (req, res) => {
    const { waktu, nilai } = req.body;
    console.log('Received data to save:', req.body);
    try {
        const newData = new DataValue({ waktu, nilai });
        await newData.save();
        console.log('Data saved to MongoDB:', newData);
        res.status(200).json({ message: 'Message sent successfully', data: newData });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/data', async (req, res) => {
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

module.exports = router;
