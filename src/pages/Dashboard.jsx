import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CalendarCheck, 
  IndianRupee, 
  AlertCircle, 
  ArrowUpRight, 
  TrendingUp, 
  Stethoscope, 
  Printer, 
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  getPatients, 
  getVisits, 
  getInvoices 
} from '../services/storage';
import { formatPaise } from '../utils/currency';
import { formatDate, getPatientAgeDisplay } from '../utils/date';
import PrescriptionPrintModal from '../components/print/PrescriptionPrintModal';
import ReceiptPrintModal from '../components/print/ReceiptPrintModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Print Modals
  const [selectedVisitForPrint, setSelectedVisitForPrint] = useState(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);
  const [printPatient, setPrintPatient] = useState(null);

  const loadData = () => {
    setPatients(getPatients() || []);
    setVisits(getVisits() || []);
    setInvoices(getInvoices() || []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('scc_storage_change', loadData);
    return () => window.removeEventListener('scc_storage_change', loadData);
  }, []);

  // Calculate Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisits = (visits || []).filter(v => v?.date && typeof v.date === 'string' && v.date.startsWith(todayStr));
  
  // Today's collections from invoices created today
  const todayInvoices = (invoices || []).filter(inv => inv?.date && typeof inv.date === 'string' && inv.date.startsWith(todayStr) && inv.status !== 'Void');
  const todayCollectionPaise = todayInvoices.reduce((sum, inv) => sum + (Number(inv?.paidPaise) || 0), 0);

  // Total unpaid balances across all active issued invoices
  const unpaidInvoices = (invoices || []).filter(inv => inv?.status === 'Issued' && (inv.balancePaise || 0) > 0);
  const totalUnpaidPaise = unpaidInvoices.reduce((sum, inv) => sum + (Number(inv?.balancePaise) || 0), 0);

  // Prepare 7-Day Collections Trend for Recharts
  const last7DaysData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

    const dayInvoices = (invoices || []).filter(inv => inv?.date && typeof inv.date === 'string' && inv.date.startsWith(dateKey) && inv.status !== 'Void');
    const dayCollectionPaise = dayInvoices.reduce((sum, inv) => sum + (Number(inv?.paidPaise) || 0), 0);
    const dayVisitsCount = (visits || []).filter(v => v?.date && typeof v.date === 'string' && v.date.startsWith(dateKey)).length;

    last7DaysData.push({
      date: dayLabel,
      collectionRupees: dayCollectionPaise / 100,
      visits: dayVisitsCount
    });
  }

  // Filtered recent visits
  const recentVisits = [...(visits || [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  const handleOpenRxPrint = (visit) => {
    const patient = (patients || []).find(p => p.id === visit.patientId);
    setSelectedVisitForPrint(visit);
    setPrintPatient(patient);
  };

  const handleOpenReceiptPrint = (invoiceId, patientId) => {
    const inv = (invoices || []).find(i => i.id === invoiceId);
    const patient = (patients || []).find(p => p.id === patientId);
    if (inv && patient) {
      setSelectedInvoiceForPrint(inv);
      setPrintPatient(patient);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Top Welcome Banner */}
      <div className="w-full bg-[#2A4343] text-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[#F1D49A] text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Santosh Child Care Consultation Console
          </div>
          <h2 className="text-2xl font-black text-white mt-1 break-words">
            Welcome, Dr. B. Sivakumar
          </h2>
          <p className="text-slate-300 text-xs mt-1 max-w-xl break-words text-balance">
            You have <strong className="text-[#F1D49A] font-bold">{todayVisits.length} pediatric consultations</strong> recorded today. All bills and prescriptions are synced locally.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate('/admin/workspace')}
            className="w-full md:w-auto px-5 py-2.5 bg-[#D35E36] hover:bg-[#b54c2a] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Stethoscope className="w-4 h-4 text-[#F1D49A]" />
            <span>Open Clinical Workspace</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Visits */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 break-words transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Today's Visits
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#416B66]/10 text-[#416B66] flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2A4343]">
              {todayVisits.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Patients</span>
          </div>
          <div className="mt-2 text-[11px] text-[#416B66] flex items-center gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Clinic Timing: 1:00 PM – 9:00 PM</span>
          </div>
        </div>

        {/* Card 2: Today's Collection */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 break-words transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Today's Collection
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#2A4343]">
              {formatPaise(todayCollectionPaise)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span>{todayInvoices.length} invoices cleared today</span>
          </div>
        </div>

        {/* Card 3: Unpaid Balances */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 break-words transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Unpaid Balances
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              totalUnpaidPaise > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'
            }`}>
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-3xl font-extrabold ${totalUnpaidPaise > 0 ? 'text-amber-800' : 'text-[#2A4343]'}`}>
              {formatPaise(totalUnpaidPaise)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Across {unpaidInvoices.length} patient bills
          </div>
        </div>

        {/* Card 4: Total Patients Directory */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 break-words transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Enrolled
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F1D49A]/30 text-[#2A4343] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2A4343]">
              {(patients || []).length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Child Records</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>Offline persistent</span>
            <button 
              onClick={() => navigate('/admin/patients')}
              className="text-[#416B66] font-bold hover:underline inline-flex items-center gap-0.5"
            >
              View Directory <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Grid: 7-Day Collections Chart + Quick Navigation */}
      {/* Middle Grid: 7-Day Collections Chart + Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collections Chart (2 cols) */}
        <div className="lg:col-span-2 w-full bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-base text-[#2A4343]">7-Day Revenue & Footfall Trend</h3>
              <p className="text-xs text-slate-500">Daily collections in Rupees (₹) and patient visits</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-[#2A4343]">
                <span className="w-3 h-3 rounded-full bg-[#416B66] inline-block"></span>
                Collection (₹)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7DaysData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenueDashboard" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#416B66" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#416B66" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ 
                    backgroundColor: '#2A4343', 
                    borderRadius: '8px', 
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px' 
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="collectionRupees" 
                  stroke="#416B66" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorRevenueDashboard)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Clinic Status Card */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#2A4343]">Doctor Quick Actions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Frequent clinical workflows</p>

            <div className="mt-4 space-y-2.5">
              <button
                onClick={() => navigate('/admin/workspace')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-[#416B66]/10 border border-slate-200 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#416B66] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2A4343]">New Pediatric Visit</div>
                    <div className="text-[11px] text-slate-500">Record vitals, diagnosis & Rx</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#416B66] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/admin/patients')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-[#416B66]/10 border border-slate-200 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2A4343] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2A4343]">Search Patient Directory</div>
                    <div className="text-[11px] text-slate-500">Check previous visit history</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#2A4343] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/admin/reports')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-[#D35E36]/10 border border-slate-200 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D35E36] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2A4343]">Daily & Monthly Reports</div>
                    <div className="text-[11px] text-slate-500">Export CSV collections audit</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#D35E36] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
            <span className="font-bold text-[#2A4343]">Clinic Timing:</span> 1:00 PM – 9:00 PM Daily.
            <div className="text-slate-500 text-[10px] mt-0.5">7, College Road, Ambalai (8300 44 2584)</div>
          </div>
        </div>
      </div>

      {/* Recent Visits & Consultations Table */}
      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-[#2A4343]">Recent Consultations</h3>
            <p className="text-xs text-slate-500">Latest pediatric visits recorded</p>
          </div>
          <button
            onClick={() => navigate('/admin/patients')}
            className="text-xs text-[#416B66] font-bold hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Patients Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto w-full pb-2 custom-scrollbar">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-brand-dark font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Age / Sex</th>
                <th className="py-3 px-4">Visit Date & Time</th>
                <th className="py-3 px-4">Chief Complaint</th>
                <th className="py-3 px-4">Weight</th>
                <th className="py-3 px-4">Status / Bill</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentVisits.map((visit) => {
                const patient = (patients || []).find(p => p.id === visit.patientId);
                const invoice = (invoices || []).find(i => i.id === visit.invoiceId);
                const hasRx = visit.prescription && visit.prescription.length > 0;

                return (
                  <tr key={visit.id} className="hover:bg-brand-sage-subtle/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-brand-dark text-sm">
                        {patient?.name || 'Unknown Patient'}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        {patient?.phone} • {patient?.id}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-stone-700">
                      {patient ? `${getPatientAgeDisplay(patient)} / ${patient.sex || 'Child'}` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {formatDate(visit.date)}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-stone-700 font-medium">
                      {visit.complaint || 'General Checkup'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-brand-dark">
                      {visit.vitals?.weightKg ? `${visit.vitals.weightKg} kg` : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {invoice ? (
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            invoice.status === 'Void'
                              ? 'bg-red-100 text-red-800'
                              : invoice.balancePaise === 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {invoice.status === 'Void' ? 'Void' : invoice.balancePaise === 0 ? 'Paid' : `Bal: ${formatPaise(invoice.balancePaise)}`}
                          </span>
                          <div className="text-[10px] text-stone-400 font-mono mt-0.5">{invoice.id}</div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-stone-400">No bill</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasRx && (
                          <button
                            onClick={() => handleOpenRxPrint(visit)}
                            title="Print Prescription"
                            className="p-1.5 rounded-lg text-stone-600 hover:text-brand-orange hover:bg-stone-100 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/admin/workspace?patientId=${visit.patientId}&visitId=${visit.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-brand-teal/10 hover:bg-brand-teal hover:text-white text-brand-teal font-semibold text-xs transition-colors"
                        >
                          View / Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals for Print */}
      {selectedVisitForPrint && printPatient && (
        <PrescriptionPrintModal
          isOpen={!!selectedVisitForPrint}
          onClose={() => setSelectedVisitForPrint(null)}
          visit={selectedVisitForPrint}
          patient={printPatient}
        />
      )}

      {selectedInvoiceForPrint && printPatient && (
        <ReceiptPrintModal
          isOpen={!!selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
          invoice={selectedInvoiceForPrint}
          patient={printPatient}
        />
      )}
    </div>
  );
}
