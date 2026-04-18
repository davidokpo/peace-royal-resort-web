import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();

// Basic trust proxy for local development
app.set('trust proxy', true);

// Standard Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Use the routes we updated
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