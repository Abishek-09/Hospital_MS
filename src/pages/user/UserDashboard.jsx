import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  ClipboardList, 
  Calendar, 
  Phone, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { getPatients, getVisits } from '../../services/storage';
import { formatDate } from '../../utils/date';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    setPatients(getPatients());
    setVisits(getVisits());
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter(v => v.date && v.date.startsWith(todayStr));
  const recentPatients = [...patients].slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-brand-teal via-brand-teal-light to-brand-sage rounded-2xl p-6 text-white shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-sand text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Santosh Child Care — Front Desk Reception Desk
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            Welcome to Front Desk Console
          </h2>
          <p className="text-teal-50 text-xs mt-1 max-w-xl">
            Register new child patients, maintain contact phone directories, and prepare visits for Dr. B. Sivakumar.
          </p>
        </div>

        <button
          onClick={() => navigate('/user/patients')}
          className="px-4 py-2.5 bg-brand-dark hover:bg-brand-dark-light text-brand-sand text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4 text-brand-sand" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-brand-border/70 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
            Total Registered Children
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-brand-dark">{patients.length}</span>
            <span className="text-xs text-stone-500 font-medium">Patients</span>
          </div>
          <div className="mt-2 text-[11px] text-brand-teal font-semibold">
            All records stored offline
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-brand-border/70 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
            Today's Consultations Queue
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-brand-dark">{todayVisits.length}</span>
            <span className="text-xs text-stone-500 font-medium">In Clinic</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-semibold">
            Attending: Dr. B. Sivakumar, M.D.
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-brand-border/70 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
            Consultation Timing
          </span>
          <div className="mt-2 text-xl font-extrabold text-brand-dark">
            1:00 PM – 9:00 PM
          </div>
          <div className="mt-2 text-[11px] text-stone-500 font-medium">
            7, College Road, Ambalai (8300 44 2584)
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Action Buttons */}
        <div className="bg-white rounded-2xl p-6 border border-brand-border/70 shadow-soft space-y-3">
          <h3 className="font-bold text-base text-brand-dark">Reception Workflows</h3>
          <p className="text-xs text-stone-500">Quick links to front desk operations</p>

          <div className="pt-2 space-y-2.5">
            <button
              onClick={() => navigate('/user/patients')}
              className="w-full p-3 rounded-xl bg-brand-teal-subtle hover:bg-brand-teal/15 border border-brand-teal/20 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-teal text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-dark">Register Patient (Name & Mobile)</div>
                  <div className="text-[11px] text-stone-500">Enroll new child into clinic</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-teal group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/user/workspace')}
              className="w-full p-3 rounded-xl bg-brand-sage-subtle hover:bg-brand-sage/40 border border-brand-sage/50 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-dark text-brand-sand flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-dark">Visit Workspace Prep</div>
                  <div className="text-[11px] text-stone-500">View patient details & past history</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-dark group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Recently Registered Children List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-border/70 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-brand-dark">Recently Enrolled Patients</h3>
              <p className="text-xs text-stone-500">Child directory list</p>
            </div>
            <button
              onClick={() => navigate('/user/patients')}
              className="text-xs text-brand-teal font-bold hover:underline flex items-center gap-1"
            >
              <span>View Full Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-brand-dark font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Patient ID</th>
                  <th className="py-2.5 px-4">Child Name</th>
                  <th className="py-2.5 px-4">Mobile Number</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentPatients.map(p => (
                  <tr key={p.id} className="hover:bg-brand-sage-subtle/30">
                    <td className="py-3 px-4 font-mono font-bold text-stone-600">{p.id}</td>
                    <td className="py-3 px-4 font-bold text-brand-dark">{p.name}</td>
                    <td className="py-3 px-4 font-mono text-stone-700">{p.phone}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/user/workspace?patientId=${p.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-brand-teal/10 hover:bg-brand-teal text-brand-teal hover:text-white font-bold text-[11px] transition-colors"
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
