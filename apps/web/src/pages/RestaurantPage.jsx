import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Coffee, Loader2, Minus, Plus, UtensilsCrossed, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import SidebarNavigation from '@/components/SidebarNavigation.jsx';
import { HOTEL_IMAGES } from '@/config/siteContent.js';
import { submitBookingRequest } from '@/lib/bookingSubmission.js';

const RestaurantPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState({});
  const [hasAllergies, setHasAllergies] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    allergies: '',
    dietary_requirements: '',
    delivery_type: 'delivery',
    delivery_address: ''
  });

  const menuItems = [
    { id: 1, name: 'Pepper Soup (Goat/Fish)', price: 3800, desc: 'Spicy African delicacy for evening hangouts.', img: HOTEL_IMAGES.restaurantMain, highlight: true },
    { id: 2, name: 'Jollof Rice with Chicken', price: 3500, desc: 'Classic spicy Nigerian jollof with grilled chicken.', img: HOTEL_IMAGES.restaurantMain },
    { id: 3, name: 'Egusi Soup & Pounded Yam', price: 4200, desc: 'Traditional melon seed soup with smooth pounded yam.', img: HOTEL_IMAGES.restaurantMain },
    { id: 4, name: 'Suya Platter', price: 2800, desc: 'Spicy grilled beef skewers with onions and peppers.', img: HOTEL_IMAGES.restaurantMain },
  ];

  const breakfastPackages = [
    { id: 'bp1', name: 'Therapeutic Morning Tea + Pastries', price: 8500, desc: 'A light, calming start to your day on the balcony.' },
    { id: 'bp2', name: 'Coffee + Fresh Juice + Plate', price: 12000, desc: 'The classic continental morning experience.' },
    { id: 'bp3', name: 'Sunrise Breakfast Bundle', price: 15000, desc: 'Premium breakfast spread for the ultimate morning.' }
  ];

  const allItems = [...menuItems, ...breakfastPackages];

  const updateCart = (item, delta) => {
    setCart(prev => {
      const current = prev[item.id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return { ...prev, [item.id]: next };
    });
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const item = allItems.find(i => String(i.id) === String(id));
      return total + (item ? item.price * qty : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(cart).length === 0) {
      toast.error('Your order is empty. Add items to continue.');
      return;
    }
    if (hasAllergies && !formData.allergies.trim()) {
      toast.error('Please detail your allergies to ensure food safety.');
      return;
    }

    setLoading(true);
    try {
      const total = calculateTotal();
      const orderItems = Object.entries(cart).map(([id, qty]) => {
        const item = allItems.find(i => String(i.id) === String(id));
        return { id: item.id, name: item.name, price: item.price, quantity: qty };
      });

      const orderData = {
        ...formData,
        menu_items: orderItems,
        allergies: hasAllergies ? formData.allergies : 'None',
        dietary_requirements: formData.dietary_requirements || 'None',
        total_price: total,
        order_status: 'pending'
      };

      const submission = await submitBookingRequest({
        endpoint: '/bookings/intake',
        payload: {
          bookingType: 'restaurant',
          data: orderData,
        },
        fallbackRecord: orderData,
      });

      navigate('/success', { state: { order: submission.record, submissionMode: submission.mode } });
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Order submission failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Restaurant — Peace Royal Resort</title>
      </Helmet>

      <div className="min-h-screen bg-[#8B5E3C]/10 organic-pattern">
        <Header />
        <SidebarNavigation />

        <main className="lg:ml-24 pt-32 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="heading-font text-5xl md:text-6xl font-bold text-foreground mb-4">
                African Cuisine
              </h1>
              <p className="text-xl text-muted-foreground font-medium">
                Authentic. Fresh. Unforgettable.
              </p>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {menuItems.map(item => (
                <div key={item.id} className={`glassmorphic-card rounded-2xl overflow-hidden flex flex-col ${item.highlight ? 'ring-2 ring-secondary neon-amber' : ''}`}>
                  <div className="h-48 relative">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                    {item.highlight && (
                      <div className="absolute top-3 right-3 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full">
                        Evening Favorite
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg mb-2 text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-grow">{item.desc}</p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/20">
                      <span className="font-bold text-secondary">₦{item.price.toLocaleString()}</span>
                      <div className="flex items-center gap-3 bg-white/40 rounded-full px-2 py-1">
                        <button onClick={() => updateCart(item, -1)} className="p-1 hover:bg-white/50 rounded-full transition-colors"><Minus className="w-4 h-4" /></button>
                        <span className="text-sm font-medium w-4 text-center">{cart[item.id] || 0}</span>
                        <button onClick={() => updateCart(item, 1)} className="p-1 hover:bg-white/50 rounded-full transition-colors"><Plus className="w-4 h-4 text-secondary" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Breakfast Packages */}
            <div className="mb-20">
              <div className="text-center mb-10">
                <Coffee className="w-10 h-10 mx-auto text-secondary mb-3" />
                <h2 className="heading-font text-3xl font-bold">Breakfast Packages</h2>
                <p className="text-muted-foreground mt-2">Perfect for Balcony Mornings.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {breakfastPackages.map(pkg => (
                  <div key={pkg.id} className="glassmorphic-panel rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-shadow">
                    <h3 className="font-bold text-lg mb-3">{pkg.name}</h3>
                    <p className="text-sm text-muted-foreground mb-6 h-10">{pkg.desc}</p>
                    <div className="flex flex-col items-center justify-between mt-auto gap-4">
                      <span className="font-bold text-xl">₦{pkg.price.toLocaleString()}</span>
                      <div className="flex items-center gap-3 bg-secondary/10 rounded-full px-4 py-2 w-full justify-center">
                        <button onClick={() => updateCart(pkg, -1)} className="p-1 hover:bg-secondary/20 rounded-full"><Minus className="w-4 h-4" /></button>
                        <span className="font-medium w-8 text-center">{cart[pkg.id] || 0}</span>
                        <button onClick={() => updateCart(pkg, 1)} className="p-1 hover:bg-secondary/20 rounded-full"><Plus className="w-4 h-4 text-secondary" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Integrated Order Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glassmorphic-panel rounded-3xl p-8 md:p-12 shadow-xl max-w-4xl mx-auto"
            >
              <div className="text-center mb-10">
                <UtensilsCrossed className="w-10 h-10 mx-auto text-secondary mb-4" />
                <h2 className="heading-font text-3xl font-bold text-foreground">Complete Your Order</h2>
                <p className="text-muted-foreground">Freshly prepared and delivered to you.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name">Full Name</Label>
                    <Input id="customer_name" required value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} className="bg-white/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="bg-white/50" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-white/50" />
                  </div>
                </div>

                <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/10 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox id="has_allergies" checked={hasAllergies} onCheckedChange={setHasAllergies} />
                    <Label htmlFor="has_allergies" className="flex items-center gap-2 text-base font-medium">
                      <AlertCircle className="w-5 h-5 text-secondary" /> I have food allergies
                    </Label>
                  </div>
                  {hasAllergies && (
                    <div className="pl-8">
                      <Label htmlFor="allergies" className="text-destructive font-semibold mb-2 block">Please specify allergies *</Label>
                      <Textarea id="allergies" required={hasAllergies} value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})} placeholder="e.g., Peanuts, Shellfish, Dairy" className="bg-white/70 border-destructive/30 focus-visible:ring-destructive" />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="dietary" className="mb-2 block">Dietary Requirements (Optional)</Label>
                    <Input id="dietary" value={formData.dietary_requirements} onChange={(e) => setFormData({...formData, dietary_requirements: e.target.value})} placeholder="e.g., Vegan, Halal" className="bg-white/50" />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Delivery Method</Label>
                  <RadioGroup value={formData.delivery_type} onValueChange={(val) => setFormData({...formData, delivery_type: val})} className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delivery" id="r_delivery" />
                      <Label htmlFor="r_delivery">Room Delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pickup" id="r_pickup" />
                      <Label htmlFor="r_pickup">Pickup at Restaurant</Label>
                    </div>
                  </RadioGroup>
                  {formData.delivery_type === 'delivery' && (
                    <div className="pt-2">
                      <Label htmlFor="address">Room Number / Address</Label>
                      <Input id="address" required value={formData.delivery_address} onChange={(e) => setFormData({...formData, delivery_address: e.target.value})} className="bg-white/50 mt-1" />
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-medium text-foreground">Total Order Value:</span>
                    <span className="text-2xl font-bold text-secondary">₦{calculateTotal().toLocaleString()}</span>
                  </div>
                  <Button type="submit" disabled={loading || calculateTotal() === 0} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-6 text-lg rounded-xl transition-all">
                    {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</> : 'Proceed to Checkout'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default RestaurantPage;
