const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
    waktu: { type: String, required: false },
    nilai: {
        Unit: { type: String, required: false },
        Setpoint: { type: Number, required: false },
        //Sampling: { type: Number, required: false },
        Temperature: { type: Number, required: false },
        //DutyCycle: { type: Number, required: false }
    }
});

const DataValue = mongoose.model('DataValue', DataSchema);

module.exports = { DataValue };
