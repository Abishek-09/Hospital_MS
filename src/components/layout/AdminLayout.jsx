import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Receipt, 
  BarChart3, 
  Settings, 
  HeartHandshake, 
  Calendar, 
  LogOut, 
  Clock, 
  PhoneCall, 
  MapPin,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getClinicSettings } from '../../services/storage';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, logoutAdmin, currentUser } = useAuth();
  const { addToast } = useToast();
  const settings = getClinicSettings();

  const handleLogout = () => {
    if (logoutAdmin) {
      logoutAdmin();
    } else {
      logout();
    }
    addToast({ title: "Logged Out", message: "Doctor session ended securely.", type: "info" });
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Patients Directory', path: '/admin/patients', icon: Users },
    { label: 'Patient Details & History', path: '/admin/patient-history', icon: Clock },
    { label: 'Billing & Invoices', path: '/admin/invoices', icon: Receipt },
    { label: 'Reports & Clinical Analytics', path: '/admin/reports', icon: BarChart3 },
    { label: 'Clinic Configuration & Backup', path: '/admin/settings', icon: Settings },
  ];

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="flex min-h-screen bg-brand-body text-brand-dark font-sans selection:bg-brand-sand selection:text-brand-dark">
      {/* Persistent Admin Sidebar */}
      <aside className="w-64 bg-brand-dark text-white flex flex-col shrink-0 min-h-screen border-r border-brand-dark-light/40 no-print select-none z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-b from-brand-dark-light/30 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-teal to-brand-sage flex items-center justify-center shadow-lg text-brand-dark shrink-0">
              <HeartHandshake className="w-6 h-6 text-brand-dark" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-base tracking-tight text-white leading-tight font-sans">
                {settings.clinicName || 'Santosh Child Care'}
              </h1>
              <p className="text-[11px] font-semibold text-brand-sand tracking-wide uppercase truncate mt-0.5">
                Doctor Console (Admin)
              </p>
            </div>
          </div>

          {/* Doctor Badge */}
          <div className="mt-4 p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white tracking-wide">
                {settings.doctorName || 'Dr. B. Sivakumar'}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-brand-sand" />
            </div>
            <span className="text-[11px] text-brand-sand font-medium leading-tight">
              M.B.B.S., M.D., (PEDS)
            </span>
            <span className="text-[10px] text-stone-300">
              Consultant Pediatrician
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Doctor Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-brand-teal text-white shadow-soft font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-brand-sand' : 'text-stone-400 group-hover:text-stone-200'
                }`} />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-sand shadow-sm animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Clinic Details & Logout Footer */}
        <div className="p-4 border-t border-white/10 bg-black/10 text-[11px] space-y-2.5 text-stone-300">
          <div className="flex items-center gap-2 text-brand-sand font-medium">
            <Clock className="w-3.5 h-3.5 text-brand-sand" />
            <span>Timing: {settings.timings || '1:00 PM – 9:00 PM'}</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-stone-400" />
            <span>{settings.phone || '8300 44 2584'}</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-stone-300 hover:text-red-300 border border-white/10 transition-colors flex items-center justify-center gap-2 font-semibold text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Doctor Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin TopBar - Strictly NO 'Add Patient' button */}
        <header className="h-16 bg-white border-b border-brand-border/80 px-6 flex items-center justify-between shadow-soft shrink-0 z-20 no-print">
          {/* Left: Date & Clinic Timing */}
          <div className="flex items-center gap-2.5 text-xs font-semibold text-brand-dark">
            <div className="w-8 h-8 rounded-lg bg-brand-sage-subtle border border-brand-sage/60 flex items-center justify-center text-brand-dark">
              <Calendar className="w-4 h-4 text-brand-teal" />
            </div>
            <div>
              <div className="text-brand-dark font-bold">{formattedDate}</div>
              <div className="text-[10px] text-brand-muted flex items-center gap-1 font-normal">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Doctor Consultation Active (1:00 PM – 9:00 PM)</span>
              </div>
            </div>
          </div>

          {/* Right: Doctor Badge & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-teal-subtle border border-brand-teal/20 text-xs">
              <div className="w-6 h-6 rounded-lg bg-brand-teal text-brand-sand flex items-center justify-center font-bold">
                <Stethoscope className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="font-bold text-brand-dark block text-xs">Dr. B. Sivakumar</span>
                <span className="text-[10px] text-brand-muted block">M.B.B.S., M.D., (PEDS)</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-stone-500 hover:text-red-600 rounded-xl hover:bg-stone-100 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Page Outlet */}
        <main className="flex-1 p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
