import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  Search, 
  Phone, 
  MapPin, 
  Calendar, 
  Stethoscope, 
  Printer, 
  Receipt, 
  Sparkles, 
  Weight, 
  Activity, 
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertCircle,
  X
} from 'lucide-react';
import { getPatients, getVisitsForPatient, getInvoices, getClinicSettings } from '../../services/storage';
import { formatDate, getPatientAgeDisplay } from '../../utils/date';
import { formatPaise } from '../../utils/currency';
import PrescriptionPrintModal from '../../components/print/PrescriptionPrintModal';
import ReceiptPrintModal from '../../components/print/ReceiptPrintModal';

export default function AdminPatientHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientIdParam = searchParams.get('patientId');

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Print Modals
  const [selectedVisitForPrint, setSelectedVisitForPrint] = useState(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);

  const loadData = () => {
    const list = getPatients() || [];
    setPatients(list);
    setInvoices(getInvoices() || []);

    if (patientIdParam) {
      const p = list.find(item => item.id === patientIdParam);
      if (p) setSelectedPatient(p);
      else if (list.length > 0) setSelectedPatient(list[0]);
    } else if (list.length > 0) {
      setSelectedPatient(list[0]);
      setSearchParams({ patientId: list[0].id }, { replace: true });
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('scc_storage_change', loadData);
    return () => window.removeEventListener('scc_storage_change', loadData);
  }, [patientIdParam]);

  useEffect(() => {
    if (selectedPatient) {
      const history = getVisitsForPatient(selectedPatient.id) || [];
      // Sort newest first
      setPatientHistory(history.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } else {
      setPatientHistory([]);
    }
  }, [selectedPatient]);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearchParams({ patientId: patient.id }, { replace: true });
  };

  const filteredPatients = (patients || []).filter(p => {
    if (!p) return false;
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase().trim();
    const nameMatch = p.name ? String(p.name).toLowerCase().includes(term) : false;
    const phoneMatch = p.phone ? String(p.phone).includes(term) : false;
    const idMatch = p.id ? String(p.id).toLowerCase().includes(term) : false;
    return nameMatch || phoneMatch || idMatch;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 border border-brand-border/70 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-dark text-brand-sand flex items-center justify-center font-bold">
            <Clock className="w-5 h-5 text-brand-sand" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              Doctor Clinical Records
            </div>
            <h2 className="text-lg font-black text-brand-dark tracking-tight">
              Patient Details & Medical History
            </h2>
          </div>
        </div>

        {/* Quick Patient Switcher & Search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <select
              value={selectedPatient?.id || ''}
              onChange={(e) => {
                const p = patients.find(item => item.id === e.target.value);
                if (p) handleSelectPatient(p);
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-brand-teal cursor-pointer"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => navigate('/admin/patients')}
            className="px-3 py-2 border border-stone-300 hover:border-brand-teal text-xs font-semibold text-stone-700 rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Users className="w-3.5 h-3.5 text-brand-teal" />
            <span>All Patients</span>
          </button>
        </div>
      </div>

      {/* Patient Search Bar (Keep only search box) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3.5">
        <div ref={searchContainerRef} className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search child by name (or தமிழ்), phone number, or ID to inspect history..."
            value={searchFilter}
            onChange={(e) => {
              setSearchFilter(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full pl-10 pr-9 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#416B66] bg-slate-50 focus:bg-white transition-all font-medium text-slate-800"
          />
          {searchFilter && (
            <button
              type="button"
              onClick={() => {
                setSearchFilter('');
                setIsSearchOpen(false);
              }}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Autocomplete Results Dropdown */}
          {isSearchOpen && searchFilter.trim() && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-lg z-40 max-h-64 overflow-y-auto divide-y divide-slate-100">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      handleSelectPatient(p);
                      setSearchFilter('');
                      setIsSearchOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors group"
                  >
                    <div>
                      <span className="font-bold text-slate-800 group-hover:text-[#416B66]">
                        {p.name}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-2 font-mono">
                        {p.phone}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 group-hover:bg-[#416B66]/10 px-2 py-0.5 rounded text-slate-600 font-bold">
                      {p.id}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">
                  No patient found matching "{searchFilter}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedPatient ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ==================== LEFT COLUMN: Patient Card & Vitals Timeline ==================== */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Patient Profile Card (Exact match to screenshot left card) */}
            <div className="bg-white rounded-2xl p-5 border border-brand-border/70 shadow-soft">
              <div className="flex items-start justify-between border-b border-stone-100 pb-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-brand-dark">
                      {selectedPatient.name}
                    </h3>
                    <span className="text-xs font-mono font-bold bg-brand-sand/60 text-brand-dark px-2 py-0.5 rounded">
                      {selectedPatient.id}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-1.5">
                    <span>Phone: <strong className="text-stone-700">{selectedPatient.phone}</strong></span>
                    <span>•</span>
                    <span>{selectedPatient.address || '7, College Road Cross, Ambalai'}</span>
                    <span>•</span>
                    <span className="text-brand-teal font-semibold">{patientHistory.length} previous visits</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-brand-teal-subtle text-brand-teal text-xs font-bold">
                    {getPatientAgeDisplay(selectedPatient)}
                  </span>
                  <div className="text-[11px] text-stone-500 font-semibold mt-0.5">
                    {selectedPatient.sex || 'Child'}
                  </div>
                </div>
              </div>

              {/* 2. Weight & Vitals Timeline (Exact match to screenshot small cards) */}
              <div className="mt-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center justify-between">
                  <span>Weight & Vitals Timeline</span>
                  <span className="text-[10px] text-brand-teal font-semibold">Growth history</span>
                </div>
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {patientHistory.filter(v => v.vitals?.weightKg).length > 0 ? (
                    patientHistory
                      .filter(v => v.vitals?.weightKg)
                      .slice(0, 6)
                      .map((v, i) => (
                        <div 
                          key={i} 
                          className="bg-brand-sage-subtle border border-brand-sage/60 rounded-xl p-2.5 shrink-0 text-center min-w-[76px] shadow-xs"
                        >
                          <span className="block text-xs font-extrabold text-brand-dark">
                            {v.vitals.weightKg} kg
                          </span>
                          <span className="block text-[10px] text-stone-500 mt-0.5">
                            {formatDate(v.date).split(' ')[0]} {formatDate(v.date).split(' ')[1]}
                          </span>
                        </div>
                      ))
                  ) : (
                    <div className="text-xs text-stone-400 italic py-2">
                      No past weight records recorded yet
                    </div>
                  )}
                </div>
              </div>

              {/* Registration & Clinic Meta */}
              <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>Enrolled via Front Desk</span>
                <span className="font-semibold text-brand-dark">Santosh Child Care</span>
              </div>
            </div>

            {/* Quick Consultation CTA */}
            <div className="bg-gradient-to-tr from-brand-dark to-brand-teal text-white rounded-2xl p-5 shadow-card space-y-3">
              <div className="flex items-center gap-2 text-brand-sand text-xs font-bold uppercase tracking-wider">
                <Stethoscope className="w-4 h-4" />
                <span>Pediatric Consultation</span>
              </div>
              <h4 className="text-base font-extrabold leading-snug">
                Ready to consult {selectedPatient.name}?
              </h4>
              <p className="text-xs text-stone-200">
                Launch the consultation desk to record vitals, chief complaints, prescribe medicines, and issue bills.
              </p>
              <button
                onClick={() => navigate(`/admin/workspace?patientId=${selectedPatient.id}`)}
                className="w-full py-2.5 px-4 bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Launch Clinical Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ==================== RIGHT COLUMN: Detailed Past Medical History Timeline ==================== */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-brand-border/70 shadow-soft">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                <h3 className="font-extrabold text-base text-brand-dark flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-teal" />
                  <span>Past Medical History ({patientHistory.length} Visits)</span>
                </h3>
                <span className="text-xs text-stone-500">
                  Chronological records
                </span>
              </div>

              <div className="space-y-4">
                {patientHistory.length > 0 ? (
                  patientHistory.map((pastVisit) => {
                    const invoice = invoices.find(inv => inv.id === pastVisit.invoiceId || inv.visitId === pastVisit.id);
                    const hasRx = pastVisit.prescription && pastVisit.prescription.length > 0;

                    return (
                      <div 
                        key={pastVisit.id}
                        className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-white hover:border-brand-teal/40 transition-all text-xs space-y-3 shadow-xs"
                      >
                        {/* Header: Date, Visit ID, Invoice Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-brand-teal" />
                            <span className="font-extrabold text-brand-dark text-sm">
                              {formatDate(pastVisit.date)}
                            </span>
                            <span className="font-mono text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">
                              {pastVisit.id}
                            </span>
                          </div>

                          {invoice && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              invoice.status === 'Void'
                                ? 'bg-red-100 text-red-800'
                                : (invoice.balancePaise || 0) === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {invoice.status === 'Void' ? 'Void' : (invoice.balancePaise || 0) === 0 ? 'Paid' : `Bal: ${formatPaise(invoice.balancePaise)}`}
                            </span>
                          )}
                        </div>

                        {/* Complaint */}
                        {pastVisit.complaint && (
                          <div className="text-stone-700 bg-white p-2.5 rounded-lg border border-stone-100">
                            <strong className="text-brand-dark block text-[11px] uppercase tracking-wider mb-0.5">Chief Complaint:</strong>
                            <p className="text-xs font-medium">{pastVisit.complaint}</p>
                          </div>
                        )}

                        {/* Vitals Summary Pill Row */}
                        {pastVisit.vitals && Object.values(pastVisit.vitals).some(v => v !== null && v !== '') && (
                          <div className="text-[11px] text-stone-700 flex flex-wrap gap-2 pt-1">
                            {pastVisit.vitals.weightKg && (
                              <span className="bg-brand-sage-subtle border border-brand-sage/60 px-2 py-0.5 rounded-md font-semibold">
                                Wt: <strong>{pastVisit.vitals.weightKg} kg</strong>
                              </span>
                            )}
                            {pastVisit.vitals.temperatureF && (
                              <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-amber-900 font-semibold">
                                Temp: <strong>{pastVisit.vitals.temperatureF}°F</strong>
                              </span>
                            )}
                            {pastVisit.vitals.spO2 && (
                              <span className="bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md text-blue-900 font-semibold">
                                SpO2: <strong>{pastVisit.vitals.spO2}%</strong>
                              </span>
                            )}
                            {pastVisit.vitals.pulseRate && (
                              <span className="bg-stone-100 px-2 py-0.5 rounded-md text-stone-700">
                                Pulse: <strong>{pastVisit.vitals.pulseRate} bpm</strong>
                              </span>
                            )}
                            {pastVisit.vitals.heightCm && (
                              <span className="bg-stone-100 px-2 py-0.5 rounded-md text-stone-700">
                                Ht: <strong>{pastVisit.vitals.heightCm} cm</strong>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Examination Notes */}
                        {pastVisit.notes && (
                          <div className="text-stone-600 text-xs italic">
                            Doctor Notes: {pastVisit.notes}
                          </div>
                        )}

                        {/* Prescription Summary */}
                        {hasRx && (
                          <div className="pt-2 border-t border-stone-200">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                                Prescribed Medicines:
                              </span>
                              <span className="text-[10px] text-stone-400 font-semibold">
                                {pastVisit.prescription.length} medicines
                              </span>
                            </div>
                            <ul className="space-y-1 bg-white p-2.5 rounded-lg border border-stone-100">
                              {pastVisit.prescription.map((rx, idx) => (
                                <li key={idx} className="text-xs text-stone-700 flex items-start gap-1.5">
                                  <span className="text-brand-orange font-bold">•</span>
                                  <div>
                                    <strong className="text-brand-dark">{rx.drugName}</strong>
                                    <span className="text-stone-500 ml-1">
                                      ({rx.dose || rx.strength || 'standard dose'}, {rx.frequency})
                                    </span>
                                    {rx.instructions && (
                                      <span className="text-[11px] text-brand-teal block">
                                        ↳ {rx.instructions}
                                      </span>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action Buttons for this visit */}
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-2">
                          {hasRx && (
                            <button
                              onClick={() => {
                                setSelectedVisitForPrint(pastVisit);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs flex items-center gap-1 transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5 text-stone-600" />
                              <span>Print Rx</span>
                            </button>
                          )}

                          {invoice && (
                            <button
                              onClick={() => {
                                setSelectedInvoiceForPrint(invoice);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs flex items-center gap-1 transition-colors"
                            >
                              <Receipt className="w-3.5 h-3.5 text-stone-600" />
                              <span>Print Receipt</span>
                            </button>
                          )}

                          <button
                            onClick={() => navigate(`/admin/workspace?patientId=${selectedPatient.id}&visitId=${pastVisit.id}`)}
                            className="px-2.5 py-1 rounded-lg bg-brand-teal/10 hover:bg-brand-teal hover:text-white text-brand-teal font-semibold text-xs transition-colors flex items-center gap-1"
                          >
                            <span>Open in Workspace</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-stone-400">
                    <Clock className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                    <p className="text-sm font-semibold text-stone-600">No previous consultations recorded</p>
                    <p className="text-xs text-stone-400 mt-0.5">This child has no prior visit history on file.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-brand-border/70 text-stone-400">
          <Users className="w-12 h-12 mx-auto text-stone-300 mb-2" />
          <p className="text-base font-bold text-stone-700">No Patient Selected</p>
          <p className="text-xs text-stone-500 mt-1">Select a patient above to view their clinical history and vitals timeline.</p>
        </div>
      )}

      {/* Print Modals */}
      {selectedVisitForPrint && selectedPatient && (
        <PrescriptionPrintModal
          isOpen={!!selectedVisitForPrint}
          onClose={() => setSelectedVisitForPrint(null)}
          visit={selectedVisitForPrint}
          patient={selectedPatient}
        />
      )}

      {selectedInvoiceForPrint && selectedPatient && (
        <ReceiptPrintModal
          isOpen={!!selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
          invoice={selectedInvoiceForPrint}
          patient={selectedPatient}
        />
      )}
    </div>
  );
}
