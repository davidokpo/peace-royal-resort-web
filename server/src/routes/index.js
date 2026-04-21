import { Router } from 'express';
import bookingsRouter from './bookings.js';
import paystackRouter from './paystack.js';

const router = Router();

export default () => {
    // This tells the API: "Anything starting with /bookings, send to bookingsRouter"
    router.use('/bookings', bookingsRouter);
    router.use('/paystack', paystackRouter);

    // Simple test route to verify the API is alive
    router.get('/test', (req, res) => res.json({ message: "API is working!" }));

    return router;
};
