import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../lib/auth";
import { apiFetch } from "../lib/api";
import { Spinner, Button, Input } from "../components/UI";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const usernameTrimmed = form.username.trim();
    if (!usernameTrimmed || !form.password) { toast.error("Please fill in both fields."); return; }
    setLoading(true);
    try {
      const data = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ ...form, username: usernameTrimmed }) });
      toast.success("Login successful! Redirecting...");
      login(data.token, data.user);
    } catch (err) {
      toast.error(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-b from-slate-200/50 to-transparent blur-3xl -z-10 rounded-full opacity-60" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-[400px] px-6">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white mb-6 shadow-lg shadow-slate-900/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-h1 mb-2">Auction OS</h1>
          <p className="text-body text-slate-500">Official Auction Platform</p>
        </div>
        <div className="surface-elevated p-8">
          <h2 className="text-h3 mb-6 font-semibold">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-small font-medium text-slate-700 mb-1.5" htmlFor="username">Email or Username</label>
              <Input id="username" placeholder="Enter email or username" autoComplete="username" value={form.username} onChange={(e) => setForm((c) => ({ ...c, username: e.target.value }))} />
            </div>
            <div>
              <label className="block text-small font-medium text-slate-700 mb-1.5" htmlFor="password">Password</label>
              <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} />
            </div>
            <Button type="submit" variant="primary" loading={loading} loadingText="Authenticating..." className="w-full mt-2">Continue to Dashboard</Button>
          </form>
        </div>
        <p className="text-center text-xs text-slate-400 mt-8">Secure Access Portal</p>
      </motion.div>
    </div>
  );
}
