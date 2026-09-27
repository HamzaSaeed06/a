import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Mail, Lock, Eye, EyeOff, CheckCircle, ArrowRight, User, Loader2, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const { login, signup } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    let res;
    if (isSignUp) {
      res = await signup({ name, email, password });
    } else {
      res = await login(email, password);
    }

    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleFillDemo = () => {
    setIsSignUp(false);
    setEmail('sarah@example.com');
    setPassword('password123');
    setErrorMsg('');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Dark Brand */}
      <div className="hidden lg:flex w-1/2 bg-[#0F172A] flex-col items-center justify-center px-12 py-16 relative overflow-hidden">
        <div className="absolute top-[-150px] left-[-100px] w-[400px] h-[400px] rounded-full bg-[#2563EB]/10 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-80px] w-[350px] h-[350px] rounded-full bg-[#EC4899]/8 blur-3xl" />

        <div className="relative z-10 max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <Shield size={28} className="text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold text-white tracking-tight">SafeWatch</h2>
              <p className="text-xs text-[#94A3B8]">Child Safety Monitoring System</p>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white leading-tight mb-4">
            Keep your children<br />safe, always.
          </h1>
          <p className="text-[#94A3B8] text-sm leading-relaxed mb-8">
            Monitor your child's real-time location, safety band status, and receive instant alerts — connected to live Express & MongoDB Atlas backend.
          </p>

          <div className="space-y-3 text-left max-w-xs mx-auto">
            {['Real-time Location & Telemetry', 'Instant SOS Emergency Alerts', 'Geofenced Safe Zones Sync'].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <CheckCircle size={18} className="text-[#16A34A] flex-shrink-0" />
                <span className="text-white text-sm">{feat}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-[#64748B] mt-12">
            Academic Final Year Project · Child Safety System
          </p>
        </div>
      </div>

      {/* Right Panel — Login / Signup Form */}
      <div className="flex-1 bg-[#F8FAFC] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="bg-[#0F172A] p-2 rounded-lg">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-[#0F172A]">SafeWatch</span>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8">
            {/* Header Tabs */}
            <div className="flex items-center justify-between mb-6 border-b border-[#F1F5F9] pb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#0F172A]">
                  {isSignUp ? 'Create an account' : 'Welcome back'}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {isSignUp ? 'Sign up to monitor your child' : 'Sign in to access live safety dashboard'}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-xs font-medium text-[#DC2626]">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Sign Up only) */}
              {isSignUp && (
                <div>
                  <label className="text-xs font-semibold text-[#334155] block mb-1">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sarah Chen"
                      className="w-full border border-[#E2E8F0] rounded-lg pl-10 pr-4 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full border border-[#E2E8F0] rounded-lg pl-10 pr-4 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#334155]">Password</label>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-[#E2E8F0] rounded-lg pl-10 pr-10 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F172A] text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#1E293B] transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Fill Button */}
            <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] hover:bg-[#DBEAFE] py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles size={14} /> Fill Live Parent Credentials (sarah@example.com)
              </button>
            </div>

            {/* Mode Switcher */}
            <p className="text-xs text-[#64748B] text-center mt-4">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg('');
                }}
                className="text-[#2563EB] font-semibold hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Create one'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
