//This code is Created by Hendrich H M
// You could adjust this code to your needs
// However, you can't remove the author's because it's against the law
// This code is Copyright of the author

const express = require('express');
const moment = require('moment-timezone');
const { DataValue } = require('../model/data');
const authMiddleware = require('../middleware/authMiddleware');
require('dotenv').config();

const router = express.Router();

// Route to handle POST requests to save data
router.post('/send-message', authMiddleware, async (req, res) => {
    const { waktu, nilai } = req.body;
    console.log('Received data to save:', req.body);
    try {
        const timestampInJakarta = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
        const newData = new DataValue({ waktu: timestampInJakarta, nilai, user: req.user.username }); 
        await newData.save();
        console.log('Data saved to MongoDB:', newData);
        res.status(200).json({ message: 'Message sent successfully', data: newData });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to handle GET requests to fetch data
router.get('/last30days', authMiddleware, async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        console.log('Querying data from MongoDB...');
        const data = await DataValue.find({
            waktu: { $gte: thirtyDaysAgo }
        })
        .sort({ waktu: -1 })
        .populate('user', 'username');  // Populate field user dengan username

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
            lastLoggedInUser: req.user.username  // Gunakan req.user.username dari middleware
        };

        console.log('Response to be sent to frontend:', JSON.stringify(responseObject, null, 2));
        res.status(200).json(responseObject);
    } catch (error) {
        console.error('Error getting last 30 days data:', error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
