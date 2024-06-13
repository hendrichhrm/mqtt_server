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

client.on('connect', () => {
    console.log('MQTT client connected');
    client.subscribe(['skripsi/byhendrich/dashtoesp', 'skripsi/byhendrich/esptodash'], { qos: 2 }, (error) => {
        if (error) {
            console.log('Subscription error:', error);
        } else {
            console.log('Subscribed to skripsi/byhendrich/dashtoesp and skripsi/byhendrich/esptodash');
        }
    });
});

client.on('message', async (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        console.log(`Received data: ${JSON.stringify(data)} on topic: ${topic}`);
        let newEntry;

        const timestamp = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');

        if (topic === 'skripsi/byhendrich/dashtoesp') {
            const { Unit, Setpoint } = data;
            newEntry = new DataValue({
                waktu: timestamp,
                nilai: {
                    Unit: Unit,
                    Setpoint: Setpoint
                }
            });
            console.log('dashtoesp success');
        } else if (topic === 'skripsi/byhendrich/esptodash') {
            const { Unit, Setpoint, Temperature } = data;
            newEntry = new DataValue({
                waktu: timestamp,
                nilai: {
                    Unit: Unit,
                    Setpoint: Setpoint,
                    Temperature: Temperature
                }
            });
            console.log('esptodash success');
        }

        if (newEntry) {
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
