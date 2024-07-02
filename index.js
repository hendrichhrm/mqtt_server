//This code is Created by Hendrich H M
// You could adjust this code to your needs
// However, you can't remove the author's because it's against the law
// This code is Copyright of the author

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const mqttController = require('./controller/mqttController');
const messageController = require('./controller/messageController');
const last30DaysController = require('./controller/last30DaysController');
const authController = require('./controller/authController');
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
    socketTimeoutMS: 45000
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error(`Failed to connect to MongoDB: ${err.message}`);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Ensure JSON parsing with a reasonable limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Auth routes
app.use('/auth', authController); 

// Protected routes with auth middleware
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

// Other API routes
app.use('/api/messages', authMiddleware, messageController); 
app.use('/api', authMiddleware, last30DaysController); 

// Cron job for cleaning up old data
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

// Error handling for uncaught exceptions and promise rejections
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

app.listen(port, host, () => {
    console.log(`App running on http://${host}:${port}`);
});