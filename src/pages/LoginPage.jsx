import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HeartHandshake, 
  Stethoscope, 
  UserCheck, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Phone, 
  MapPin,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth, USER_PROFILES } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [selectedRole, setSelectedRole] = useState('admin'); // 'admin' or 'user'
  const [username, setUsername] = useState('doctor');
  const [password, setPassword] = useState('peds2026');
  const [error, setError] = useState('');

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError('');
    if (role === 'admin') {
      setUsername('doctor');
      setPassword('peds2026');
    } else {
      setUsername('reception');
      setPassword('frontdesk2026');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please provide username and password.');
      return;
    }

    const res = login(selectedRole, username, password);
    if (res.success) {
      addToast({
        title: `Welcome, ${res.user.name}`,
        message: `Logged in successfully as ${selectedRole === 'admin' ? 'Doctor (Admin)' : 'System Controller (Receptionist)'}.`,
        type: 'success'
      });

      const redirectPath = location.state?.from?.pathname || res.redirectPath;
      navigate(redirectPath, { replace: true });
    } else {
      setError(res.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-brand-body flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      {/* Background Decor */}
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Clinic Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-dark text-brand-sand shadow-card mb-1">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight uppercase">
            Santosh Child Care
          </h1>
          <p className="text-xs font-semibold text-brand-teal tracking-wide uppercase">
            Pediatric Clinic & Child Health Care
          </p>
          <div className="text-[11px] text-stone-500 flex items-center justify-center gap-2 mt-1">
            <span>7, College Road, Ambalai</span>
            <span>•</span>
            <span>Ph: 8300 44 2584</span>
          </div>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/70 shadow-elevated">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-brand-dark">Sign In to Clinic Console</h2>
            <p className="text-xs text-stone-500 mt-0.5">Select your role to access your authorized workspace</p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-stone-100 rounded-2xl border border-stone-200">
            {/* Doctor / Admin */}
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`p-3 rounded-xl transition-all duration-200 text-left flex flex-col justify-between ${
                selectedRole === 'admin'
                  ? 'bg-brand-dark text-white shadow-soft font-bold'
                  : 'text-stone-600 hover:text-brand-dark'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Stethoscope className={`w-4 h-4 ${selectedRole === 'admin' ? 'text-brand-sand' : 'text-brand-teal'}`} />
                {selectedRole === 'admin' && (
                  <span className="w-2 h-2 rounded-full bg-brand-sand"></span>
                )}
              </div>
              <span className="text-xs font-bold leading-tight block">Doctor (Admin)</span>
              <span className={`text-[10px] mt-0.5 block ${selectedRole === 'admin' ? 'text-stone-300' : 'text-stone-400'}`}>
                Full Clinical & Billing
              </span>
            </button>

            {/* Receptionist / User */}
            <button
              type="button"
              onClick={() => handleRoleChange('user')}
              className={`p-3 rounded-xl transition-all duration-200 text-left flex flex-col justify-between ${
                selectedRole === 'user'
                  ? 'bg-brand-dark text-white shadow-soft font-bold'
                  : 'text-stone-600 hover:text-brand-dark'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <UserCheck className={`w-4 h-4 ${selectedRole === 'user' ? 'text-brand-sand' : 'text-brand-teal'}`} />
                {selectedRole === 'user' && (
                  <span className="w-2 h-2 rounded-full bg-brand-sand"></span>
                )}
              </div>
              <span className="text-xs font-bold leading-tight block">Receptionist (User)</span>
              <span className={`text-[10px] mt-0.5 block ${selectedRole === 'user' ? 'text-stone-300' : 'text-stone-400'}`}>
                Registration & Prep
              </span>
            </button>
          </div>

          {/* Role Summary Banner */}
          <div className="p-3 mb-5 rounded-xl bg-brand-sage-subtle border border-brand-sage/60 text-xs text-brand-dark">
            {selectedRole === 'admin' ? (
              <div className="space-y-0.5">
                <div className="font-bold flex items-center gap-1.5 text-brand-dark">
                  <ShieldCheck className="w-4 h-4 text-brand-teal" />
                  <span>Dr. B. Sivakumar, M.B.B.S., M.D., (PEDS)</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Access: Dashboard analytics, Vitals, Prescription Builder, Billing, Void Invoices & Reports. (Note: Patient registration is handled by Front Desk).
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="font-bold flex items-center gap-1.5 text-brand-dark">
                  <UserCheck className="w-4 h-4 text-brand-teal" />
                  <span>Front Desk System Controller</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Access: Patient Directory (Full CRUD with Name & Mobile ONLY) and Visit Workspace (Patient demographics & past history timeline ONLY).
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                Username / User ID
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

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group"
            >
              <span>Sign In as {selectedRole === 'admin' ? 'Doctor' : 'Receptionist'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Quick Demo Switch Chips */}
          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span className="font-medium">Quick switch:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                  selectedRole === 'admin' ? 'bg-brand-teal text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                Doctor Demo
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('user')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                  selectedRole === 'user' ? 'bg-brand-teal text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                Receptionist Demo
              </button>
            </div>
          </div>
        </div>

        {/* Clinic Timing Notice */}
        <div className="text-center text-xs text-stone-500">
          <Clock className="w-3.5 h-3.5 inline mr-1 text-brand-teal" />
          <span>Consultation Timings: 1:00 PM – 9:00 PM Daily</span>
        </div>
      </div>
    </div>
  );
}
