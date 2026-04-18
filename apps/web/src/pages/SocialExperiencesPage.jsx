import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Club, Gamepad2, Flower2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import SidebarNavigation from '@/components/SidebarNavigation.jsx';
import GardenExperienceToggle from '@/components/GardenExperienceToggle.jsx';
import { HOTEL_IMAGES } from '@/config/siteContent.js';

const SocialExperiencesPage = () => {
  const experiences = [
    {
      id: 'spice-cinema',
      title: 'Spice & Cinema',
      subtitle: 'Garden After Dark',
      description: 'Fresh Pepper Soup + Outdoor Movies under the stars.',
      icon: Flame,
      glowClass: 'neon-glow-amber',
      iconColor: 'text-[#FFB84D]',
      cta: 'Book Garden Experience',
      link: '/garden-booking'
    },
    {
      id: 'deck-dawn',
      title: 'Deck & Dawn',
      subtitle: 'Social Balcony',
      description: 'Card games and therapeutic breakfasts on the balcony with Gwarimpa skyline view.',
      icon: Club,
      glowClass: 'neon-glow-green',
      iconColor: 'text-[#7FFF00]',
      cta: 'Reserve Balcony Spot',
      link: '/balcony-booking'
    },
    {
      id: 'game-night',
      title: 'Friday Game Night',
      subtitle: 'Cafe Board Games',
      description: 'Monopoly, Chess, and Scrabble. Community vibes in our minimalist cafe. Every Friday.',
      icon: Gamepad2,
      glowClass: 'neon-glow-amber',
      iconColor: 'text-[#FFB84D]',
      cta: 'Order & Reserve Table',
      link: '/cafe'
    },
    {
      id: 'digital-detox',
      title: 'Digital Detox',
      subtitle: 'Wellness',
      description: 'Yoga and Meditation. No sodas, just vibes and fresh juice.',
      icon: Flower2,
      glowClass: 'neon-glow-green',
      iconColor: 'text-[#7FFF00]',
      cta: 'Book Wellness Session',
      link: '/wellness'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Social Experiences — Peace Royal Resort</title>
        <meta name="description" content="Discover unique social experiences at Peace Royal Resort. From Garden After Dark to Friday Game Nights and Social Balcony breakfasts." />
      </Helmet>

      <div className="min-h-screen bg-background organic-pattern">
        <Header />
        <SidebarNavigation />

        <main className="lg:ml-20 pb-20 lg:pb-0 pt-20">
          <section className="relative h-[60vh] overflow-hidden">
            <img
              src={HOTEL_IMAGES.socialHero}
              alt="Vibrant garden party with warm lighting"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center px-4"
              >
                <h1 className="heading-font text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-balance" style={{ letterSpacing: '-0.02em' }}>
                  Social Experiences
                </h1>
                <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                  Connect, unwind, and create memories in our curated spaces.
                </p>
              </motion.div>
            </div>
          </section>

          <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <GardenExperienceToggle />

            <div className="mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="heading-font text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                  Curated for Connection
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Choose your vibe. From energetic game nights to peaceful mornings.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {experiences.map((exp, index) => {
                  const Icon = exp.icon;
                  return (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="glassmorphic-card rounded-3xl p-8 flex flex-col h-full group hover:scale-[1.02] transition-all duration-300"
                    >
                      <div className={`w-16 h-16 rounded-2xl bg-black/80 flex items-center justify-center mb-6 ${exp.glowClass} transition-all duration-300 group-hover:shadow-xl`}>
                        <Icon className={`w-8 h-8 ${exp.iconColor}`} />
                      </div>
                      
                      <div className="mb-2">
                        <span className="text-sm font-semibold tracking-wider uppercase text-primary/80">
                          {exp.subtitle}
                        </span>
                      </div>
                      
                      <h3 className="heading-font text-3xl font-bold text-foreground mb-4">
                        {exp.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-lg leading-relaxed mb-8 flex-grow">
                        {exp.description}
                      </p>
                      
                      <div className="mt-auto">
                        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98] py-6 text-lg">
                          <Link to={exp.link}>{exp.cta}</Link>
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SocialExperiencesPage;