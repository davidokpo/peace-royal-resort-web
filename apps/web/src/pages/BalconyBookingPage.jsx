import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import SidebarNavigation from '@/components/SidebarNavigation.jsx';
import BalconyBookingForm from '@/components/BalconyBookingForm.jsx';

const BalconyBookingPage = () => {
  return (
    <>
      <Helmet>
        <title>Book Social Balcony — Peace Royal Resort</title>
        <meta name="description" content="Reserve your spot on our Social Balcony for therapeutic breakfasts and skyline views." />
      </Helmet>

      <div className="min-h-screen bg-background organic-pattern">
        <Header />
        <SidebarNavigation />

        <main className="lg:ml-20 pb-20 lg:pb-0 pt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="heading-font text-4xl md:text-5xl font-bold text-foreground mb-4">
                Social Balcony Booking
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Enjoy breakfast and card games with a stunning view of the Gwarimpa skyline.
              </p>
            </div>
            
            <BalconyBookingForm />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BalconyBookingPage;