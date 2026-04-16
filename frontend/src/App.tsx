import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import BookingPage from './pages/BookingPage';
import ReservationsPage from './pages/ReservationsPage';
import DestinationsPage from './pages/DestinationsPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import PaymentPage from './pages/PaymentPage';
import BookingConfirmPage from './pages/BookingConfirmPage';
import NotFoundPage from './pages/NotFoundPage';

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<SearchResults />} />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* Protected */}
        <Route path="/book/:scheduleId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/payment/:reservationId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/reservations" element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} />
        <Route path="/booking-confirm" element={<ProtectedRoute><BookingConfirmPage /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
