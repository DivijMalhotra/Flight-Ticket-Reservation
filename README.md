# ✈️ SkyFlow — Flight Ticket Reservation System

A production-grade flight booking platform built with React 19, Express, MongoDB, Clerk Auth, and Stripe Payments.

## 🏗️ Architecture

```
RailFlowV2/
├── frontend/           # React 19 + Vite 6 + TypeScript
│   ├── src/
│   │   ├── components/ # Navbar, Footer, Layout, ProtectedRoute, PageTransition
│   │   ├── pages/      # Home, SearchResults, BookingPage, PaymentPage, Dashboard,
│   │   │               # ReservationsPage, QueriesPage, SignIn/Up, BookingConfirm, 404
│   │   ├── services/   # API client
│   │   ├── lib/        # utils, queryClient
│   │   ├── App.tsx     # Router
│   │   ├── index.tsx   # Entry (Clerk + QueryClient providers)
│   │   └── index.css   # Tailwind CSS global styles
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.ts
├── backend/            # Express 5 + MongoDB + Mongoose
│   ├── config/db.ts
│   ├── models/         # Passenger, Flight, FlightSchedule, Reservation, Ticket, Payment
│   ├── routes/         # passengers, flights, schedules, reservations, queries, payments
│   ├── seed.ts
│   └── server.ts
└── database/           # SQL reference schemas
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017
- Clerk account (get keys at https://clerk.com)
- Stripe account (get keys at https://stripe.com) — optional for demo

### 1. Backend Setup
```bash
cd backend
npm install
# Edit .env with your MongoDB URI, Clerk, and Stripe keys
npm run seed    # Seeds database with sample data
npm run dev     # Starts on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Edit .env with your Clerk publishable key
npm run dev     # Starts on http://localhost:5173
```

## 🛣️ Routes

### Public Routes
| Route | Page |
|-------|------|
| `/` | Home — Hero, Search, Offers, Popular Routes |
| `/results` | Search Results — Filters, Sort, Pagination |
| `/queries` | SQL Queries — 8 predefined database queries |
| `/sign-in` | Clerk Sign In |
| `/sign-up` | Clerk Sign Up |

### Protected Routes (requires auth)
| Route | Page |
|-------|------|
| `/book/:scheduleId` | Booking — Passenger, Seat, Class, Payment |
| `/payment/:reservationId` | Payment — Stripe/UPI/Card |
| `/dashboard` | User Dashboard — Stats, Upcoming/Past Trips |
| `/reservations` | All Reservations — Expand/Collapse Details |
| `/booking-confirm` | Booking Confirmation — Boarding Pass |

## 🔑 Environment Variables

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Backend (`.env`)
```
MONGO_URI=mongodb://127.0.0.1:27017/flight_reservation
PORT=5000
CLIENT_URL=http://localhost:5173
CLERK_SECRET_KEY=sk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/passengers` | List all passengers |
| POST | `/api/passengers` | Add passenger |
| GET | `/api/flights` | List all flights |
| GET | `/api/flights/search` | Search flights by source, dest, date |
| GET | `/api/schedules` | List all schedules |
| GET | `/api/schedules/:id` | Get schedule with flight info |
| GET | `/api/reservations` | List all reservations (enriched) |
| POST | `/api/reservations/book` | Create booking (reservation + ticket + payment) |
| PUT | `/api/reservations/:id/cancel` | Cancel reservation |
| POST | `/api/payments/create-intent` | Create payment intent |
| POST | `/api/payments/confirm` | Confirm payment |
| POST | `/api/payments/webhook` | Payment webhook |
| GET | `/api/queries/*` | 8 SQL-equivalent queries |
| GET | `/api/health` | Health check |

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS 3, Framer Motion, TanStack Query
- **Auth:** Clerk (frontend + backend)
- **Payments:** Stripe (PaymentElement + webhook)
- **Backend:** Express 5, MongoDB, Mongoose 8
- **UI:** Lucide React icons, React Hot Toast, date-fns, clsx
