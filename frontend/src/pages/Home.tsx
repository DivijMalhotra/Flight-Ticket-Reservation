import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Plane, MapPin, Calendar, Users, ArrowLeftRight,
  Shield, Clock, CreditCard, Headphones, Sparkles, ArrowRight,
  TrendingUp,
} from 'lucide-react';

const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune'];

const POPULAR_ROUTES = [
  { from: 'Delhi', to: 'Mumbai', price: '₹5,500', time: '2h 15m', img: '🏙️' },
  { from: 'Mumbai', to: 'Bangalore', price: '₹4,200', time: '1h 30m', img: '🌴' },
  { from: 'Delhi', to: 'Chennai', price: '₹6,000', time: '2h 30m', img: '🛕' },
  { from: 'Kolkata', to: 'Delhi', price: '₹5,800', time: '2h 15m', img: '🌉' },
];

const FEATURES = [
  { icon: Shield, title: 'Secure Booking', desc: 'End-to-end encrypted payments with Stripe' },
  { icon: Clock, title: 'Real-time Updates', desc: 'Live seat availability and delay tracking' },
  { icon: CreditCard, title: 'Flexible Payments', desc: 'UPI, Cards, Net Banking — all supported' },
  { icon: Headphones, title: '24/7 Support', desc: 'Round-the-clock customer assistance' },
];

const OFFERS = [
  { tag: 'NEW USER', title: '15% off on first flight', code: 'SKYFLOW15', gradient: 'from-brand-500/20 to-orange-600/10' },
  { tag: 'WEEKEND', title: 'Flat ₹500 off weekend flights', code: 'WKND500', gradient: 'from-blue-500/20 to-purple-600/10' },
  { tag: 'BUSINESS', title: 'Business class at economy rates', code: 'BIZUP', gradient: 'from-emerald-500/20 to-teal-600/10' },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [source, setSource] = useState('Delhi');
  const [destination, setDestination] = useState('Mumbai');
  const [date, setDate] = useState('');
  const [tripType, setTripType] = useState('oneway');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (source) params.set('source', source);
    if (destination) params.set('destination', destination);
    if (date) params.set('date', date);
    navigate(`/results?${params.toString()}`);
  };

  const swapCities = () => {
    setSource(destination);
    setDestination(source);
  };

  return (
    <>
      {/* ══ HERO ══ */}
      <section className="relative bg-surface-primary pt-16 pb-28 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-500/[0.06] rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-brand-500/[0.03] rounded-full blur-[80px]" />
        </div>
        <div className="container-app relative z-10">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-5 py-1.5 text-xs text-brand-500 mb-7">
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse-dot" />
              Live seat availability · Real-time pricing
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-tight mb-4 tracking-tight text-white">
              Travel Smarter,<br />Book <span className="text-brand-500">Faster.</span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Search across all major airlines, compare prices in real-time,
              and book your flight in seconds — backed by MongoDB.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══ SEARCH BOX ══ */}
      <div className="container-app relative z-20">
        <motion.form
          onSubmit={handleSearch}
          className="bg-surface-card border border-border rounded-2xl p-8 -mt-14 shadow-2xl shadow-black/40"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          id="search-form"
        >
          {/* Tabs */}
          <div className="flex gap-1 mb-5">
            <button type="button" className="px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-brand-500 text-white transition-all cursor-pointer border-none">
              <Plane size={14} /> Flights
            </button>
          </div>

          {/* Trip Type Radio */}
          <div className="flex gap-5 items-center mb-6">
            {['oneway', 'roundtrip'].map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">
                <input
                  type="radio"
                  name="triptype"
                  value={type}
                  checked={tripType === type}
                  onChange={() => setTripType(type)}
                  className="w-3.5 h-3.5 accent-brand-500"
                />
                {type === 'oneway' ? 'One Way' : 'Round Trip'}
              </label>
            ))}
          </div>

          {/* Source / Swap / Destination */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 mb-4">
            <div className="form-group">
              <label>From</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500 pointer-events-none" />
                <select value={source} onChange={(e) => setSource(e.target.value)} className="form-input w-full pl-10" id="source-select">
                  <option value="">Any City</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={swapCities}
              className="self-end w-10 h-10 rounded-full border border-border bg-surface-input text-gray-400 flex items-center justify-center cursor-pointer hover:border-brand-500 hover:text-brand-500 transition-all mb-1 mx-auto"
              title="Swap cities"
            >
              <ArrowLeftRight size={16} />
            </button>

            <div className="form-group">
              <label>To</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500 pointer-events-none" />
                <select value={destination} onChange={(e) => setDestination(e.target.value)} className="form-input w-full pl-10" id="destination-select">
                  <option value="">Any City</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Date + Travelers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            <div className="form-group">
              <label>Departure</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500 pointer-events-none" />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input w-full pl-10" id="date-input" />
              </div>
            </div>
            <div className="form-group">
              <label>Travelers</label>
              <div className="relative">
                <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500 pointer-events-none" />
                <select defaultValue="1" className="form-input w-full pl-10" id="travelers-select">
                  <option value="1">1 Traveler</option>
                  <option value="2">2 Travelers</option>
                  <option value="3">3 Travelers</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" id="search-btn">
            <Search size={18} /> Search Flights
          </button>
        </motion.form>
      </div>

      {/* ══ OFFERS ══ */}
      <section className="container-app py-16">
        <motion.div {...fadeUp}>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles size={20} className="text-brand-500" />
            <h2 className="text-xl font-bold text-white">Exclusive Offers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {OFFERS.map((offer, i) => (
              <motion.div
                key={i}
                className={`relative overflow-hidden rounded-xl border border-white/5 p-6 bg-gradient-to-br ${offer.gradient}`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/15 px-2 py-0.5 rounded">{offer.tag}</span>
                <p className="text-white font-semibold mt-3 text-sm">{offer.title}</p>
                <p className="text-gray-500 text-xs mt-1">Use code: <span className="text-brand-400 font-mono font-bold">{offer.code}</span></p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══ POPULAR ROUTES ══ */}
      <section className="container-app pb-16">
        <motion.div {...fadeUp}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp size={20} className="text-brand-500" />
              <h2 className="text-xl font-bold text-white">Popular Routes</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {POPULAR_ROUTES.map((route, i) => (
              <motion.div
                key={i}
                className="card cursor-pointer group"
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/results?source=${route.from}&destination=${route.to}`)}
              >
                <div className="text-3xl mb-3">{route.img}</div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white mb-1">
                  {route.from}
                  <ArrowRight size={14} className="text-brand-500" />
                  {route.to}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">~{route.time}</span>
                  <span className="text-sm font-bold text-brand-500">from {route.price}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="bg-surface-secondary py-16 border-y border-white/5">
        <div className="container-app">
          <motion.div {...fadeUp}>
            <h2 className="text-xl font-bold text-white text-center mb-10">Why choose SkyFlow?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feat, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
                    <feat.icon size={22} className="text-brand-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{feat.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ APP BANNER ══ */}
      <section className="container-app py-16">
        <motion.div
          {...fadeUp}
          className="rounded-2xl bg-gradient-to-r from-brand-500/20 via-surface-card to-brand-500/10 border border-brand-500/20 p-10 md:p-14 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Ready to take off?</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
            Join thousands of travelers who book smarter with SkyFlow. Create your account and start flying today.
          </p>
          <button onClick={() => navigate('/sign-up')} className="btn btn-primary !w-auto px-10">
            Get Started Free <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>
    </>
  );
};

export default Home;
