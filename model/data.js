const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
    waktu: { type: Date, required: true }, // Gunakan tipe Date untuk waktu
    nilai: {
        Unit: { type: String, required: true },
        Setpoint: { type: Number, required: true },
        Temperature: { type: Number, required: true },
    }
});

const DataValue = mongoose.model('DataValue', DataSchema);

module.exports = { DataValue };
