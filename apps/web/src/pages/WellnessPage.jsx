import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Flower2, Gamepad2, Crown, Loader2, Sparkles, CheckCircle2, Coffee, Trees, Waves, Wine, Sunrise } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import SidebarNavigation from '@/components/SidebarNavigation.jsx';
import { HOTEL_IMAGES } from '@/config/siteContent.js';

const packages = [
  {
    id: 'Wellness Package',
    name: 'Wellness Package',
    shortLabel: 'Mind, body, and soul',
    price: 70000,
    icon: Flower2,
    accent: 'from-[#8FAF7A] to-[#58705B]',
    cardTone: 'bg-[#F4F1E7]',
    description:
      'Slip into a slower rhythm where dawn feels gentle, the air feels kinder, and your body is finally allowed to exhale. This retreat is designed for restoration, with guided stretching, soft music, nourishing bites, and quiet corners that help you feel cared for from sunrise to sleep.',
    access: [
      'Morning balcony access for green tea and sunrise views',
      'Private stretching session with a dedicated wellness coach',
      'Massage session for deep release and calm',
      'Garden and cafe access throughout your stay',
      'Serene relaxation spaces with soothing music and tea service',
    ],
    menu: [
      'Refreshing green tea at sunrise',
      'Cold-pressed fruit juice',
      'Healthy breakfast platter',
      'Famous Night Paradise Tea to ease insomnia and welcome deep sleep',
    ],
    cta: 'Choose restoration',
  },
  {
    id: 'Luxury Package',
    name: 'Kings Luxury Package',
    shortLabel: 'A kingly stay',
    price: 100000,
    icon: Crown,
    accent: 'from-[#7C5B3B] to-[#3E2414]',
    cardTone: 'bg-[#F8E7D4]',
    description:
      'For the guest who wants comfort to arrive before they do, this package wraps every hour in quiet indulgence. Expect graceful mornings, rich meals, a restful room, evening pampering, and small touches of celebration that make the stay feel generous and memorable.',
    access: [
      'Executive room stay with elevated in-room comfort',
      'Cafe access for focused work or gentle afternoon breaks',
      'Evening massage session',
      'Full access to the Wellness Package experience',
      'Full access to the Fun and Games Package experience',
      'Curated premium room touches including chilled wine',
      'A fuller hospitality experience from breakfast to dinner',
    ],
    menu: [
      'Complimentary breakfast on arrival morning',
      'Kings breakfast spread',
      'Buffet breakfast and dinner',
      'Bottle of wine in the fridge',
    ],
    cta: 'Choose luxury',
  },
  {
    id: 'Fun and Games Package',
    name: 'Fun and Games Package',
    shortLabel: 'Vibes from day to night',
    price: 30000,
    icon: Gamepad2,
    accent: 'from-[#F2A83B] to-[#8B3F18]',
    cardTone: 'bg-[#FFF1D8]',
    description:
      'This one is for laughter, friendly rivalry, and memories that stay long after checkout. Move from board games to balcony banter to smoky garden grills, with easy drinks, playful energy, and a social rhythm that keeps the whole experience bright and alive.',
    access: [
      'Cafe access for board games, chess, and Friday game-night energy',
      'Balcony access for card games and relaxed drinks',
      'Garden access for pepper soup evenings and grill moments',
      'Social spaces designed for easy fun and shared memories',
    ],
    menu: [
      'Smoothies or soda on the balcony',
      'Pepper soup in the garden',
      'Palm wine and grills',
    ],
    cta: 'Choose the vibes',
  },
];

const WellnessPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0].id);
  const [formData, setFormData] = useState({
    participant_name: '',
    email: '',
    phone: '',
    class_type: packages[0].id,
    booking_date: '',
    booking_time: '07:00',
    participants_count: 1,
    special_requests: ''
  });

  const selectedPackage = useMemo(
    () => packages.find((item) => item.id === selectedPackageId) ?? packages[0],
    [selectedPackageId],
  );

  const handlePackageSelect = (packageId) => {
    setSelectedPackageId(packageId);
    setFormData((current) => ({
      ...current,
      class_type: packageId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const chosenPackage = packages.find((item) => item.id === formData.class_type) ?? packages[0];
      const total = chosenPackage.price * Number(formData.participants_count || 1);

      const bookingData = {
        ...formData,
        booking_status: 'pending',
        total_price: total,
      };

      const bookingRes = await apiServerClient.fetch('/bookings/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingType: 'wellness',
          data: bookingData,
        }),
      });

      const bookingResult = await bookingRes.json();
      if (!bookingRes.ok || !bookingResult?.booking?.id) {
        throw new Error(bookingResult?.error || 'Failed to save booking');
      }

      navigate('/success', { state: { booking: bookingResult.booking } });
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Booking failed. Try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Packages and Retreats - Peace Royal Resort</title>
      </Helmet>

      <div className="min-h-screen bg-[#F7F1E8]">
        <Header />
        <SidebarNavigation />

        <main className="lg:ml-24">
          <section className="relative overflow-hidden bg-gradient-to-br from-[#F7F1E8] via-[#EEF2E6] to-[#E7D8C7] pt-32 pb-24">
            <div className="absolute inset-0 organic-pattern opacity-20"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-14 items-start">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#58705B]/20 bg-white/60 px-4 py-2 text-sm font-medium text-[#58705B] backdrop-blur-sm">
                    <Sparkles className="h-4 w-4" /> Curated stay packages
                  </div>
                  <h1 className="heading-font mt-6 text-5xl font-bold leading-tight text-[#2F3A2F] md:text-6xl">
                    Packages made for calm, comfort, and beautiful memories.
                  </h1>
                  <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#4A564A]">
                    Choose the feeling you want to carry home with you. Whether you want restoration, indulgence, or playful connection, each package is designed as a full little world of access, food, and atmosphere.
                  </p>

                  <div className="mt-10 grid gap-5 md:grid-cols-3">
                    {packages.map((item) => {
                      const Icon = item.icon;
                      const isSelected = selectedPackageId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handlePackageSelect(item.id)}
                          className={`rounded-[2rem] border p-6 text-left transition-all duration-300 ${item.cardTone} ${
                            isSelected
                              ? 'border-[#2F3A2F] shadow-[0_18px_60px_rgba(47,58,47,0.18)] -translate-y-1'
                              : 'border-white/70 shadow-[0_12px_40px_rgba(80,70,50,0.08)] hover:-translate-y-1'
                          }`}
                        >
                          <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-white shadow-lg`}>
                            <Icon className="h-7 w-7" />
                          </div>
                          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6D755F]">{item.shortLabel}</div>
                          <h2 className="mt-2 text-2xl font-bold text-[#2F3A2F]">{item.name}</h2>
                          <p className="mt-3 text-sm leading-6 text-[#586458]">{item.description}</p>
                          <div className="mt-5 flex items-center justify-between">
                            <span className="text-2xl font-bold text-[#2F3A2F]">N{item.price.toLocaleString()}</span>
                            <span className="text-sm font-medium text-[#7C5B3B]">{item.cta}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                  <div className="overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/70 shadow-[0_24px_80px_rgba(63,51,35,0.14)] backdrop-blur-md">
                    <div className="relative h-[320px] overflow-hidden">
                      <img src={HOTEL_IMAGES.wellnessHero} alt="Curated hotel lifestyle package" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent"></div>
                      <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/18 px-3 py-1 text-xs uppercase tracking-[0.25em] backdrop-blur-sm">
                          <Sunrise className="h-4 w-4" /> Featured package
                        </div>
                        <h3 className="heading-font mt-4 text-4xl font-bold">{selectedPackage.name}</h3>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-white/90">{selectedPackage.description}</p>
                      </div>
                    </div>

                    <div className="grid gap-8 p-8 lg:grid-cols-[1fr_0.92fr]">
                      <div>
                        <div className="rounded-[2rem] bg-[#F7F3EA] p-6">
                          <h4 className="flex items-center gap-2 text-lg font-semibold text-[#2F3A2F]">
                            <CheckCircle2 className="h-5 w-5 text-[#58705B]" /> Description
                          </h4>
                          <p className="mt-4 text-base leading-7 text-[#566156]">{selectedPackage.description}</p>
                        </div>

                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                          <div className="rounded-[2rem] bg-[#EEF2E6] p-6">
                            <h4 className="flex items-center gap-2 text-lg font-semibold text-[#2F3A2F]">
                              <Trees className="h-5 w-5 text-[#58705B]" /> Access
                            </h4>
                            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#495649]">
                              {selectedPackage.access.map((item) => (
                                <li key={item} className="flex gap-3">
                                  <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#58705B]"></span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-[2rem] bg-[#FFF4DD] p-6">
                            <h4 className="flex items-center gap-2 text-lg font-semibold text-[#2F3A2F]">
                              <Coffee className="h-5 w-5 text-[#A56A2D]" /> Menu
                            </h4>
                            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5F533F]">
                              {selectedPackage.menu.map((item) => (
                                <li key={item} className="flex gap-3">
                                  <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#D3943A]"></span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[2rem] bg-[#2F3A2F] p-6 text-white shadow-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm uppercase tracking-[0.24em] text-white/65">Package price</p>
                            <p className="mt-2 text-4xl font-bold">N{selectedPackage.price.toLocaleString()}</p>
                          </div>
                          <div className="rounded-2xl bg-white/10 p-3">
                            <Waves className="h-7 w-7" />
                          </div>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                          <div className="space-y-2">
                            <Label className="text-white/80">Full Name</Label>
                            <Input required value={formData.participant_name} onChange={e => setFormData({ ...formData, participant_name: e.target.value })} className="border-white/20 bg-white/10 text-white placeholder:text-white/50" />
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label className="text-white/80">Email</Label>
                              <Input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="border-white/20 bg-white/10 text-white placeholder:text-white/50" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white/80">Phone</Label>
                              <Input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="border-white/20 bg-white/10 text-white placeholder:text-white/50" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label className="text-white/80">Package</Label>
                              <Select value={formData.class_type} onValueChange={(value) => handlePackageSelect(value)} required>
                                <SelectTrigger className="border-white/20 bg-white/10 text-white">
                                  <SelectValue placeholder="Select package" />
                                </SelectTrigger>
                                <SelectContent>
                                  {packages.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white/80">Date</Label>
                              <Input type="date" required min={new Date().toISOString().split('T')[0]} value={formData.booking_date} onChange={e => setFormData({ ...formData, booking_date: e.target.value })} className="border-white/20 bg-white/10 text-white" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label className="text-white/80">Preferred time</Label>
                              <Input type="time" value={formData.booking_time} onChange={e => setFormData({ ...formData, booking_time: e.target.value })} className="border-white/20 bg-white/10 text-white" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white/80">Guests</Label>
                              <Input type="number" min="1" value={formData.participants_count} onChange={e => setFormData({ ...formData, participants_count: e.target.value })} className="border-white/20 bg-white/10 text-white" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white/80">Special requests</Label>
                            <Textarea value={formData.special_requests} onChange={e => setFormData({ ...formData, special_requests: e.target.value })} className="border-white/20 bg-white/10 text-white placeholder:text-white/50" rows={4} placeholder="Tell us how you want the experience to feel." />
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm text-white/80">
                            <div className="flex items-center gap-2 font-medium text-white">
                              <Wine className="h-4 w-4" /> Package includes access and menu items listed on this card.
                            </div>
                            <p className="mt-2 leading-6">Your total today: N{(selectedPackage.price * Number(formData.participants_count || 1)).toLocaleString()}</p>
                          </div>
                          <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-[#D7A65A] text-[#2F2418] hover:bg-[#e2b56f]">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Reserve ${selectedPackage.name}`}
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default WellnessPage;
