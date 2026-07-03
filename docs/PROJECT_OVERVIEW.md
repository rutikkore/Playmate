# Project Overview: Playmate

Playmate is a premium, modern sports turf and play area booking platform built using **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Three.js**. It features a stunning glassmorphic design, smooth animations, and a dual-role interface that allows users to experience the platform as either a **Player** (booking slots & joining matches) or a **Provider** (managing venues, slots, and bookings).

---

## 🚀 Technology Stack

### Core Frameworks & Build Tools
- **React 18**: Frontend UI library.
- **Vite**: Rapid dev server and build tool.
- **TypeScript**: Static typing for robustness.
- **React Router Dom (v6)**: Client-side routing and layout management.
- **TanStack React Query (v5)**: Data fetching and query/cache management.

### Styling & UI Elements
- **Tailwind CSS (v3)** & **PostCSS / Autoprefixer**: Utility-first styling.
- **Radix UI**: Accessible, unstyled primitives (Dialog, Select, Sheet, Tooltip, Dropdown, Accordion, etc.) customized via **shadcn/ui**.
- **Lucide React**: Clean, modern icon library.

### Animations & 3D Interactive Visuals
- **Framer Motion**: Page transitions, scroll effects, and hover interactions.
- **Three.js / React Three Fiber (`@react-three/fiber`) / Drei (`@react-three/drei`)**: Real-time 3D particle systems and soccer ball scroll-interactivity on the homepage.
- **Custom CSS 3D Transforms**: Lightweight, performance-friendly 3D orbital rings and rotating CSS cubes that follow the user's cursor.

---

## 📁 Directory Structure & Key Files

```text
Playmate/
├── public/                  # Static assets (favicons, logos)
├── src/
│   ├── assets/              # Turf images, icons, and hero photography
│   ├── components/
│   │   ├── auth/            # AuthInputs, RoleCards
│   │   ├── home/            # Hero, Scene3D, Home3DUI, ScrollScene3D (3D visual overlays)
│   │   ├── layout/          # AppLayout, AppSidebar (Responsive sidebar & header)
│   │   ├── ui/              # Shadcn components (Button, Dialog, Sheet, etc.) + SportsBackground
│   │   ├── NavLink.tsx      # Custom navigation link wrapper
│   │   ├── StatCard.tsx     # Reusable dashboard analytics card
│   │   └── TurfCard.tsx     # Reusable turf discovery/booking card
│   ├── contexts/
│   │   └── RoleContext.tsx  # User state management (UserName, Role: player/provider)
│   ├── hooks/
│   │   ├── use-mobile.tsx   # Detects viewport size for responsive layout
│   │   └── use-toast.ts     # Handles application alerts and toasts
│   ├── lib/
│   │   └── utils.ts         # CN utility combining clsx and tailwind-merge
│   ├── pages/
│   │   ├── Index.tsx        # Homepage / Landing page
│   │   ├── Login.tsx        # Simulated login page (Role selection: Player vs. Provider)
│   │   ├── PlayerDashboard.tsx  # Dashboard showing player stats and recommended turfs
│   │   ├── TurfDiscovery.tsx    # Turf search page with filtering by sport and location
│   │   ├── BookingCalendar.tsx  # Interactive hourly booking calendar grid
│   │   ├── Matchmaking.tsx      # Team matchmaking portal to find/join games
│   │   ├── MyGames.tsx          # Tracker for upcoming/completed games
│   │   ├── ProviderDashboard.tsx # Provider stats, revenue tracking, and today's slots
│   │   ├── ProviderTurfs.tsx    # CRUD interface for turf managers to add/edit/delete venues
│   │   ├── ProviderSlots.tsx    # Day-wise hourly slot locking/blocking tool
│   │   ├── ProviderBookings.tsx # Comprehensive list of confirmed, pending, and cancelled bookings
│   │   └── NotFound.tsx      # Custom 404 page
│   ├── App.tsx              # Main App entry point with routes & providers
│   ├── main.tsx             # React DOM rendering root
│   └── index.css            # Styles, theme variables, glassmorphic tokens
├── index.html               # Main HTML document and metadata
├── package.json             # Scripts, dependencies, and devDependencies
├── tailwind.config.ts       # Tailwind theme colors, fonts, and animations config
└── tsconfig.json            # TypeScript configuration
```

---

## 🔑 Key Features & User Flows

The application relies on a **`RoleContext`** (`src/contexts/RoleContext.tsx`) that maintains the active user role (`"player"` or `"provider"`), userName, and authenticated status. Users can instantly switch roles using the sidebar toggle.

### ⚽ Player Flow
1. **Landing Page (`Index.tsx`) & Simulated Login (`Login.tsx`)**: High-performance intro with parallax cards and glowing visuals.
2. **Player Dashboard (`PlayerDashboard.tsx`)**: Displays total games played, upcoming schedule, overall win rate, PlayMate score, and recommended turfs.
3. **Turf Discovery (`TurfDiscovery.tsx`)**: Allows filtering of local turfs by sport tags (Football, Cricket, Badminton, Tennis) and search queries.
4. **Interactive Slot Booking (`BookingCalendar.tsx`)**: Hourly grid interface showing available and booked slots for selected dates. Selecting a slot opens a confirmation modal simulating payment.
5. **Matchmaking (`Matchmaking.tsx`)**: Lists user-created co-op games. Players can see how many spots are left, check skill levels (Beginner, Intermediate, Advanced), and click "Join".
6. **My Games (`MyGames.tsx`)**: Shows upcoming, completed (with scores), and cancelled matches.

### 🏢 Provider (Turf Owner) Flow
1. **Provider Dashboard (`ProviderDashboard.tsx`)**: Track monthly revenue, occupancy rates, active players, recent bookings, and real-time slot statuses.
2. **Turf Management (`ProviderTurfs.tsx`)**: Full form-based setup to add new turf locations, customize sports, adjust hourly rates, specify court counts, and activate/deactivate listings.
3. **Slot Management (`ProviderSlots.tsx`)**: Interactive grid to manually block slots for maintenance or reservations. Booked slots are locked and protected.
4. **Bookings List (`ProviderBookings.tsx`)**: Comprehensive log showing booking details, player names, courts, revenues, and statuses (Confirmed, Pending, Cancelled).

---

## 🎨 Design System & Aesthetics

The application implements a premium, high-fidelity dark theme designed to mimic modern professional sports software.

- **Theme Colors**:
  - `Background`: Deep midnight blue/navy (`hsl(224, 71%, 4%)`)
  - `Primary / Accent`: Neon lime green (`hsl(86, 100%, 59%)`)
  - `Secondary / Cards`: Translucent dark glass (`hsl(224, 50%, 12%)`)
  - `Border / Inputs`: Soft dark border outlines (`hsl(224, 50%, 18%)`)
- **Typography**: Uses clean, geometric fonts (General Sans, Clash Display, and Manrope) configured in `index.html` and `tailwind.config.ts`.
- **Special Effects**:
  - `glass-card`: Transparent backdrop blur with sleek neon border highlights.
  - `neon-glow`: Vibrant glowing box shadows for buttons and key actions.
  - `stadium-light`: Radiant teal/green gradients in the background simulating stadium spotlights.
  - `3D Parallax`: Mouse-tracking Framer Motion parallax cards.

---

## 💻 Available Scripts

Run the following commands using npm (or bun/pnpm):

- **Start Development Server**:
  ```bash
  npm run dev
  ```
- **Build Production Bundle**:
  ```bash
  npm run build
  ```
- **Preview Production Build**:
  ```bash
  npm run preview
  ```
- **Run Tests** (Vitest/React Testing Library):
  ```bash
  npm run test
  ```
- **Lint Check**:
  ```bash
  npm run lint
  ```
