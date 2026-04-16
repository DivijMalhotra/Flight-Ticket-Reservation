import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle, Search, ClipboardList, Download, Plane } from 'lucide-react';

const BookingConfirmPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state as any;

  if (!data) {
    return (
      <div className="container-app page-section text-center">
        <p className="text-gray-400">No booking data. <Link to="/" className="text-brand-500">Go Home</Link></p>
      </div>
    );
  }

  const { reservation, ticket, payment } = data;

  return (
    <div className="container-app page-section">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg mx-auto"
      >
        <div className="card !p-8 text-center">
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={40} className="text-green-400" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-1">Booking Confirmed!</h2>
          <p className="text-gray-500 text-sm mb-6">Your ticket has been generated successfully</p>

          {/* Boarding pass style */}
          <div className="bg-surface-primary rounded-xl border border-white/5 overflow-hidden mb-6">
            <div className="bg-brand-500/10 px-6 py-3 flex items-center justify-between border-b border-brand-500/20">
              <div className="flex items-center gap-2">
                <Plane size={14} className="text-brand-500" />
                <span className="text-xs font-semibold text-brand-500">BOARDING PASS</span>
              </div>
              <span className="text-xs text-gray-500">#{ticket?.Ticket_ID}</span>
            </div>
            <div className="p-5 space-y-3 text-left">
              {[
                ['Reservation ID', `#${reservation?.Res_ID}`],
                ['Seat', ticket?.Seat_Num],
                ['Class', ticket?.Class_Type],
                ['Price', formatCurrency(ticket?.Price || 0)],
                ['Payment', `${payment?.Pay_Status} via ${payment?.Pay_Mode}`],
              ].map(([label, value], i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className={`font-medium ${
                    label === 'Price' ? 'text-brand-500' :
                    label === 'Payment' ? 'text-green-400' : 'text-white'
                  }`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary btn-sm flex-1"
            >
              <Search size={15} /> Search More
            </button>
            <button
              onClick={() => navigate('/reservations')}
              className="btn btn-outline btn-sm flex-1 !text-white"
            >
              <ClipboardList size={15} /> My Bookings
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingConfirmPage;
