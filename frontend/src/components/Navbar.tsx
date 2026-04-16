import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { Plane, ClipboardList, Database, LayoutDashboard, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { to: '/', label: 'Flights', icon: Plane },
  { to: '/reservations', label: 'Reservations', icon: ClipboardList },
  { to: '/queries', label: 'Queries', icon: Database },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const { isSignedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container-app flex items-center justify-between h-full">
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-extrabold text-xs text-white group-hover:scale-105 transition-transform">
            SF
          </div>
          <span className="text-xl font-extrabold text-white">
            Sky<span className="text-brand-500">Flow</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-1.5 text-sm font-medium transition-colors',
                  active ? 'text-white' : 'text-gray-400 hover:text-white'
                )}
              >
                <link.icon size={15} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isSignedIn ? (
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8',
                },
              }}
            />
          ) : (
            <>
              <Link to="/sign-in" className="btn btn-outline btn-xs no-underline !text-white">
                Sign In
              </Link>
              <Link to="/sign-up" className="btn btn-primary btn-xs no-underline !w-auto">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-surface-secondary border-t border-white/5 overflow-hidden"
          >
            <div className="container-app py-4 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.to
                      ? 'bg-brand-500/10 text-brand-500'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/5 mt-2 pt-3 flex gap-2">
                {isSignedIn ? (
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  <>
                    <Link to="/sign-in" className="btn btn-outline btn-sm flex-1 no-underline !text-white" onClick={() => setMobileOpen(false)}>
                      Sign In
                    </Link>
                    <Link to="/sign-up" className="btn btn-primary btn-sm flex-1 no-underline" onClick={() => setMobileOpen(false)}>
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;