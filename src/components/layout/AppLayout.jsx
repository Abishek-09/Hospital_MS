import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  HeartHandshake,
  LayoutDashboard,
  Users,
  Clock,
  Receipt,
  BarChart3,
  Settings,
  Stethoscope,
  LogOut,
  Calendar,
  ShieldCheck,
  UserCheck,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getClinicSettings } from '../../services/storage';

export default function AppLayout({ children, role = 'admin', customNavItems = null }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, logoutAdmin, logoutUser } = useAuth();
  const { addToast } = useToast();
  const clinicSettings = getClinicSettings();

  // Close sidebar automatically when navigating to a new route on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const isAdmin = role === 'admin' || location.pathname.startsWith('/admin');

  const defaultAdminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Patients Directory', path: '/admin/patients', icon: Users },
    { label: 'Patient Details & History', path: '/admin/patient-history', icon: Clock },
    { label: 'Billing & Invoices', path: '/admin/invoices', icon: Receipt },
    { label: 'Reports & Clinical Analytics', path: '/admin/reports', icon: BarChart3 },
    { label: 'Clinic Configuration & Backup', path: '/admin/settings', icon: Settings },
  ];

  const defaultUserNav = [
    { label: 'Visit Workspace', path: '/user/workspace', icon: Stethoscope },
    { label: 'Patients Directory', path: '/user/patients', icon: Users },
  ];

  const navItems = customNavItems || (isAdmin ? defaultAdminNav : defaultUserNav);

  const handleLogout = () => {
    if (isAdmin) {
      if (logoutAdmin) logoutAdmin();
      else logout();
      addToast({ title: "Logged Out", message: "Doctor session ended securely.", type: "info" });
      navigate('/admin/login', { replace: true });
    } else {
      if (logoutUser) logoutUser();
      else logout();
      addToast({ title: "Logged Out", message: "Reception desk session closed.", type: "info" });
      navigate('/user/login', { replace: true });
    }
  };

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    // Main wrapper
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

      {/* 1. MOBILE SIDEBAR OVERLAY (Backdrop) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. SIDEBAR (Off-canvas on mobile, static on desktop) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#2A4343] text-white transform transition-transform duration-300 ease-in-out
        md:static md:translate-x-0 md:w-64 flex flex-col shrink-0 min-h-screen select-none shadow-xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header & Brand Logo */}
        <div className="p-5 border-b border-white/10 bg-black/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#416B66] to-[#C0C29D] flex items-center justify-center shadow-lg text-[#2A4343] shrink-0 font-bold">
              <HeartHandshake className="w-6 h-6 text-[#2A4343]" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-base tracking-tight text-white leading-tight truncate">
                {clinicSettings.clinicName || 'Santosh Child Care'}
              </h1>
              <p className="text-[11px] font-semibold text-[#F1D49A] tracking-wide uppercase truncate mt-0.5">
                {isAdmin ? 'Doctor Console (Admin)' : 'Front Desk Reception'}
              </p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role Badge Card */}
        <div className="px-4 py-3 bg-white/5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white tracking-wide">
              {isAdmin ? (clinicSettings.doctorName || 'Dr. B. Sivakumar') : 'Front Desk Reception'}
            </span>
            {isAdmin ? (
              <ShieldCheck className="w-3.5 h-3.5 text-[#F1D49A]" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-[#F1D49A]" />
            )}
          </div>
          <span className="text-[11px] text-[#F1D49A] font-medium leading-tight block mt-0.5">
            {isAdmin ? 'M.B.B.S., M.D., (PEDS)' : 'System Controller'}
          </span>
          <span className="text-[10px] text-slate-300 block">
            {isAdmin ? 'Consultant Pediatrician' : 'Registration & Queue Prep'}
          </span>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            {isAdmin ? 'Doctor Workspace' : 'Front Desk Operations'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${isActive
                    ? 'bg-[#416B66] text-white shadow-sm font-bold'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-[#F1D49A]' : 'text-slate-300 group-hover:text-white'
                  }`} />
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F1D49A] shadow-sm animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer & Sign Out */}
        <div className="p-4 border-t border-white/10 bg-black/15 text-[11px] space-y-2.5 text-slate-300 shrink-0">
          <div className="flex items-center gap-2 text-[#F1D49A] font-medium">
            <Clock className="w-3.5 h-3.5 text-[#F1D49A]" />
            <span>Timing: {clinicSettings.timings || '1:00 PM – 9:00 PM'}</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
            <span>{clinicSettings.phone || '8300 44 2584'}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full mt-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-200 hover:text-red-300 border border-white/10 transition-colors flex items-center justify-center gap-2 font-semibold text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isAdmin ? 'Doctor Sign Out' : 'Reception Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* MOBILE HEADER (Hamburger Menu) */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm shrink-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2A4343] text-white flex items-center justify-center font-bold shrink-0">
              <HeartHandshake className="w-5 h-5 text-[#F1D49A]" />
            </div>
            <div>
              <div className="font-extrabold text-[#2A4343] text-sm leading-tight">
                {clinicSettings.clinicName || 'Santosh Child Care'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {isAdmin ? 'Doctor Console' : 'Front Desk'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 hover:text-[#2A4343] hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            aria-label="Open Navigation Menu"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* DESKTOP TOPBAR */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 px-6 items-center justify-between shadow-xs shrink-0 z-20">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-[#2A4343]">
            <div className="w-8 h-8 rounded-lg bg-[#416B66]/10 border border-[#416B66]/20 flex items-center justify-center text-[#416B66]">
              <Calendar className="w-4 h-4 text-[#416B66]" />
            </div>
            <div>
              <div className="text-[#2A4343] font-bold">{formattedDate}</div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 font-normal">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{isAdmin ? 'Doctor Consultation Active (1:00 PM – 9:00 PM)' : 'Front Desk Active (1:00 PM – 9:00 PM)'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#416B66]/10 border border-[#416B66]/20 text-xs">
              <div className="w-6 h-6 rounded-lg bg-[#416B66] text-[#F1D49A] flex items-center justify-center font-bold">
                {isAdmin ? <Stethoscope className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
              </div>
              <div className="text-left">
                <span className="font-bold text-[#2A4343] block text-xs">
                  {isAdmin ? (clinicSettings.doctorName || 'Dr. B. Sivakumar') : 'Front Desk Desk'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {isAdmin ? 'M.B.B.S., M.D., (PEDS)' : 'System Controller'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 rounded-xl hover:bg-slate-100 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* SCROLLABLE PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="w-full max-w-[1600px] mx-auto">
            {children || <Outlet />}
          </div>
        </div>
      </main>
    </div>
  );
}
