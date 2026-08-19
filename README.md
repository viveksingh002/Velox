# Vëlox 🚗

**Move like never before.** A full-stack ride-hailing platform connecting customers with verified vehicle partners — bikes, autos, cars, and more.

---

## ✨ Features

### For Customers

- Sign in with Google/Email (Supabase Auth)
- Search nearby vehicles by type (bike / auto / car / loading / truck)
- Real-time fare estimation and booking
- Live ride tracking with map (Leaflet + OpenStreetMap)
- OTP-based ride verification
- Booking history with filters (Ongoing / Completed / Cancelled)
- Rate rides after completion
- Editable profile

### For Partners (Vendors)

- 3-step onboarding: Vehicle details → Documents → Bank details
- Document upload (Aadhaar, License, RC) to Supabase Storage
- Video KYC with admin (powered by ZegoCloud)
- Vehicle photo + pricing configuration
- Live earnings dashboard with 7-day chart
- Accept/decline ride requests
- Track active rides in real time

### For Admins

- Central dashboard with vendor stats (Total / Approved / Pending / Rejected)
- Review queue: Video KYC, Vendor documents, Pricing & vehicle images
- Approve/reject vendors and pricing submissions with reasons
- Live video KYC calls with partners

---

## 🛠️ Tech Stack

| Layer        | Technology                               |
| ------------ | ---------------------------------------- |
| Frontend     | Next.js (App Router), TypeScript, React  |
| Backend      | Node.js, Express                         |
| Database     | MongoDB (Mongoose)                       |
| Auth         | Supabase Auth                            |
| File Storage | Supabase Storage                         |
| Video Calls  | ZegoCloud                                |
| Maps         | Leaflet + OpenStreetMap + OSRM (routing) |
| Animations   | Framer Motion                            |
| Charts       | Recharts                                 |
| Icons        | Lucide React                             |

---

## 📁 Project Structure

```
velox/
├── src/
│   ├── app/
│   │   ├── admin/            # Admin dashboard & review pages
│   │   ├── partner/          # Partner onboarding, dashboard, active ride
│   │   ├── dashboard/        # Customer "My Bookings"
│   │   ├── profile/          # Shared profile page (customer/partner)
│   │   ├── checkout/         # Ride booking & payment flow
│   │   ├── search/           # Vehicle search
│   │   └── signin/           # Auth
│   ├── components/           # Navbar, Profile, shared UI
│   └── lib/
│       └── supabase.ts       # Supabase client
└── backend/
    ├── models/                # Vendor, Booking, Customer (Mongoose schemas)
    ├── routes/                # vendor, booking, admin, customer APIs
    ├── db.js                  # MongoDB connection
    └── server.js               # Express app entry point
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- A Supabase project (for Auth + Storage)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd velox

# Frontend
cd velox
npm install

# Backend
cd ../backend
npm install
```

### 2. Environment Variables

Create `.env.local` in the frontend root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
BACKEND_URL=http://localhost:5000

NEXT_PUBLIC_ZEGO_APP_ID=your_zego_app_id
NEXT_PUBLIC_ZEGO_SERVER_SECRET=your_zego_server_secret
```

Create `.env` in `backend/`:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

### 3. Supabase Setup

Create two **public** storage buckets:

- `vendor-documents` — Aadhaar, License, RC uploads
- `vehicle-images` — Vehicle photos for pricing review

### 4. Run the App

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd velox
npm run dev
```

App runs at `http://localhost:3000`, API at `http://localhost:5000`.
