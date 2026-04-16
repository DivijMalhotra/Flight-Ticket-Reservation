import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Plane, Star, Clock, TrendingUp, Sparkles } from 'lucide-react';
import PageHero from '@/components/PageHero';

/* ── Local generated images ── */
import mumbaiImg from '@/assets/destinations/mumbai.png';
import delhiImg from '@/assets/destinations/delhi.png';
import bengaluruImg from '@/assets/destinations/bengaluru.png';

/* ── Remote images for cities where generation quota was exhausted ── */
const goaImg = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80&auto=format';
const ahmedabadImg = 'https://images.pexels.com/photos/3581916/pexels-photo-3581916.jpeg?auto=compress&cs=tinysrgb&w=800';
const amritsarImg = 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&q=80&auto=format';
const hyderabadImg = 'https://images.pexels.com/photos/10070972/pexels-photo-10070972.jpeg?auto=compress&cs=tinysrgb&w=800';
const chennaiImg = 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80&auto=format';
const kolkataImg = 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&q=80&auto=format';

interface Destination {
  city: string;
  tagline: string;
  description: string;
  image: string;
  rating: number;
  flightTime: string;
  highlight: string;
  color: string; // dot color accent
}

const DESTINATIONS: Destination[] = [
  {
    city: 'Mumbai',
    tagline: 'The City of Dreams',
    description: 'Experience the bustling metropolis with the iconic Marine Drive, Bollywood magic, and world-class street food.',
    image: mumbaiImg,
    rating: 4.8,
    flightTime: '2h 15m',
    highlight: 'Trending',
    color: '#e8873a',
  },
  {
    city: 'Delhi',
    tagline: 'The Heart of India',
    description: 'Discover centuries of history at India Gate, Red Fort, and Qutub Minar, blended with modern culture.',
    image: delhiImg,
    rating: 4.7,
    flightTime: '2h 30m',
    highlight: 'Popular',
    color: '#ef4444',
  },
  {
    city: 'Bangalore',
    tagline: 'Silicon Valley of India',
    description: 'India\'s tech capital with beautiful parks, vibrant nightlife, and perfect year-round weather.',
    image: bengaluruImg,
    rating: 4.6,
    flightTime: '1h 50m',
    highlight: 'Tech Hub',
    color: '#22c55e',
  },
  {
    city: 'Goa',
    tagline: 'Pristine Beaches',
    description: 'Sun-kissed beaches, Portuguese heritage, thrilling water sports, and unforgettable sunsets await you.',
    image: goaImg,
    rating: 4.9,
    flightTime: '1h 30m',
    highlight: 'Top Rated',
    color: '#3b82f6',
  },
  {
    city: 'Ahmedabad',
    tagline: 'Vibrant Heritage',
    description: 'UNESCO World Heritage city with Sabarmati Ashram, exquisite textiles, and authentic Gujarati cuisine.',
    image: ahmedabadImg,
    rating: 4.5,
    flightTime: '1h 45m',
    highlight: 'Heritage',
    color: '#f59e0b',
  },
  {
    city: 'Amritsar',
    tagline: 'Golden City',
    description: 'Home to the magnificent Golden Temple, Wagah Border ceremony, and legendary Punjabi hospitality.',
    image: amritsarImg,
    rating: 4.8,
    flightTime: '1h 40m',
    highlight: 'Spiritual',
    color: '#a855f7',
  },
  {
    city: 'Hyderabad',
    tagline: 'City of Pearls',
    description: 'Biryani capital with Charminar, Hussain Sagar Lake, and a booming IT corridor.',
    image: hyderabadImg,
    rating: 4.6,
    flightTime: '1h 35m',
    highlight: 'Foodie',
    color: '#ec4899',
  },
  {
    city: 'Chennai',
    tagline: 'Gateway to the South',
    description: 'Marina Beach, ancient temples, Carnatic music heritage, and the birthplace of South Indian cinema.',
    image: chennaiImg,
    rating: 4.5,
    flightTime: '2h 20m',
    highlight: 'Cultural',
    color: '#14b8a6',
  },
  {
    city: 'Kolkata',
    tagline: 'City of Joy',
    description: 'The cultural capital — Victoria Memorial, Howrah Bridge, Durga Puja splendor, and literary heritage.',
    image: kolkataImg,
    rating: 4.7,
    flightTime: '2h 15m',
    highlight: 'Artistic',
    color: '#6366f1',
  },
];

/* ── Animation helpers ── */
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const stagger = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

/* ═══════════════════ Component ═══════════════════ */
const DestinationsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSearch = (city: string) => {
    navigate(`/results?destination=${city}`);
  };

  return (
    <>
      <PageHero
        icon={MapPin}
        title="Popular Destinations"
        subtitle="Discover our most booked flight routes and explore the world with SkyFlow."
        badge="Explore India"
      />

      {/* ── Stats Bar ── */}
      <section className="container-app -mt-6 relative z-10 mb-8">
        <motion.div
          {...fadeUp}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Destinations', value: '9+', icon: MapPin },
            { label: 'Daily Flights', value: '300+', icon: Plane },
            { label: 'Avg. Rating', value: '4.7★', icon: Star },
            { label: 'Trending Now', value: 'Goa', icon: TrendingUp },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-surface-card border border-border rounded-xl p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                <stat.icon size={18} className="text-brand-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-white leading-tight">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Destination Cards Grid ── */}
      <section className="container-app pb-16">
        <motion.div {...fadeUp} className="flex items-center gap-3 mb-8">
          <Sparkles size={20} className="text-brand-500" />
          <h2 className="text-xl font-bold text-white">Explore Destinations</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESTINATIONS.map((dest, i) => (
            <motion.div
              key={dest.city}
              {...stagger}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group relative rounded-2xl overflow-hidden border border-border bg-surface-card hover:border-brand-500/40 transition-all duration-300 cursor-pointer"
              whileHover={{ y: -6 }}
              onClick={() => handleSearch(dest.city)}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={dest.image}
                  alt={`${dest.city} destination`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Highlight badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className="px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider backdrop-blur-md"
                    style={{
                      background: `${dest.color}20`,
                      color: dest.color,
                      border: `1px solid ${dest.color}40`,
                    }}
                  >
                    {dest.highlight}
                  </span>
                </div>

                {/* City name on image */}
                <div className="absolute bottom-3 left-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: dest.color }}
                    />
                    <h3 className="text-xl font-extrabold text-white tracking-tight drop-shadow-lg">
                      {dest.city}
                    </h3>
                  </div>
                  <p className="text-gray-300 text-xs italic drop-shadow-md">
                    {dest.tagline}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                  {dest.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-white font-semibold">{dest.rating}</span>
                    / 5.0
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock size={12} className="text-brand-500" />
                    ~{dest.flightTime} avg.
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-sm !rounded-lg w-full group-hover:shadow-lg group-hover:shadow-brand-500/20 transition-shadow"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSearch(dest.city);
                  }}
                >
                  <Plane size={14} /> Search Flights
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="container-app pb-16">
        <motion.div
          {...fadeUp}
          className="rounded-2xl bg-gradient-to-r from-brand-500/20 via-surface-card to-brand-500/10 border border-brand-500/20 p-10 md:p-14 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            Can't decide where to go?
          </h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
            Search all available flights with flexible dates and find the best deals to any destination across India.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary !w-auto px-10"
          >
            <Plane size={16} /> Browse All Flights
          </button>
        </motion.div>
      </section>
    </>
  );
};

export default DestinationsPage;
