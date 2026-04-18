import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Home, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const PaymentSuccess = () => {
  const location = useLocation();
  const [data] = useState(location.state || null);

  const booking = data?.booking;
  const order = data?.order;

  const getDetails = () => {
    if (booking?.room_type) {
      return {
        type: 'Room Booking',
        items: [
          { label: 'Guest name', value: booking.guest_name },
          { label: 'Room type', value: booking.room_type },
          { label: 'Check-in', value: new Date(booking.check_in_date).toLocaleDateString() },
          { label: 'Check-out', value: new Date(booking.check_out_date).toLocaleDateString() },
          { label: 'Amount', value: `N${booking.total_price?.toLocaleString()}` }
        ]
      };
    }
    if (order?.menu_items) {
      return {
        type: 'Food Order',
        items: [
          { label: 'Customer name', value: order.customer_name },
          { label: 'Delivery type', value: order.delivery_type },
          { label: 'Order status', value: order.order_status },
          { label: 'Amount', value: `N${order.total_price?.toLocaleString()}` }
        ]
      };
    }
    if (order?.beverage_items) {
      return {
        type: 'Cafe Order',
        items: [
          { label: 'Customer name', value: order.customer_name },
          { label: 'Order type', value: order.delivery_type },
          { label: 'Order status', value: order.order_status },
          { label: 'Amount', value: `N${order.total_price?.toLocaleString()}` }
        ]
      };
    }
    if (booking?.class_type) {
      return {
        type: 'Wellness Booking',
        items: [
          { label: 'Participant name', value: booking.participant_name },
          { label: 'Package', value: booking.class_type },
          { label: 'Date', value: new Date(booking.booking_date).toLocaleDateString() },
          { label: 'Time', value: booking.booking_time },
          { label: 'Participants', value: booking.participants_count },
          { label: 'Amount', value: `N${booking.total_price?.toLocaleString()}` }
        ]
      };
    }
    if (booking?.eventType || booking?.customerName) {
      return {
        type: 'Garden Booking',
        items: [
          { label: 'Customer name', value: booking.customerName },
          { label: 'Event type', value: booking.eventType },
          { label: 'Guests', value: booking.guestCount },
          { label: 'Preferred date', value: booking.preferredDate },
          { label: 'Preferred time', value: booking.preferredTime },
          { label: 'Amount', value: `N${booking.totalPrice?.toLocaleString()}` }
        ]
      };
    }

    return { type: 'Booking', items: [] };
  };

  const details = getDetails();

  return (
    <>
      <Helmet>
        <title>Booking received - Peace Royal Resort</title>
        <meta name="description" content="Your booking or order has been received successfully. Thank you for choosing Peace Royal Resort." />
      </Helmet>

      <div className="min-h-screen bg-background leaf-pattern">
        <Header />

        <main className="pt-32 pb-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-panel-light rounded-2xl p-8 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <h1 className="heading-font text-3xl md:text-4xl font-bold text-foreground mb-4">
                Booking received
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Your {details.type.toLowerCase()} has been received. Our team will review it and contact you to confirm the next step.
              </p>

              <div className="bg-card rounded-xl p-6 mb-8 text-left">
                <h2 className="heading-font text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Confirmation details
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border gap-4">
                    <span className="text-muted-foreground">Reference number:</span>
                    <span className="font-semibold text-foreground text-right">{booking?.id || order?.id || 'N/A'}</span>
                  </div>
                  {details.items.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-border gap-4">
                      <span className="text-muted-foreground">{item.label}:</span>
                      <span className="font-semibold text-foreground text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-foreground mb-2">Next steps</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></span>
                    <span>Keep your reference number handy in case you need to follow up</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></span>
                    <span>Our team will contact you shortly to confirm arrangements and payment options</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></span>
                    <span>For any questions, please contact us at info@peaceroyalresort.com</span>
                  </li>
                </ul>
              </div>

              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98]">
                <Link to="/" className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Back to home
                </Link>
              </Button>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PaymentSuccess;
