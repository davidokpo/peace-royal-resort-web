import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tv, Zap, BedDouble, Plane, Briefcase, Sparkles, Sunrise } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import SidebarNavigation from '@/components/SidebarNavigation.jsx';
import Logo from '@/components/Logo.jsx';
import { HOTEL_IMAGES, HOTEL_CONTACT } from '@/config/siteContent.js';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Home — Peace Royal Resort</title>
        <meta name="description" content="Experience tranquility and luxury at Peace Royal Resort. Discover nature-inspired minimalism in the heart of Gwarimpa." />
      </Helmet>

      <div className="min-h-screen bg-background organic-pattern">
        <Header />
        <SidebarNavigation />

        <main className="lg:ml-24 pb-20 lg:pb-0">
          {/* Hero Section */}
          <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
            <div className="absolute inset-0">
              <img
                src={HOTEL_IMAGES.homeHero}
                alt="Peace Royal Resort exterior"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/65 to-primary/20"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl"
              >
                <div className="mb-8">
                  <Logo size="large" lightBg={false} className="origin-left scale-75 md:scale-100" />
                </div>
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm mb-6">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <span>Nature-inspired luxury</span>
                </div>
                <h1 className="heading-font text-5xl md:text-7xl font-bold text-white mb-6 text-balance leading-[1.1]" style={{ letterSpacing: '-0.02em' }}>
                  Home of Peace<br />Baile na Siochana
                </h1>
                <p className="text-xl md:text-2xl text-white/80 mb-10 leading-relaxed font-light text-balance">
                  Where mornings taste like peace and nights feel like home.
                </p>
                <p className="text-sm md:text-base text-white/85 mb-8">
                  {HOTEL_CONTACT.address}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-base px-8 py-6 rounded-xl transition-all duration-300 active:scale-[0.98] shadow-lg shadow-secondary/20">
                    <Link to="/rooms">Reserve a room</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 text-base px-8 py-6 rounded-xl transition-all duration-300 active:scale-[0.98]">
                    <Link to="/garden">Explore garden</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Balcony Breakfast Feature */}
          <section className="py-24 relative overflow-hidden bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="relative order-2 lg:order-1"
                >
                  <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative z-10">
                    <video
                      src={HOTEL_IMAGES.homeBalcony}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  </div>
                  {/* Decorative backdrop */}
                  <div className="absolute -inset-4 bg-muted rounded-3xl -z-10 transform translate-x-4 translate-y-6"></div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="order-1 lg:order-2"
                >
                  <Sunrise className="w-12 h-12 text-secondary mb-6" />
                  <h2 className="heading-font text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                    Therapeutic Mornings on the Balcony
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Start your day with fresh tea, a newspaper, and the gentle Gwarimpa sunrise. Breathe in the crisp air and set your intentions. Pure peace.
                  </p>
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-xl transition-all duration-300">
                    <Link to="/balcony-booking">Experience the Balcony</Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </section>

          {/* 4-Icon Feature Row */}
          <section className="py-16 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { icon: Tv, title: 'Smart TVs', desc: 'Football & Netflix ready' },
                  { icon: Zap, title: 'Solar Inverter', desc: '24/7 uninterrupted power' },
                  { icon: BedDouble, title: 'Orthopedic Beds', desc: 'Deep, restorative sleep' },
                  { icon: Plane, title: 'Airport Pickup', desc: 'Seamless arrivals' }
                ].map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="glassmorphic-card rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform duration-300"
                    >
                      <div className="w-14 h-14 mx-auto rounded-full bg-card flex items-center justify-center mb-4 neon-green shadow-sm">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 3-Card Grid */}
          <section className="py-24 organic-pattern">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="heading-font text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                  Curated Spaces
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Intentional design for every mood and moment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: 'Sanctuary Rooms', desc: 'Minimalist decor, maximum comfort.', link: '/rooms', bg: 'bg-muted' },
                  { title: 'African Dining', desc: 'Authentic flavors, crafted with love.', link: '/restaurant', bg: 'bg-secondary text-secondary-foreground' },
                  { title: 'Wellness & Flow', desc: 'Yoga, meditation, and inner peace.', link: '/wellness', bg: 'bg-accent text-accent-foreground' }
                ].map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className={`${card.bg} rounded-3xl p-8 flex flex-col h-[320px] shadow-sm hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group`}
                  >
                    <h3 className="heading-font text-3xl font-bold mb-4 relative z-10">{card.title}</h3>
                    <p className="text-lg opacity-90 relative z-10">{card.desc}</p>
                    <div className="mt-auto relative z-10">
                      <Button asChild variant="outline" className="rounded-full bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all text-current border-current">
                        <Link to={card.link}>Explore</Link>
                      </Button>
                    </div>
                    {/* Decorative subtle circle */}
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Commuter Bag Callout */}
          <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 organic-pattern-dark opacity-50"></div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <Briefcase className="w-12 h-12 mx-auto mb-6 text-accent" />
              <h2 className="heading-font text-3xl md:text-4xl font-bold mb-6 text-balance">
                Always on the move?
              </h2>
              <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed max-w-2xl mx-auto">
                Ask about our <strong className="font-semibold text-white">Commuter Breakfast Bag</strong>. Freshly packed pastries, fruit, and coffee ready when you are, so you never have to skip the most important meal of the day.
              </p>
              <Button asChild variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 rounded-xl px-8">
                <Link to="/cafe">View Cafe Options</Link>
              </Button>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;
