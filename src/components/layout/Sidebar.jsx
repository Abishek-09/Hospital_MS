import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Receipt, 
  BarChart3, 
  Settings, 
  HeartHandshake,
  Clock,
  PhoneCall,
  MapPin,
  ShieldCheck,
  UserCheck,
  History
} from 'lucide-react';
import { getClinicSettings } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const settings = getClinicSettings();
  const { role, currentUser } = useAuth();

  // Admin Navigation Links (Doctor)
  const adminNavItems = [
    { label: 'Clinical Dashboard', path: '/admin/dashboard', icon: Stethoscope },
    { label: 'Patients Directory', path: '/admin/patients', icon: Users, badge: 'Read-only' },
    { label: 'Clinic Analytics & History', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Invoices & Billing', path: '/admin/invoices', icon: Receipt },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { label: 'Clinic Settings', path: '/admin/settings', icon: Settings },
  ];

  // User Navigation Links (System Controller / Reception)
  const userNavItems = [
    { label: 'Patients Directory', path: '/user/patients', icon: Users, badge: 'Full CRUD' },
    { label: 'Patient Medical History', path: '/user/workspace', icon: History, badge: 'History only' },
  ];

  const currentNavItems = role === 'user' ? userNavItems : adminNavItems;

  return (
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
              Pediatric Clinic
            </p>
          </div>
        </div>

        {/* Dynamic Role Badge Card */}
        <div className="mt-4 p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white tracking-wide truncate">
              {currentUser?.displayName || 'Dr. B. Sivakumar'}
            </span>
            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
              role === 'admin' ? 'bg-brand-teal text-brand-sand' : 'bg-brand-orange text-white'
            }`}>
              {role === 'admin' ? 'Doctor (Admin)' : 'System Controller'}
            </span>
          </div>
          <span className="text-[11px] text-brand-sand font-medium leading-tight">
            {role === 'admin' ? 'M.B.B.S., M.D., (PEDS)' : 'Front Desk Controller'}
          </span>
          <span className="text-[10px] text-stone-300">
            {role === 'admin' ? 'Consultant Pediatrician' : 'Patient Registration & History'}
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center justify-between">
          <span>{role === 'admin' ? 'Doctor Console' : 'Reception Console'}</span>
          <span className="text-[9px] font-mono opacity-60">RBAC</span>
        </div>

        {currentNavItems.map((item) => {
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
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && !isActive && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-stone-300 font-mono">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-brand-sand shadow-sm animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Clinic Details & Role Footer */}
      <div className="p-4 border-t border-white/10 bg-black/10 text-[11px] space-y-2 text-stone-300">
        <div className="flex items-center gap-2 text-brand-sand font-medium">
          <Clock className="w-3.5 h-3.5 text-brand-sand" />
          <span>Timing: {settings.timings || '1:00 PM – 9:00 PM'}</span>
        </div>
        <div className="flex items-center gap-2">
          <PhoneCall className="w-3.5 h-3.5 text-stone-400" />
          <span>{settings.phone || '8300 44 2584'}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{settings.address || '7, College Road, Ambalai'}</span>
        </div>
      </div>
    </aside>
  );
}
