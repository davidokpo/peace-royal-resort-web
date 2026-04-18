import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { HOTEL_CONTACT, HOTEL_SOCIALS } from '@/config/siteContent.js';

const Footer = () => {
  const services = [
    'Airport Pickup/Drop-off',
    'Commuter Breakfast Bag',
    'Smart TVs (Football/Netflix)',
    'Solar Inverter Backup',
    'Orthopedic Beds'
  ];

  return (
    <footer className="bg-primary text-primary-foreground leaf-pattern-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Logo size="medium" lightBg={false} />
              <div>
                <h3 className="heading-font text-2xl font-bold">Peace Royal Resort</h3>
                <p className="text-primary-foreground/80 text-sm italic">Baile na Siochana</p>
              </div>
            </div>
            <p className="text-primary-foreground/80 mb-6 leading-relaxed">
              Experience tranquility and luxury in the heart of Gwarimpa. Where mornings taste like peace and nights feel like home.
            </p>
            <h4 className="heading-font text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <a href={HOTEL_CONTACT.mapUrl} target="_blank" rel="noreferrer" className="text-primary-foreground/90 hover:text-white transition-colors">
                  {HOTEL_CONTACT.address}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <a href={HOTEL_CONTACT.phoneHref} className="text-primary-foreground/90 hover:text-white transition-colors">
                  {HOTEL_CONTACT.phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a href={`mailto:${HOTEL_CONTACT.email}`} className="text-primary-foreground/90 hover:text-white transition-colors">
                  {HOTEL_CONTACT.email}
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="heading-font text-lg font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index} className="text-primary-foreground/80 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="heading-font text-lg font-semibold mb-4">Connect with us</h4>
            <div className="flex gap-4 mb-6">
              <a href={HOTEL_SOCIALS.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-all duration-200 neon-glow-amber" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href={HOTEL_SOCIALS.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-all duration-200 neon-glow-amber" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={HOTEL_SOCIALS.x} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-all duration-200 neon-glow-amber" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
            <div className="space-y-2">
              <Link to="/privacy" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
          <p className="text-primary-foreground/70">© 2026 Peace Royal Resort. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
