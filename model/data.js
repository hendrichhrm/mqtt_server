const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
    waktu: { type: Date, required: false },
    nilai: {
        Unit: { type: String, required: false },
        Setpoint: { type: Number, required: false },
        Temperature: { type: Number, required: false }
    }
});

const DataValue = mongoose.model('DataValue', DataSchema);

module.exports = { DataValue };
