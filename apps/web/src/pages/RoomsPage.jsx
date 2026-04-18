import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wifi, Tv, Wind, Coffee, ShieldCheck, Upload, Loader2, BedDouble } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import MediaSlideshow from '@/components/MediaSlideshow.jsx';
import SidebarNavigation from '@/components/SidebarNavigation.jsx';
import { HOTEL_IMAGES } from '@/config/siteContent.js';

const RoomsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: '',
    email: '',
    phone: '',
    check_in_date: '',
    check_out_date: '',
    room_type: '',
    special_requests: '',
    identity_document: null
  });

  const rooms = [
    {
      id: 'executive',
      name: 'Executive Suite',
      price: 30000,
      image: HOTEL_IMAGES.roomExecutive,
      media: [
        { src: HOTEL_IMAGES.roomExecutive, alt: 'Executive suite photo' },
        { src: '/assets/images/executive_room.MOV', alt: 'Executive suite video tour' }
      ],
      desc: 'Spacious luxury with premium amenities, perfect for extended stays.',
      amenities: ['Orthopedic bed', 'Smart TV (Netflix)', 'Elegant room finish', 'High-speed WiFi']
    },
    {
      id: 'deluxe',
      name: 'Deluxe Room',
      price: 25000,
      image: HOTEL_IMAGES.roomDeluxe,
      media: [
        { src: HOTEL_IMAGES.roomDeluxe, alt: 'Deluxe room photo' }
      ],
      desc: 'Comfortable, elegant, and designed for deep rest.',
      amenities: ['Orthopedic bed', 'Smart TV', 'Work desk', 'High-speed WiFi']
    }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFormData({ ...formData, identity_document: file });
  };

  const calculateNights = () => {
    if (!formData.check_in_date || !formData.check_out_date) return 0;
    const diff = new Date(formData.check_out_date) - new Date(formData.check_in_date);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const roomPrice = formData.room_type === 'Executive Suite' ? 30000 : formData.room_type === 'Deluxe Room' ? 25000 : 0;
    return nights * roomPrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nights = calculateNights();
    if (nights <= 0) {
      toast.error('Check-out date must be after check-in date.');
      return;
    }

    setLoading(true);

    try {
      // Logic to find the API based on environment
      const API_BASE = import.meta.env.VITE_API_URL || 'https://peace-royal-resort.vercel.app/api';
      
      const response = await fetch(`${API_BASE}/bookings/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          total_price: calculateTotal(),
          type: 'room',
          // File names can't be sent as JSON easily, so we send the name
          identity_document_name: formData.identity_document?.name || 'No file uploaded'
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Booking recorded successfully!');
        // Navigate to success/booked page
        navigate('/booked', { 
          state: { 
            booking: data.booking,
            message: "Your sanctuary at Peace Royal is reserved." 
          } 
        });
      } else {
        toast.error(data.message || 'Booking failed to save.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Network Error: Could not reach the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Rooms — Peace Royal Resort</title>
      </Helmet>

      <div className="min-h-screen bg-[#D9C5B2]/20 organic-pattern">
        <Header />
        <SidebarNavigation />

        <main className="lg:ml-24 pt-32 pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="heading-font text-5xl md:text-6xl font-bold text-foreground mb-4">
                Your Sanctuary Awaits
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Minimalist spaces designed for profound rest and relaxation.
              </p>
            </div>

            {/* Room Listing */}
            <div className="space-y-12 mb-24">
              {rooms.map((room, idx) => (
                <motion.div 
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`flex flex-col ${idx % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 bg-card/60 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden shadow-lg`}
                >
                  <div className="md:w-1/2 h-64 md:h-auto relative">
                    <MediaSlideshow items={room.media} className="h-full w-full" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-primary shadow-sm">
                      ₦{room.price.toLocaleString()} / night
                    </div>
                  </div>
                  <div className="md:w-1/2 p-8 flex flex-col justify-center">
                    <h2 className="heading-font text-3xl font-bold text-foreground mb-3">{room.name}</h2>
                    <p className="text-muted-foreground mb-6 text-lg">{room.desc}</p>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {room.amenities.map((am, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                          <div className="w-2 h-2 rounded-full bg-accent neon-green"></div>
                          {am}
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={() => {
                        setFormData(prev => ({ ...prev, room_type: room.name }));
                        document.getElementById('booking-form').scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-fit bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl px-8"
                    >
                      Select Room
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Unified Booking Form */}
            <motion.div 
              id="booking-form"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glassmorphic-panel rounded-3xl p-8 md:p-12 shadow-xl"
            >
              <div className="text-center mb-10">
                <BedDouble className="w-10 h-10 mx-auto text-primary mb-4" />
                <h2 className="heading-font text-3xl font-bold text-foreground">Secure Your Booking</h2>
                <p className="text-muted-foreground">Payment required to guarantee reservation.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="guest_name">Full Name</Label>
                    <Input id="guest_name" required value={formData.guest_name} onChange={(e) => setFormData({...formData, guest_name: e.target.value})} className="bg-white/50 border-white/60" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-white/50 border-white/60" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="bg-white/50 border-white/60" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room_type">Room Type</Label>
                    <Select value={formData.room_type} onValueChange={(val) => setFormData({...formData, room_type: val})} required>
                      <SelectTrigger className="bg-white/50 border-white/60 text-gray-900">
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map(r => <SelectItem key={r.id} value={r.name}>{r.name} (₦{r.price.toLocaleString()})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="check_in_date">Check-in Date</Label>
                    <Input id="check_in_date" type="date" required min={new Date().toISOString().split('T')[0]} value={formData.check_in_date} onChange={(e) => setFormData({...formData, check_in_date: e.target.value})} className="bg-white/50 border-white/60" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="check_out_date">Check-out Date</Label>
                    <Input id="check_out_date" type="date" required min={formData.check_in_date || new Date().toISOString().split('T')[0]} value={formData.check_out_date} onChange={(e) => setFormData({...formData, check_out_date: e.target.value})} className="bg-white/50 border-white/60" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>ID Verification (NIN / Passport)</Label>
                  <div className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center bg-white/30 hover:bg-white/50 transition-colors">
                    <input type="file" id="id_upload" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                    <label htmlFor="id_upload" className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-8 h-8 text-primary mb-3" />
                      <span className="font-medium text-foreground">{formData.identity_document ? formData.identity_document.name : 'Click to upload identity document'}</span>
                      <span className="text-sm text-muted-foreground mt-1">Required for check-in</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="special_requests">Special Requests (Optional)</Label>
                  <Textarea id="special_requests" value={formData.special_requests} onChange={(e) => setFormData({...formData, special_requests: e.target.value})} className="bg-white/50 border-white/60" rows={3} placeholder="Any specific needs for your stay?" />
                </div>

                {calculateNights() > 0 && formData.room_type && (
                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">{calculateNights()} nights × {formData.room_type}</span>
                      <span className="font-bold text-foreground">₦{calculateTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Secure payment via Paystack</span>
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-6 text-lg rounded-xl transition-all">
                  {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</> : 'Proceed to Checkout'}
                </Button>
              </form>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default RoomsPage;