const mqtt = require('mqtt');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const { DataValue } = require('../model/data');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB', err);
    });

// Connect to MQTT broker
const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

client.on('connect',async (topic, message) => {
    const data = JSON.parse(message.toString());
        console.log(`Received data: ${JSON.stringify(data)} on topic: ${topic}`);

    console.log('MQTT client connected');
    client.subscribe(['skripsi/byhendrich/dashtoesp', 'skripsi/byhendrich/esptodash', 'skripsi/byhendrich/esp32status'], { qos: 2 }, (error) => {
        if (error) {
            console.log('Subscription error:', error);
        } else {
            console.log('Subscribed to skripsi/byhendrich/dashtoesp, skripsi/byhendrich/esptodash, and skripsi/byhendrich/esp32status');
        }
    });
});

client.on('message', async (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        console.log(`Received data: ${JSON.stringify(data)} on topic: ${topic}`);
        let newEntry;

        if (topic === 'skripsi/byhendrich/dashtoesp') {
            const { Unit, Setpoint } = data;
            newEntry = new DataValue({
                waktu: moment().tz('Asia/Jakarta').format(),  // Use moment-timezone to set time in GMT+7
                nilai: {
                    Unit: Unit,
                    Setpoint: Setpoint
                }
            });
            console.log('dashtoesp success');
        } else if (topic === 'skripsi/byhendrich/esptodash') {
            if (!data.Unit || !data.Setpoint || data.Temperature === undefined) {
                console.error('Missing required data fields', data);
                return;  // Skip saving incomplete data
            }

            let newEntry = new DataValue({
                waktu: moment().tz('Asia/Jakarta').format(), // Assign current time in Jakarta timezone
                nilai: {
                    Unit: data.Unit,
                    Setpoint: data.Setpoint,
                    Temperature: data.Temperature
                }
            });
            console.log('Attempting to save:', newEntry);
            await newEntry.save();
            console.log('Data saved to MongoDB:', newEntry);
        }
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

// Function to publish messages
const publishPesan = (req, res) => {
    const message = JSON.stringify(req.body);
    client.publish('skripsi/byhendrich/dashtoesp', message, {}, (error) => {
        if (error) {
            console.error('Failed to publish message:', error);
            return res.status(500).send('Failed to publish message');
        }
        res.status(200).send('Message published');
    });
};

const getPesan = async (req, res) => {
    try {
        const messages = await DataValue.find();
        res.json(messages);
    } catch (err) {
        console.error('Error retrieving messages:', err);
        res.status(500).send(err.message);
    }
};

module.exports = { publishPesan, getPesan };
