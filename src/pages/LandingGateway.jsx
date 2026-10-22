import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartHandshake, 
  Stethoscope, 
  ClipboardList, 
  ArrowRight, 
  Clock, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2,
  Users,
  Receipt
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingGateway() {
  const { isAdminAuthenticated, isUserAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-brand-body flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-brand-sand selection:text-brand-dark">
      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-b border-brand-border/60">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-dark text-brand-sand flex items-center justify-center shadow-md">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight uppercase">
              Santosh Child Care
            </h1>
            <p className="text-xs font-semibold text-brand-teal tracking-wide uppercase">
              Comprehensive Pediatric Clinic & Health Centre
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-600 bg-white px-4 py-2 rounded-xl border border-brand-border/80 shadow-soft">
          <Clock className="w-4 h-4 text-brand-teal" />
          <span>Timing: <strong className="text-brand-dark">1:00 PM – 9:00 PM</strong></span>
        </div>
      </header>

      {/* Main Gateway Body */}
      <main className="max-w-4xl w-full mx-auto my-auto py-10 space-y-8 text-center animate-fade-in">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-sand/50 text-brand-dark text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" />
            <span>Dual Role Clinical Management System</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
            Select Your Clinic Portal
          </h2>
          <p className="text-stone-600 text-sm max-w-lg mx-auto">
            Authorized access for <strong>Dr. B. Sivakumar</strong> and Front Desk Staff. Choose your workspace below to continue.
          </p>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
          {/* Card 1: Doctor Portal (Admin) */}
          <div className="bg-white rounded-3xl p-7 border-2 border-brand-dark/20 hover:border-brand-dark shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-dark text-brand-sand flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-brand-dark/10 text-brand-dark">
                  Admin Portal
                </span>
              </div>

              <h3 className="text-xl font-black text-brand-dark">Doctor Portal</h3>
              <p className="text-xs font-bold text-brand-teal mt-0.5">
                Dr. B. Sivakumar, M.B.B.S., M.D., (PEDS)
              </p>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                Full clinical suite: Pediatric vitals, dynamic prescription builder with Tamil instructions, integer paise billing engine, invoices, and analytics.
              </p>

              <div className="mt-4 pt-4 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Clinical consultation & vitals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Prescription & Receipt printing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Financial reports & database backup</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4">
              <Link
                to="/admin/login"
                className="w-full py-3 px-4 bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group-hover:shadow"
              >
                <span>{isAdminAuthenticated ? 'Go to Doctor Dashboard' : 'Doctor Login'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: Reception Desk (User) */}
          <div className="bg-white rounded-3xl p-7 border-2 border-brand-teal/20 hover:border-brand-teal shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-teal text-white flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-6 h-6 text-brand-sand" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-brand-teal/10 text-brand-teal">
                  User Portal
                </span>
              </div>

              <h3 className="text-xl font-black text-brand-dark">Reception Desk</h3>
              <p className="text-xs font-bold text-brand-teal mt-0.5">
                Front Desk & System Controller
              </p>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                Front desk suite: Register new child patients (Name & Mobile ONLY), manage directory CRUD, and prepare consultation queues with past history.
              </p>

              <div className="mt-4 pt-4 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Register patients (Name & Mobile ONLY)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Directory CRUD (Edit & Delete contact)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Queue prep & past medical history view</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4">
              <Link
                to="/user/login"
                className="w-full py-3 px-4 bg-brand-teal hover:bg-brand-teal-light text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group-hover:shadow"
              >
                <span>{isUserAuthenticated ? 'Go to Reception Desk' : 'Reception Login'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto py-4 border-t border-brand-border/60 text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-brand-teal" />
          <span>7, College Road, Ambalai</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-brand-teal" />
          <span>Clinic Contact: 8300 44 2584</span>
        </div>
        <div className="text-[11px] text-stone-400">
          Santosh Child Care © 2026. Offline Persistent.
        </div>
      </footer>
    </div>
  );
}
