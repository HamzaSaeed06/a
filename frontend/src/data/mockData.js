// SafeWatch v1.0 — Complete Mock Data
export const INITIAL_CHILDREN = [
  {
    id: 'sophia', name: 'Sophia Chen', age: 8, gender: 'girl',
    themeColor: '#EC4899', ageColor: '#9D174D', ageBg: '#FCE7F3',
    alertActive: true, alertText: 'Alert Active',
    location: 'Lincoln Elementary School, 123 Oak St',
    lastUpdated: 'Updated 2 min ago', bandStatus: 'Band connected',
    bandConnected: true, battery: 12, batteryColor: '#DC2626',
    avatar: 'https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?auto=format&fit=crop&w=200&h=200&q=80',
    device: { id: 'SB-2024-A471', name: "Sophia's Band", model: 'SafeWatch Band v3 Pro',
      firmware: 'v2.4.1', signal: '-64 dBm (Excellent)', tamperStatus: 'Active & Secured',
      waterproof: 'IP68 (Safe for swimming)', lastSync: '2 min ago', paired: 'Jan 15, 2025' },
    safeZone: 'Lincoln Elementary School', inSafeZone: true,
    coords: { lat: 37.7749, lng: -122.4194 }
  },
  {
    id: 'liam', name: 'Liam Torres', age: 10, gender: 'boy',
    themeColor: '#3B82F6', ageColor: '#0369A1', ageBg: '#E0F2FE',
    alertActive: true, alertText: 'Alert Active',
    location: 'Riverside Park, near fountain',
    lastUpdated: 'Updated 5 min ago', bandStatus: 'Band connected',
    bandConnected: true, battery: 74, batteryColor: '#2563EB',
    avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=200&h=200&q=80',
    device: { id: 'SB-2024-B892', name: "Liam's Band", model: 'SafeWatch Band v3 Lite',
      firmware: 'v2.4.0', signal: '-71 dBm (Good)', tamperStatus: 'Tamper Alert Tripped',
      waterproof: 'IP68 (Safe for swimming)', lastSync: '1 min ago', paired: 'Jan 15, 2025' },
    safeZone: 'Riverside Park', inSafeZone: true,
    coords: { lat: 37.7785, lng: -122.4150 }
  }
];

export const INITIAL_ALERTS = [
  { id: 1, childId: 'liam', childName: 'Liam Torres',
    avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=200&h=200&q=80',
    type: 'Zone Exceeded', typeColor: '#B45309', typeBg: '#FEF3C7',
    location: 'Elm Street & 5th Ave', timestamp: 'Today, 3:42 PM',
    status: 'active', severity: 'high',
    details: 'Liam has moved outside the Riverside Park safe zone boundary.' },
  { id: 2, childId: 'sophia', childName: 'Sophia Chen',
    avatar: 'https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?auto=format&fit=crop&w=200&h=200&q=80',
    type: 'Low Battery', typeColor: '#475569', typeBg: '#E2E8F0',
    location: 'Lincoln Elementary School', timestamp: 'Today, 2:15 PM',
    status: 'active', severity: 'medium',
    details: 'Band battery dropped to 12%. Immediate charging recommended.' },
  { id: 3, childId: 'sophia', childName: 'Sophia Chen',
    avatar: 'https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?auto=format&fit=crop&w=200&h=200&q=80',
    type: 'Suspicious Contact', typeColor: '#C2410C', typeBg: '#FFEDD5',
    location: 'Oak Street Playground', timestamp: 'Yesterday, 4:30 PM',
    status: 'resolved', severity: 'high',
    details: 'Unpaired Bluetooth device attempted beacon broadcast. Verified by parent.' },
  { id: 4, childId: 'liam', childName: 'Liam Torres',
    avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=200&h=200&q=80',
    type: 'Tamper Detected', typeColor: '#EA580C', typeBg: '#FFEDD5',
    location: 'Riverside Park', timestamp: 'Yesterday, 1:10 PM',
    status: 'resolved', severity: 'high',
    details: 'Band clasp sensor opened momentarily. Liam confirmed adjusting band.' },
  { id: 5, childId: 'sophia', childName: 'Sophia Chen',
    avatar: 'https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?auto=format&fit=crop&w=200&h=200&q=80',
    type: 'Emergency', typeColor: '#DC2626', typeBg: '#FEE2E2',
    location: 'Near Maple Ave', timestamp: '2 days ago, 9:05 AM',
    status: 'resolved', severity: 'critical',
    details: 'Emergency SOS triggered. Parent responded within 1.4 minutes.' }
];

export const INITIAL_SAFE_ZONES = [
  { id: 'sz-1', name: 'Home', type: 'home', address: '742 Evergreen Terrace',
    radiusMeters: 150, status: 'active', assignedTo: ['Sophia Chen', 'Liam Torres'],
    color: '#8B5CF6', icon: 'home' },
  { id: 'sz-2', name: 'Lincoln Elementary', type: 'school',
    address: '123 Oak St, San Francisco, CA', radiusMeters: 200, status: 'active',
    assignedTo: ['Sophia Chen'], color: '#3B82F6', icon: 'school' },
  { id: 'sz-3', name: 'Riverside Park', type: 'custom',
    address: 'Riverside Park, near fountain', radiusMeters: 100, status: 'active',
    assignedTo: ['Liam Torres'], color: '#10B981', icon: 'park' }
];

export const CURRENT_USER = {
  name: 'Sarah Chen', email: 'sarah@example.com',
  phone: '+1 (555) 234-5678', role: 'Primary Guardian',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80'
};

export const EMERGENCY_CONTACTS = [
  { name: 'Michael Chen', relation: 'Father', phone: '+1 (555) 876-5432', tag: 'Primary Contact' },
  { name: 'Emily Davis', relation: 'Grandmother', phone: '+1 (555) 987-6543', tag: 'Secondary Contact' }
];

export const POLICE_STATIONS = {
  primary: { name: 'Central Police Precinct #4', phone: '(555) 019-2831',
    address: '452 Park Avenue, Sector 4', responseTime: '~4-7 mins' },
  nearby: [
    { name: 'North District Station', distance: '1.2 km', address: '789 North Boulevard',
      phone: '(555) 019-8822', status: '24/7 Active' },
    { name: 'Westside Precinct', distance: '2.8 km', address: '102 West River Road',
      phone: '(555) 019-4411', status: '24/7 Active' }
  ]
};

export const REPORTS = [
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
];

export const ANALYTICS = {
  safetyScore: 94, safeZoneAdherence: 98.2, avgResponseTime: 1.4, totalIncidents: 6,
  alertFrequency: [
    { day: 'Mon', zone: 1, sos: 0 }, { day: 'Tue', zone: 2, sos: 1 },
    { day: 'Wed', zone: 0, sos: 0 }, { day: 'Thu', zone: 3, sos: 1 },
    { day: 'Fri', zone: 1, sos: 0 }, { day: 'Sat', zone: 2, sos: 0 },
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
};
