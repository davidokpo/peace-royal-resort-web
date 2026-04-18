import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Moon, Gamepad2, Loader2, Minus, Plus, Laptop, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import MediaSlideshow from '@/components/MediaSlideshow.jsx';
import SidebarNavigation from '@/components/SidebarNavigation.jsx';
import { HOTEL_IMAGES } from '@/config/siteContent.js';
import { submitBookingRequest } from '@/lib/bookingSubmission.js';
import { startCheckoutOrShowPending } from '@/lib/paymentCheckout.js';

const CafePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState({});
  const [isFriday, setIsFriday] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    allergies: '',
    special_requests: '',
    delivery_type: 'pickup',
    board_game_selection: '',
    player_count: 2,
    game_time_slot: ''
  });

  const beverages = [
    { id: 1, name: 'Chamomile Tea', price: 1200, night: true },
    { id: 2, name: 'Artisan Espresso', price: 1000 },
    { id: 3, name: 'Matcha Latte', price: 1800 },
    { id: 4, name: 'Fresh Green Smoothie', price: 2500 }
  ];

  const workspaceMedia = [
    { src: HOTEL_IMAGES.cafeWorkspace, alt: 'Cafe workspace video' },
    { src: '/assets/images/Let_coffee_connect_us.MOV', alt: 'Cafe event energy' },
    { src: HOTEL_IMAGES.cafeGames, alt: 'Cafe games video' },
  ];

  const gameNightMedia = [
    { src: HOTEL_IMAGES.cafeGames, alt: 'Cafe game night video' },
    { src: '/assets/images/Let_coffee_connect_us.MOV', alt: 'Cafe group gaming clip' },
    { src: HOTEL_IMAGES.cafeWorkspace, alt: 'Cafe social workspace event video' },
  ];

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
      const item = beverages.find(i => String(i.id) === String(id));
      return total + (item ? item.price * qty : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(cart).length === 0) {
      toast.error('Add items to order.');
      return;
    }
    const total = calculateTotal();
    if (isFriday && total < 3000) {
      toast.error('Friday Game Night requires a minimum order of ₦3,000 to reserve a table.');
      return;
    }

    setLoading(true);
    try {
      const orderItems = Object.entries(cart).map(([id, qty]) => {
        const item = beverages.find(i => String(i.id) === String(id));
        return { id: item.id, name: item.name, price: item.price, quantity: qty };
      });

      const orderData = {
        customer_name: formData.customer_name,
        email: formData.email,
        phone: formData.phone,
        beverage_items: orderItems,
        allergies: formData.allergies || 'None',
        special_requests: formData.special_requests || 'None',
        delivery_type: isFriday ? 'pickup' : formData.delivery_type,
        order_status: 'pending',
        total_price: total,
        friday_game_night: isFriday,
        board_game_selection: isFriday ? formData.board_game_selection : '',
        player_count: isFriday ? formData.player_count : null,
        game_time_slot: isFriday ? formData.game_time_slot : '',
        reserved_table_number: isFriday ? `T-${Math.floor(Math.random() * 20) + 1}` : ''
      };

      const submission = await submitBookingRequest({
        endpoint: '/bookings/intake',
        payload: {
          bookingType: 'cafe',
          data: orderData,
        },
        fallbackRecord: orderData,
      });

      if (submission.mode === 'local_backup') {
        navigate('/payment-success', { state: { order: submission.record, submissionMode: submission.mode } });
        return;
      }

      const checkout = await startCheckoutOrShowPending({
        navigate,
        amount: total,
        bookingId: submission.record.id,
        productName: isFriday ? 'Cafe order and game night' : 'Cafe order',
        customerEmail: formData.email,
        state: { order: submission.record, submissionMode: submission.mode },
      });

      if (!checkout.started) {
        toast.warning('Your request was saved, but payment could not be started automatically. Please contact the hotel to complete payment.');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Cafe & Workspace — Peace Royal Resort</title>
      </Helmet>

      <div className="min-h-screen">
        <Header />
        <SidebarNavigation />

        <main className="lg:ml-24">
          {/* Top Section - Workspace */}
          <section className="bg-[#8B5E3C] text-white pt-32 pb-24 relative overflow-hidden">
            <div className="absolute inset-0 organic-pattern opacity-10 mix-blend-overlay"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                  <Laptop className="w-12 h-12 text-[#D9C5B2] mb-6" />
                  <h1 className="heading-font text-5xl md:text-6xl font-bold mb-4">Your Workspace.<br/>Your Vibe.</h1>
                  <p className="text-lg text-white/80 max-w-lg leading-relaxed mb-8">
                    Remote work, creative sessions, or just a quiet corner. Fuel your flow with artisanal beverages in a serene, distraction-free environment.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {beverages.map(item => (
                      <div key={item.id} className={`bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between ${item.night ? 'ring-1 ring-[#7FFF00]/50 neon-green' : ''}`}>
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-semibold text-white">{item.name}</h3>
                          {item.night && <Moon className="w-4 h-4 text-[#7FFF00]" />}
                        </div>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="font-medium text-white/90">₦{item.price.toLocaleString()}</span>
                          <div className="flex items-center gap-2 bg-black/20 rounded-full px-2 py-1">
                            <button type="button" onClick={() => updateCart(item, -1)} className="p-1 hover:bg-white/20 rounded-full"><Minus className="w-3 h-3" /></button>
                            <span className="text-sm font-medium w-4 text-center">{cart[item.id] || 0}</span>
                            <button type="button" onClick={() => updateCart(item, 1)} className="p-1 hover:bg-white/20 rounded-full"><Plus className="w-3 h-3 text-[#FFB84D]" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
                  <MediaSlideshow items={workspaceMedia} className="h-full w-full" />
                </motion.div>
              </div>
            </div>
          </section>

          {/* Leaf Transition Divider */}
          <div className="w-full h-16 bg-[#8B5E3C] relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#5A634B]"></div>
             <div className="absolute inset-0 organic-pattern opacity-20"></div>
          </div>

          {/* Bottom Section - Friday Game Night */}
          <section className="bg-[#5A634B] text-white py-24 relative overflow-hidden">
            <div className="absolute inset-0 organic-pattern opacity-20"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-[#FFB84D] mb-6 neon-amber font-semibold uppercase tracking-wider text-sm">
                  <Users className="w-4 h-4" /> Community Weekend
                </div>
                <h2 className="heading-font text-5xl md:text-6xl font-bold mb-4 text-balance">Friday Night Lights</h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">
                  Every Friday. Community. Games. Good vibes. Join us for a minimalist cafe takeover where strangers become friends over board games.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
                <div className="h-[400px] rounded-3xl overflow-hidden shadow-2xl relative">
                  <MediaSlideshow items={gameNightMedia} className="h-full w-full" overlayClassName="bg-black/20" />
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><Gamepad2 className="w-6 h-6 text-[#FFB84D]" /> Reserve Your Table</h3>
                  <p className="text-white/70 mb-6 text-sm">Secure a table for game night by placing a minimum food/drink order of ₦3,000 per table. Select your game and time slot below.</p>
                  
                  <div className="flex items-center gap-3 bg-black/20 p-4 rounded-xl mb-8">
                    <Checkbox id="friday_toggle" checked={isFriday} onCheckedChange={(val) => {
                      setIsFriday(val);
                      if (val) setFormData(f => ({ ...f, delivery_type: 'pickup' }));
                    }} className="border-white/50 data-[state=checked]:bg-[#FFB84D]" />
                    <Label htmlFor="friday_toggle" className="text-white cursor-pointer font-medium text-lg">Yes, I'm booking for Friday Game Night</Label>
                  </div>

                  {isFriday && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                      <div>
                        <Label className="text-white/80 mb-2 block">Select Game</Label>
                        <RadioGroup value={formData.board_game_selection} onValueChange={(val) => setFormData({...formData, board_game_selection: val})} className="grid grid-cols-3 gap-3">
                          {['Chess', 'Monopoly', 'Scrabble'].map(game => (
                            <div key={game}>
                              <RadioGroupItem value={game} id={game} className="peer sr-only" />
                              <Label htmlFor={game} className="flex flex-col items-center justify-center rounded-xl border-2 border-white/20 bg-white/5 p-4 peer-data-[state=checked]:border-[#FFB84D] peer-data-[state=checked]:bg-[#FFB84D]/10 hover:bg-white/10 cursor-pointer transition-all">
                                {game}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white/80">Players (1-6)</Label>
                          <Input type="number" min="1" max="6" value={formData.player_count} onChange={(e) => setFormData({...formData, player_count: e.target.value})} className="bg-black/20 border-white/20 text-white mt-1" />
                        </div>
                        <div>
                          <Label className="text-white/80">Time Slot</Label>
                          <Select value={formData.game_time_slot} onValueChange={(val) => setFormData({...formData, game_time_slot: val})}>
                            <SelectTrigger className="bg-black/20 border-white/20 text-white mt-1">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="18:00">6:00 PM</SelectItem>
                              <SelectItem value="19:00">7:00 PM</SelectItem>
                              <SelectItem value="20:00">8:00 PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Checkout Form - Shows for both regular cafe order and game night */}
              <div className="max-w-3xl mx-auto bg-card text-card-foreground rounded-3xl p-8 shadow-2xl">
                <h3 className="heading-font text-2xl font-bold mb-6 text-center">Complete Your Order Request</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="c_name">Name</Label>
                      <Input id="c_name" required value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c_phone">Phone</Label>
                      <Input id="c_phone" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="c_email">Email</Label>
                      <Input id="c_email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="c_allergies">Allergies (Required)</Label>
                    <Input id="c_allergies" required value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})} placeholder="Type 'None' if applicable" />
                  </div>

                  {!isFriday && (
                    <div className="space-y-3">
                      <Label>Order Option</Label>
                      <RadioGroup value={formData.delivery_type} onValueChange={(val) => setFormData({...formData, delivery_type: val})} className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pickup" id="p_pick" />
                          <Label htmlFor="p_pick">Pickup</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="delivery" id="p_del" />
                          <Label htmlFor="p_del">Room Delivery</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-lg">Total: <strong className="text-2xl text-primary font-bold">₦{calculateTotal().toLocaleString()}</strong></div>
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white py-6 px-10 rounded-xl text-lg transition-all active:scale-95">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isFriday ? 'Reserve Table' : 'Submit Order Request')}
                    </Button>
                  </div>
                </form>
              </div>

            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default CafePage;

