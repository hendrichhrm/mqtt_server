//This code is Created by Hendrich H M
// You could adjust this code to your needs
// However, you can't remove the author's because it's against the law
// This code is Copyright of the author

const { DataValue } = require('../model/data');

const getLast30Days = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Query your MongoDB database for the last 30 days of data
        const data = await DataValue.find({
            waktu: { $gte: thirtyDaysAgo }
        }).sort({ waktu: -1 }).populate('user', 'username'); // Populate user field with username

        const validData = data.filter(entry => 
            entry.nilai && (entry.nilai.Unit !== undefined || entry.nilai.Setpoint !== undefined || entry.nilai.Temperature !== undefined));

        res.status(200).json({
            data: validData, // or combinedData if combining
            lastLoggedInUser: req.user.username // Assuming `req.user` contains the logged-in user's info
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = getLast30Days;
