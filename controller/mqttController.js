const mqtt = require('mqtt');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const { DataValue } = require('../model/data');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Connect to MQTT broker
const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

client.on('connect', () => {
    console.log('MQTT client connected');
    client.subscribe(['skripsi/byhendrich/dashtoesp', 'skripsi/byhendrich/esptodash', 'skripsi/byhendrich/esp32status'], { qos: 2 }, (error) => {
        if (error) {
            console.log('Subscription error:', error);
        } else {
            console.log('Subscribed to topics');
        }
    });
});

client.on('message', async (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        console.log(`Received data: ${JSON.stringify(data)} on topic: ${topic}`);
        
        let newEntry;

        if (topic == 'skripsi/byhendrich/dashtoesp' || topic == 'skripsi/byhendrich/esptodash') {
        
            const { Unit, Setpoint, Temperature } = data;

            if (topic == 'skripsi/byhendrich/dashtoesp') {
                
                newEntry = new DataValue({
                    waktu: moment().tz('Asia/Jakarta').format(),
                    nilai: {
                        Unit: Unit,
                        Setpoint: Setpoint
                    }
                });
            } else if (topic == 'skripsi/byhendrich/esptodash') {
                console.log(Unit);
                console.log(Setpoint);
                console.log(Temperature);
                const tempValue = parseFloat(Temperature.replace(/[^0-9.-]+/g, '')); // Remove non-numeric characters

                if (isNaN(tempValue)) {
                    throw new Error(`Invalid temperature value: ${Temperature}`);
                }
                newEntry = new DataValue({
                    waktu: moment().tz('Asia/Jakarta').format(),
                    nilai: {
                        Unit: Unit,
                        Setpoint: Setpoint,
                        Temperature: Temperature
                    }
                });
            }
            console.log(topic)
            await newEntry.save();
            console.log('Data saved to MongoDB:', newEntry);
        } else if (topic === 'skripsi/byhendrich/esp32status') {
            console.log('Received ESP32 status update:', data.status);
        } else {
            console.log('Received data on an unexpected topic:', topic);
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

// Function to retrieve messages from MongoDB
const getPesan = async (req, res) => {
    try {
        res.json(messages);
    } catch (error) {
        console.error('Error retrieving messages:', error);
        res.status(500).send(error.message);
    }
};

module.exports = { publishPesan, getPesan };
