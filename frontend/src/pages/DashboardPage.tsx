import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { api } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Plane, CreditCard, Ticket, Calendar,
  TrendingUp, Clock, ArrowRight,
} from 'lucide-react';

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
  const totalSpent = reservations.reduce((s, r) => s + (r.Total_Amount || 0), 0);
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
    { icon: Ticket, label: 'Total Bookings', value: reservations.length, color: 'text-blue-400' },
    { icon: CreditCard, label: 'Amount Spent', value: formatCurrency(totalSpent), color: 'text-brand-500' },
    { icon: Plane, label: 'Upcoming', value: upcoming.length, color: 'text-green-400' },
    { icon: TrendingUp, label: 'Completed', value: past.length, color: 'text-purple-400' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container-app page-section">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <LayoutDashboard size={24} className="text-brand-500" /> Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! Here's your travel summary.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="card !p-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold text-white mt-0.5">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Trips */}
        <div className="mb-8">
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
                      <p className="text-sm font-bold text-brand-500">{formatCurrency(r.Total_Amount)}</p>
                      <span className="badge badge-success text-[0.65rem]">{r.Res_Status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Trips */}
        <div>
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
                    <p className="text-sm text-gray-400">{formatCurrency(r.Total_Amount)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
