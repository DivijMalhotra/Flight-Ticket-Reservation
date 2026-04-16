import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PageHero from '@/components/PageHero';
import {
  ClipboardList, XCircle, User, Plane, PlaneTakeoff, PlaneLanding,
  CreditCard, Calendar, Armchair, Tag, Mail, Phone, Hash, ChevronDown, ChevronUp,
} from 'lucide-react';

interface TicketDetail {
  Ticket_ID: number; Seat_Num: string; Class_Type: string; Price: number;
  Ticket_Status: string; Flight_Number: string; Airline_Name: string;
  Source: string; Destination: string; Depart_Time: string; Arrival_Time: string; Travel_Date: string;
}
interface PaymentDetail {
  Pay_ID: number; Amount: number; Pay_Date: string; Pay_Mode: string; Pay_Status: string;
}
interface EnrichedReservation {
  Res_ID: number; Res_Date: string; Res_Status: string; Total_Amount: number;
  Passenger_ID: number; Passenger_Name: string; Passenger_Email: string;
  Passenger_Contact: string; Passenger_Passport: string;
  tickets: (TicketDetail & { Passenger_Name?: string; Passenger_Email?: string; Passenger_Contact?: string; Passenger_Passport?: string })[];
  payments: PaymentDetail[];
}

const statusBadge = (s: string) => {
  if (['Confirmed', 'Booked', 'Success'].includes(s)) return <span className="badge badge-success">{s}</span>;
  if (s === 'Pending') return <span className="badge badge-warning">{s}</span>;
  return <span className="badge badge-danger">{s}</span>;
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<EnrichedReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const load = () => {
    setLoading(true);
    api.getReservations().then(setReservations).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleExpand = (resId: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(resId) ? next.delete(resId) : next.add(resId);
      return next;
    });
  };

  const handleCancel = async (resId: number) => {
    if (!confirm(`Cancel reservation #${resId}?`)) return;
    try {
      await api.cancelReservation(resId);
      toast.success(`Reservation #${resId} cancelled`);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <PageHero
        icon={ClipboardList}
        title="Reservations"
        subtitle="View and manage all your flight reservations"
        badge={`${reservations.length} total bookings`}
      />

      <div className="container-app -mt-6 relative z-10 pb-12">
        <motion.div {...fadeUp}>
          {loading ? (
            <div className="flex justify-center py-20"><div className="spinner" /></div>
          ) : reservations.length === 0 ? (
            <div className="empty-state"><p className="text-4xl mb-4">📋</p><p>No reservations yet.</p></div>
          ) : (
            <div className="space-y-3">
              {reservations.map(r => {
                const isOpen = expanded.has(r.Res_ID);
                const ticket = r.tickets[0];
                const payment = r.payments[0];
                return (
                  <motion.div
                    key={r.Res_ID}
                    className={cn('card !p-0 overflow-hidden', isOpen && 'border-brand-500 shadow-lg shadow-brand-500/5')}
                    layout
                    id={`res-${r.Res_ID}`}
                  >
                    {/* Header */}
                    <div
                      className="grid grid-cols-[1.2fr_1fr_auto_40px] items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                      onClick={() => toggleExpand(r.Res_ID)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-bold text-brand-500">#{r.Res_ID}</span>
                        <div className="flex items-center gap-2 text-sm font-semibold text-white truncate">
                          {ticket ? (
                            <>
                              <span>{ticket.Source}</span>
                              <Plane size={12} className="text-brand-500 flex-shrink-0" />
                              <span>{ticket.Destination}</span>
                            </>
                          ) : '—'}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-white flex items-center gap-1.5"><User size={12} /> {r.Passenger_Name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={10} /> {ticket?.Travel_Date || r.Res_Date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-extrabold text-brand-500">{formatCurrency(Number(r.Total_Amount))}</p>
                        {statusBadge(r.Res_Status)}
                      </div>
                      <div className="text-gray-500 flex items-center justify-center">
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/5 px-5 py-5 bg-white/[0.01]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {/* Flight (Common for all tickets in reservation) */}
                              {ticket && (
                                <div className="bg-surface-input rounded-xl p-4 border border-white/5">
                                  <h4 className="text-[0.7rem] font-bold text-brand-500 uppercase tracking-wider mb-3 flex items-center gap-2 pb-2 border-b border-brand-500/10">
                                    <Plane size={13} /> Flight Info
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Flight</span><span className="text-white">{ticket.Flight_Number} · {ticket.Airline_Name}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500 flex items-center gap-1"><PlaneTakeoff size={11} />Depart</span><span className="text-white">{ticket.Source} — {ticket.Depart_Time}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500 flex items-center gap-1"><PlaneLanding size={11} />Arrive</span><span className="text-white">{ticket.Destination} — {ticket.Arrival_Time}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500 flex items-center gap-1"><Calendar size={11} />Date</span><span className="text-white">{ticket.Travel_Date}</span></div>
                                  </div>
                                </div>
                              )}

                              {/* Payment (Common for reservation) */}
                              {payment ? (
                                <div className="bg-surface-input rounded-xl p-4 border border-white/5">
                                  <h4 className="text-[0.7rem] font-bold text-brand-500 uppercase tracking-wider mb-3 flex items-center gap-2 pb-2 border-b border-brand-500/10">
                                    <CreditCard size={13} /> Payment Info
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Pay ID</span><span className="text-white">#{payment.Pay_ID}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="text-brand-500 font-bold">{formatCurrency(Number(payment.Amount))}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="text-white">{payment.Pay_Date}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Mode</span><span className="text-white">{payment.Pay_Mode}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Status</span>{statusBadge(payment.Pay_Status)}</div>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-surface-input rounded-xl p-4 border border-white/5 flex items-center justify-center opacity-50">
                                  <span className="text-xs text-gray-400">No payment info found</span>
                                </div>
                              )}
                            </div>

                            {/* Travelers Loop */}
                            <h4 className="text-[0.75rem] font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2 mt-2">
                              <User size={14} className="text-brand-500" /> Travelers ({r.tickets.length})
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {r.tickets.map((t, idx) => (
                                <div key={t.Ticket_ID} className="bg-surface-input rounded-xl p-4 border border-white/5 flex flex-col md:flex-row gap-4">
                                  {/* Left side: Passenger */}
                                  <div className="flex-1 space-y-2 text-sm md:border-r border-white/5 pr-4">
                                    <div className="font-semibold text-white text-base mb-1">
                                      Traveler {idx + 1}: {t.Passenger_Name || r.Passenger_Name}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400"><Mail size={12} /> <span className="truncate">{t.Passenger_Email || r.Passenger_Email}</span></div>
                                    <div className="flex items-center gap-2 text-gray-400"><Phone size={12} /> <span>{t.Passenger_Contact || r.Passenger_Contact}</span></div>
                                    <div className="flex items-center gap-2 text-gray-400"><Hash size={12} /> <span>{t.Passenger_Passport || r.Passenger_Passport}</span></div>
                                  </div>
                                  
                                  {/* Right side: Ticket */}
                                  <div className="flex-1 space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Ticket ID</span><span className="text-white">#{t.Ticket_ID}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500 flex items-center gap-1"><Armchair size={11} />Seat</span><span className="text-brand-500 font-bold">{t.Seat_Num}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Class</span><span className="text-white">{t.Class_Type}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Price</span><span className="text-white">{formatCurrency(Number(t.Price))}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Status</span>{statusBadge(t.Ticket_Status)}</div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Cancel */}
                            {['Confirmed', 'Pending'].includes(r.Res_Status) && (
                              <div className="mt-5 pt-4 border-t border-white/5 flex justify-end">
                                <button className="btn btn-danger btn-sm" onClick={() => handleCancel(r.Res_ID)} id={`cancel-${r.Res_ID}`}>
                                  <XCircle size={15} /> Cancel Reservation
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default ReservationsPage;
