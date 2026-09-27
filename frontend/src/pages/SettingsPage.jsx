import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  User, Bell, Phone, Lock, MapPin, AlertTriangle,
  Globe, Palette, LogOut, ChevronRight, Eye, EyeOff, Save, Plus, Trash2
} from 'lucide-react';

export const SettingsPage = () => {
  const { currentUser, setCurrentUser, addToast, logout } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states initialized from currentUser
  const nameParts = (currentUser?.name || 'Sarah Chen').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] || 'Sarah');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || 'Chen');
  const [email, setEmail] = useState(currentUser?.email || 'sarah@example.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+1 (415) 555-0182');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (currentUser?.name) {
      const parts = currentUser.name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
    if (currentUser?.email) setEmail(currentUser.email);
    if (currentUser?.phone) setPhone(currentUser.phone);
    if (currentUser?.contacts && Array.isArray(currentUser.contacts) && currentUser.contacts.length > 0) {
      setContacts(currentUser.contacts);
    }
  }, [currentUser]);

  // Emergency contacts list
  const [contacts, setContacts] = useState([
    { name: 'David Chen', relation: 'Father', phone: '+1 (415) 555-0199', tag: 'Primary' },
    { name: 'Dr. Emily Watson', relation: 'Pediatrician', phone: '+1 (415) 555-0144', tag: 'Medical' },
    { name: 'Oakland Police Precinct #4', relation: 'Local Emergency', phone: '911 / (415) 555-0100', tag: 'Police' }
  ]);

  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');
  const [selectedTheme, setSelectedTheme] = useState('light');

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const payload = { name: fullName, phone, contacts };
      if (password) payload.password = password;

      const res = await authAPI.updateProfile(payload);
      if (res?.data?.user) {
        setCurrentUser((prev) => ({
          ...prev,
          name: res.data.user.name || fullName,
          phone: res.data.user.phone || phone,
          contacts: res.data.user.contacts || contacts,
        }));
      }
      addToast('Account & Emergency Contacts updated in MongoDB!', 'success');
      setPassword('');
    } catch (err) {
      addToast(`Failed to update settings: ${err.message}`, 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddContact = async () => {
    const newContact = { name: 'Emergency Contact', relation: 'Family', phone: '+1 (415) 555-0000', tag: 'Secondary' };
    const updated = [...contacts, newContact];
    setContacts(updated);
    try {
      await authAPI.updateProfile({ contacts: updated });
      addToast('Emergency contact added and saved to MongoDB', 'success');
    } catch (e) {
      addToast('Emergency contact added locally', 'info');
    }
  };

  const handleRemoveContact = async (index) => {
    const updated = contacts.filter((_, i) => i !== index);
    setContacts(updated);
    try {
      await authAPI.updateProfile({ contacts: updated });
      addToast('Emergency contact removed from MongoDB', 'info');
    } catch (e) {
      addToast('Emergency contact removed', 'info');
    }
  };


  const handleSignOut = () => {
    logout();
  };


  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'location', label: 'Location Permissions', icon: MapPin },
    { id: 'alerts', label: 'Alert Preferences', icon: AlertTriangle },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'theme', label: 'Theme Preferences', icon: Palette },
  ];

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-5 max-w-5xl mx-auto animate-fade-in space-y-6">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          
          {/* Left Sub-Navigation Menu (1 Column) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <nav className="space-y-0.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                      <Icon size={16} />
                    </span>
                    {tab.label}
                    {isActive && <ChevronRight size={14} className="ml-auto" />}
                  </button>
                );
              })}

              {/* Divider & Sign Out */}
              <div className="pt-2 border-t border-slate-100 mt-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </nav>
          </div>

          {/* Right Detail Panel (3 Columns) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              
              {/* --- 1. Account Tab --- */}
              {activeTab === 'account' && (
                <div>
                  <h3 className="font-bold font-display text-slate-900 mb-5 text-lg">Account Settings</h3>

                  {/* Profile Header */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="relative">
                      <img
                        alt="Profile"
                        className="w-16 h-16 rounded-2xl object-cover"
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format"
                      />
                      <button
                        type="button"
                        onClick={() => addToast('Upload picture feature selected', 'info')}
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-white text-xs hover:bg-slate-700 transition-colors"
                        title="Upload Avatar"
                      >
                        +
                      </button>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-base">{firstName} {lastName}</p>
                      <p className="text-sm text-slate-500">Parent Account</p>
                    </div>
                  </div>

                  {/* Account Form */}
                  <form onSubmit={handleSaveAccount} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700">First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700">Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1.5">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-500 text-sm px-4 py-2.5 gap-2 mt-2"
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                  </form>
                </div>
              )}

              {/* --- 2. Notifications Tab --- */}
              {activeTab === 'notifications' && (
                <div>
                  <h3 className="font-bold font-display text-slate-900 mb-2 text-lg">Notification Preferences</h3>
                  <p className="text-xs text-slate-500 mb-5">Manage push alerts, SMS messages, and automated summaries</p>

                  <div className="space-y-3">
                    {[
                      { title: 'Emergency SOS Instant Push Alerts', desc: 'Loud alert notification when SOS is pressed', default: true },
                      { title: 'Safe Zone Geofence Breach SMS', desc: 'Immediate text message when child leaves safe area', default: true },
                      { title: 'Low Band Battery Warnings', desc: 'Alert when battery level drops below 15%', default: true },
                      { title: 'Weekly Child Activity Summary Email', desc: 'Weekly email digest of distance & safety score', default: false }
                    ].map((item, idx) => (
                      <label key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked={item.default}
                          onChange={(e) => addToast(`${item.title} updated`, 'info')}
                          className="w-5 h-5 text-slate-900 rounded accent-slate-900"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* --- 3. Emergency Contacts Tab --- */}
              {activeTab === 'contacts' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold font-display text-slate-900 text-lg">Emergency Contacts</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Contacts notified automatically during SOS triggers</p>
                    </div>
                    <button
                      onClick={handleAddContact}
                      className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 hover:bg-slate-800"
                    >
                      <Plus size={14} /> Add Contact
                    </button>
                  </div>

                  <div className="space-y-3">
                    {contacts.map((contact, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">{contact.name}</p>
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{contact.tag}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{contact.relation} · {contact.phone}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveContact(idx)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Remove Contact"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- 4. Privacy Tab --- */}
              {activeTab === 'privacy' && (
                <div>
                  <h3 className="font-bold font-display text-slate-900 mb-2 text-lg">Privacy & Data Controls</h3>
                  <p className="text-xs text-slate-500 mb-5">Configure data storage, encryption & third-party sharing</p>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                      <p className="text-sm font-semibold text-slate-800">End-to-End GPS Location Encryption</p>
                      <p className="text-xs text-slate-500">All band telemetry data is encrypted using AES-256 standards before transmission.</p>
                      <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1">Active</span>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                      <p className="text-sm font-semibold text-slate-800">Location Log Retention Period</p>
                      <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white">
                        <option>30 Days (Default)</option>
                        <option>60 Days</option>
                        <option>90 Days</option>
                        <option>1 Year</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* --- 5. Location Permissions Tab --- */}
              {activeTab === 'location' && (
                <div>
                  <h3 className="font-bold font-display text-slate-900 mb-2 text-lg">Location Permissions</h3>
                  <p className="text-xs text-slate-500 mb-5">Manage mobile & band GPS access</p>

                  <div className="space-y-3">
                    {[
                      { title: 'High-Accuracy Real-Time GPS Tracking', desc: 'Uses cellular + Wi-Fi triangulation for sub-meter precision', default: true },
                      { title: 'Background Location Monitoring', desc: 'Allows background geofence compliance checks 24/7', default: true },
                      { title: 'Offline Location Caching', desc: 'Saves GPS points when signal drops and syncs when reconnected', default: true }
                    ].map((item, idx) => (
                      <label key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                        <input type="checkbox" defaultChecked={item.default} className="w-5 h-5 text-slate-900 rounded accent-slate-900" />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* --- 6. Alert Preferences Tab --- */}
              {activeTab === 'alerts' && (
                <div>
                  <h3 className="font-bold font-display text-slate-900 mb-2 text-lg">Alert Preferences</h3>
                  <p className="text-xs text-slate-500 mb-5">Adjust geofence radii and alarm sound intensity</p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-800 block mb-1">Geofence Buffer Distance (Meters)</label>
                      <input type="range" min="50" max="500" defaultValue="100" className="w-full text-slate-900 accent-slate-900" />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>50m (Strict)</span>
                        <span>100m (Recommended)</span>
                        <span>500m (Relaxed)</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                      <p className="text-sm font-semibold text-slate-800">SOS Siren Audio Mode</p>
                      <p className="text-xs text-slate-500">Play loud emergency alarm on mobile phone when SOS is pressed even in Silent Mode.</p>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-slate-900 accent-slate-900" />
                        Override Silent / Do Not Disturb
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* --- 7. Language Tab --- */}
              {activeTab === 'language' && (
                <div>
                  <h3 className="font-bold font-display text-slate-900 mb-2 text-lg">Language & Regional Settings</h3>
                  <p className="text-xs text-slate-500 mb-5">Select your preferred application display language</p>

                  <div className="space-y-3 max-w-md">
                    <label className="text-sm font-semibold text-slate-800 block">System Language</label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => {
                        setSelectedLanguage(e.target.value);
                        addToast(`Language updated to ${e.target.value}`, 'success');
                      }}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white"
                    >
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>Spanish (Español)</option>
                      <option>French (Français)</option>
                      <option>Urdu (اردو)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* --- 8. Theme Preferences Tab --- */}
              {activeTab === 'theme' && (
                <div>
                  <h3 className="font-bold font-display text-slate-900 mb-2 text-lg">Theme Preferences</h3>
                  <p className="text-xs text-slate-500 mb-5">Customize the appearance of SafeWatch</p>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setSelectedTheme('light');
                        addToast('Switched to Light Mode', 'info');
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedTheme === 'light' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="w-full h-12 bg-slate-100 rounded-lg mb-2 border border-slate-200" />
                      <p className="text-sm font-bold text-slate-900">Light Theme (Default)</p>
                      <p className="text-xs text-slate-500">Clean slate light theme from Figma design</p>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTheme('dark');
                        addToast('Switched to Dark Mode', 'info');
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedTheme === 'dark' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="w-full h-12 bg-slate-800 rounded-lg mb-2 border border-slate-700" />
                      <p className="text-sm font-bold text-slate-900">Dark Theme</p>
                      <p className="text-xs text-slate-500">Sleek high-contrast dark theme</p>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </main>
  );
};

export default SettingsPage;
