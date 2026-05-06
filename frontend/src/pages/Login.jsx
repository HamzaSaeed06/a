import { useState } from "react";
import { motion } from "framer-motion";
import { Gavel, Eye, EyeSlash, ArrowRight } from "@phosphor-icons/react";
import { useAuth } from "../lib/auth";
import { apiFetch } from "../lib/api";
import { Spinner, Button, Input } from "../components/UI";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const usernameTrimmed = form.username.trim();
    if (!usernameTrimmed || !form.password) { 
      toast.error("Please fill in both fields."); 
      return; 
    }
    setLoading(true);
    try {
      const data = await apiFetch("/auth/login", { 
        method: "POST", 
        body: JSON.stringify({ ...form, username: usernameTrimmed }) 
      });
      toast.success("Login successful!");
      login(data.token, data.user);
    } catch (err) {
      toast.error(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: "32px 32px"
            }}
          />
        </div>
        
        {/* Accent glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-12">
              <div className="h-12 w-12 rounded-xl bg-teal-500 flex items-center justify-center">
                <Gavel size={24} weight="fill" className="text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Auction OS</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Cricket Auction
              <br />
              <span className="text-teal-400">Management Platform</span>
            </h1>
            
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Professional-grade auction management system for cricket leagues. 
              Streamline your player bidding process.
            </p>
            
            <div className="mt-12 flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white">500+</span>
                <span className="text-sm text-slate-400">Players Managed</span>
              </div>
              <div className="h-10 w-px bg-slate-700" />
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white">50+</span>
                <span className="text-sm text-slate-400">Franchises</span>
              </div>
              <div className="h-10 w-px bg-slate-700" />
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white">10K+</span>
                <span className="text-sm text-slate-400">Bids Processed</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="w-full max-w-[400px]"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="h-11 w-11 rounded-xl bg-teal-600 flex items-center justify-center">
              <Gavel size={22} weight="fill" className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">Auction OS</span>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email or Username
              </label>
              <Input 
                id="username" 
                placeholder="Enter your email or username" 
                autoComplete="username" 
                value={form.username} 
                onChange={(e) => setForm((c) => ({ ...c, username: e.target.value }))} 
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password" 
                  autoComplete="current-password" 
                  value={form.password} 
                  onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} 
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="pt-2"
            >
              <Button 
                type="submit" 
                variant="primary" 
                loading={loading} 
                loadingText="Signing in..." 
                className="w-full h-12 text-base"
              >
                Sign in
                <ArrowRight size={18} weight="bold" />
              </Button>
            </motion.div>
          </form>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center text-xs text-slate-400 mt-10"
          >
            Protected by enterprise-grade security
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
