import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BedDouble, UtensilsCrossed, Coffee, Flower2, Trees } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from './Logo.jsx';

const SidebarNavigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/rooms', icon: BedDouble, label: 'Rooms' },
    { path: '/restaurant', icon: UtensilsCrossed, label: 'Dining' },
    { path: '/cafe', icon: Coffee, label: 'Cafe' },
    { path: '/wellness', icon: Flower2, label: 'Wellness' },
    { path: '/garden', icon: Trees, label: 'Garden' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside className="hidden lg:flex flex-col fixed left-0 top-24 bottom-0 w-24 glassmorphic-panel border-r border-border z-40 bg-background/60">
        <div className="flex justify-center pt-6 pb-2">
          <Link to="/" aria-label="Home">
            <Logo size="small" lightBg={true} className="hover:scale-110 transition-transform duration-300" />
          </Link>
        </div>
        <nav className="flex flex-col items-center gap-6 py-6 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative group flex flex-col items-center"
                aria-label={item.label}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <span className={`mt-2 text-[10px] font-medium tracking-wider uppercase transition-colors ${active ? 'text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-100'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 glassmorphic-panel border-t border-border z-40 pb-safe">
        <nav className="flex items-center justify-around py-3 px-2 overflow-x-auto gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-1 min-w-[56px] p-1"
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-transparent text-muted-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <span className={`text-[10px] font-medium tracking-wide ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default SidebarNavigation;