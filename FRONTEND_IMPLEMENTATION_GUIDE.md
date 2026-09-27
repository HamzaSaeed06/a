# SafeWatch v1.0 — Frontend Implementation Guide

> **Purpose**: This document is the SINGLE SOURCE OF TRUTH for building the SafeWatch frontend. Every page, component, color, font size, and layout is documented exactly as it appears in the Figma design. An agent reading this file should be able to build a pixel-perfect frontend without needing Figma access.

> **Tech Stack**: React 18 + Vite 5 + Tailwind CSS 3 + Lucide React Icons + React Router 6

> **Data Strategy**: Phase 1 uses local mock data. Backend integration comes later.

---

## TABLE OF CONTENTS

1. [Design Token System](#phase-1-design-token-system)
2. [Project Setup & Shell Layout](#phase-2-project-setup--shell-layout)
3. [Sidebar Navigation](#phase-3-sidebar-navigation)
4. [Login / Auth Page](#phase-4-login--auth-page)
5. [Dashboard Page](#phase-5-dashboard-page)
6. [Children Page](#phase-6-children-page)
7. [Live Location Page](#phase-7-live-location-page)
8. [Alerts Page](#phase-8-alerts-page)
9. [Safe Zones Page](#phase-9-safe-zones-page)
10. [Devices Page](#phase-10-devices-page)
11. [Emergency / SOS Page](#phase-11-emergency--sos-page)
12. [Police Station Page](#phase-12-police-station-page)
13. [Reports Page](#phase-13-reports-page)
14. [Safety Analytics Page](#phase-14-safety-analytics-page)
15. [Settings Page](#phase-15-settings-page)
16. [Shared Components](#phase-16-shared-components)
17. [Mock Data Schema](#phase-17-mock-data-schema)

---

## PHASE 1: DESIGN TOKEN SYSTEM

### 1.1 Color Palette

All colors must be defined in `tailwind.config.js` under `theme.extend.colors`:

```js
colors: {
  // Brand / Primary
  brand: {
    navy: '#0F172A',      // Sidebar active pill, primary CTAs, dark buttons
    dark: '#0d1527',      // Alternative dark background
    blue: '#2563EB',      // Primary links, active tabs, blue CTAs
    lightBlue: '#3B82F6', // Secondary blue accents
    sky: '#38bdf8',       // Light blue accent
  },

  // Surfaces & Borders
  surface: {
    page: '#F1F5F9',      // Main page background
    sidebar: '#F8FAFC',   // Sidebar background
    card: '#FFFFFF',      // Card backgrounds
    border: '#E2E8F0',    // Card borders, dividers
    muted: '#F8FAFC',     // Muted background
  },

  // Text Colors
  text: {
    primary: '#0F172A',   // Main headings (Slate 900)
    secondary: '#1E293B', // Card titles (Slate 800)
    body: '#334155',      // Body text (Slate 700)
    muted: '#64748B',     // Metadata, timestamps (Slate 500)
    light: '#94A3B8',     // Placeholder text (Slate 400)
  },

  // Status Colors
  status: {
    // Green / Safe
    greenText: '#16A34A',
    greenBg: '#DCFCE7',
    greenLight: '#F0FDF4',
    // Amber / Warning
    amberText: '#D97706',
    amberBg: '#FEF3C7',
    amberDark: '#B45309',
    // Red / Danger
    redText: '#DC2626',
    redBg: '#FEE2E2',
    redLight: '#FEF2F2',
    redDark: '#991B1B',
    redBorder: '#FECACA',
    // Orange
    orangeText: '#C2410C',
    orangeBg: '#FFEDD5',
    orangeBtn: '#EA580C',
  },

  // Child Theme Accents
  child: {
    // Sophia (Girl) - Pink theme
    pinkAccent: '#EC4899',
    pinkDark: '#E11D48',
    pinkText: '#9D174D',
    pinkBg: '#FCE7F3',
    pinkBadgeText: '#DB2777',
    // Liam (Boy) - Blue theme
    blueAccent: '#3B82F6',
    blueDark: '#2563EB',
    blueText: '#0369A1',
    blueBg: '#E0F2FE',
    blueBadgeText: '#2563EB',
    blueLightBg: '#DBEAFE',
  },

  // Misc
  purple: {
    bg: '#F3E8FF',
    accent: '#8B5CF6',
  }
}
```

### 1.2 Typography

- **Font Family**: `Inter` from Google Fonts (fallback: system-ui, sans-serif)
- Add to `index.html` `<head>`:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  ```
- Set in Tailwind config:
  ```js
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  }
  ```

#### Type Scale (exact sizes from Figma):

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Title | `text-3xl` (30px) | `font-bold` (700) | `#0F172A` |
| Section Header | `text-xl` (20px) | `font-semibold` (600) | `#1E293B` |
| Card Title | `text-lg` (18px) | `font-semibold` (600) | `#1E293B` |
| Body Text | `text-sm` (14px) | `font-normal` (400) / `font-medium` (500) | `#334155` |
| Metadata / Subtitle | `text-xs` (12px) | `font-normal` (400) | `#64748B` |
| Badge / Pill Text | `text-xs` (12px) | `font-semibold` (600) | varies |
| Metric Value | `text-3xl` (30px) | `font-bold` (700) | `#0F172A` |

### 1.3 Spacing & Layout

| Token | Value | Usage |
|-------|-------|-------|
| Page padding | `p-6` (24px) | Main content area padding |
| Grid gap | `gap-6` (24px) | Between cards in grid |
| Card padding | `p-4` to `p-6` (16-24px) | Internal card padding |
| Card border radius | `rounded-xl` (12px) | All cards |
| Large card radius | `rounded-2xl` (16px) | Feature/hero cards |
| Card border | `border border-[#E2E8F0]` | 1px solid |
| Card shadow | `shadow-sm` | Subtle elevation |
| Sidebar width | `w-60` (240px) | Fixed left sidebar |

### 1.4 Common Component Tokens

#### Badges / Pills
```
Default: bg-[#F1F5F9] text-[#64748B] text-xs font-semibold px-2.5 py-0.5 rounded-full
Green:   bg-[#DCFCE7] text-[#16A34A]
Red:     bg-[#FEE2E2] text-[#DC2626]
Amber:   bg-[#FEF3C7] text-[#D97706]
Orange:  bg-[#FFEDD5] text-[#C2410C]
Blue:    bg-[#DBEAFE] text-[#2563EB]
Pink:    bg-[#FCE7F3] text-[#DB2777]
Purple:  bg-[#F3E8FF] text-[#8B5CF6]
```

#### Buttons
```
Primary Dark:  bg-[#0F172A] text-white px-4 py-2.5 rounded-lg font-medium text-sm
Primary Blue:  bg-[#2563EB] text-white px-4 py-2.5 rounded-lg font-medium text-sm
Danger Red:    bg-[#DC2626] text-white px-4 py-2.5 rounded-lg font-medium text-sm
Ghost/Outline: bg-white border border-[#E2E8F0] text-[#334155] px-4 py-2.5 rounded-lg font-medium text-sm
Pill Button:   bg-[#F1F5F9] text-[#334155] px-3 py-1.5 rounded-full text-sm font-medium
```

#### Progress Bars
```
Container: h-2 bg-[#E2E8F0] rounded-full overflow-hidden
Fill (green): bg-[#16A34A] h-full rounded-full  (battery > 50%)
Fill (amber): bg-[#D97706] h-full rounded-full  (battery 20-50%)
Fill (red):   bg-[#DC2626] h-full rounded-full   (battery < 20%)
```

#### Toggle Switch
```
Active:   w-11 h-6 bg-[#16A34A] rounded-full (circle right)
Inactive: w-11 h-6 bg-[#E2E8F0] rounded-full (circle left)
```

---

## PHASE 2: PROJECT SETUP & SHELL LAYOUT

### 2.1 Project Init
```bash
npm create vite@latest ./ -- --template react
npm install react-router-dom lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2.2 File Structure
```
src/
├── App.jsx                 # Router + Shell layout
├── main.jsx                # Entry point with BrowserRouter
├── index.css               # Tailwind directives + global styles
├── components/
│   ├── Sidebar.jsx
│   ├── Header.jsx          # Page header with title + alert badge
│   ├── AlertBanner.jsx
│   ├── ChildCard.jsx
│   ├── ChildSwitcher.jsx
│   ├── LiveMapOverview.jsx
│   ├── MapView.jsx
│   ├── MetricCards.jsx
│   ├── RecentAlerts.jsx
│   ├── LocationDetails.jsx
│   ├── SafeZonesCard.jsx
│   ├── StatusCard.jsx
│   ├── Modal.jsx
│   └── ToastNotification.jsx
├── context/
│   └── AppContext.jsx       # Global state provider
├── data/
│   └── mockData.js          # All mock data
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── ChildrenPage.jsx
│   ├── LiveLocationPage.jsx
│   ├── AlertsPage.jsx
│   ├── SafeZonesPage.jsx
│   ├── DevicesPage.jsx
│   ├── EmergencySOSPage.jsx
│   ├── PoliceStationPage.jsx
│   ├── ReportsPage.jsx
│   ├── SafetyAnalyticsPage.jsx
│   └── SettingsPage.jsx
└── styles/                  # (OPTIONAL: prefer Tailwind utility classes)
```

### 2.3 App Shell Layout

The app uses a fixed sidebar + scrollable main content area:

```
┌─────────────┬─────────────────────────────────────┐
│             │                                     │
│   SIDEBAR   │         MAIN CONTENT AREA           │
│   (240px)   │         (flex-1, scrollable)        │
│   Fixed     │         bg-[#F1F5F9]                │
│   Full      │         p-6                         │
│   Height    │                                     │
│   bg-white  │                                     │
│             │                                     │
└─────────────┴─────────────────────────────────────┘
```

```jsx
// App.jsx structure
<div className="flex h-screen bg-[#F1F5F9]">
  <Sidebar />
  <main className="flex-1 overflow-y-auto p-6">
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/children" element={<ChildrenPage />} />
      {/* ... all routes */}
    </Routes>
  </main>
</div>
```

---

## PHASE 3: SIDEBAR NAVIGATION

### Layout
- Width: `w-60` (240px)
- Background: `bg-white`
- Border right: `border-r border-[#E2E8F0]`
- Height: full screen `h-screen`, fixed position
- Padding: `p-4`
- Display: `flex flex-col`

### Top Section — Logo
- Shield icon (from Lucide: `Shield`) inside a dark rounded box `bg-[#0F172A] p-2 rounded-lg`
- Brand name: `SafeWatch` — `text-xl font-bold text-[#0F172A]`
- Tagline: `Child Safety` — `text-xs text-[#64748B]`

### Navigation Items (ordered top to bottom)
Each item is a link with icon + label:

| # | Icon (Lucide) | Label | Route |
|---|---------------|-------|-------|
| 1 | `LayoutDashboard` | Dashboard | `/` |
| 2 | `Users` | Children | `/children` |
| 3 | `MapPin` | Live Location | `/live-location` |
| 4 | `Bell` | Alerts | `/alerts` |
| 5 | `Shield` | Safe Zones | `/safe-zones` |
| 6 | `Watch` | Devices | `/devices` |
| 7 | `AlertTriangle` | Emergency / SOS | `/emergency` |
| 8 | `Building2` | Police Station | `/police-station` |
| 9 | `FileText` | Reports | `/reports` |
| 10 | `BarChart3` | Safety Analytics | `/safety-analytics` |

**Styling:**
```
Active item:   bg-[#0F172A] text-white px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3
Inactive item: text-[#64748B] hover:bg-[#F1F5F9] px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3
```

- Alerts item has a red counter badge: `bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold px-2 py-0.5 rounded-full ml-auto`

### Bottom Section — User Profile Card
- Container: `mt-auto border-t border-[#E2E8F0] pt-4`
- Avatar: `w-10 h-10 rounded-full object-cover`
- Name: `Sarah Chen` — `text-sm font-semibold text-[#0F172A]`
- Role: `Primary Guardian` — `text-xs text-[#64748B]`
- Settings gear icon on right: `Settings` from Lucide, links to `/settings`

---

## PHASE 4: LOGIN / AUTH PAGE

### Layout
Full-screen split layout. NO sidebar shown on this page.

```
┌──────────────────────┬──────────────────────┐
│                      │                      │
│   LEFT PANEL         │   RIGHT PANEL        │
│   (Dark gradient)    │   (Light form)       │
│   bg-[#0F172A]       │   bg-[#F8FAFC]       │
│   50% width          │   50% width          │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

### Left Panel (Brand section)
- Background: `bg-[#0F172A]` (dark navy)
- Full height, centered content vertically
- **Logo**: Shield icon in dark rounded box, `SafeWatch` title in white, `Child Safety Monitoring System` subtitle in `text-[#94A3B8]`
- **Headline**: `Keep your children safe, always.` — white, `text-3xl font-bold`
- **Description**: `Monitor your child's real-time location, safety band status, and receive instant alerts — all from one dashboard.` — `text-[#94A3B8] text-sm`
- **Feature list** (green checkmarks):
  - ✓ `Real-time Location`
  - ✓ `Instant Alerts`
  - ✓ `Safe Zones`
  - Each: green check icon `text-[#16A34A]` + white text
- **Footer**: `Academic Final Year Project · Child Safety System` — `text-xs text-[#64748B]`

### Right Panel (Form section)
- Background: `bg-[#F8FAFC]`
- Center: a white card container `bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8 max-w-md mx-auto`
- **Header**: `Welcome back` — `text-2xl font-bold text-[#0F172A]`
- **Subtitle**: `Sign in to your SafeWatch account` — `text-sm text-[#64748B]`
- **Email field**:
  - Label: `Email address` — `text-sm font-medium text-[#334155]`
  - Input: `border border-[#E2E8F0] rounded-lg px-4 py-2.5 w-full text-sm`
  - Left icon: `Mail` (Lucide) inside input, `text-[#94A3B8]`
  - Placeholder: `parent@example.com`
- **Password field**:
  - Label: `Password` — `text-sm font-medium text-[#334155]`
  - Input: same styling, with `Lock` icon left, eye toggle icon right
  - Placeholder: `••••••••`
  - Right link: `Forgot password?` — `text-xs text-[#2563EB]`
- **Submit button**: `Sign In →` — full-width, `bg-[#0F172A] text-white py-3 rounded-lg font-medium text-sm`
- **Secondary link**: `Don't have an account?` + `Create one` (blue link `text-[#2563EB]`)
- **Demo callout box**: Light blue tint `bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-3`, text: `Demo: Use any credentials to sign in` — `text-sm text-[#2563EB]`

### Auth Behavior
- On form submit, navigate directly to Dashboard (no real auth for mock phase)
- Store a simple `isAuthenticated` flag in context

---

## PHASE 5: DASHBOARD PAGE

### Page Header
- Title: `Dashboard` — `text-3xl font-bold text-[#0F172A]`
- Right side: `● 2 Active Alerts` badge — `bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold px-3 py-1 rounded-full` with a red dot indicator

### Alert Banner (below header)
- Container: `bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 flex items-center gap-4`
- Left: Bell icon inside `bg-[#FEE2E2] p-2 rounded-lg` container
- Title: `2 Active Alerts Require Attention` — `text-base font-semibold text-[#991B1B]`
- Subtitle: `Review and take action on pending alerts` — `text-sm text-[#DC2626]`
- Right link: `View Alerts >` — `text-sm font-medium text-[#DC2626] hover:underline`

### Metric Cards (4-column grid)
Container: `grid grid-cols-4 gap-6`

| Card | Icon | Icon BG | Value | Subtitle |
|------|------|---------|-------|----------|
| TOTAL CHILDREN | `Users` | `bg-[#F8FAFC]` text-[#64748B] | `2` | `Monitored profiles` |
| ACTIVE ALERTS | `Bell` | `bg-[#FEF2F2]` text-[#DC2626] | `2` | `Needs attention` |
| BAND STATUS | `Wifi` | `bg-[#F0FDF4]` text-[#16A34A] | `2/2` | `Bands connected` |
| AVG BATTERY | `Battery` | `bg-[#F0FDF4]` text-[#16A34A] | `43%` | `Battery levels` |

Each card structure:
```
bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5
├── Top: Label text-xs font-semibold text-[#64748B] uppercase tracking-wide
├── Middle: Value text-3xl font-bold text-[#0F172A]
├── Bottom: Subtitle text-sm text-[#64748B]
└── Right: Icon in colored circle bg p-2.5 rounded-lg
```

### Main Content (2-column layout)
`grid grid-cols-[1fr_380px] gap-6`

#### Left Column: Live Map Overview
- Card: `bg-white rounded-xl border border-[#E2E8F0] shadow-sm`
- Header: `Live Map Overview` + right link `Full map >` (blue link)
- Map: CSS-grid simulated map (no real map library needed for mock):
  - Gray grid background `bg-[#F1F5F9]` with dashed grid lines
  - Location pins for `You` (home icon, dark circle), `Sophia` (pink pin), `Liam` (blue pin)
  - Dashed circle boundaries for Safe Zones (colored borders)
  - Footer tag: `Demo Map View` gray badge

#### Right Column: Child Status Cards
Two stacked cards for Sophia and Liam.

**Sophia Chen Card:**
- `bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5`
- Avatar: `w-12 h-12 rounded-full` (use placeholder image URL)
- Name: `Sophia Chen` — `text-base font-semibold text-[#0F172A]`
- Badges row:
  - `Age 8` — pink badge `bg-[#FCE7F3] text-[#9D174D]`
  - `● Alert Active` — red badge `bg-[#FEE2E2] text-[#DC2626]`
- Location: pin icon + `Lincoln Elementary School, 123 Oak St` — `text-sm text-[#64748B]`
- Timestamp: clock icon + `Updated 2 min ago` — `text-xs text-[#94A3B8]`
- Band status: `Band connected` — green dot + `text-sm text-[#16A34A]`
- Battery: `12%` — red text with red progress bar (< 20% = red)

**Liam Torres Card:** Same structure with:
- `Age 10` — blue badge `bg-[#E0F2FE] text-[#0369A1]`
- Location: `Riverside Park, near fountain`
- Battery: `74%` — blue text with blue progress bar

---

## PHASE 6: CHILDREN PAGE

### Page Header
- Title: `Child Profile` — `text-3xl font-bold text-[#0F172A]`
- Subtitle: `2 children registered` — `text-sm text-[#64748B]`
- Right: Alert badge + `+ Add Child` button (dark navy `bg-[#0F172A] text-white`)

### Children Grid
`grid grid-cols-2 gap-6`

#### Card Structure (each child)
```
bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden
├── TOP ACCENT BAR: h-1 w-full (Sophia: bg-[#EC4899], Liam: bg-[#3B82F6])
├── HEADER: p-5
│   ├── Avatar: w-16 h-16 rounded-full
│   ├── Name: text-lg font-semibold text-[#0F172A]
│   └── Subtitle: Age X
├── BADGES ROW: px-5
│   ├── Gender badge: (Sophia: "👧 Girl" pink bg, Liam: "👦 Boy" blue bg)
│   └── Alert badge: "⚠ Alert" red bg
├── INFO LIST: px-5 py-3
│   ├── Pin icon + Location text
│   └── Chip icon + "Band Name" + battery %
└── ACTION BUTTONS: px-5 pb-5 flex gap-3
    ├── "Profile" — ghost pill button (gray bg, user icon)
    └── "Location" — colored button (Sophia: pink, Liam: blue, white text, pin icon)
```

**Sophia Card specifics:**
- Accent bar: `bg-[#EC4899]` (pink gradient)
- Gender badge: `👧 Girl` — `bg-[#FCE7F3] text-[#DB2777]`
- Alert badge: `⚠ Alert` — `bg-[#FEE2E2] text-[#DC2626]`
- Location: `Lincoln Elementary School, 123 Oak St`
- Band: `Sophia's Band` — battery `12%` (red text `text-[#DC2626]`)
- Location button: `bg-[#EC4899] text-white`

**Liam Card specifics:**
- Accent bar: `bg-[#3B82F6]` (blue)
- Gender badge: `👦 Boy` — `bg-[#DBEAFE] text-[#2563EB]`
- Location: `Riverside Park, near fountain`
- Band: `Liam's Band` — battery `74%` (normal dark text)
- Location button: `bg-[#2563EB] text-white`

---

## PHASE 7: LIVE LOCATION PAGE

### Page Header
- Title: `Live Location` — `text-3xl font-bold`
- Right: Alert badge

### Child Selector Tabs
Horizontal tab bar to switch between children:

```
flex gap-3 mb-6
├── Tab (Active / Sophia): border-2 border-[#EC4899] bg-[#FFF1F2] rounded-xl px-4 py-3
│   ├── Avatar (w-8 h-8 rounded-full)
│   ├── Name: "Sophia Chen" font-medium text-[#0F172A]
│   └── "Age 8" text-xs text-[#64748B]
└── Tab (Inactive / Liam): border border-[#E2E8F0] bg-white rounded-xl px-4 py-3
    └── Same structure, muted colors
```

### Main Layout (2 columns)
`grid grid-cols-[1fr_350px] gap-6`

#### Left: Map View
- Card: `bg-white rounded-xl border shadow-sm`
- Header: `{Child Name}'s Location` + `Last refreshed: just now`
- Action buttons row: `↺ Refresh` + `⤢ Navigate` (ghost buttons)
- Map: CSS grid-based demo map showing:
  - Child's pin marker
  - "You" pin with home icon
  - Dashed safe zone perimeters
  - `Demo Map View` footer tag

#### Right: Info Panels (stacked)

**Status Card:**
- Header: child avatar + name + age badge (colored banner, Sophia=pink header bg, Liam=blue)
- Status rows:
  - `Safety Status:` → `● Safe` green badge
  - `Safe Zone:` → `Within zone` green badge
  - `Band:` → `📶 connected` green badge
  - `Battery:` → `12%` red text + red progress bar

**Location Details Card:**
- Header: `Location Details`
- Pin icon: `Lincoln Elementary School, 123 Oak St` (current location)
- Clock icon: `2 min ago` (last updated)
- Ruler icon: `349m from you` (distance)

---

## PHASE 8: ALERTS PAGE

### Page Header
- Title: `Alert Center` — `text-3xl font-bold`
- Right: Alert badge

### Summary Counter Cards (3-column grid)
```
grid grid-cols-3 gap-4
├── "2 Active"   — red text #DC2626
├── "3 Resolved" — green text #16A34A
└── "1 Dismissed" — gray text #64748B
```
Each: `bg-white rounded-xl border shadow-sm p-4 text-center`

### Filter Row
- Search input: `🔍 Search alerts...` — `border rounded-lg px-4 py-2 text-sm`
- Dropdown: `All types ▼` — `border rounded-lg px-3 py-2 text-sm`

### Main Layout (2 columns)
`grid grid-cols-[1fr_400px] gap-6`

#### Left: Alert List
Each alert item is a clickable card:

```
bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 cursor-pointer hover:border-[#3B82F6]
├── Row 1: Avatar (w-10 h-10 rounded-full) + Child Name + Type Badge
│   Badge colors by type:
│   - "Zone Exceeded": bg-[#FEF3C7] text-[#D97706]
│   - "Low Battery": bg-[#E2E8F0] text-[#475569]
│   - "Suspicious Contact": bg-[#FFEDD5] text-[#C2410C]
│   - "Tamper Detected": bg-[#FFEDD5] text-[#EA580C]
│   - "Emergency": bg-[#FEE2E2] text-[#DC2626]
├── Row 2: Clock icon + timestamp + Pin icon + location
└── Row 3: Status badge
    - "active": bg-[#FEE2E2] text-[#DC2626]
    - "resolved": bg-[#DCFCE7] text-[#16A34A]
    - "dismissed": bg-[#F1F5F9] text-[#64748B]
```

**Alert items (5 total):**
1. Liam Torres — `Zone Exceeded` — Today, 3:42 PM — Elm Street & 5th Ave — `active`
2. Sophia Chen — `Low Battery` — Today, 2:15 PM — Lincoln Elementary School — `active`
3. Sophia Chen — `Suspicious Contact` — Yesterday, 4:30 PM — Oak Street Playground — `resolved`
4. Liam Torres — `Tamper Detected` — Yesterday, 1:10 PM — Riverside Park — `resolved`
5. Sophia Chen — `Emergency` — 2 days ago, 9:05 AM — Near Maple Ave — `resolved`

#### Right: Alert Details Panel (shown when alert clicked)
- Container: `bg-white rounded-xl border shadow-sm p-6`
- Header: `Alert Details` + `×` close button
- Child profile: Avatar + Name + Age badge
- Warning callout: `bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-3`
  - Type badge + description text
- Details list: Clock + timestamp, Pin + location, Band status badge
- Status tag: `Status: active` (red badge)
- CTA: `✓ Mark as Resolved` — `bg-[#2563EB] text-white w-full py-2.5 rounded-lg`

---

## PHASE 9: SAFE ZONES PAGE

### Page Header
- Title: `Safe Zones`
- Subtitle: `3 zones defined · 3 active`
- Right: Alert badge + `+ Add Zone` button (dark navy)

### Main Layout (2 columns)
`grid grid-cols-[1fr_400px] gap-6`

#### Left: Safe Zone Map
- Same CSS demo map with "You" pin and dashed zone boundaries
- Zone circles with colored dashed borders
- Footer: `Demo Map View`

#### Right: Zone Cards List (scrollable)

Each zone card:
```
bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4
├── Header Row: zone icon (in green bg) + zone name + toggle switch
│   Icons: Home → home icon, School → building icon, Park/Custom → pin icon
│   All icon containers: bg-[#DCFCE7] text-[#16A34A] p-2 rounded-lg
├── Badges: type pill (gray) + "XXXm radius" (green pill)
├── Radius bar: label "Safe radius" + value "150m" (green text) + progress bar
├── Status text: "✓ Child is within safe range" — text-[#16A34A] text-sm
└── Action buttons: "✎ Edit" (gray pill) + "🗑 Delete" (red pill bg-[#FEE2E2] text-[#DC2626])
```

**Zone data (3 active zones + 1 inactive):**
1. **Home** — type: `home`, radius: `150m`, toggle: ON, status: within range
2. **Lincoln Elementary** — type: `school`, radius: `200m`, toggle: ON, status: within range
3. **Riverside Park** — type: `custom`, radius: `100m`, toggle: ON, status: within range

---

## PHASE 10: DEVICES PAGE

### Page Header
- Title: `Devices`
- Subtitle: `2 of 2 bands connected`
- Right: Alert badge + `+ Pair New Band` button (dark navy)

### Device Cards (vertical stack)

Each device card:
```
bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden
├── TOP ACCENT BAR: h-1 w-full (Sophia: bg-[#EC4899], Liam: bg-[#3B82F6])
├── HEADER (p-5):
│   ├── Band icon: bg-[#DCFCE7] text-[#16A34A] p-3 rounded-xl
│   ├── Device name: "Sophia's Band" — text-lg font-semibold
│   ├── Serial: "SB-2024-A471" — text-xs text-[#64748B]
│   └── Status: "● Connected" green badge
├── PAIRED CHILD: Avatar + Name
├── BATTERY: "12%" (red/green text) + progress bar + optional warning
│   Warning (if low): "⚠ Low battery — please charge soon" text-[#DC2626]
├── METADATA: grid of Firmware / Paired date / Last sync
└── HARDWARE TESTS section:
    Label: "HARDWARE TESTS" — text-xs font-semibold uppercase text-[#64748B]
    Buttons row (4 ghost pill buttons):
    - "⚡ Test Vibration"
    - "((•)) Test LED"
    - "! Test SOS"
    - "📱 Test Tamper"
    Each: bg-white border border-[#E2E8F0] rounded-full px-3 py-1.5 text-sm
```

**Device 1: Sophia's Band**
- Accent: pink `#EC4899`
- Serial: `SB-2024-A471`
- Battery: `12%` (RED, with warning)
- Firmware: `v2.4.1`, Paired: `Jan 15, 2025`, Last sync: `2 min ago`

**Device 2: Liam's Band**
- Accent: blue `#3B82F6`
- Serial: `SB-2024-B892`
- Battery: `74%` (GREEN, no warning)
- Firmware: `v2.4.0`, Paired: `Jan 15, 2025`, Last sync: `1 min ago`

---

## PHASE 11: EMERGENCY / SOS PAGE

### Page Header
- Title: `Emergency / SOS` — text has red tint `text-[#DC2626]` or mixed
- Right: Alert badge

### Active Emergency Banner
```
bg-[#FEF2F2] border-2 border-[#FCA5A5] rounded-2xl p-6
├── Icon: AlertTriangle in red circle
├── Title: "Active Emergency" — text-2xl font-bold text-[#991B1B]
├── Subtitle: "2 alerts require immediate attention" — text-[#DC2626]
└── Child summary card inside:
    Avatar + "Liam Torres" + "Age 10"
    Badges: "● Zone Exceeded" (amber) + "● Connected" (green)
    Details: "Location: Elm Street & 5th Ave" + "Alert Time: Today, 3:42 PM"
```

### Main Content (2 columns)
`grid grid-cols-2 gap-6`

#### Left: Last Known Location
- Title: `Last Known Location`
- Map view (same CSS demo map)

#### Right: Emergency Actions + Medical Info

**Emergency Action Buttons (stacked):**
1. `🚨 Call Emergency Services` — `bg-[#DC2626] text-white p-4 rounded-xl w-full`
   - Subtitle: `Dial 911 immediately`
2. `👮 Locate Nearest Police` — `bg-[#2563EB] text-white p-4 rounded-xl w-full`
   - Subtitle: `Find police station nearby`
3. `📍 Share Location & Details` — `bg-[#1E293B] text-white p-4 rounded-xl w-full`
   - Subtitle: `Share with emergency contacts`

**Emergency Medical Info Box:**
- Container: `bg-white rounded-xl border border-[#FECACA] p-4`
- Title: `Emergency Medical Info` — `text-[#DC2626] font-semibold` with cross icon
- Text: `No known allergies. Father is primary contact.`
- `Blood type: O+` — bold `text-[#991B1B]`

### Emergency Types Reference (bottom full-width grid)
Title: `Emergency Types Reference`
5 items in grid:
1. 🟡 `Safe Range Exceeded` — "Child has moved outside designated safe area."
2. 🟠 `Band Removed / Tampered` — "Band strap sensor detected removal or tampering."
3. 🔴 `SOS Pressed` — "Child has pressed the emergency SOS button."
4. ⚠️ `Suspicious Contact` — "Prolonged contact with unknown individual detected."
5. 🔵 `Connection Lost` — "Band signal lost for extended period."

---

## PHASE 12: POLICE STATION PAGE

### Page Header
- Title: `Police Station`
- Subtitle: `Emergency dispatch & nearby precincts`
- Right: Alert badge + `🚨 Emergency Call 911` button (RED `bg-[#DC2626]`)

### Primary Precinct Banner
```
bg-[#EFF6FF] border border-[#93C5FD] rounded-xl p-6
├── Shield icon + "Central Police Precinct #4" (text-xl font-bold)
├── Badge: "● Primary Emergency Contact" — blue pill bg-[#DBEAFE] text-[#2563EB]
├── Info list:
│   Phone: "Emergency Desk: (555) 019-2831"
│   Location: "452 Park Avenue, Sector 4"
│   Response Time: "~4-7 mins"
└── CTA: "📞 Direct Call Desk" — bg-[#2563EB] text-white rounded-lg
```

### Main Content (2 columns)

#### Left: Nearby Police Precincts

**Station 1: North District Station**
- Badge: `1.2 km away`
- Address: `789 North Boulevard`
- Phone: `(555) 019-8822`
- Status: `● 24/7 Active` (green text)
- CTA: `Call Station` button

**Station 2: Westside Precinct**
- Badge: `2.8 km away`
- Address: `102 West River Road`
- Phone: `(555) 019-4411`
- Status: `● 24/7 Active`
- CTA: `Call Station` button

#### Right: Dispatch Information Protocol
- Title: `Dispatch Information Protocol`
- Subtitle: `Information sent automatically during SOS dispatch`
- Checklist (green checkmarks ✓):
  1. `Child Live GPS Coordinates`
  2. `Child Profile & Photo`
  3. `Parent Contact Information`
  4. `Smart Band Battery & Status`
  5. `Safe Zone Breach Logs`
- Footer: `Emergency dispatch log is maintained and encrypted.`

---

## PHASE 13: REPORTS PAGE

### Page Header
- Title: `Reports`
- Subtitle: `Generated activity & safety reports`
- Right: Alert badge + `+ Generate Report` button (dark navy)

### Metric Cards (4-column grid)

| Card | Value | Subtitle | Icon BG |
|------|-------|----------|---------|
| TOTAL REPORTS | `12` | `All time` | gray bg |
| THIS MONTH | `4` | `Generated in Sept` | blue bg `#DBEAFE` |
| AUTOMATIC EXPORTS | `Weekly` | `Scheduled` | green bg `#DCFCE7` |
| LAST GENERATED | `Today` | `3:00 PM` | purple bg `#F3E8FF` |

### Filter Row
- Search: `🔍 Search reports...`
- Dropdowns: `All Children ▼`, `All Types ▼`, `Last 30 days ▼`

### Reports List
Each report item:
```
bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4
├── File icon (PDF=red, CSV=green)
├── Title + date range
├── Badges: report type (colored pill) + format (PDF red / CSV green)
├── Status: "● Ready" green text
└── Actions: "⬇ Download" + "👁 View" buttons
```

**Report Items:**
1. 📄 PDF — `Weekly Safety Summary — Sophia Chen` — Sept 17-24, 2025 — `Weekly Summary` (blue) + `PDF` (red)
2. 📄 CSV — `Location History Data — Liam Torres` — Sept 1-24, 2025 — `Location Log` (purple) + `CSV` (green)
3. 📄 PDF — `Incident & Alert Log — Both Children` — August 2025 — `Incident Log` (amber) + `PDF` (red)
4. 📄 PDF — `Safe Zone Violation Report — Liam Torres` — Sept 20, 2025 — `Safe Zone Report` (orange) + `PDF` (red)

---

## PHASE 14: SAFETY ANALYTICS PAGE

### Page Header
- Title: `Safety Analytics`
- Subtitle: `Insights, trends & behavior analysis`
- Right: Alert badge + `Last 7 days ▼` dropdown

### Metric Cards (4-column grid)

| Card | Value | Extra | Icon BG |
|------|-------|-------|---------|
| SAFETY SCORE | `94/100` | `+2% vs last week` green pill | green bg |
| SAFE ZONE ADHERENCE | `98.2%` | `Time inside safe zones` blue text | blue bg |
| AVG RESPONSE TIME | `1.4 min` | `Alert acknowledgment` | amber bg |
| TOTAL INCIDENTS | `6` | `-2 vs last week` green pill | red bg |

### Charts Section (2 columns)

#### Left: Alert Frequency Bar Chart
- Title: `Alert Frequency (Past 7 Days)`
- Subtitle: `Daily distribution of safety alerts`
- Bar chart with days Mon-Sun on X-axis, values 0-4 on Y-axis
- Color-coded bars: Blue = Zone Alerts, Red = SOS/Battery Alerts
- **Implementation**: Use simple CSS div-based bars (no chart library needed for mock)

#### Right: Time Spent by Location (Donut Chart)
- Title: `Time Spent by Location`
- Subtitle: `Distribution of time across zones`
- Donut/pie chart breakdown:
  - Home: 62% — `#3B82F6` (blue)
  - Lincoln Elementary: 28% — `#22C55E` (green)
  - Riverside Park: 7% — `#F59E0B` (amber)
  - Outside Safe Zones: 3% — `#EF4444` (red)
- **Implementation**: CSS conic-gradient or SVG donut

### Child Safety Rating Section
Cards for each child:
- **Sophia Chen**: Safety Score `96/100`, Safe Zone Time `99%`, Alerts `2`
- **Liam Torres**: Safety Score `92/100`, Safe Zone Time `97%`, Alerts `4`

---

## PHASE 15: SETTINGS PAGE

### Page Header
- Title: `Settings`
- Subtitle: `Account, notifications, & system preferences`
- Right: Alert badge + `Save Changes` button (dark navy)

### Tab Navigation Bar
```
flex gap-1 bg-[#F1F5F9] rounded-lg p-1
├── "Account" (Active: bg-[#0F172A] text-white rounded-md px-4 py-2 text-sm font-medium)
├── "Notifications" (Inactive: text-[#64748B] px-4 py-2)
├── "Security"
├── "Emergency Contacts"
├── "Theme & Appearance"
└── "System Logs"
```

### Tab Panels:

#### Account Tab
**Profile Information Section:**
- Avatar: Large circle photo + `Change Photo` button + `Remove` button
- Form fields:
  - `Full Name`: `Sarah Chen`
  - `Email Address`: `sarah@example.com` with `✓ Verified` green badge
  - `Phone Number`: `+1 (555) 234-5678`

#### Notifications Tab
**Notification Channels:**
Toggle switches (all ON by default):
- `Push Notifications` — toggle ON (green)
- `SMS Alerts` — toggle ON
- `Email Reports` — toggle ON
- `Low Battery Alerts` — toggle ON

#### Theme & Appearance Tab
**Theme Selection:**
- 3 options in a grid:
  1. `Light Theme` ☀️ (Sun icon) — default selected (blue border)
  2. `Dark Theme` 🌙 (Moon icon)
  3. `System Default` 🖥️ (Monitor icon)

**Color Accent Selector:**
- 4 color circles: Blue (default, with checkmark), Purple, Pink, Green

#### Emergency Contacts Tab
- **Contact 1**: `Michael Chen (Father)` — `+1 (555) 876-5432` — tag: `Primary Contact`
- **Contact 2**: `Emily Davis (Grandmother)` — `+1 (555) 987-6543` — tag: `Secondary Contact`
- CTA: `+ Add Emergency Contact` button

---

## PHASE 16: SHARED COMPONENTS

### ToastNotification
- Position: fixed bottom-right `fixed bottom-6 right-6 z-50`
- Container: `bg-white rounded-xl border shadow-lg p-4 min-w-[320px]`
- Types: `success` (green icon), `warning` (amber icon), `danger` (red icon), `info` (blue icon)
- Auto-dismiss after 3.5 seconds
- Slide-in animation from right

### Modal
- Overlay: `fixed inset-0 bg-black/50 z-50 flex items-center justify-center`
- Dialog: `bg-white rounded-2xl shadow-xl max-w-lg w-full p-6`
- Header: title + `×` close button
- Footer: action buttons

### Map View Component (Reusable CSS Demo Map)
- Gray grid background with dashed lines
- Pin markers as positioned absolute elements
- Dashed circle borders for safe zones with `border-dashed border-2` and `rounded-full`
- "Demo Map View" badge in bottom corner

---

## PHASE 17: MOCK DATA SCHEMA

### Children Array
```js
INITIAL_CHILDREN = [
  {
    id: 'sophia',
    name: 'Sophia Chen',
    age: 8,
    gender: 'girl',
    themeColor: '#EC4899',        // pink
    ageColor: '#9D174D',
    ageBg: '#FCE7F3',
    alertActive: true,
    alertText: 'Alert Active',
    location: 'Lincoln Elementary School, 123 Oak St',
    lastUpdated: 'Updated 2 min ago',
    bandStatus: 'Band connected',
    bandConnected: true,
    battery: 12,
    batteryColor: '#DC2626',
    avatar: '<placeholder_url>',
    device: {
      id: 'SB-2024-A471',
      name: "Sophia's Band",
      model: 'SafeWatch Band v3 Pro',
      firmware: 'v2.4.1',
      signal: '-64 dBm (Excellent)',
      tamperStatus: 'Active & Secured',
      waterproof: 'IP68 (Safe for swimming)',
      lastSync: '2 min ago',
      paired: 'Jan 15, 2025'
    },
    safeZone: 'Lincoln Elementary School',
    inSafeZone: true,
    coords: { lat: 37.7749, lng: -122.4194 }
  },
  {
    id: 'liam',
    name: 'Liam Torres',
    age: 10,
    gender: 'boy',
    themeColor: '#3B82F6',        // blue
    ageColor: '#0369A1',
    ageBg: '#E0F2FE',
    alertActive: true,
    alertText: 'Alert Active',
    location: 'Riverside Park, near fountain',
    lastUpdated: 'Updated 5 min ago',
    bandStatus: 'Band connected',
    bandConnected: true,
    battery: 74,
    batteryColor: '#2563EB',
    avatar: '<placeholder_url>',
    device: {
      id: 'SB-2024-B892',
      name: "Liam's Band",
      model: 'SafeWatch Band v3 Lite',
      firmware: 'v2.4.0',
      signal: '-71 dBm (Good)',
      tamperStatus: 'Tamper Alert Tripped',
      waterproof: 'IP68 (Safe for swimming)',
      lastSync: '1 min ago',
      paired: 'Jan 15, 2025'
    },
    safeZone: 'Riverside Park',
    inSafeZone: true,
    coords: { lat: 37.7785, lng: -122.4150 }
  }
]
```

### Alerts Array
```js
INITIAL_ALERTS = [
  { id: 1, childId: 'liam', childName: 'Liam Torres', type: 'Zone Exceeded',
    typeColor: '#B45309', typeBg: '#FEF3C7', location: 'Elm Street & 5th Ave',
    timestamp: 'Today, 3:42 PM', status: 'active', severity: 'high',
    details: 'Liam has moved outside the Riverside Park safe zone boundary.' },
  { id: 2, childId: 'sophia', childName: 'Sophia Chen', type: 'Low Battery',
    typeColor: '#475569', typeBg: '#E2E8F0', location: 'Lincoln Elementary School',
    timestamp: 'Today, 2:15 PM', status: 'active', severity: 'medium',
    details: 'Band battery dropped to 12%. Immediate charging recommended.' },
  { id: 3, childId: 'sophia', childName: 'Sophia Chen', type: 'Suspicious Contact',
    typeColor: '#C2410C', typeBg: '#FFEDD5', location: 'Oak Street Playground',
    timestamp: 'Yesterday, 4:30 PM', status: 'resolved', severity: 'high',
    details: 'Unpaired Bluetooth device attempted beacon broadcast. Verified by parent.' },
  { id: 4, childId: 'liam', childName: 'Liam Torres', type: 'Tamper Detected',
    typeColor: '#EA580C', typeBg: '#FFEDD5', location: 'Riverside Park',
    timestamp: 'Yesterday, 1:10 PM', status: 'resolved', severity: 'high',
    details: 'Band clasp sensor opened momentarily. Liam confirmed adjusting band.' },
  { id: 5, childId: 'sophia', childName: 'Sophia Chen', type: 'Emergency',
    typeColor: '#DC2626', typeBg: '#FEE2E2', location: 'Near Maple Ave',
    timestamp: '2 days ago, 9:05 AM', status: 'resolved', severity: 'critical',
    details: 'Emergency SOS triggered. Parent responded within 1.4 minutes.' }
]
```

### Safe Zones Array
```js
INITIAL_SAFE_ZONES = [
  { id: 'sz-1', name: 'Home', type: 'home', address: '742 Evergreen Terrace',
    radiusMeters: 150, status: 'active', assignedTo: ['Sophia Chen', 'Liam Torres'],
    color: '#8B5CF6', icon: 'home' },
  { id: 'sz-2', name: 'Lincoln Elementary', type: 'school',
    address: '123 Oak St, San Francisco, CA', radiusMeters: 200, status: 'active',
    assignedTo: ['Sophia Chen'], color: '#3B82F6', icon: 'school' },
  { id: 'sz-3', name: 'Riverside Park', type: 'custom',
    address: 'Riverside Park, near fountain', radiusMeters: 100, status: 'active',
    assignedTo: ['Liam Torres'], color: '#10B981', icon: 'park' }
]
```

### Current User
```js
CURRENT_USER = {
  name: 'Sarah Chen',
  email: 'sarah@example.com',
  phone: '+1 (555) 234-5678',
  avatar: '<placeholder_url>',
  role: 'Primary Guardian'
}
```

### Emergency Contacts
```js
EMERGENCY_CONTACTS = [
  { name: 'Michael Chen', relation: 'Father', phone: '+1 (555) 876-5432', tag: 'Primary Contact' },
  { name: 'Emily Davis', relation: 'Grandmother', phone: '+1 (555) 987-6543', tag: 'Secondary Contact' }
]
```

### Police Stations
```js
POLICE_STATIONS = {
  primary: {
    name: 'Central Police Precinct #4',
    phone: '(555) 019-2831',
    address: '452 Park Avenue, Sector 4',
    responseTime: '~4-7 mins'
  },
  nearby: [
    { name: 'North District Station', distance: '1.2 km', address: '789 North Boulevard',
      phone: '(555) 019-8822', status: '24/7 Active' },
    { name: 'Westside Precinct', distance: '2.8 km', address: '102 West River Road',
      phone: '(555) 019-4411', status: '24/7 Active' }
  ]
}
```

### Reports Mock Data
```js
REPORTS = [
  { id: 1, icon: 'pdf', title: 'Weekly Safety Summary — Sophia Chen',
    range: 'Sept 17 - Sept 24, 2025', type: 'Weekly Summary', typeBg: '#DBEAFE',
    typeColor: '#2563EB', format: 'PDF', status: 'Ready' },
  { id: 2, icon: 'csv', title: 'Location History Data — Liam Torres',
    range: 'Sept 1 - Sept 24, 2025', type: 'Location Log', typeBg: '#F3E8FF',
    typeColor: '#8B5CF6', format: 'CSV', status: 'Ready' },
  { id: 3, icon: 'pdf', title: 'Incident & Alert Log — Both Children',
    range: 'August 2025', type: 'Incident Log', typeBg: '#FEF3C7',
    typeColor: '#D97706', format: 'PDF', status: 'Ready' },
  { id: 4, icon: 'pdf', title: 'Safe Zone Violation Report — Liam Torres',
    range: 'Sept 20, 2025', type: 'Safe Zone Report', typeBg: '#FFEDD5',
    typeColor: '#EA580C', format: 'PDF', status: 'Ready' }
]
```

### Analytics Mock Data
```js
ANALYTICS = {
  safetyScore: 94,
  safeZoneAdherence: 98.2,
  avgResponseTime: 1.4,
  totalIncidents: 6,
  alertFrequency: [
    { day: 'Mon', zone: 1, sos: 0 },
    { day: 'Tue', zone: 2, sos: 1 },
    { day: 'Wed', zone: 0, sos: 0 },
    { day: 'Thu', zone: 3, sos: 1 },
    { day: 'Fri', zone: 1, sos: 0 },
    { day: 'Sat', zone: 2, sos: 0 },
    { day: 'Sun', zone: 0, sos: 0 }
  ],
  timeByLocation: [
    { name: 'Home', percent: 62, color: '#3B82F6' },
    { name: 'Lincoln Elementary', percent: 28, color: '#22C55E' },
    { name: 'Riverside Park', percent: 7, color: '#F59E0B' },
    { name: 'Outside Safe Zones', percent: 3, color: '#EF4444' }
  ],
  childRatings: [
    { name: 'Sophia Chen', score: 96, safeZoneTime: '99%', alerts: 2 },
    { name: 'Liam Torres', score: 92, safeZoneTime: '97%', alerts: 4 }
  ]
}
```

---

## CRITICAL RULES FOR IMPLEMENTATION

1. **PIXEL PERFECT**: Every color, spacing, font size, and layout MUST match this guide exactly.
2. **NO external CSS frameworks** beyond Tailwind. No Bootstrap, no Material UI.
3. **Lucide React** for ALL icons. No other icon library.
4. **No chart library needed** for mock phase — use CSS bars and conic-gradient for charts.
5. **No real maps** — use the CSS grid-based demo map component for all map views.
6. **Responsive**: Sidebar should collapse to hamburger on mobile (< 768px).
7. **Animations**: Subtle hover effects on cards (scale 1.01 or border color change), smooth page transitions.
8. **Mock data only** — no API calls, no fetch, no axios. All data from `mockData.js`.
9. **React Router 6** for SPA navigation, no page reloads.
10. **AppContext** for global state: children, alerts, safe zones, toasts, modals.
