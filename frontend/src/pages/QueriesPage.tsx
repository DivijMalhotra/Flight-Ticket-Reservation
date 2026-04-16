import React, { useState } from 'react';
import { api } from '@/services/api';
import { motion } from 'framer-motion';
import { Database, Play, Terminal, AlertTriangle } from 'lucide-react';

interface QueryDef {
  id: string;
  name: string;
  description: string;
  run: () => Promise<any>;
}

const QUERIES: QueryDef[] = [
  { id: 'q1', name: 'Passengers to Delhi', description: 'Booked tickets to Delhi', run: api.passengersToDelhi },
  { id: 'q2', name: 'Tickets by Date', description: 'Tickets for 2026-05-01', run: () => api.ticketsByDate('2026-05-01') },
  { id: 'q3', name: 'No Reservations', description: 'Passengers without bookings', run: api.passengersNoReservation },
  { id: 'q4', name: 'Total UPI Payments', description: 'Aggregate UPI amount', run: api.totalUpiPayments },
  { id: 'q5', name: 'Seats > 50', description: 'Flights with 50+ seats', run: api.flightsSeatsGt50 },
  { id: 'q6', name: 'Delayed Flights', description: 'Delay > 0 minutes', run: api.delayedFlights },
  { id: 'q7', name: 'Delhi Travelers + Date', description: 'Names & dates for Delhi', run: api.passengerTravelDelhi },
  { id: 'q8', name: 'Successful Payments', description: 'Status = Success', run: api.successfulPayments },
];

const QueriesPage: React.FC = () => {
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runQuery = async (q: QueryDef) => {
    setActiveQuery(q.id);
    setLoading(true);
    setData(null);
    try {
      const result = await q.run();
      setData(result);
    } catch {
      setData({ error: 'Query execution failed.' });
    }
    setLoading(false);
  };

  const renderData = () => {
    if (!data) return null;

    if (data.error) {
      return (
        <div className="mt-6 p-5 bg-red-500/10 text-red-400 rounded-xl flex items-center gap-2.5 text-sm">
          <AlertTriangle size={18} /> {data.error}
        </div>
      );
    }

    const dataArray = data.value ? data.value : (Array.isArray(data) ? data : null);

    if (dataArray) {
      if (dataArray.length === 0) {
        return <div className="empty-state animate-fade-in"><p className="text-4xl mb-3">🔍</p><p>No results.</p></div>;
      }

      const keys = Object.keys(dataArray[0]).filter(k => !['_id', '__v', 'createdAt', 'updatedAt'].includes(k));
      return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Terminal size={16} className="text-brand-500" /> Query Results
            </h3>
            <span className="badge badge-success">{data.Count || dataArray.length} Row(s)</span>
          </div>
          <div className="card !p-0 overflow-hidden">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>{keys.map(k => <th key={k}>{k.replace(/_/g, ' ')}</th>)}</tr>
                </thead>
                <tbody>
                  {dataArray.map((row: any, i: number) => (
                    <tr key={i}>
                      {keys.map(k => {
                        const val = String(row[k] ?? '—');
                        const isAmount = k.toLowerCase().includes('amount') || k.toLowerCase().includes('price');
                        const color = val.includes('Confirmed') || val.includes('Success') ? 'text-green-400'
                          : val.includes('Cancelled') || val.includes('Failed') ? 'text-red-400'
                          : val.includes('Pending') ? 'text-yellow-400' : '';
                        return (
                          <td key={k} className={`${color} ${isAmount ? 'font-semibold' : ''}`}>
                            {isAmount ? `₹${Number(row[k]).toLocaleString()}` : typeof row[k] === 'object' ? JSON.stringify(row[k]) : val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      );
    }

    // Aggregation result
    const keys = Object.keys(data).filter(k => !['_id', '__v', 'createdAt', 'updatedAt'].includes(k));
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
          <Database size={16} className="text-brand-500" /> Aggregation Result
        </h3>
        <div className="card max-w-md">
          <div className="space-y-3">
            {keys.map(k => (
              <div key={k} className="flex justify-between text-sm py-2 border-b border-white/[0.03] last:border-none">
                <span className="text-gray-500">{k.replace(/_/g, ' ')}</span>
                <span className={`font-bold ${k.toLowerCase().includes('amount') ? 'text-brand-500 text-lg' : 'text-white'}`}>
                  {k.toLowerCase().includes('amount') ? `₹${Number(data[k]).toLocaleString()}` : String(data[k])}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="container-app page-section">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3 mb-1">
          <Database size={24} className="text-brand-500" /> SQL Queries
        </h1>
        <p className="text-sm text-gray-500 mb-8">Run predefined queries (relational algebra equivalents) against MongoDB</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {QUERIES.map(q => (
            <button
              key={q.id}
              onClick={() => runQuery(q)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                activeQuery === q.id
                  ? 'border-brand-500 bg-brand-500/5 shadow-lg shadow-brand-500/5'
                  : 'border-border bg-surface-card hover:border-brand-500/40 hover:bg-surface-card-hover'
              }`}
              id={`query-${q.id}`}
            >
              <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                <Play size={14} className="text-brand-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{q.name}</p>
                <p className="text-[0.7rem] text-gray-500 mt-0.5">{q.description}</p>
              </div>
            </button>
          ))}
        </div>

        {loading && <div className="flex justify-center py-12"><div className="spinner" /></div>}
        {!loading && data && renderData()}
      </motion.div>
    </div>
  );
};

export default QueriesPage;
