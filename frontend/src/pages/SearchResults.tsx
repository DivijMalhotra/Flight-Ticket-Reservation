import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { motion } from 'framer-motion';
import { cn, formatCurrency, formatTime } from '@/lib/utils';
import {
  PlaneTakeoff, PlaneLanding, AlertTriangle, ArrowUpDown, Filter,
  SlidersHorizontal, X,
} from 'lucide-react';

interface FlightResult {
  Schedule_ID: number;
  Flight_ID: number;
  Flight_Number: string;
  Airline_Name: string;
  Source: string;
  Destination: string;
  Depart_Time: string;
  Arrival_Time: string;
  Travel_Date: string;
  Available_Seats: number;
  Delay_Minutes: number;
  Base_Price: number;
}

type SortKey = 'price' | 'depart' | 'seats';

const AIRLINES = ['Air India', 'SpiceJet', 'IndiGo', 'Vistara', 'GoAir'];
const CLASSES_FILTER = ['Any', 'Non-stop', 'Cheapest'];

const SkeletonCard: React.FC = () => (
  <div className="card p-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
      <div className="space-y-2">
        <div className="skeleton h-5 w-20" />
        <div className="skeleton h-3 w-14" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-1 w-20" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-5 w-20" />
        <div className="skeleton h-3 w-14" />
      </div>
      <div className="space-y-2 text-right">
        <div className="skeleton h-6 w-16 ml-auto" />
        <div className="skeleton h-8 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

const SearchResults: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>('price');
  const [filterAirlines, setFilterAirlines] = useState<Set<string>>(new Set());
  const [maxPrice, setMaxPrice] = useState(20000);
  const [showFilters, setShowFilters] = useState(false);

  const source = params.get('source') || '';
  const destination = params.get('destination') || '';
  const date = params.get('date') || '';

  useEffect(() => {
    setLoading(true);
    api.searchFlights(source, destination, date)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [source, destination, date]);

  const toggleAirline = (airline: string) => {
    setFilterAirlines(prev => {
      const next = new Set(prev);
      next.has(airline) ? next.delete(airline) : next.add(airline);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = [...results];
    if (filterAirlines.size > 0) {
      list = list.filter(r => filterAirlines.has(r.Airline_Name));
    }
    list = list.filter(r => r.Base_Price <= maxPrice);
    list.sort((a, b) => {
      if (sortBy === 'price') return a.Base_Price - b.Base_Price;
      if (sortBy === 'depart') return a.Depart_Time.localeCompare(b.Depart_Time);
      return b.Available_Seats - a.Available_Seats;
    });
    return list;
  }, [results, filterAirlines, maxPrice, sortBy]);

  return (
    <div className="container-app page-section">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            {source || 'Any'} → {destination || 'Any'}
            {date && <span className="text-gray-500 text-sm font-normal ml-3">{date}</span>}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} flight(s) found</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="flex items-center gap-1.5 bg-surface-card border border-border rounded-lg px-3 py-2">
            <ArrowUpDown size={14} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="bg-transparent text-sm text-white outline-none border-none cursor-pointer font-medium"
            >
              <option value="price">Price</option>
              <option value="depart">Departure</option>
              <option value="seats">Seats</option>
            </select>
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden btn btn-outline btn-xs flex items-center gap-1.5"
          >
            <Filter size={14} /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={cn(
          'w-64 flex-shrink-0 space-y-6',
          showFilters ? 'fixed inset-0 z-50 bg-surface-primary p-6 overflow-auto md:relative md:inset-auto md:z-auto md:p-0' : 'hidden md:block'
        )}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-brand-500" /> Filters
            </h3>
            <button onClick={() => setShowFilters(false)} className="md:hidden text-gray-400 bg-transparent border-none cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Price Range */}
          <div className="bg-surface-card border border-border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-3">
              Max Price: {formatCurrency(maxPrice)}
            </label>
            <input
              type="range"
              min={1000}
              max={20000}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>

          {/* Airlines */}
          <div className="bg-surface-card border border-border rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-3">Airlines</label>
            <div className="space-y-2">
              {AIRLINES.map(airline => (
                <label key={airline} className="flex items-center gap-2.5 text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={filterAirlines.has(airline)}
                    onChange={() => toggleAirline(airline)}
                    className="w-3.5 h-3.5 accent-brand-500 rounded"
                  />
                  {airline}
                </label>
              ))}
            </div>
          </div>

          {filterAirlines.size > 0 && (
            <button
              onClick={() => setFilterAirlines(new Set())}
              className="btn btn-ghost btn-xs w-full"
            >
              Clear Filters
            </button>
          )}
        </aside>

        {/* Results */}
        <div className="flex-1 space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="text-5xl mb-4">✈️</div>
              <p className="text-gray-400">No flights found. Try different search criteria.</p>
            </div>
          ) : (
            filtered.map((r, i) => (
              <motion.div
                key={r.Schedule_ID}
                className="card p-5 hover:border-brand-500/40"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                id={`flight-${r.Schedule_ID}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-5 items-center">
                  {/* Departure */}
                  <div>
                    <div className="flex items-center gap-2 text-base font-bold text-white">
                      <PlaneTakeoff size={16} className="text-brand-500" />
                      {r.Source}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{formatTime(r.Depart_Time)}</div>
                  </div>

                  {/* Flight line */}
                  <div className="flex flex-col items-center gap-1 px-4">
                    <span className="text-[0.7rem] text-gray-500 whitespace-nowrap">{r.Flight_Number} · {r.Airline_Name}</span>
                    <div className="w-20 h-0.5 bg-gradient-to-r from-brand-500 to-brand-500/30 rounded-full" />
                    {r.Delay_Minutes > 0 && (
                      <span className="flex items-center gap-1 text-[0.65rem] text-yellow-400">
                        <AlertTriangle size={10} /> {r.Delay_Minutes}m delay
                      </span>
                    )}
                  </div>

                  {/* Arrival */}
                  <div>
                    <div className="flex items-center gap-2 text-base font-bold text-white">
                      <PlaneLanding size={16} className="text-brand-500" />
                      {r.Destination}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{formatTime(r.Arrival_Time)}</div>
                  </div>

                  {/* Price + Book */}
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-brand-500">{formatCurrency(r.Base_Price)}</div>
                    <div className={cn(
                      'text-xs mt-0.5',
                      r.Available_Seats < 50 ? 'text-yellow-400' : 'text-green-400'
                    )}>
                      {r.Available_Seats} seats
                    </div>
                    <button
                      className="btn btn-primary btn-sm mt-2 !w-full"
                      onClick={() => navigate(`/book/${r.Schedule_ID}`)}
                      disabled={r.Available_Seats <= 0}
                      id={`book-btn-${r.Schedule_ID}`}
                    >
                      {r.Available_Seats > 0 ? 'Book Now' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
