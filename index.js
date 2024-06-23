const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const mqttController = require('./controller/mqttController');
const messageController = require('./controller/messageController');
const last30DaysController = require('./controller/last30DaysController');
const authController = require('./controller/authController'); // Ensure this line is correct
const authMiddleware = require('./middleware/authMiddleware');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

const mongoUri = process.env.MONGODB_URI;
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';
const jwt_secret = process.env.JWT_SECRET;

console.log('MongoDB URI:', mongoUri);
console.log('jwt_secret:', jwt_secret);
mongoose.set('debug', true);

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, 
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error(`Failed to connect to MongoDB: ${err.message}`);
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use('/auth', authController); // Ensure this line is correct
// Protected routes
app.post('/skripsi/byhendrich/dashtoesp', authMiddleware, async (req, res) => {
    try {
        await mqttController.publishPesan(req, res);
    } catch (err) {
        console.error('Error in /skripsi/byhendrich/dashtoesp:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/skripsi/byhendrich/esptodash', authMiddleware, async (req, res) => {
    try {
        await mqttController.getPesan(req, res);
    } catch (err) {
        console.error('Error in /skripsi/byhendrich/esptodash:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.use('/api/messages', authMiddleware, messageController); 
app.use('/api', authMiddleware, last30DaysController); 

cron.schedule('0 0 * * *', async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
        await DataValue.deleteMany({ waktu: { $lt: thirtyDaysAgo } });
        console.log('Old data deleted');
    } catch (err) {
        console.error('Error deleting old data:', err);
    }
});

app.listen(port, host, () => {
    console.log(`App running on http://${host}:${port}`);
});
