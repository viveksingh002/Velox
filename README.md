<div align="center">
# Vëlox 🚗

### *Move Differently.*

**A premium vehicle rental platform built for India — bikes, cars, SUVs, and trucks, all in one place.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](https://claude.ai/chat/LICENSE)

![Velox Preview](https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge)

</div>
---


---

---

## ✨ Features

* 🚀 **Instant Booking** — Book any vehicle in under 60 seconds
* 🗺️ **Live Tracking** — Real-time GPS tracking for every ride
* 💰 **Transparent Pricing** — No hidden fees, no surge pricing
* 🛡️ **Fully Insured** — Every vehicle verified and insured
* 📱 **Fully Responsive** — Seamless experience on all devices
* 🌙 **Dark UI** — Premium dark design with smooth animations
* ⚡ **Scroll Animations** — LERP-based car animation, reveal effects
* 🖱️ **Cursor Effects** — Custom glow trail on CTA section

---

## 🛠️ Tech Stack

| Layer     | Technology                   |
| --------- | ---------------------------- |
| Framework | Next.js 15 (App Router)      |
| Language  | TypeScript                   |
| Styling   | Tailwind CSS + Custom CSS    |
| Backend   | Node.js + Express            |
| Database  | MongoDB (Mongoose)           |
| Font      | Inter (Google Fonts)         |
| Icons     | Custom SVG (no dependencies) |

---

## 📁 Project Structure

```
velox/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + fonts
│   │   ├── page.tsx            # Main page
│   │   └── globals.css         # Global styles
│   └── components/
│       ├── Navbar.tsx          # Fixed navbar with scroll effect
│       ├── Hero.tsx            # Hero with animated SVG car
│       ├── Stats.tsx           # Animated count-up stats
│       ├── Fleet.tsx           # Vehicle fleet grid
│       ├── HowItWorks.tsx      # 3-step process + phone mockup
│       ├── Pricing.tsx         # Pricing cards
│       ├── Quote.tsx           # Auto-rotating testimonials
│       ├── CTA.tsx             # Call-to-action + cursor effect
│       └── Footer.tsx          # Footer + newsletter
├── backend/
│   ├── server.js               # Express server
│   ├── db.js                   # MongoDB connection
│   ├── models/
│   │   └── Booking.js          # Booking schema
│   └── routes/
│       └── booking.js          # Booking API routes
└── public/
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* npm or yarn
* MongoDB (local or Atlas)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/viveksingh002/Velox.git
cd Velox

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend
npm install
cd ..
```

### Running Locally

```bash
# Start frontend (Next.js)
npm run dev
# → http://localhost:3000

# Start backend (in a separate terminal)
cd backend
node server.js
# → http://localhost:5000
```

---

## 🎨 Components Overview

### `Hero.tsx`

* Full-screen landing with animated SVG car
* LERP-based scroll-driven car movement
* Headlight / taillight toggle based on scroll direction
* Parallax orbs and grid background

### `Fleet.tsx`

* 4 vehicle categories: Bikes, Cars, SUVs, Trucks
* Premium hand-drawn SVG icons (no emojis)
* Scroll reveal with staggered animation
* Hover: card lift + icon slide + bg glow

### `Pricing.tsx`

* 4 pricing cards with feature lists
* Featured card highlight with blue glow
* SVG icons matching each vehicle type
* Bottom accent line on hover

### `Quote.tsx`

* 3 rotating testimonials with auto-cycle (5s)
* Smooth fade + slide transition
* Progress bar animation
* Dot navigation with pill indicator

### `CTA.tsx`

* Custom cursor: glow blob + 12-dot fluid trail
* Floating particle animations
* Trust badges row

### `Footer.tsx`

* Newsletter subscription form
* Social links (Instagram, X, LinkedIn, YouTube)
* Responsive 4-column → 2-column → 1-column layout

---

## 📸 Screenshots

> *Coming soon — add your own screenshots here*

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

```bash
git checkout -b feature/your-feature
git commit -m "add: your feature"
git push origin feature/your-feature
```

---


</div>
