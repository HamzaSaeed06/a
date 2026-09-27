/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: '#0F172A',
          dark: '#0d1527',
          blue: '#2563EB',
          lightBlue: '#3B82F6',
          sky: '#38bdf8',
        },
        surface: {
          page: '#F1F5F9',
          sidebar: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#F8FAFC',
        },
        txt: {
          primary: '#0F172A',
          secondary: '#1E293B',
          body: '#334155',
          muted: '#64748B',
          light: '#94A3B8',
        },
        status: {
          greenText: '#16A34A',
          greenBg: '#DCFCE7',
          greenLight: '#F0FDF4',
          amberText: '#D97706',
          amberBg: '#FEF3C7',
          amberDark: '#B45309',
          redText: '#DC2626',
          redBg: '#FEE2E2',
          redLight: '#FEF2F2',
          redDark: '#991B1B',
          redBorder: '#FECACA',
          orangeText: '#C2410C',
          orangeBg: '#FFEDD5',
        },
        child: {
          pinkAccent: '#EC4899',
          pinkDark: '#E11D48',
          pinkText: '#9D174D',
          pinkBg: '#FCE7F3',
          pinkBadge: '#DB2777',
          blueAccent: '#3B82F6',
          blueDark: '#2563EB',
          blueText: '#0369A1',
          blueBg: '#E0F2FE',
          blueBadge: '#2563EB',
          blueLightBg: '#DBEAFE',
        },
      },
    },
  },
  plugins: [],
}
