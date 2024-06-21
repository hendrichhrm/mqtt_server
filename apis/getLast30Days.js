const { DataValue } = require('../model/data');

const getLast30Days = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const data = await DataValue.find({
            waktu: { $gte: thirtyDaysAgo }
        }).sort({ waktu: -1 });

        const validData = data.filter(entry => entry.nilai && entry.nilai.Unit !== undefined && entry.nilai.Setpoint !== undefined && entry.nilai.Temperature !== undefined);

        res.status(200).json(validData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = getLast30Days;
