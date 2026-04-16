import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { formatCurrency, formatTime, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Ticket, Plane, Users, Armchair, ArrowRight, CheckCircle2,
} from 'lucide-react';

const SEAT_ROWS = 6;
const SEAT_COLS = ['A', 'B', 'C', 'D'];

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
  const price = schedule ? Math.round((schedule.Base_Price || 5000) * classMultiplier) : 0;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerId) { toast.error('Select a passenger'); return; }
    setSubmitting(true);
    try {
      const data = await api.book({
        Passenger_ID: Number(passengerId),
        Schedule_ID: Number(scheduleId),
        Seat_Num: seatNum || undefined,
        Class_Type: classType,
      });
      toast.success('Reservation created! Proceed to payment.');
      navigate(`/payment/${data.reservation.Res_ID}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container-app page-section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
          <Ticket size={24} className="text-brand-500" /> Book Your Flight
        </h1>
        <p className="text-sm text-gray-500 mb-8">Schedule #{scheduleId}</p>

        {/* Flight summary card */}
        {schedule && (
          <div className="card mb-6 !p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-xs text-gray-500">From</p>
                  <p className="text-lg font-bold text-white">{schedule.Source || 'Origin'}</p>
                  <p className="text-xs text-gray-500">{formatTime(schedule.Depart_Time)}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Plane size={16} className="text-brand-500" />
                  <div className="w-16 h-0.5 bg-brand-500/30 rounded" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">To</p>
                  <p className="text-lg font-bold text-white">{schedule.Destination || 'Destination'}</p>
                  <p className="text-xs text-gray-500">{formatTime(schedule.Arrival_Time)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Travel Date</p>
                <p className="text-sm font-semibold text-white">{schedule.Travel_Date}</p>
                <p className="text-xs text-green-400 mt-1">{schedule.Available_Seats} seats left</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleBook} id="booking-form">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            {/* Left — Form */}
            <div className="space-y-6">
              {/* Passenger */}
              <div className="card !p-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                  <Users size={16} className="text-brand-500" /> Passenger Details
                </h3>
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
              </div>

              {/* Class + Seat */}
              <div className="card !p-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                  <Armchair size={16} className="text-brand-500" /> Seat Selection
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-5">
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
                  <div className="form-group">
                    <label>Seat (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 12A"
                      value={seatNum}
                      onChange={(e) => setSeatNum(e.target.value)}
                      className="form-input w-full"
                      id="seat-input"
                    />
                  </div>
                </div>

                {/* Visual Seat Map */}
                <div className="bg-surface-primary rounded-xl p-4 border border-white/5">
                  <p className="text-[0.68rem] text-gray-500 uppercase tracking-wider font-semibold mb-3 text-center">Quick Select</p>
                  <div className="flex flex-col gap-1.5 items-center">
                    {Array.from({ length: SEAT_ROWS }, (_, row) => (
                      <div key={row} className="flex gap-1.5 items-center">
                        <span className="text-[0.65rem] text-gray-600 w-4 text-right">{row + 1}</span>
                        {SEAT_COLS.map(col => {
                          const seat = `${row + 1}${col}`;
                          const isSelected = seatNum === seat;
                          return (
                            <button
                              key={seat}
                              type="button"
                              onClick={() => setSeatNum(seat)}
                              className={cn(
                                'w-8 h-7 rounded text-[0.65rem] font-semibold border transition-all cursor-pointer',
                                isSelected
                                  ? 'bg-brand-500 border-brand-500 text-white'
                                  : 'bg-white/5 border-white/10 text-gray-500 hover:border-brand-500/50 hover:text-white'
                              )}
                            >
                              {col}
                            </button>
                          );
                        })}
                        <span className="w-4" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Summary */}
            <div className="lg:sticky lg:top-20 self-start">
              <div className="card !p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">Booking Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Class</span>
                    <span className="text-white font-medium">{classType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Seat</span>
                    <span className="text-white font-medium">{seatNum || 'Auto-assign'}</span>
                  </div>
                  <div className="border-t border-white/5 pt-3 flex justify-between">
                    <span className="text-gray-400 font-semibold">Total</span>
                    <span className="text-xl font-extrabold text-brand-500">
                      {formatCurrency(price)}
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary !rounded-xl"
                  disabled={submitting}
                  id="confirm-booking-btn"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ArrowRight size={16} /> Proceed to Payment
                    </span>
                  )}
                </button>
                <p className="text-[0.68rem] text-gray-600 text-center">You'll pay on the next screen</p>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BookingPage;
