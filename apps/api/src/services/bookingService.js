import { google } from 'googleapis';

export const createBooking = async (payload) => {
  console.log('--- Incoming Booking Data ---', payload);

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        // Improved key cleaning for Windows environment variables
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
          .replace(/\\n/g, '\n')
          .replace(/"/g, '')
          .trim(),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // CRITICAL: You were missing this line below
    const sheets = google.sheets({ version: 'v4', auth });

    // Mapping based on your terminal log: payload.guest_name, payload.check_in_date, etc.
    const row = [
      new Date().toLocaleString(),
      payload.clientBookingRef || `PR-${Date.now()}`,
      payload.type || 'Room',
      payload.room_type || payload.package || 'Standard',
      payload.guest_name || payload.customerName || payload.name || 'Unknown',
      payload.email || payload.customerEmail || 'N/A',
      payload.phone || payload.customerPhone || '',
      payload.check_in_date || payload.checkIn || '',
      payload.check_out_date || payload.checkOut || '',
      payload.preferredDate || '',
      payload.preferredTime || '',
      payload.guestCount || payload.guest_count || '',
      '', '', '', '', '', // Analysis padding
      payload.total_price || payload.amount || payload.totalPrice || 0,
      'pending',
      'pending',
      '',
      'Website'
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${process.env.GOOGLE_SHEETS_TAB_NAME || 'Bookings_Raw'}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    console.log('✅ Google Sheets Sync Success:', response.statusText);
    
    // Most Vite/React frontends specifically look for the "booking" property 
    // to populate the Success/Confirmation page.
    return { 
      success: true, 
      message: 'Booking confirmed',
      booking: {
        ...payload,
        id: payload.clientBookingRef || `PR-${Date.now()}`,
        status: 'confirmed'
      }
    };  
  } catch (error) {
    console.error('❌ GOOGLE SYNC ERROR:', error.message);
    throw error;
  }
};

