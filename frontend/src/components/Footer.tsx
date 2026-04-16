import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Github, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-secondary border-t border-white/5 mt-auto">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-extrabold text-xs text-white">
                SF
              </div>
              <span className="text-xl font-extrabold text-white">
                Sky<span className="text-brand-500">Flow</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
              Book flights seamlessly with real-time availability, smart search, and instant confirmations — powered by modern web technology.
            </p>
            <div className="flex gap-3 mt-5">
              {[Github, Twitter, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 hover:text-brand-500 hover:border-brand-500/30 transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Quick Links</h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { to: '/', label: 'Search Flights' },
                { to: '/reservations', label: 'My Bookings' },
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/queries', label: 'SQL Queries' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Support</h4>
            <ul className="flex flex-col gap-2.5">
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">© 2026 SkyFlow. Flight Ticket Reservation System — DBMS Project.</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Plane size={12} className="text-brand-500" />
            Built with React, Express, MongoDB
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
