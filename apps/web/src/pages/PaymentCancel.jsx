import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { XCircle, Home, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { HOTEL_CONTACT } from '@/config/siteContent.js';

const PaymentCancel = () => {
  return (
    <>
      <Helmet>
        <title>Payment cancelled — Peace Royal Resort</title>
        <meta name="description" content="Your payment was not completed. You can try again or contact us for assistance." />
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
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>

              <h1 className="heading-font text-3xl md:text-4xl font-bold text-foreground mb-4">
                Payment cancelled
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Your payment was not completed. No charges have been made to your account.
              </p>

              <div className="bg-muted rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-foreground mb-2">What happened?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The payment process was interrupted or cancelled. This could be due to:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2"></span>
                    <span>Clicking the back button or closing the payment window</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2"></span>
                    <span>Payment timeout or connection issues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2"></span>
                    <span>Choosing to cancel the transaction</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-200 active:scale-[0.98]">
                  <Link to="/rooms" className="flex items-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    Try again
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="transition-all duration-200 active:scale-[0.98]">
                  <Link to="/" className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Back to home
                  </Link>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-8">
                Need help? Contact us at {HOTEL_CONTACT.email} or call {HOTEL_CONTACT.phoneDisplay}
              </p>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PaymentCancel;