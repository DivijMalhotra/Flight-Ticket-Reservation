import { API_BASE } from '@/lib/utils';

async function request(url: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  getPassengers: () => request('/passengers'),
  addPassenger: (data: any) => request('/passengers', { method: 'POST', body: JSON.stringify(data) }),

  searchFlights: (source: string, destination: string, date: string) =>
    request(`/flights/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`),
  getAllFlights: () => request('/flights'),

  getSchedules: () => request('/schedules'),
  getSchedule: (id: number) => request(`/schedules/${id}`),

  getReservations: () => request('/reservations'),
  getReservation: (id: number) => request(`/reservations/${id}`),
  book: (data: any) => request('/reservations/book', { method: 'POST', body: JSON.stringify(data) }),
  cancelReservation: (id: number) => request(`/reservations/${id}/cancel`, { method: 'PUT' }),

  // Payment
  createPaymentIntent: (data: any) => request('/payments/create-intent', { method: 'POST', body: JSON.stringify(data) }),
  confirmPayment: (data: any) => request('/payments/confirm', { method: 'POST', body: JSON.stringify(data) }),

  // Queries
  passengersToDelhi: () => request('/queries/passengers-to-delhi'),
  ticketsByDate: (date: string) => request(`/queries/tickets-by-date?date=${date}`),
  passengersNoReservation: () => request('/queries/passengers-no-reservation'),
  totalUpiPayments: () => request('/queries/total-upi-payments'),
  flightsSeatsGt50: () => request('/queries/flights-seats-gt-50'),
  delayedFlights: () => request('/queries/delayed-flights'),
  passengerTravelDelhi: () => request('/queries/passenger-travel-delhi'),
  successfulPayments: () => request('/queries/successful-payments'),
};
