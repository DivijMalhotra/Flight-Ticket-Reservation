import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container-app page-section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 mb-6"
        >
          <Plane size={36} className="text-brand-500 rotate-45" />
        </motion.div>
        <h1 className="text-6xl font-extrabold text-white mb-2">404</h1>
        <p className="text-lg text-gray-400 mb-1">Flight Not Found</p>
        <p className="text-sm text-gray-600 max-w-sm mx-auto mb-8">
          The page you're looking for has flown off to an unknown destination. Let's get you back on track.
        </p>
        <Link to="/" className="btn btn-primary !w-auto !inline-flex px-8 no-underline">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
