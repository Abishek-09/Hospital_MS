import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ClipboardList,
  HeartHandshake,
  Lock,
  User,
  ArrowRight,
  UserCheck,
  Clock,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function UserLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();
  const { addToast } = useToast();

  const [username, setUsername] = useState('reception');
  const [password, setPassword] = useState('frontdesk2026');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please provide Reception username and password.');
      return;
    }

    const res = loginUser(username, password);
    if (res.success) {
      addToast({
        title: "Welcome, Reception Desk",
        message: "Front desk system controller session activated.",
        type: "success"
      });

      const redirectPath = location.state?.from?.pathname || '/user/workspace';
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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-teal text-brand-sand shadow-card mb-1">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight uppercase">
            Reception Desk Sign In
          </h1>
          <p className="text-xs font-bold text-brand-teal uppercase">
            Santosh Child Care — Front Desk System Controller
          </p>
        </div>

        {/* Reception Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/70 shadow-elevated">
          {/* Reception Badge */}
          <div className="p-3.5 mb-5 rounded-xl bg-brand-teal text-white space-y-0.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-brand-sand">Front Desk Controller</span>
              <UserCheck className="w-4 h-4 text-brand-sand" />
            </div>
            <p className="text-[11px] text-stone-100">Patient Registration & Queue Preparation</p>
            <p className="text-[10px] text-stone-300 pt-1">
              Authorized access: Patient Directory (Name & Mobile ONLY) and Queue History View.
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
                Receptionist ID
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
              className="w-full py-3 bg-brand-teal hover:bg-brand-teal-light text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group"
            >
              <span>Access Reception Desk</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Demo Chip */}
          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span className="text-[11px]">Demo credentials:</span>
            <button
              type="button"
              onClick={() => { setUsername('reception'); setPassword('frontdesk2026'); }}
              className="px-2.5 py-1 rounded-lg bg-brand-sage-subtle text-brand-dark text-[10px] font-bold hover:bg-brand-sage transition-colors"
            >
              Fill Demo Login
            </button>
          </div>
        </div>

        {/* Link to Doctor Login */}
        <div className="text-center text-xs text-stone-600">
          <span>Are you the doctor? </span>
          <Link to="/admin/login" className="font-bold text-brand-orange hover:underline">
            Go to Doctor Login
          </Link>
        </div>
      </div>
    </div>
  );
}
