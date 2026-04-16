import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { formatCurrency, formatTime, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PageHero from '@/components/PageHero';
import {
  Ticket, Plane, Users, Armchair, ArrowLeft, ExternalLink,
  Shield, Clock, CheckCircle2,
} from 'lucide-react';

const SEAT_ROWS = 5;
const SEAT_COLS_LEFT = ['A', 'B', 'C'];
const SEAT_COLS_RIGHT = ['D', 'E', 'F'];

/* ─── Fake booked seats for visual realism ─── */
const BOOKED_SEATS = new Set(['1D', '2A', '2E', '2F', '3A', '3B', '3C', '4D', '4E', '4F', '5D', '5E', '5F']);

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const BookingPage: React.FC = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<any>(null);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [passengerId, setPassengerId] = useState('');
  const [classType, setClassType] = useState('Economy');
  const [seatNum, setSeatNum] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getPassengers(),
      api.getSchedule(Number(scheduleId)),
    ]).then(([p, s]) => {
      setPassengers(p);
      setSchedule(s);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [scheduleId]);

  const classMultiplier = classType === 'Business' ? 1.8 : classType === 'First' ? 3 : 1;
  const price = schedule ? Math.round((Number(schedule.Base_Price) || 5000) * classMultiplier) : 0;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerId) { toast.error('Select a passenger'); return; }
    if (!seatNum) { toast.error('Please select a seat'); return; }
    setSubmitting(true);
    try {
      const data = await api.book({
        Passenger_ID: Number(passengerId),
        Schedule_ID: Number(scheduleId),
        Seat_Num: seatNum,
        Class_Type: classType,
      });

      // Create Stripe Checkout Session and redirect
      const checkoutRes = await api.createCheckoutSession({
        Res_ID: data.reservation.Res_ID,
        Amount: price,
        Flight_Info: {
          Source: schedule.Source || 'Origin',
          Destination: schedule.Destination || 'Destination',
          Airline: schedule.Airline_Name || 'Airline',
          Class_Type: classType,
          Seat_Num: seatNum,
          Travel_Date: schedule.Travel_Date,
        },
      });

      if (checkoutRes.url) {
        window.location.href = checkoutRes.url;
      } else {
        navigate(`/payment/${data.reservation.Res_ID}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderSeat = (seat: string) => {
    const isSelected = seatNum === seat;
    const isBooked = BOOKED_SEATS.has(seat);

    return (
      <button
        key={seat}
        type="button"
        disabled={isBooked}
        onClick={() => setSeatNum(seat)}
        className={cn(
          'w-9 h-8 rounded-md text-[0.7rem] font-bold border transition-all',
          isBooked
            ? 'bg-red-500/15 border-red-500/20 text-red-400/50 cursor-not-allowed'
            : isSelected
              ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/30 scale-105 cursor-pointer'
              : 'bg-white/5 border-white/10 text-gray-400 hover:border-brand-500/50 hover:text-white hover:bg-white/10 cursor-pointer'
        )}
      >
        {seat}
      </button>
    );
  };

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
        icon={Ticket}
        title="Book Your Flight"
        subtitle={schedule ? `${schedule.Source} → ${schedule.Destination} · ${schedule.Airline_Name || 'Airline'} · ${schedule.Travel_Date}` : `Schedule #${scheduleId}`}
        badge="Live seat availability"
      />

      <div className="container-app -mt-6 relative z-10 pb-12">
        {/* Flight summary header */}
        {schedule && (
          <motion.div {...fadeUp} className="mb-6">
            <div className="card !p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center">
                    <Plane size={20} className="text-brand-500" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">
                      {schedule.Source || 'Origin'} → {schedule.Destination || 'Destination'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {schedule.Airline_Name || 'Airline'} · {classType} · {schedule.Travel_Date} · 1 pax
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-brand-500">{formatCurrency(price)}</p>
                  <p className="text-[0.65rem] text-gray-500">total</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleBook} id="booking-form">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            {/* ──── Left — Seat Map ──── */}
            <motion.div {...fadeUp} className="space-y-5">
              {/* Passenger */}
              <div className="card !p-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                  <Users size={16} className="text-brand-500" /> Passenger Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Select Passenger</label>
                    <select
                      value={passengerId}
                      onChange={(e) => setPassengerId(e.target.value)}
                      className="form-input w-full"
                      id="passenger-select"
                      required
                    >
                      <option value="">Choose a passenger</option>
                      {passengers.map(p => (
                        <option key={p.Passenger_ID} value={p.Passenger_ID}>
                          {p.Name} (ID: {p.Passenger_ID})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Class</label>
                    <select
                      value={classType}
                      onChange={(e) => setClassType(e.target.value)}
                      className="form-input w-full"
                      id="class-select"
                    >
                      <option value="Economy">Economy</option>
                      <option value="Business">Business</option>
                      <option value="First">First Class</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Seat Map */}
              <div className="card !p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Armchair size={16} className="text-brand-500" /> Choose Your Seats
                  </h3>
                  <span className="flex items-center gap-1.5 text-[0.65rem] text-green-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Select 1 seat — {seatNum ? '1 selected' : '0 selected'}
                </p>

                {/* Legend */}
                <div className="flex items-center gap-5 mb-5 justify-center">
                  {[
                    { label: 'Available', color: 'bg-white/10 border-white/20' },
                    { label: 'Selected', color: 'bg-brand-500 border-brand-500' },
                    { label: 'Booked', color: 'bg-red-500/15 border-red-500/20' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <div className={`w-4 h-3.5 rounded-sm border ${item.color}`} />
                      <span className="text-[0.65rem] text-gray-500">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Aircraft body */}
                <div className="bg-surface-primary rounded-2xl p-5 border border-white/5">
                  {/* Cockpit */}
                  <div className="flex items-center justify-center gap-2 mb-4 text-gray-600">
                    <Plane size={13} className="rotate-0" />
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] font-semibold">Cockpit</span>
                  </div>

                  {/* Seats grid */}
                  <div className="flex flex-col gap-2 items-center">
                    {Array.from({ length: SEAT_ROWS }, (_, row) => (
                      <div key={row} className="flex items-center gap-1">
                        <span className="text-[0.6rem] text-gray-600 w-4 text-right mr-1">{row + 1}</span>
                        <div className="flex gap-1.5">
                          {SEAT_COLS_LEFT.map(col => renderSeat(`${row + 1}${col}`))}
                        </div>
                        <div className="w-6" />
                        <div className="flex gap-1.5">
                          {SEAT_COLS_RIGHT.map(col => renderSeat(`${row + 1}${col}`))}
                        </div>
                        <span className="text-[0.6rem] text-gray-600 w-4 ml-1">{row + 1}</span>
                      </div>
                    ))}
                  </div>

                  {/* Column letters */}
                  <div className="flex items-center justify-center mt-3 gap-1">
                    <span className="w-4 mr-1" />
                    <div className="flex gap-1.5">
                      {SEAT_COLS_LEFT.map(col => (
                        <span key={col} className="w-9 text-center text-[0.6rem] text-gray-600 font-medium">{col}</span>
                      ))}
                    </div>
                    <div className="w-6" />
                    <div className="flex gap-1.5">
                      {SEAT_COLS_RIGHT.map(col => (
                        <span key={col} className="w-9 text-center text-[0.6rem] text-gray-600 font-medium">{col}</span>
                      ))}
                    </div>
                    <span className="w-4 ml-1" />
                  </div>
                </div>

                {/* Selected seat indicator */}
                {seatNum && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2.5 border border-white/10"
                  >
                    <span className="text-xs text-gray-400">Your seats:</span>
                    <span className="bg-brand-500 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                      {seatNum}
                    </span>
                  </motion.div>
                )}

                {/* Timestamp */}
                <p className="text-[0.6rem] text-gray-600 text-center mt-3">
                  ⊙ Updated {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </p>
              </div>
            </motion.div>

            {/* ──── Right — Booking Summary ──── */}
            <div className="lg:sticky lg:top-20 self-start space-y-4">
              <div className="card !p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">Booking Summary</h3>
                <div className="space-y-3 text-sm">
                  {[
                    ['Route', `${schedule?.Source || '—'} → ${schedule?.Destination || '—'}`],
                    ['Operator', schedule?.Airline_Name || '—'],
                    ['Date', schedule?.Travel_Date || '—'],
                    ['Time', schedule ? `${formatTime(schedule.Depart_Time)} → ${formatTime(schedule.Arrival_Time)}` : '—'],
                    ['Class', classType],
                    ['Travelers', '1'],
                    ['Seats', seatNum || 'None'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-500">{label}</span>
                      <span className={cn(
                        'font-medium',
                        label === 'Seats' && seatNum ? 'text-brand-500' : 'text-white'
                      )}>
                        {value}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-white/5 pt-3 flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-xl font-extrabold text-brand-500">
                      {formatCurrency(price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secure Stripe Checkout notice */}
              <div className="card !p-4 !bg-brand-500/5 !border-brand-500/15">
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield size={14} className="text-brand-500" />
                  <span className="text-xs font-semibold text-white">Secure Stripe Checkout</span>
                </div>
                <p className="text-[0.68rem] text-gray-400 leading-relaxed">
                  You'll be redirected to Stripe's secure payment page. We support all major cards.
                </p>
              </div>

              {/* Pay button */}
              <button
                type="submit"
                className="btn btn-primary !rounded-xl w-full"
                disabled={submitting || !seatNum}
                id="confirm-booking-btn"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating booking...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ExternalLink size={16} /> Pay {formatCurrency(price)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default BookingPage;
