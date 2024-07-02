//This code is Created by Hendrich H M
// You could adjust this code to your needs
// However, you can't remove the author's because it's against the law
// This code is Copyright of the author

const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
    waktu: { type: Date, required: false },
    nilai: {
        Unit: { type: String, required: false },
        Setpoint: { type: Number, required: false },
        Temperature: { type: String, required: false }
        
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false } 
}, { collection: 'datavalues' });

const DataValue = mongoose.model('DataValue', DataSchema);

module.exports = { DataValue };
