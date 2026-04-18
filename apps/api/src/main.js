import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();

// Basic trust proxy for Vercel/Cloud deployment
app.set('trust proxy', true);

// --- UPDATED CORS FOR MOBILE ACCESS ---
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://peace-royal-resort.vercel.app',
    'https://peace-royal-resort-s-projects.vercel.app' // Handles Vercel preview links
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps) or if in the allowed list
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS policy'));
        }
    },
    credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check for Vercel
app.get('/api/health', (req, res) => {
    res.json({ status: 'Peace Royal API is live', time: new Date() });
});

// Use the routes
app.use('/', routes());

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`🚀 Peace Royal API running on http://localhost:${port}`);
});

export default app;