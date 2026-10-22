import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Stethoscope, 
  HeartHandshake, 
  Calendar, 
  LogOut, 
  Clock, 
  PhoneCall, 
  MapPin,
  UserCheck,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getClinicSettings } from '../../services/storage';

export default function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutUser, userSession } = useAuth();
  const { addToast } = useToast();
  const settings = getClinicSettings();

  const handleLogout = () => {
    logoutUser();
    addToast({ title: "Logged Out", message: "Reception desk session closed.", type: "info" });
    navigate('/user/login', { replace: true });
  };

  const navItems = [
    { label: 'Visit Workspace', path: '/user/workspace', icon: Stethoscope },
    { label: 'Patients Directory', path: '/user/patients', icon: Users },
  ];

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="flex min-h-screen bg-brand-body text-brand-dark font-sans selection:bg-brand-sand selection:text-brand-dark">
      {/* Persistent Receptionist Sidebar (THEME: #416B66 Secondary Teal) */}
      <aside className="w-64 bg-brand-teal text-white flex flex-col shrink-0 min-h-screen border-r border-brand-teal-light/40 no-print select-none z-30 shadow-card">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/15 bg-black/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-brand-teal flex items-center justify-center shadow-lg shrink-0">
              <HeartHandshake className="w-6 h-6 text-brand-teal" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-base tracking-tight text-white leading-tight font-sans">
                {settings.clinicName || 'Santosh Child Care'}
              </h1>
              <p className="text-[11px] font-semibold text-brand-sand tracking-wide uppercase truncate mt-0.5">
                Reception Desk
              </p>
            </div>
          </div>

          {/* User Badge */}
          <div className="mt-4 p-2.5 rounded-xl bg-black/15 border border-white/10 flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white tracking-wide">
                Front Desk Reception
              </span>
              <UserCheck className="w-3.5 h-3.5 text-brand-sand" />
            </div>
            <span className="text-[11px] text-brand-sand font-medium leading-tight">
              System Controller
            </span>
            <span className="text-[10px] text-stone-200">
              Registration & Queue Prep
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-100">
            Front Desk Operations
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
                    ? 'bg-brand-dark text-white shadow-soft font-bold'
                    : 'text-teal-50 hover:text-white hover:bg-black/10'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-brand-sand' : 'text-teal-200 group-hover:text-white'
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
        <div className="p-4 border-t border-white/15 bg-black/15 text-[11px] space-y-2.5 text-teal-100">
          <div className="flex items-center gap-2 text-brand-sand font-medium">
            <Clock className="w-3.5 h-3.5 text-brand-sand" />
            <span>Timing: {settings.timings || '1:00 PM – 9:00 PM'}</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-teal-200" />
            <span>{settings.phone || '8300 44 2584'}</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-2 py-2 px-3 rounded-xl bg-black/20 hover:bg-red-600/30 text-white border border-white/15 transition-colors flex items-center justify-center gap-2 font-semibold text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Reception Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Reception TopBar */}
        <header className="h-16 bg-white border-b border-brand-border/80 px-6 flex items-center justify-between shadow-soft shrink-0 z-20 no-print">
          {/* Left: Date & Clinic Timing */}
          <div className="flex items-center gap-2.5 text-xs font-semibold text-brand-dark">
            <div className="w-8 h-8 rounded-lg bg-brand-teal-subtle border border-brand-teal/30 flex items-center justify-center text-brand-teal">
              <Calendar className="w-4 h-4 text-brand-teal" />
            </div>
            <div>
              <div className="text-brand-dark font-bold">{formattedDate}</div>
              <div className="text-[10px] text-brand-muted flex items-center gap-1 font-normal">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Front Desk Active (1:00 PM – 9:00 PM)</span>
              </div>
            </div>
          </div>

          {/* Right: Front Desk Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-teal-subtle border border-brand-teal/20 text-xs">
              <div className="w-6 h-6 rounded-lg bg-brand-teal text-white flex items-center justify-center font-bold">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="font-bold text-brand-dark block text-xs">Front Desk Desk</span>
                <span className="text-[10px] text-brand-muted block">System Controller</span>
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
