import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import ScrollToTop from './components/ScrollToTop.jsx';
import HomePage from './pages/HomePage.jsx';
import RoomsPage from './pages/RoomsPage.jsx';
import RestaurantPage from './pages/RestaurantPage.jsx';
import CafePage from './pages/CafePage.jsx';
import WellnessPage from './pages/WellnessPage.jsx';
import GardenBookingPage from './pages/GardenBookingPage.jsx';
import BalconyBookingPage from './pages/BalconyBookingPage.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import PaymentCancel from './pages/PaymentCancel.jsx';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/restaurant" element={<RestaurantPage />} />
        <Route path="/cafe" element={<CafePage />} />
        <Route path="/wellness" element={<WellnessPage />} />
        <Route path="/garden" element={<GardenBookingPage />} />
        <Route path="/balcony-booking" element={<BalconyBookingPage />} />
        <Route path="/balcony" element={<BalconyBookingPage />} /> {/* Alias for link ease */}
        <Route path="/success" element={<PaymentSuccess />} />
        <Route path="/cancel" element={<PaymentCancel />} />
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <h1 className="heading-font text-4xl font-bold text-foreground mb-4">Page not found</h1>
              <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
              <a href="/" className="text-primary font-medium hover:underline">Back to Home</a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;