import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { api } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import PageHero from '@/components/PageHero';
import {
  LayoutDashboard, Plane, CreditCard, Ticket, Calendar,
  TrendingUp, Clock, ArrowRight,
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const DashboardPage: React.FC = () => {
  const { user } = useUser();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReservations()
      .then(setReservations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const confirmed = reservations.filter(r => r.Res_Status === 'Confirmed');
  const totalSpent = reservations.reduce((s, r) => s + (Number(r.Total_Amount) || 0), 0);
  const upcoming = confirmed.filter(r => {
    const ticket = r.tickets?.[0];
    if (!ticket?.Travel_Date) return false;
    return new Date(ticket.Travel_Date) >= new Date();
  });
  const past = confirmed.filter(r => {
    const ticket = r.tickets?.[0];
    if (!ticket?.Travel_Date) return true;
    return new Date(ticket.Travel_Date) < new Date();
  });

  const stats = [
    { icon: Ticket, label: 'Total Bookings', value: String(reservations.length), color: 'text-blue-400', gradient: 'from-blue-500/20 to-blue-600/5' },
    { icon: CreditCard, label: 'Amount Spent', value: formatCurrency(totalSpent), color: 'text-brand-500', gradient: 'from-brand-500/20 to-orange-600/5' },
    { icon: Plane, label: 'Upcoming', value: String(upcoming.length), color: 'text-green-400', gradient: 'from-green-500/20 to-emerald-600/5' },
    { icon: TrendingUp, label: 'Completed', value: String(past.length), color: 'text-purple-400', gradient: 'from-purple-500/20 to-violet-600/5' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <PageHero
        icon={LayoutDashboard}
        title={`Welcome back${user?.firstName ? `, ${user.firstName}` : ''}!`}
        subtitle="Here's your travel summary and upcoming trips"
        badge="Live dashboard"
      />

      {/* Stats */}
      <section className="container-app -mt-8 relative z-10 mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className={`relative overflow-hidden rounded-xl border border-white/5 p-5 bg-gradient-to-br ${stat.gradient}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold text-white mt-0.5 truncate" title={stat.value}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Upcoming Trips */}
      <section className="container-app pb-8">
        <motion.div {...fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock size={18} className="text-brand-500" /> Upcoming Trips
            </h2>
            <Link to="/reservations" className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="card !p-8 text-center">
              <p className="text-3xl mb-3">✈️</p>
              <p className="text-gray-500 text-sm">No upcoming trips. <Link to="/" className="text-brand-500">Book a flight</Link></p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 3).map((r) => {
                const ticket = r.tickets[0];
                return (
                  <div key={r.Res_ID} className="card !p-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                        <Plane size={18} className="text-brand-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {ticket?.Source || '—'} → {ticket?.Destination || '—'}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={11} /> {ticket?.Travel_Date || r.Res_Date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-500">{formatCurrency(Number(r.Total_Amount))}</p>
                      <span className="badge badge-success text-[0.65rem]">{r.Res_Status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </section>

      {/* Past Trips */}
      <section className="bg-surface-secondary py-10 border-y border-white/5">
        <div className="container-app">
          <motion.div {...fadeUp}>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-brand-500" /> Past Trips
            </h2>
            {past.length === 0 ? (
              <div className="card !p-8 text-center">
                <p className="text-gray-500 text-sm">No past trips yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {past.slice(0, 5).map((r) => {
                  const ticket = r.tickets[0];
                  return (
                    <div key={r.Res_ID} className="card !p-4 flex items-center justify-between flex-wrap gap-3 opacity-70 hover:opacity-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                          <Plane size={18} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {ticket?.Source || '—'} → {ticket?.Destination || '—'}
                          </p>
                          <p className="text-xs text-gray-500">{ticket?.Travel_Date || r.Res_Date}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">{formatCurrency(Number(r.Total_Amount))}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default DashboardPage;
