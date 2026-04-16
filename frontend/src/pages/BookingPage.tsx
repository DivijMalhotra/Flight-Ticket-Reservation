import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/services/api';
import { formatCurrency, formatTime, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PageHero from '@/components/PageHero';
import {
  Ticket, Plane, Users, Armchair, ExternalLink,
  Shield, Clock, CheckCircle2, Plus, Minus,
} from 'lucide-react';

const SEAT_ROWS = 10;
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read travelers count from URL — default 1, no upper limit
  const initialTravelers = Math.max(1, Number(searchParams.get('travelers') || '1'));

  const [schedule, setSchedule] = useState<any>(null);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [travelerCount, setTravelerCount] = useState(initialTravelers);
  const [selectedPassengers, setSelectedPassengers] = useState<string[]>(
    Array(initialTravelers).fill('')
  );
  const [classType, setClassType] = useState('Economy');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
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

  // Sync arrays when traveler count changes
  useEffect(() => {
    setSelectedPassengers(prev => {
      const next = [...prev];
      while (next.length < travelerCount) next.push('');
      return next.slice(0, travelerCount);
    });
    setSelectedSeats(prev => prev.slice(0, travelerCount));
  }, [travelerCount]);

  const classMultiplier = classType === 'Business' ? 1.8 : classType === 'First' ? 3 : 1;
  const perTicketPrice = schedule ? Math.round((Number(schedule.Base_Price) || 5000) * classMultiplier) : 0;
  const totalPrice = perTicketPrice * travelerCount;

  const handleSeatClick = (seat: string) => {
    if (BOOKED_SEATS.has(seat)) return;

    setSelectedSeats(prev => {
      if (prev.includes(seat)) {
        // Deselect
        return prev.filter(s => s !== seat);
      }
      if (prev.length >= travelerCount) {
        // Replace the oldest selection
        return [...prev.slice(1), seat];
      }
      return [...prev, seat];
    });
  };

  const handlePassengerChange = (index: number, value: string) => {
    setSelectedPassengers(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const incrementTravelers = () => {
    const maxSeats = schedule?.Available_Seats || 999;
    if (travelerCount < maxSeats) {
      setTravelerCount(prev => prev + 1);
    }
  };

  const decrementTravelers = () => {
    if (travelerCount > 1) {
      setTravelerCount(prev => prev - 1);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate: at least one passenger selected
    const filledPassengers = selectedPassengers.filter(p => p !== '');
    if (filledPassengers.length === 0) {
      toast.error('Select at least one passenger');
      return;
    }

    // Validate: enough seats selected
    if (selectedSeats.length < travelerCount) {
      toast.error(`Please select ${travelerCount} seat(s) — you've selected ${selectedSeats.length}`);
      return;
    }

    // Build travelers array
    const travelers = Array.from({ length: travelerCount }, (_, i) => ({
      Passenger_ID: Number(selectedPassengers[i] || selectedPassengers[0]),
      Seat_Num: selectedSeats[i],
    }));

    setSubmitting(true);
    try {
      const data = await api.book({
        Schedule_ID: Number(scheduleId),
        Class_Type: classType,
        Travelers: travelers,
      });

      // Create Stripe Checkout Session and redirect
      const seatList = selectedSeats.join(', ');
      const checkoutRes = await api.createCheckoutSession({
        Res_ID: data.reservation.Res_ID,
        Amount: totalPrice,
        Flight_Info: {
          Source: schedule.Source || 'Origin',
          Destination: schedule.Destination || 'Destination',
          Airline: schedule.Airline_Name || 'Airline',
          Class_Type: classType,
          Seat_Num: seatList,
          Travel_Date: schedule.Travel_Date,
          Travelers: travelerCount,
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
    const isSelected = selectedSeats.includes(seat);
    const isBooked = BOOKED_SEATS.has(seat);
    const seatIndex = selectedSeats.indexOf(seat);

    return (
      <button
        key={seat}
        type="button"
        disabled={isBooked}
        onClick={() => handleSeatClick(seat)}
        className={cn(
          'w-9 h-8 rounded-md text-[0.7rem] font-bold border transition-all relative',
          isBooked
            ? 'bg-red-500/15 border-red-500/20 text-red-400/50 cursor-not-allowed'
            : isSelected
              ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/30 scale-105 cursor-pointer'
              : 'bg-white/5 border-white/10 text-gray-400 hover:border-brand-500/50 hover:text-white hover:bg-white/10 cursor-pointer'
        )}
      >
        {seat}
        {isSelected && travelerCount > 1 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white text-brand-500 text-[0.55rem] font-extrabold flex items-center justify-center border border-brand-500">
            {seatIndex + 1}
          </span>
        )}
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
                      {schedule.Airline_Name || 'Airline'} · {classType} · {schedule.Travel_Date} · {travelerCount} pax
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-brand-500">{formatCurrency(totalPrice)}</p>
                  <p className="text-[0.65rem] text-gray-500">
                    {travelerCount > 1 ? `${formatCurrency(perTicketPrice)} × ${travelerCount}` : 'total'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleBook} id="booking-form">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            {/* ──── Left — Passenger & Seat Map ──── */}
            <motion.div {...fadeUp} className="space-y-5">
              {/* Traveler Count + Class */}
              <div className="card !p-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                  <Users size={16} className="text-brand-500" /> Travelers & Class
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Number of Travelers</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={decrementTravelers}
                        disabled={travelerCount <= 1}
                        className={cn(
                          'w-10 h-10 rounded-lg border flex items-center justify-center transition-all cursor-pointer',
                          travelerCount <= 1
                            ? 'border-white/5 text-gray-600 bg-white/[0.02] cursor-not-allowed'
                            : 'border-border text-white bg-surface-input hover:border-brand-500'
                        )}
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={travelerCount}
                        onChange={(e) => {
                          const val = Math.max(1, Number(e.target.value));
                          const maxSeats = schedule?.Available_Seats || 999;
                          setTravelerCount(Math.min(val, maxSeats));
                        }}
                        className="form-input w-20 text-center font-bold text-lg"
                        id="traveler-count-input"
                      />
                      <button
                        type="button"
                        onClick={incrementTravelers}
                        disabled={travelerCount >= (schedule?.Available_Seats || 999)}
                        className={cn(
                          'w-10 h-10 rounded-lg border flex items-center justify-center transition-all cursor-pointer',
                          travelerCount >= (schedule?.Available_Seats || 999)
                            ? 'border-white/5 text-gray-600 bg-white/[0.02] cursor-not-allowed'
                            : 'border-border text-white bg-surface-input hover:border-brand-500'
                        )}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {schedule && (
                      <p className="text-[0.65rem] text-gray-600 mt-1">
                        {schedule.Available_Seats} seat(s) available
                      </p>
                    )}
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

              {/* Passenger Details */}
              <div className="card !p-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                  <Users size={16} className="text-brand-500" /> Passenger Details
                </h3>
                <div className="space-y-3">
                  {Array.from({ length: travelerCount }, (_, i) => (
                    <div key={i} className="form-group">
                      <label>Traveler {i + 1}{i === 0 ? ' (Primary)' : ''}</label>
                      <select
                        value={selectedPassengers[i] || ''}
                        onChange={(e) => handlePassengerChange(i, e.target.value)}
                        className="form-input w-full"
                        id={`passenger-select-${i}`}
                        required={i === 0}
                      >
                        <option value="">Choose a passenger</option>
                        {passengers.map(p => (
                          <option key={p.Passenger_ID} value={p.Passenger_ID}>
                            {p.Name} (ID: {p.Passenger_ID})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
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
                  Select {travelerCount} seat{travelerCount > 1 ? 's' : ''} — {selectedSeats.length} selected
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

                {/* Selected seat indicators */}
                {selectedSeats.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-2 flex-wrap bg-white/5 rounded-lg px-4 py-2.5 border border-white/10"
                  >
                    <span className="text-xs text-gray-400">Your seats:</span>
                    {selectedSeats.map((seat, i) => (
                      <span key={seat} className="bg-brand-500 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                        {travelerCount > 1 ? `T${i + 1}: ` : ''}{seat}
                      </span>
                    ))}
                    {selectedSeats.length < travelerCount && (
                      <span className="text-xs text-yellow-400">
                        ({travelerCount - selectedSeats.length} more needed)
                      </span>
                    )}
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
                    ['Travelers', String(travelerCount)],
                    ['Seats', selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-500">{label}</span>
                      <span className={cn(
                        'font-medium',
                        label === 'Seats' && selectedSeats.length > 0 ? 'text-brand-500' : 'text-white'
                      )}>
                        {value}
                      </span>
                    </div>
                  ))}

                  {/* Price breakdown */}
                  {travelerCount > 1 && (
                    <div className="flex justify-between text-xs text-gray-500 border-t border-white/5 pt-2">
                      <span>Per ticket</span>
                      <span className="text-white">{formatCurrency(perTicketPrice)} × {travelerCount}</span>
                    </div>
                  )}

                  <div className="border-t border-white/5 pt-3 flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-xl font-extrabold text-brand-500">
                      {formatCurrency(totalPrice)}
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
                disabled={submitting || selectedSeats.length < travelerCount}
                id="confirm-booking-btn"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating booking...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ExternalLink size={16} /> Pay {formatCurrency(totalPrice)}
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
