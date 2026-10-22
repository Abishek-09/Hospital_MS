import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  Search, 
  UserPlus, 
  Stethoscope, 
  Calendar, 
  Phone, 
  MapPin, 
  ChevronRight, 
  Filter, 
  ArrowUpDown,
  History,
  Clock,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { 
  getPatients, 
  getVisits, 
  getInvoices 
} from '../services/storage';
import { getPatientAgeDisplay, formatDate } from '../utils/date';
import { formatPaise } from '../utils/currency';
import AddPatientModal from '../components/modals/AddPatientModal';

export default function PatientsDirectory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSex, setFilterSex] = useState('All');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  const isDoctorRoute = location.pathname.startsWith('/admin');

  const loadData = () => {
    setPatients(getPatients());
    setVisits(getVisits());
    setInvoices(getInvoices());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('scc_storage_change', loadData);
    return () => window.removeEventListener('scc_storage_change', loadData);
  }, []);

  // Filter patients by search term and sex
  const filteredPatients = patients.filter((patient) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term ||
      patient.name.toLowerCase().includes(term) ||
      patient.phone.includes(term) ||
      patient.id.toLowerCase().includes(term) ||
      (patient.address && patient.address.toLowerCase().includes(term));

    const matchesSex = filterSex === 'All' || patient.sex === filterSex;

    return matchesSearch && matchesSex;
  });

  const getPatientLastVisit = (patientId) => {
    const patientVisits = visits.filter(v => v.patientId === patientId);
    if (!patientVisits.length) return null;
    return patientVisits.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  };

  const getPatientPendingBalance = (patientId) => {
    const patientInvoices = invoices.filter(i => i.patientId === patientId && i.status === 'Issued');
    return patientInvoices.reduce((sum, inv) => sum + (inv.balancePaise || 0), 0);
  };

  const handlePatientCreated = (newPatient) => {
    if (isDoctorRoute) {
      navigate(`/admin/workspace?patientId=${newPatient.id}`);
    } else {
      navigate(`/user/workspace?patientId=${newPatient.id}`);
    }
  };

  const handleConsult = (patientId) => {
    if (isDoctorRoute) {
      navigate(`/admin/workspace?patientId=${patientId}`);
    } else {
      navigate(`/user/workspace?patientId=${patientId}`);
    }
  };

  const handleViewHistory = (patientId) => {
    if (isDoctorRoute) {
      navigate(`/admin/patient-history?patientId=${patientId}`);
    } else {
      navigate(`/user/workspace?patientId=${patientId}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-[1600px] mx-auto">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#2A4343] tracking-tight">
            Patients Directory (Doctor View)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage child patient profiles, approximate age calculations, and visit histories
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isDoctorRoute ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs">
              <ShieldAlert className="w-4 h-4 text-[#416B66]" />
              <span>Registration managed by Front Desk</span>
            </div>
          ) : (
            <button
              onClick={() => setIsAddPatientOpen(true)}
              className="px-4 py-2.5 bg-[#D35E36] hover:bg-[#b54c2a] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>Register New Patient</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Child Name (or தமிழ்), Phone, or Patient ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:border-[#416B66] focus:ring-2 focus:ring-[#416B66]/20 transition-all"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['All', 'Male', 'Female'].map((sex) => (
            <button
              key={sex}
              onClick={() => setFilterSex(sex)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterSex === sex
                  ? 'bg-[#416B66] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sex}
            </button>
          ))}
          <span className="text-xs text-slate-500 ml-2 font-mono font-semibold">
            ({filteredPatients.length} records)
          </span>
        </div>
      </div>

      {/* Patients Table Card with Horizontal Scroll Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Scrollable Container with custom scrollbar and padding */}
        <div className="overflow-x-auto w-full pb-4 custom-scrollbar">
          <table className="w-full min-w-[1400px] text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[#2A4343] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap w-28">Patient ID</th>
                <th className="py-3.5 px-4 min-w-[220px]">Child Name</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">Age / Sex</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">Parent Phone</th>
                <th className="py-3.5 px-4 min-w-[240px]">Residential Address</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[200px]">Last Consultation</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[190px]">Outstanding Balance</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap sticky right-0 bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] z-20 min-w-[200px]">
                  Consultation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => {
                  const lastVisit = getPatientLastVisit(patient.id);
                  const pendingPaise = getPatientPendingBalance(patient.id);

                  return (
                    <tr 
                      key={patient.id} 
                      className="group hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600 whitespace-nowrap">
                        {patient.id}
                      </td>
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="font-bold text-[#2A4343] text-sm">
                          {patient.name}
                        </div>
                        {patient.dob && (
                          <div className="text-[10px] text-slate-400 font-medium">
                            DOB: {formatDate(patient.dob)}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-medium border border-slate-200">
                          {getPatientAgeDisplay(patient)} • {patient.sex}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 font-medium whitespace-nowrap">
                        {patient.phone}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 min-w-[240px] max-w-sm truncate">
                        {patient.address || 'Ambalai'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[200px]">
                        {lastVisit ? (
                          <div>
                            <div className="font-semibold text-slate-800">{formatDate(lastVisit.date)}</div>
                            <div className="text-[10px] text-slate-500 truncate max-w-xs">{lastVisit.complaint || 'Routine checkup'}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No visits yet</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[190px]">
                        {pendingPaise > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <AlertCircle className="w-3 h-3" />
                            {formatPaise(pendingPaise)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">₹0.00</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50/80 transition-colors shadow-[-4px_0_10px_rgba(0,0,0,0.05)] z-10 min-w-[200px]">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewHistory(patient.id)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 border border-slate-200"
                            title="View Patient Details & History"
                          >
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>History</span>
                          </button>
                          <button
                            onClick={() => handleConsult(patient.id)}
                            className="px-3 py-1.5 bg-[#416B66] hover:bg-[#335551] text-white text-xs font-bold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
                          >
                            <Stethoscope className="w-3.5 h-3.5 text-[#F1D49A]" />
                            <span>Consult</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No matching patients found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try searching with a different name or phone number.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal (Available when triggered) */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onPatientCreated={handlePatientCreated}
      />
    </div>
  );
}
