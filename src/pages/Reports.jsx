import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  IndianRupee, 
  AlertCircle, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  TrendingUp,
  PieChart as PieIcon,
  Users
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  getVisits, 
  getInvoices, 
  getPatients 
} from '../services/storage';
import { formatPaise } from '../utils/currency';
import { formatDate } from '../utils/date';
import { useToast } from '../context/ToastContext';

export default function Reports() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'monthly' | 'unpaid'
  const [visits, setVisits] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    setVisits(getVisits());
    setInvoices(getInvoices());
    setPatients(getPatients());
  }, []);

  // 1. Daily Visits Data
  const dailyVisitsMap = {};
  visits.forEach(v => {
    const dStr = v.date ? v.date.split('T')[0] : 'Unknown';
    dailyVisitsMap[dStr] = (dailyVisitsMap[dStr] || 0) + 1;
  });

  const dailyVisitsData = Object.keys(dailyVisitsMap)
    .sort()
    .slice(-10)
    .map(dateKey => ({
      date: formatDate(dateKey),
      visits: dailyVisitsMap[dateKey]
    }));

  // 2. Monthly Collections Data
  const monthlyCollectionsMap = {};
  invoices.filter(i => i.status !== 'Void').forEach(inv => {
    const mStr = inv.date ? inv.date.substring(0, 7) : 'Unknown'; // YYYY-MM
    monthlyCollectionsMap[mStr] = (monthlyCollectionsMap[mStr] || 0) + (inv.paidPaise || 0);
  });

  const monthlyCollectionsData = Object.keys(monthlyCollectionsMap)
    .sort()
    .map(monthKey => {
      const d = new Date(monthKey + "-01");
      const monthName = isNaN(d.getTime()) ? monthKey : d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      return {
        month: monthName,
        collectedRupees: monthlyCollectionsMap[monthKey] / 100
      };
    });

  // Payment Mode Breakdown
  let cashTotalPaise = 0;
  let onlineTotalPaise = 0;
  invoices.filter(i => i.status !== 'Void').forEach(inv => {
    (inv.payments || []).forEach(p => {
      if (p.mode === 'Cash') cashTotalPaise += (p.amountPaise || 0);
      else onlineTotalPaise += (p.amountPaise || 0);
    });
  });

  const paymentModeData = [
    { name: 'Online (UPI/GPay)', value: onlineTotalPaise / 100, color: '#416B66' },
    { name: 'Cash', value: cashTotalPaise / 100, color: '#D35E36' }
  ];

  // 3. Unpaid Balances Data
  const unpaidInvoices = invoices.filter(inv => inv.status === 'Issued' && (inv.balancePaise || 0) > 0);
  const totalUnpaidPaise = unpaidInvoices.reduce((sum, inv) => sum + (inv.balancePaise || 0), 0);

  // Client-Side CSV Exporter
  const handleExportCSV = (filename, rows) => {
    if (!rows.length) {
      addToast({ title: "No Data", message: "There are no records to export.", type: "warning" });
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        headers.map(field => {
          const val = row[field] !== undefined ? String(row[field]).replace(/"/g, '""') : '';
          return `"${val}"`;
        }).join(',')
      )
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      title: "CSV Exported",
      message: `Downloaded ${filename}.csv successfully.`,
      type: "success"
    });
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">
            Reports & Clinical Analytics
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Audit charts for patient footfall, collection ledgers, and outstanding dues
          </p>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (activeTab === 'daily') {
                const rows = visits.map(v => {
                  const p = patients.find(item => item.id === v.patientId);
                  return {
                    VisitID: v.id,
                    Date: formatDate(v.date),
                    PatientID: v.patientId,
                    PatientName: p?.name || '',
                    Phone: p?.phone || '',
                    WeightKg: v.vitals?.weightKg || '',
                    Complaint: v.complaint || ''
                  };
                });
                handleExportCSV("santosh_child_care_daily_visits", rows);
              } else if (activeTab === 'monthly') {
                const rows = invoices.map(i => {
                  const p = patients.find(item => item.id === i.patientId);
                  return {
                    InvoiceID: i.id,
                    Date: formatDate(i.date),
                    PatientName: p?.name || '',
                    TotalRupees: (i.totalPaise || 0) / 100,
                    PaidRupees: (i.paidPaise || 0) / 100,
                    BalanceRupees: (i.balancePaise || 0) / 100,
                    Status: i.status
                  };
                });
                handleExportCSV("santosh_child_care_collections", rows);
              } else {
                const rows = unpaidInvoices.map(i => {
                  const p = patients.find(item => item.id === i.patientId);
                  return {
                    InvoiceID: i.id,
                    Date: formatDate(i.date),
                    PatientName: p?.name || '',
                    Phone: p?.phone || '',
                    BalanceDueRupees: (i.balancePaise || 0) / 100
                  };
                });
                handleExportCSV("santosh_child_care_unpaid_balances", rows);
              }
            }}
            className="px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-300 text-xs font-bold text-stone-800 rounded-xl transition-all flex items-center gap-2 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-brand-teal hover:bg-brand-teal-light text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs"
          >
            <Printer className="w-4 h-4 text-brand-sand" />
            <span>Export PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-border/80 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('daily')}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'daily'
              ? 'text-brand-dark font-extrabold border-b-2 border-brand-teal'
              : 'text-stone-500 hover:text-brand-dark'
          }`}
        >
          <Calendar className="w-4 h-4 text-brand-teal" />
          <span>Daily Visits</span>
        </button>

        <button
          onClick={() => setActiveTab('monthly')}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'monthly'
              ? 'text-brand-dark font-extrabold border-b-2 border-brand-teal'
              : 'text-stone-500 hover:text-brand-dark'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-brand-teal" />
          <span>Monthly Collections</span>
        </button>

        <button
          onClick={() => setActiveTab('unpaid')}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'unpaid'
              ? 'text-brand-dark font-extrabold border-b-2 border-brand-teal'
              : 'text-stone-500 hover:text-brand-dark'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>Unpaid Balances</span>
          {unpaidInvoices.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center font-bold">
              {unpaidInvoices.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Daily Visits */}
      {activeTab === 'daily' && (
        <div className="space-y-6 animate-fade-in">
          {/* Chart */}
          <div className="bg-white rounded-2xl p-6 border border-brand-border/70 shadow-soft">
            <h3 className="font-bold text-base text-brand-dark mb-1">Recent Daily Patient Footfall</h3>
            <p className="text-xs text-stone-500 mb-4">Number of children examined per clinic day</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyVisitsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0eb" />
                  <XAxis dataKey="date" stroke="#646756" fontSize={11} tickLine={false} />
                  <YAxis allowDecimals={false} stroke="#646756" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#2A4343', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                  />
                  <Bar dataKey="visits" name="Visits" fill="#416B66" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Visits Table */}
          <div className="bg-white rounded-2xl border border-brand-border/70 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-stone-200 font-bold text-sm text-brand-dark">
              Visits Log ({visits.length} consultations)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-brand-dark font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Visit ID</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Patient</th>
                    <th className="py-2.5 px-4">Chief Complaint</th>
                    <th className="py-2.5 px-4">Weight</th>
                    <th className="py-2.5 px-4">Medicines Prescribed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {visits.map(v => {
                    const p = patients.find(item => item.id === v.patientId);
                    return (
                      <tr key={v.id} className="hover:bg-brand-sage-subtle/40">
                        <td className="py-3 px-4 font-mono font-bold text-stone-600">{v.id}</td>
                        <td className="py-3 px-4 text-stone-600">{formatDate(v.date)}</td>
                        <td className="py-3 px-4 font-bold text-brand-dark">{p?.name || 'Unknown'}</td>
                        <td className="py-3 px-4 text-stone-700 max-w-xs truncate">{v.complaint || '-'}</td>
                        <td className="py-3 px-4 font-semibold text-brand-dark">{v.vitals?.weightKg ? `${v.vitals.weightKg} kg` : '-'}</td>
                        <td className="py-3 px-4 text-stone-600">{v.prescription?.length || 0} drugs</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Monthly Collections */}
      {activeTab === 'monthly' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-brand-border/70 shadow-soft">
              <h3 className="font-bold text-base text-brand-dark mb-1">Monthly Clinic Revenue (₹)</h3>
              <p className="text-xs text-stone-500 mb-4">Total payments received per month</p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyCollectionsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0eb" />
                    <XAxis dataKey="month" stroke="#646756" fontSize={11} tickLine={false} />
                    <YAxis stroke="#646756" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Collections']}
                      contentStyle={{ backgroundColor: '#2A4343', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                    />
                    <Bar dataKey="collectedRupees" name="Collections (₹)" fill="#D35E36" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Mode Breakup */}
            <div className="bg-white rounded-2xl p-6 border border-brand-border/70 shadow-soft flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-brand-dark mb-1">Collection by Mode</h3>
                <p className="text-xs text-stone-500 mb-4">Cash vs Online UPI breakdown</p>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentModeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {paymentModeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-200 text-xs">
                {paymentModeData.map((mode, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: mode.color }} />
                      <span className="font-medium text-stone-700">{mode.name}</span>
                    </span>
                    <span className="font-bold text-brand-dark">₹{mode.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Unpaid Balances */}
      {activeTab === 'unpaid' && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Box */}
          <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Pending Receivables Summary</span>
              </div>
              <h3 className="text-3xl font-black mt-1 text-amber-950">
                {formatPaise(totalUnpaidPaise)}
              </h3>
              <p className="text-xs text-amber-800 mt-1">
                Outstanding balance from {unpaidInvoices.length} patient bills.
              </p>
            </div>
          </div>

          {/* Unpaid Table */}
          <div className="bg-white rounded-2xl border border-brand-border/70 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-brand-dark font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Patient Name</th>
                    <th className="py-2.5 px-4">Parent Phone</th>
                    <th className="py-2.5 px-4">Total Billed</th>
                    <th className="py-2.5 px-4">Paid</th>
                    <th className="py-2.5 px-4 font-bold text-amber-800">Balance Pending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {unpaidInvoices.length > 0 ? (
                    unpaidInvoices.map(inv => {
                      const p = patients.find(item => item.id === inv.patientId);
                      return (
                        <tr key={inv.id} className="hover:bg-amber-50/40">
                          <td className="py-3 px-4 font-mono font-bold text-brand-dark">{inv.id}</td>
                          <td className="py-3 px-4 text-stone-600">{formatDate(inv.date)}</td>
                          <td className="py-3 px-4 font-bold text-brand-dark">{p?.name || 'Unknown'}</td>
                          <td className="py-3 px-4 font-mono text-stone-700">{p?.phone || '-'}</td>
                          <td className="py-3 px-4 text-stone-700 font-medium">{formatPaise(inv.totalPaise)}</td>
                          <td className="py-3 px-4 text-emerald-700 font-semibold">{formatPaise(inv.paidPaise)}</td>
                          <td className="py-3 px-4 font-extrabold text-amber-900 bg-amber-50/60">
                            {formatPaise(inv.balancePaise)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-stone-400 italic">
                        No outstanding balances! All issued bills have been settled.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
