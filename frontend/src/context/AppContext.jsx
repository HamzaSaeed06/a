import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, bandsAPI, locationsAPI, sosAPI, alertsAPI } from '../services/api';


const AppContext = createContext();

export const AppProvider = ({ children: appChildren }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('safewatch_token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('safewatch_token')));
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [children, setChildren] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [safeZones, setSafeZones] = useState([]);
  const [currentUser, setCurrentUser] = useState({ name: '', email: '', phone: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Sync active tab with URL location
  useEffect(() => {
    const path = location.pathname.replace(/^\//, '') || 'dashboard';
    setActiveTab(path);
  }, [location.pathname]);

  const refreshData = async () => {
    const storedToken = localStorage.getItem('safewatch_token');
    if (!storedToken) return;

    try {
      const bandsRes = await bandsAPI.getBands();
      if (bandsRes?.data && Array.isArray(bandsRes.data)) {
        setIsBackendConnected(true);
        const mappedChildren = bandsRes.data.map((b) => ({
          id: b.id || b._id,
          name: b.nickname || 'Child Band',
          status: b.status || 'safe',
          location: b.lastLat ? `${b.lastLat.toFixed(4)}, ${b.lastLng.toFixed(4)}` : 'Live Tracking Active',
          coordinates: { lat: b.lastLat || 37.7749, lng: b.lastLng || -122.4194 },
          batteryPct: b.batteryPct || 100,
          age: b.age || 8,
          photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&h=120&fit=crop&auto=format',
          lastPing: 'Just now',
        }));
        setChildren(mappedChildren);

        if (bandsRes.data.length > 0) {
          try {
            const primaryBandId = bandsRes.data[0].id || bandsRes.data[0]._id;
            const zonesRes = await locationsAPI.getSafeZones(primaryBandId);
            if (zonesRes?.data && Array.isArray(zonesRes.data)) {
              const mappedZones = zonesRes.data.map((z) => ({
                id: z.id || z._id,
                name: z.name,
                status: z.isActive ? 'active' : 'inactive',
                radiusM: z.radiusM || 150,
                lat: z.lat,
                lng: z.lng,
              }));
              setSafeZones(mappedZones);
            } else {
              setSafeZones([]);
            }
          } catch (err) {
            console.log('Safe zones fetch notice:', err.message);
            setSafeZones([]);
          }
        } else {
          setSafeZones([]);
        }
      }

      // Fetch alerts
      try {
        const alertsRes = await alertsAPI.getAlerts();
        if (alertsRes?.data && Array.isArray(alertsRes.data)) {
          setAlerts(alertsRes.data);
        } else {
          setAlerts([]);
        }
      } catch (err) {
        console.log('Alerts fetch notice:', err.message);
        setAlerts([]);
      }
    } catch (err) {
      console.log('Refresh data error:', err.message);
    }
  };


  // Validate session & sync data on mount / token change
  useEffect(() => {
    const syncBackendData = async () => {
      setAuthLoading(true);
      const storedToken = localStorage.getItem('safewatch_token');
      if (storedToken) {
        try {
          const userRes = await authAPI.getMe();
          if (userRes?.data?.user) {
            setCurrentUser((prev) => ({
              ...prev,
              name: userRes.data.user.name || prev.name,
              email: userRes.data.user.email || prev.email,
              phone: userRes.data.user.phone || prev.phone,
            }));
            setIsAuthenticated(true);
          }

          await refreshData();
        } catch (err) {
          console.log('Session validation notice: Token expired or server unreachable');
          localStorage.removeItem('safewatch_token');
          setToken(null);
          setIsAuthenticated(false);
          setIsBackendConnected(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setAuthLoading(false);
    };
    syncBackendData();
  }, [token]);


  const login = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      if (res?.data?.token) {
        const authToken = res.data.token;
        localStorage.setItem('safewatch_token', authToken);
        setToken(authToken);
        setIsAuthenticated(true);
        if (res.data.user) {
          setCurrentUser((prev) => ({
            ...prev,
            name: res.data.user.name || prev.name,
            email: res.data.user.email || prev.email,
          }));
        }
        addToast(`Welcome back, ${res.data.user?.name || 'Parent'}!`, 'success');
        navigate('/');
        return { success: true };
      }
      return { success: false, message: res?.message || 'Login failed' };
    } catch (err) {
      const errorMsg = err.message || 'Login failed. Please check credentials.';
      addToast(errorMsg, 'warning');
      return { success: false, message: errorMsg };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await authAPI.signup(userData);
      if (res?.data?.token) {
        const authToken = res.data.token;
        localStorage.setItem('safewatch_token', authToken);
        setToken(authToken);
        setIsAuthenticated(true);
        if (res.data.user) {
          setCurrentUser((prev) => ({
            ...prev,
            name: res.data.user.name || prev.name,
            email: res.data.user.email || prev.email,
          }));
        }
        addToast('Account created successfully!', 'success');
        navigate('/');
        return { success: true };
      }
      return { success: false, message: res?.message || 'Signup failed' };
    } catch (err) {
      const errorMsg = err.message || 'Signup failed. Please try again.';
      addToast(errorMsg, 'warning');
      return { success: false, message: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('safewatch_token');
    setToken(null);
    setIsAuthenticated(false);
    addToast('Logged out successfully.', 'info');
    navigate('/login');
  };

  const registerBand = async (nickname) => {
    try {
      const res = await bandsAPI.registerBand({ nickname, deviceType: 'simulator' });
      if (res?.data) {
        const newBand = {
          id: res.data.bandId || res.data.id,
          name: nickname,
          status: 'safe',
          location: 'Registered',
          coordinates: { lat: 37.7749, lng: -122.4194 },
          batteryPct: 100,
          age: 7,
          photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&h=120&fit=crop&auto=format',
          lastPing: 'Just now',
        };
        setChildren((prev) => [newBand, ...prev]);
        addToast(`Band "${nickname}" registered successfully!`, 'success');
        closeModal();
        return { success: true };
      }
    } catch (err) {
      addToast(err.message || 'Failed to register band', 'warning');
    }
  };

  const createSafeZone = async (name, lat = 37.7749, lng = -122.4194, radiusM = 200) => {
    try {
      if (children.length === 0) throw new Error('No child band available to attach safe zone');
      const bandId = children[0].id;
      const res = await locationsAPI.createSafeZone(bandId, { name, lat, lng, radiusM });
      if (res?.data) {
        const newZone = {
          id: res.data.id,
          name: res.data.name,
          status: 'active',
          radiusM: res.data.radiusM || radiusM,
          lat: res.data.lat,
          lng: res.data.lng,
        };
        setSafeZones((prev) => [newZone, ...prev]);
        addToast(`Safe Zone "${name}" created!`, 'success');
        closeModal();
        return { success: true };
      }
    } catch (err) {
      addToast(err.message || 'Failed to create safe zone', 'warning');
    }
  };

  const toggleSafeZone = async (zoneId) => {
    try {
      await locationsAPI.activateSafeZone(zoneId);
      setSafeZones((prev) => prev.map((zone) => {
        if (zone.id === zoneId) {
          const newStatus = zone.status === 'active' ? 'inactive' : 'active';
          addToast(`"${zone.name}" is now ${newStatus}`, newStatus === 'active' ? 'success' : 'warning');
          return { ...zone, status: newStatus };
        }
        return zone;
      }));
    } catch (err) {
      setSafeZones((prev) => prev.map((zone) => {
        if (zone.id === zoneId) {
          const newStatus = zone.status === 'active' ? 'inactive' : 'active';
          addToast(`"${zone.name}" is now ${newStatus}`, newStatus === 'active' ? 'success' : 'warning');
          return { ...zone, status: newStatus };
        }
        return zone;
      }));
    }
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const navigateTo = (tabName) => {
    setActiveTab(tabName);
    setMobileMenuOpen(false);
    navigate(tabName === 'dashboard' ? '/' : `/${tabName}`);
  };

  const resolveAlert = async (alertId) => {
    try {
      if (children.length > 0) {
        await sosAPI.resolveSOS(children[0].id, alertId);
      }
    } catch (e) {
      // Ignore API errors, fallback to local state resolve
    }
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved' } : a)));
    addToast('Alert marked as resolved!', 'success');
    closeModal();
  };

  const dismissAlert = (alertId) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status: 'dismissed' } : a)));
    addToast('Alert dismissed.', 'info');
  };

  const openModal = (config) => setActiveModal(config);
  const closeModal = () => setActiveModal(null);
  const activeAlertCount = alerts.filter((a) => a.status === 'active').length;

  return (
    <AppContext.Provider value={{
      activeTab, navigateTo, children, alerts, activeAlertCount, safeZones,
      currentUser, setCurrentUser, mobileMenuOpen, setMobileMenuOpen, toasts, addToast,
      activeModal, openModal, closeModal, resolveAlert, dismissAlert, toggleSafeZone,
      registerBand, createSafeZone, refreshData,
      isBackendConnected, isAuthenticated, authLoading, login, signup, logout,
    }}>
      {appChildren}
    </AppContext.Provider>
  );

};

export const useApp = () => useContext(AppContext);
