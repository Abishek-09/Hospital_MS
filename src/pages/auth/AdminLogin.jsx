import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Stethoscope, 
  HeartHandshake, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Phone, 
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdmin } = useAuth();
  const { addToast } = useToast();

  const [username, setUsername] = useState('doctor');
  const [password, setPassword] = useState('peds2026');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please provide Doctor username and password.');
      return;
    }

    const res = loginAdmin(username, password);
    if (res.success) {
      addToast({
        title: "Welcome, Dr. B. Sivakumar",
        message: "Doctor clinical console activated.",
        type: "success"
      });

      const redirectPath = location.state?.from?.pathname || '/admin/dashboard';
      navigate(redirectPath, { replace: true });
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-brand-body flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Branding Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-dark text-brand-sand shadow-card mb-1">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight uppercase">
            Doctor Portal Sign In
          </h1>
          <p className="text-xs font-bold text-brand-teal uppercase">
            Santosh Child Care — Dr. B. Sivakumar, M.D. (PEDS)
          </p>
        </div>

        {/* Doctor Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/70 shadow-elevated">
          {/* Doctor Credentials Badge */}
          <div className="p-3.5 mb-5 rounded-xl bg-brand-dark text-white space-y-0.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-brand-sand">Dr. B. Sivakumar</span>
              <ShieldCheck className="w-4 h-4 text-brand-sand" />
            </div>
            <p className="text-[11px] text-stone-200">M.B.B.S., M.D., (PEDS) — Consultant Pediatrician</p>
            <p className="text-[10px] text-stone-400 pt-1">
              Authorized access: Clinical Vitals, Rx Builder, Billing, Invoices & Reports.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                Doctor Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:border-brand-teal"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:border-brand-teal"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group"
            >
              <span>Access Doctor Console</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Demo Chip */}
          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span className="text-[11px]">Demo credentials:</span>
            <button
              type="button"
              onClick={() => { setUsername('doctor'); setPassword('peds2026'); }}
              className="px-2.5 py-1 rounded-lg bg-brand-teal-subtle text-brand-teal text-[10px] font-bold hover:bg-brand-teal hover:text-white transition-colors"
            >
              Fill Demo Login
            </button>
          </div>
        </div>

        {/* Link to Reception Login */}
        <div className="text-center text-xs text-stone-600">
          <span>Are you front desk staff? </span>
          <Link to="/user/login" className="font-bold text-brand-teal hover:underline">
            Go to Reception Login
          </Link>
        </div>
      </div>
    </div>
  );
}
