import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Layout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#151520',
            color: '#fff',
            border: '1px solid #2a2a3a',
            borderRadius: '10px',
            fontSize: '0.88rem',
          },
          success: { iconTheme: { primary: '#2ecc71', secondary: '#fff' } },
          error: { iconTheme: { primary: '#e74c3c', secondary: '#fff' } },
        }}
      />
      <main className="flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
