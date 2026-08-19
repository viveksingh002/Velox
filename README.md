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
