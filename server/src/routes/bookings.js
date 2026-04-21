import express from 'express';
import { createBooking } from '../services/bookingService.js';

const router = express.Router();

// 1. Diagnostic Route: This allows you to check http://localhost:3001/bookings/intake in your browser
router.get('/intake', (req, res) => {
    res.json({ message: "Intake path is active. Use POST to submit data." });
});

/**
 * Main Booking Intake
 * This handles Room, Wellness, Cafe, and Garden bookings
 */
router.post('/intake', async (req, res) => {
  try {
    const bookingData = req.body.data || req.body;
    const type = req.body.bookingType || bookingData.type || 'General';

    const result = await createBooking({
      ...bookingData,
      type: type
    });

    // We send back the "result" object we created in the service above
    return res.status(201).json(result);

  } catch (error) {
    console.error('❌ Route Error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to save booking',
      error: error.message 
    });
  }
});

// Alias for /create for backward compatibility
router.post('/create', async (req, res) => {
  try {
    const bookingData = req.body.data || req.body;
    const type = req.body.bookingType || bookingData.type || 'General';
    const result = await createBooking({
      ...bookingData,
      type,
    });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
