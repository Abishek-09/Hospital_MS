import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Stethoscope, 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RotateCcw, 
  IndianRupee, 
  Sparkles,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Receipt,
  AlertOctagon,
  FileCheck,
  Search,
  UserPlus,
  X
} from 'lucide-react';
import { 
  getPatients, 
  getVisitsForPatient, 
  getPatientById,
  saveVisit, 
  getInvoiceByVisitId,
  saveInvoice,
  issueInvoice,
  voidInvoice,
  getActiveVisitDraft,
  saveActiveVisitDraft,
  clearActiveVisitDraft,
  getClinicSettings
} from '../services/storage';
import { PEDIATRIC_DRUG_PRESETS, INSTRUCTION_PRESETS } from '../services/mockData';
import { formatPaise, rupeesToPaise, paiseToRupees, calculateInvoiceSummary } from '../utils/currency';
import { formatDate, getPatientAgeDisplay } from '../utils/date';
import { useToast } from '../context/ToastContext';
import PrescriptionPrintModal from '../components/print/PrescriptionPrintModal';
import ReceiptPrintModal from '../components/print/ReceiptPrintModal';
import VoidInvoiceModal from '../components/modals/VoidInvoiceModal';
import AddPatientModal from '../components/modals/AddPatientModal';

export default function VisitWorkspace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const settings = getClinicSettings();

  const patientIdParam = searchParams.get('patientId');
  const visitIdParam = searchParams.get('visitId');

  // Patients List for Patient Switcher
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
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

  const handlePatientCreated = (newPatient) => {
    const list = getPatients() || [];
    setPatients(list);
    setSelectedPatient(newPatient);
    setSearchParams({ patientId: newPatient.id }, { replace: true });
    setIsAddPatientModalOpen(false);
  };

  // Active Visit Form State
  const [visitId, setVisitId] = useState(null);
  const [complaint, setComplaint] = useState('');
  const [notes, setNotes] = useState('');
  const [vitals, setVitals] = useState({
    weightKg: '',
    heightCm: '',
    temperatureF: '',
    pulseRate: '',
    spO2: '',
    headCircumferenceCm: ''
  });

  // Prescription Builder State (dynamic rows)
  const [prescriptionRows, setPrescriptionRows] = useState([
    {
      drugName: '',
      strength: '',
      dose: '',
      frequency: '1-0-1 (BD)',
      duration: '3 days',
      quantity: '1 bottle',
      instructions: 'After food / உணவுக்கு பின்'
    }
  ]);

  // Billing Engine State (stored internally as integer paise)
  const [invoiceId, setInvoiceId] = useState(null);
  const [invoiceStatus, setInvoiceStatus] = useState('Draft'); // Draft, Issued, Void
  const [invoiceItems, setInvoiceItems] = useState([
    { id: 'item-1', description: 'Pediatric Consultation', type: 'Consultation', amountPaise: 30000 }
  ]);
  const [discountValue, setDiscountValue] = useState(0); // in Rupees
  const [discountType, setDiscountType] = useState('flat'); // 'flat' or 'percent'
  const [taxPercent, setTaxPercent] = useState(settings.taxPercent || 0); // default 0%
  const [paymentRows, setPaymentRows] = useState([
    { mode: 'Online (UPI/GPay)', amountPaise: 30000 }
  ]);

  // UI & Auto-Save States
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saving' | 'saved'
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState(null);
  const isInitialLoad = useRef(true);

  // Modals
  const [isRxPrintOpen, setIsRxPrintOpen] = useState(false);
  const [isReceiptPrintOpen, setIsReceiptPrintOpen] = useState(false);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);

  // Load Patients list
  useEffect(() => {
    const list = getPatients() || [];
    setPatients(list);

    if (patientIdParam) {
      const p = list.find(item => item.id === patientIdParam);
      if (p) {
        setSelectedPatient(p);
      } else if (list.length > 0) {
        setSelectedPatient(list[0]);
      }
    } else if (list.length > 0) {
      setSelectedPatient(list[0]);
      setSearchParams({ patientId: list[0].id }, { replace: true });
    }
  }, [patientIdParam]);

  // Load Patient Visits and Initial Data
  useEffect(() => {
    if (!selectedPatient) return;

    const history = getVisitsForPatient(selectedPatient.id);
    setPatientHistory(history);

    if (visitIdParam) {
      // Load specific existing visit
      const existingVisit = history.find(v => v.id === visitIdParam);
      if (existingVisit) {
        loadVisitIntoForm(existingVisit);
        return;
      }
    }

    // Check for existing unsaved draft in localStorage
    const savedDraft = getActiveVisitDraft(selectedPatient.id);
    if (savedDraft) {
      setVisitId(savedDraft.visitId || null);
      setComplaint(savedDraft.complaint || '');
      setNotes(savedDraft.notes || '');
      setVitals(savedDraft.vitals || { weightKg: '', heightCm: '', temperatureF: '', pulseRate: '', spO2: '', headCircumferenceCm: '' });
      setPrescriptionRows(savedDraft.prescriptionRows?.length ? savedDraft.prescriptionRows : [getEmptyRxRow()]);
      setInvoiceItems(savedDraft.invoiceItems || [{ id: 'item-1', description: 'Pediatric Consultation', type: 'Consultation', amountPaise: 30000 }]);
      setDiscountValue(savedDraft.discountValue || 0);
      setDiscountType(savedDraft.discountType || 'flat');
      setPaymentRows(savedDraft.paymentRows || [{ mode: 'Cash', amountPaise: 30000 }]);
      setAutoSaveStatus('saved');
      setLastAutoSavedTime(savedDraft.autoSavedAt);
    } else {
      // Initialize fresh visit for this patient
      resetActiveVisitForm();
    }
  }, [selectedPatient, visitIdParam]);

  const loadVisitIntoForm = (visit) => {
    setVisitId(visit.id);
    setComplaint(visit.complaint || '');
    setNotes(visit.notes || '');
    setVitals(visit.vitals || {});
    setPrescriptionRows(visit.prescription?.length ? visit.prescription : [getEmptyRxRow()]);

    if (visit.invoiceId) {
      const inv = getInvoiceByVisitId(visit.id);
      if (inv) {
        setInvoiceId(inv.id);
        setInvoiceStatus(inv.status);
        setInvoiceItems(inv.items || []);
        setDiscountValue(paiseToRupees(inv.discountPaise || 0));
        setTaxPercent(inv.taxPercent || 0);
        setPaymentRows(inv.payments || []);
      }
    } else {
      setInvoiceId(null);
      setInvoiceStatus('Draft');
    }
    setAutoSaveStatus('saved');
  };

  const resetActiveVisitForm = () => {
    setVisitId(null);
    setComplaint('');
    setNotes('');
    setVitals({
      weightKg: '',
      heightCm: '',
      temperatureF: '98.6',
      pulseRate: '105',
      spO2: '99',
      headCircumferenceCm: ''
    });
    setPrescriptionRows([getEmptyRxRow()]);
    setInvoiceId(null);
    setInvoiceStatus('Draft');
    setInvoiceItems([
      { id: 'item-1', description: 'Pediatric Consultation', type: 'Consultation', amountPaise: settings.defaultConsultationFeePaise || 30000 }
    ]);
    setDiscountValue(0);
    setDiscountType('flat');
    setPaymentRows([
      { mode: 'Online (UPI/GPay)', amountPaise: settings.defaultConsultationFeePaise || 30000 }
    ]);
    setAutoSaveStatus('saved');
  };

  const getEmptyRxRow = () => ({
    drugName: '',
    strength: '',
    dose: '',
    frequency: '1-0-1 (BD)',
    duration: '3 days',
    quantity: '1 bottle',
    instructions: 'After food / உணவுக்கு பின்'
  });

  // Debounced Auto-Save Draft to LocalStorage
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (!selectedPatient || invoiceStatus === 'Issued') return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      const draftPayload = {
        visitId,
        complaint,
        notes,
        vitals,
        prescriptionRows,
        invoiceItems,
        discountValue,
        discountType,
        paymentRows
      };
      saveActiveVisitDraft(selectedPatient.id, draftPayload);
      setAutoSaveStatus('saved');
      setLastAutoSavedTime(new Date().toISOString());
    }, 1200);

    return () => clearTimeout(timer);
  }, [complaint, notes, vitals, prescriptionRows, invoiceItems, discountValue, discountType, paymentRows]);

  // Billing Calculations (Integer Paise Engine)
  const financialSummary = calculateInvoiceSummary(
    invoiceItems,
    discountValue,
    discountType,
    taxPercent
  );

  const totalPaidPaise = paymentRows.reduce((sum, p) => sum + (Number(p.amountPaise) || 0), 0);
  const balanceDuePaise = Math.max(0, financialSummary.totalPaise - totalPaidPaise);

  // Sync default single payment amount to total if only 1 row exists and not locked
  const handleAutoAdjustPayment = () => {
    if (paymentRows.length === 1 && invoiceStatus !== 'Issued') {
      setPaymentRows([{ ...paymentRows[0], amountPaise: financialSummary.totalPaise }]);
    }
  };

  // Prescription Handlers
  const handleAddRxRow = () => {
    setPrescriptionRows(prev => [...prev, getEmptyRxRow()]);
  };

  const handleRemoveRxRow = (index) => {
    setPrescriptionRows(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleRxFieldChange = (index, field, value) => {
    setPrescriptionRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSelectDrugPreset = (index, preset) => {
    setPrescriptionRows(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        drugName: preset.name,
        strength: preset.strength,
        dose: preset.dose,
        frequency: preset.frequency,
        duration: preset.duration,
        quantity: preset.quantity,
        instructions: preset.instructions
      };
      return updated;
    });
  };

  // Billing Item Handlers
  const handleAddInvoiceItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      description: 'Medicine / Syrup',
      type: 'Medicine',
      amountPaise: 15000 // ₹150.00
    };
    setInvoiceItems(prev => [...prev, newItem]);
  };

  const handleRemoveInvoiceItem = (id) => {
    if (invoiceStatus === 'Issued') return;
    setInvoiceItems(prev => prev.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    if (invoiceStatus === 'Issued') return;
    setInvoiceItems(prev => prev.map(item => {
      if (item.id === id) {
        if (field === 'amountRupees') {
          return { ...item, amountPaise: rupeesToPaise(value) };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Payment Rows Handlers
  const handleAddPaymentRow = () => {
    if (invoiceStatus === 'Issued') return;
    setPaymentRows(prev => [...prev, { mode: 'Cash', amountPaise: balanceDuePaise }]);
  };

  const handleRemovePaymentRow = (index) => {
    if (invoiceStatus === 'Issued') return;
    setPaymentRows(prev => prev.filter((_, idx) => idx !== index));
  };

  const handlePaymentChange = (index, field, value) => {
    if (invoiceStatus === 'Issued') return;
    setPaymentRows(prev => {
      const updated = [...prev];
      if (field === 'amountRupees') {
        updated[index] = { ...updated[index], amountPaise: rupeesToPaise(value) };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  // Repeat Previous Prescription into Active Visit
  const handleRepeatPrescription = (pastVisit) => {
    if (!pastVisit.prescription || !pastVisit.prescription.length) return;
    setPrescriptionRows(pastVisit.prescription);
    addToast({
      title: "Prescription Copied",
      message: `Repeated ${pastVisit.prescription.length} medicines from visit dated ${formatDate(pastVisit.date)}`,
      type: "info"
    });
  };

  // Save Visit Action
  const handleSaveVisit = (shouldIssueInvoice = false) => {
    if (!selectedPatient) return;

    // Filter valid prescription rows
    const cleanedRx = prescriptionRows.filter(r => r.drugName.trim().length > 0);

    const visitPayload = {
      id: visitId || undefined,
      patientId: selectedPatient.id,
      date: new Date().toISOString(),
      complaint: complaint.trim(),
      notes: notes.trim(),
      vitals: {
        weightKg: vitals.weightKg ? parseFloat(vitals.weightKg) : null,
        heightCm: vitals.heightCm ? parseFloat(vitals.heightCm) : null,
        temperatureF: vitals.temperatureF ? parseFloat(vitals.temperatureF) : null,
        pulseRate: vitals.pulseRate ? parseInt(vitals.pulseRate) : null,
        spO2: vitals.spO2 ? parseInt(vitals.spO2) : null,
        headCircumferenceCm: vitals.headCircumferenceCm ? parseFloat(vitals.headCircumferenceCm) : null
      },
      prescription: cleanedRx,
      invoiceId: invoiceId || undefined,
      status: 'Completed'
    };

    const saved = saveVisit(visitPayload);
    setVisitId(saved.id);

    // Save Billing Invoice
    const invoicePayload = {
      id: invoiceId || undefined,
      visitId: saved.id,
      patientId: selectedPatient.id,
      date: new Date().toISOString(),
      items: invoiceItems,
      taxPercent: Number(taxPercent) || 0,
      taxPaise: financialSummary.taxPaise,
      discountPaise: financialSummary.discountPaise,
      totalPaise: financialSummary.totalPaise,
      payments: paymentRows,
      status: shouldIssueInvoice ? 'Issued' : (invoiceStatus || 'Draft')
    };

    const savedInv = saveInvoice(invoicePayload);
    setInvoiceId(savedInv.id);
    setInvoiceStatus(savedInv.status);

    // Attach invoiceId back to visit
    saved.invoiceId = savedInv.id;
    saveVisit(saved);

    // Clear Draft
    clearActiveVisitDraft(selectedPatient.id);

    addToast({
      title: shouldIssueInvoice ? "Visit Saved & Invoice Issued" : "Clinical Visit Saved",
      message: `Recorded visit ${saved.id} for ${selectedPatient.name}`,
      type: "success"
    });

    // Refresh history
    setPatientHistory(getVisitsForPatient(selectedPatient.id));
  };

  // Void Invoice Action
  const handleConfirmVoid = (id, reason) => {
    const voided = voidInvoice(id, reason);
    if (voided) {
      setInvoiceStatus('Void');
      addToast({
        title: "Invoice Voided",
        message: `Invoice ${id} has been marked Void. Reason: ${reason}`,
        type: "warning"
      });
    }
  };

  const activeVisitObject = {
    id: visitId || 'NEW-DRAFT',
    date: new Date().toISOString(),
    complaint,
    notes,
    vitals,
    prescription: prescriptionRows.filter(r => r.drugName.trim().length > 0)
  };

  const activeInvoiceObject = {
    id: invoiceId || 'DRAFT-INVOICE',
    date: new Date().toISOString(),
    items: invoiceItems,
    discountPaise: financialSummary.discountPaise,
    taxPercent: Number(taxPercent) || 0,
    taxPaise: financialSummary.taxPaise,
    totalPaise: financialSummary.totalPaise,
    payments: paymentRows,
    paidPaise: totalPaidPaise,
    balancePaise: balanceDuePaise,
    status: invoiceStatus
  };

  const isInvoiceIssued = invoiceStatus === 'Issued';

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
    <div className="w-full space-y-6 animate-fade-in">
      {/* Patient Search & New Patient Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Box with Autocomplete Dropdown */}
        <div ref={searchContainerRef} className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search child by name (or தமிழ்), phone number, or ID..."
            value={searchFilter}
            onChange={(e) => {
              setSearchFilter(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full pl-10 pr-9 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66] bg-slate-50 focus:bg-white transition-all font-medium"
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
                      setSelectedPatient(p);
                      setSearchParams({ patientId: p.id }, { replace: true });
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

        {/* Add New Patient Button */}
        <button
          type="button"
          onClick={() => setIsAddPatientModalOpen(true)}
          className="w-full sm:w-auto bg-[#D35E36] hover:bg-[#b54c2a] text-white px-5 py-2.5 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm shrink-0"
        >
          <UserPlus className="w-4 h-4 text-white" />
          <span>New patient</span>
        </button>
      </div>

      {/* Patient Switcher & Header Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-lg bg-[#2A4343] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <Stethoscope className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Active Clinical Workspace
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-extrabold text-base text-slate-800">
                {selectedPatient ? selectedPatient.name : 'Select a Patient'}
              </span>
              {selectedPatient && (
                <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                  {selectedPatient.id}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Patient Selector Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <select
              value={selectedPatient?.id || ''}
              onChange={(e) => {
                const p = patients.find(item => item.id === e.target.value);
                if (p) {
                  setSelectedPatient(p);
                  setSearchParams({ patientId: p.id });
                }
              }}
              className="w-full px-3 py-2 text-sm font-medium rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#416B66] cursor-pointer"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              resetActiveVisitForm();
              addToast({ title: "New Visit Initialized", message: "Cleared current inputs for a fresh visit", type: "info" });
            }}
            className="px-3.5 py-2 border border-slate-300 hover:border-[#416B66] text-xs font-semibold text-slate-700 rounded-md hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Visit</span>
          </button>
        </div>
      </div>

      {/* Main Split Screen Area: 12-Col Responsive Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6 items-start">
        {/* ==================== LEFT COLUMN (xl:col-span-5) ==================== */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          {/* Patient Details Card */}
          {selectedPatient && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
                    {selectedPatient.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Phone: <strong className="text-slate-800 font-medium">{selectedPatient.phone}</strong>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {selectedPatient.address || '7, College Road Cross, Ambalai'}
                  </p>
                  <span className="inline-block mt-2.5 text-xs font-semibold text-[#416B66] bg-[#416B66]/10 px-2.5 py-0.5 rounded">
                    {patientHistory.length} previous visits
                  </span>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                    {getPatientAgeDisplay(selectedPatient)}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold mt-1">
                    {selectedPatient.sex || 'Child'}
                  </span>
                </div>
              </div>

              {/* Weight Growth Track History */}
              {patientHistory.filter(v => v.vitals?.weightKg).length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Weight Growth Track
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {patientHistory
                      .filter(v => v.vitals?.weightKg)
                      .slice(0, 5)
                      .map((v, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-2 shrink-0 text-center min-w-[70px]">
                          <span className="block text-xs font-bold text-slate-800">
                            {v.vitals.weightKg} kg
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            {formatDate(v.date).split(' ')[0]} {formatDate(v.date).split(' ')[1]}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Past Medical History Timeline Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                <Clock className="w-4 h-4 text-[#416B66]" />
                <span>Past Medical History ({patientHistory.length})</span>
              </h3>
            </div>

            <div className="max-h-60 overflow-y-auto pr-1 space-y-4">
              {patientHistory.length > 0 ? (
                patientHistory.map((pastVisit) => (
                  <div 
                    key={pastVisit.id}
                    className="relative border-l-2 border-slate-200 pl-4 ml-2 pb-2 space-y-1.5"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#416B66] border-2 border-white ring-1 ring-slate-200" />

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">
                        {formatDate(pastVisit.date)}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                        {pastVisit.id}
                      </span>
                    </div>

                    {pastVisit.complaint && (
                      <p className="text-xs text-slate-600">
                        <strong className="text-slate-800">Complaint:</strong> {pastVisit.complaint}
                      </p>
                    )}

                    {pastVisit.vitals && (
                      <div className="text-[11px] text-slate-500 flex flex-wrap gap-2">
                        {pastVisit.vitals.weightKg && <span>Wt: <strong>{pastVisit.vitals.weightKg} kg</strong></span>}
                        {pastVisit.vitals.temperatureF && <span>Temp: <strong>{pastVisit.vitals.temperatureF}°F</strong></span>}
                        {pastVisit.vitals.spO2 && <span>SpO2: <strong>{pastVisit.vitals.spO2}%</strong></span>}
                      </div>
                    )}

                    {/* Prescribed Medicines Summary */}
                    {pastVisit.prescription && pastVisit.prescription.length > 0 && (
                      <div className="pt-1.5 mt-1 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Prescription:</span>
                          <button
                            type="button"
                            onClick={() => handleRepeatPrescription(pastVisit)}
                            className="text-[10px] font-bold text-[#D35E36] hover:underline flex items-center gap-0.5"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Repeat Rx</span>
                          </button>
                        </div>
                        <ul className="space-y-0.5">
                          {pastVisit.prescription.map((rx, idx) => (
                            <li key={idx} className="text-[11px] text-slate-700 truncate">
                              • <strong>{rx.drugName}</strong> ({rx.dose}, {rx.frequency})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 italic text-xs">
                  First visit for this patient. No prior consultations recorded.
                </div>
              )}
            </div>
          </div>

          {/* Standalone Billing Engine Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#416B66]/10 flex items-center justify-center text-[#416B66]">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wide">
                    Billing Engine
                  </h4>
                  <span className="text-xs text-slate-500">
                    Invoice: <strong className="font-mono text-slate-800">{invoiceId || 'Auto upon Save'}</strong>
                  </span>
                </div>
              </div>

              {/* Invoice Status Pill */}
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  invoiceStatus === 'Issued'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : invoiceStatus === 'Void'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {invoiceStatus}
                </span>

                {isInvoiceIssued && (
                  <button
                    type="button"
                    onClick={() => setIsVoidModalOpen(true)}
                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold rounded-md transition-colors flex items-center gap-1"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Void</span>
                  </button>
                )}
              </div>
            </div>

            {/* Immutable Warning if Issued */}
            {isInvoiceIssued && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  This invoice is <strong>Issued & Locked</strong> for audit compliance.
                </span>
              </div>
            )}

            {/* Line Items List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Line Items
                </label>
                {!isInvoiceIssued && (
                  <button
                    type="button"
                    onClick={handleAddInvoiceItem}
                    className="text-xs text-[#416B66] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add item
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {invoiceItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex flex-col md:flex-row gap-3 mb-3 p-3 md:p-0 bg-slate-50 md:bg-transparent rounded-lg border border-slate-200 md:border-transparent relative"
                  >
                    {/* 1. Search Input (Full width on mobile) */}
                    <div className="relative flex-1 w-full">
                      <input
                        type="text"
                        disabled={isInvoiceIssued}
                        value={item.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleItemChange(item.id, 'description', val);
                          const isSyrup = /syrup|suspension/i.test(val);
                          if (isSyrup) handleItemChange(item.id, 'type', 'Syrup');
                        }}
                        placeholder="Item description (e.g. Paracetamol Syrup)..."
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66] disabled:bg-slate-100 font-medium"
                      />
                    </div>

                    {/* 2. Type & Amount & Trash (Grid on mobile, Flex on desktop) */}
                    <div className="grid grid-cols-[1fr_1fr_auto] md:flex gap-3 items-center w-full md:w-auto">
                      <select
                        disabled={isInvoiceIssued}
                        value={item.type === 'Syrup' ? 'Syrup' : 'Medicine'}
                        onChange={(e) => handleItemChange(item.id, 'type', e.target.value)}
                        className="w-full md:w-32 px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#416B66] disabled:bg-slate-100 font-medium cursor-pointer"
                      >
                        <option value="Medicine">Medicine</option>
                        <option value="Syrup">Syrup</option>
                      </select>

                      <div className="relative w-full md:w-36">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 select-none pointer-events-none">
                          ₹
                        </span>
                        <input
                          type="number"
                          disabled={isInvoiceIssued}
                          value={paiseToRupees(item.amountPaise)}
                          onChange={(e) => handleItemChange(item.id, 'amountRupees', e.target.value)}
                          className="w-full pl-7 pr-11 py-2 text-sm font-bold text-right border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66] disabled:bg-slate-100 text-slate-800"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase select-none pointer-events-none">
                          {item.type === 'Syrup' ? 'ml' : 'qty'}
                        </span>
                      </div>

                      {!isInvoiceIssued && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInvoiceItem(item.id)}
                          disabled={invoiceItems.length === 1}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-20 shrink-0 justify-self-end md:justify-self-auto"
                          title="Delete item"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount & Tax Options: Footer Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 mt-4 border-t border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Bill-Level Discount
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      {discountType === 'flat' ? '₹' : '%'}
                    </span>
                    <input
                      type="number"
                      disabled={isInvoiceIssued}
                      min="0"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 text-sm border border-slate-300 rounded-md text-right font-medium focus:outline-none focus:ring-2 focus:ring-[#416B66] disabled:bg-slate-100"
                    />
                  </div>
                  <select
                    disabled={isInvoiceIssued}
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-32 px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#416B66] disabled:bg-slate-100 font-medium cursor-pointer"
                  >
                    <option value="flat">₹ Flat</option>
                    <option value="percent">% Percent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Tax Configuration
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      disabled={isInvoiceIssued}
                      min="0"
                      max="100"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(e.target.value)}
                      className="w-full pr-8 pl-3 py-2 text-sm border border-slate-300 rounded-md text-right font-medium focus:outline-none focus:ring-2 focus:ring-[#416B66] disabled:bg-slate-100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      %
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">(Default: 0%)</span>
                </div>
              </div>
            </div>

            {/* Payment Mode Splits */}
            <div className="mt-2 pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Payments Collected
                </label>
                {!isInvoiceIssued && (
                  <button
                    type="button"
                    onClick={handleAddPaymentRow}
                    className="text-xs text-[#416B66] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add payment split
                  </button>
                )}
              </div>

              {paymentRows.map((payment, idx) => (
                <div key={idx} className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
                  <select
                    disabled={isInvoiceIssued}
                    value={payment.mode}
                    onChange={(e) => handlePaymentChange(idx, 'mode', e.target.value)}
                    className="flex-1 min-w-[150px] px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#416B66] disabled:bg-slate-100 font-medium"
                  >
                    <option value="Online (UPI/GPay)">Online (UPI / GPay / QR)</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                  </select>

                  <div className="relative w-32 shrink-0">
                    <span className="absolute left-2.5 top-2 text-sm text-slate-400">₹</span>
                    <input
                      type="number"
                      disabled={isInvoiceIssued}
                      value={paiseToRupees(payment.amountPaise)}
                      onChange={(e) => handlePaymentChange(idx, 'amountRupees', e.target.value)}
                      className="w-full pl-6 pr-2 py-2 text-sm font-bold text-right border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66] disabled:bg-slate-100 text-emerald-800"
                    />
                  </div>

                  {!isInvoiceIssued && paymentRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePaymentRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Financial Calculation Summary (All in integer paise) */}
            <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">{formatPaise(financialSummary.subtotalPaise)}</span>
              </div>
              {financialSummary.discountPaise > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-semibold">- {formatPaise(financialSummary.discountPaise)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Tax ({taxPercent}%):</span>
                <span className="font-semibold">{formatPaise(financialSummary.taxPaise)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="text-[#416B66]">{formatPaise(financialSummary.totalPaise)}</span>
              </div>
              <div className="flex justify-between font-semibold text-sm pt-1">
                <span className="text-slate-600">Total Paid:</span>
                <span className="text-emerald-700">{formatPaise(totalPaidPaise)}</span>
              </div>
              <div className="flex justify-between font-bold text-xs pt-0.5">
                <span className="text-slate-700">Balance Outstanding:</span>
                <span className={balanceDuePaise > 0 ? "text-amber-800" : "text-slate-500"}>
                  {formatPaise(balanceDuePaise)}
                </span>
              </div>
            </div>

            {/* Bottom Billing CTAs */}
            <div className="mt-2 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => setIsReceiptPrintOpen(true)}
                className="w-full sm:w-auto bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Receipt className="w-4 h-4 text-slate-500" />
                <span>Print Receipt</span>
              </button>

              <div className="w-full sm:w-auto">
                {!isInvoiceIssued ? (
                  <button
                    type="button"
                    onClick={() => handleSaveVisit(true)}
                    className="w-full sm:w-auto bg-[#416B66] hover:bg-[#335551] text-white px-5 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Issue & Lock Invoice</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 py-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Invoice Issued
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN (xl:col-span-7) ==================== */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          {/* Active Visit Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
            {/* Header with Title & Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                  Current Clinical Consultation
                </h3>
                {/* Auto-Save Draft Indicator */}
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${autoSaveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
                  <span className="text-xs text-slate-500">
                    {autoSaveStatus === 'saving' ? 'Auto-saving draft...' : 'Draft auto-saved in local cache'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setIsRxPrintOpen(true)}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print Rx</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveVisit(false)}
                  className="bg-[#D35E36] hover:bg-[#b54c2a] text-white px-6 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Visit</span>
                </button>
              </div>
            </div>

            {/* Pediatric Vitals Grid (6-Col on Large screens) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2.5">
                Pediatric Vitals & Growth
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 12.5"
                    value={vitals.weightKg}
                    onChange={(e) => setVitals({ ...vitals, weightKg: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Height (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 88"
                    value={vitals.heightCm}
                    onChange={(e) => setVitals({ ...vitals, heightCm: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 99.2"
                    value={vitals.temperatureF}
                    onChange={(e) => setVitals({ ...vitals, temperatureF: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Pulse (bpm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 110"
                    value={vitals.pulseRate}
                    onChange={(e) => setVitals({ ...vitals, pulseRate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">SpO2 (%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 99"
                    value={vitals.spO2}
                    onChange={(e) => setVitals({ ...vitals, spO2: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Head Circ (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 46"
                    value={vitals.headCircumferenceCm}
                    onChange={(e) => setVitals({ ...vitals, headCircumferenceCm: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Chief Complaint & Clinical Notes */}
            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Chief Complaint / Presentation
                  </label>
                  {/* Common Pediatric Complaint Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {["Fever", "Cough & Cold", "Loose Stools", "Wheezing", "Vomiting"].map((chip) => (
                      <button
                        type="button"
                        key={chip}
                        onClick={() => setComplaint(prev => prev ? `${prev}, ${chip}` : chip)}
                        className="text-xs bg-slate-100 hover:bg-[#416B66]/10 text-slate-700 hover:text-[#416B66] px-2.5 py-0.5 rounded-full transition-colors font-medium border border-slate-200"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={3}
                  placeholder="e.g. High fever x 2 days, poor feeding, mild dry cough..."
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  className="w-full min-h-[80px] p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Examination Findings & Pediatric Remarks
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Pharyngeal congestion, chest clear, anterior fontanelle normal..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[80px] p-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66]"
                />
              </div>
            </div>

            {/* ==================== DYNAMIC PRESCRIPTION BUILDER ==================== */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xl font-bold text-[#2A4343]">℞</span>
                  <h4 className="font-semibold text-sm text-slate-800 uppercase tracking-wide">
                    Prescription Builder (Dynamic Drug Rows)
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={handleAddRxRow}
                  className="px-3 py-1.5 bg-[#416B66]/10 hover:bg-[#416B66] text-[#416B66] hover:text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              {/* Dynamic Rows */}
              <div className="space-y-4">
                {prescriptionRows.map((row, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col gap-3 p-4 border border-slate-200 rounded-lg bg-slate-50 transition-colors"
                  >
                    {/* Top Row (Preset & Delete) */}
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          #{index + 1}
                        </span>
                        {/* Drug Preset Autocomplete Picker */}
                        <select
                          onChange={(e) => {
                            const preset = PEDIATRIC_DRUG_PRESETS.find(p => p.name === e.target.value);
                            if (preset) handleSelectDrugPreset(index, preset);
                          }}
                          defaultValue=""
                          className="text-xs py-1.5 px-3 rounded-md border border-slate-300 bg-white text-slate-700 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#416B66] max-w-sm truncate"
                        >
                          <option value="" disabled>Select from Pediatric Drug Presets...</option>
                          {PEDIATRIC_DRUG_PRESETS.map((preset, pIdx) => (
                            <option key={pIdx} value={preset.name}>
                              {preset.name} ({preset.strength})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveRxRow(index)}
                        disabled={prescriptionRows.length === 1}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent transition-colors"
                        title="Delete Medicine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Inputs Row 1: Medicine Name (col-span-2), Strength (col-span-1), Dose (col-span-1) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Medicine Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Paracetamol Syrup"
                          value={row.drugName}
                          onChange={(e) => handleRxFieldChange(index, 'drugName', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66] font-medium"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Strength</label>
                        <input
                          type="text"
                          placeholder="e.g. 120mg/5ml"
                          value={row.strength}
                          onChange={(e) => handleRxFieldChange(index, 'strength', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66]"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Dose</label>
                        <input
                          type="text"
                          placeholder="e.g. 4 ml"
                          value={row.dose}
                          onChange={(e) => handleRxFieldChange(index, 'dose', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66] font-medium"
                        />
                      </div>
                    </div>

                    {/* Second Row: Frequency (col-span-2), Duration (col-span-2) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Frequency</label>
                        <input
                          type="text"
                          placeholder="e.g. 1-0-1 or TDS"
                          value={row.frequency}
                          onChange={(e) => handleRxFieldChange(index, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66] font-mono font-medium"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Duration</label>
                        <input
                          type="text"
                          placeholder="e.g. 5 days"
                          value={row.duration}
                          onChange={(e) => handleRxFieldChange(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66]"
                        />
                      </div>
                    </div>

                    {/* Third Row: Instructions & Presets */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="col-span-1 md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Instructions</label>
                        <input
                          type="text"
                          placeholder="Instruction (English / தமிழ் - e.g. சாப்பாட்டிற்கு பின்)"
                          value={row.instructions}
                          onChange={(e) => handleRxFieldChange(index, 'instructions', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66]"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Tamil Presets</label>
                        <select
                          onChange={(e) => handleRxFieldChange(index, 'instructions', e.target.value)}
                          defaultValue=""
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66] bg-white text-slate-700"
                        >
                          <option value="" disabled>Presets...</option>
                          {INSTRUCTION_PRESETS.map((p, idx) => (
                            <option key={idx} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Consultation Footer Actions */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setIsRxPrintOpen(true)}
                className="w-full sm:w-auto bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print Prescription</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveVisit(false)}
                className="w-full sm:w-auto bg-[#D35E36] hover:bg-[#b54c2a] text-white px-6 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4 text-white" />
                <span>Save Consultation</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Prescription Modal */}
      {selectedPatient && (
        <PrescriptionPrintModal
          isOpen={isRxPrintOpen}
          onClose={() => setIsRxPrintOpen(false)}
          visit={activeVisitObject}
          patient={selectedPatient}
        />
      )}

      {/* Print Receipt Modal */}
      {selectedPatient && (
        <ReceiptPrintModal
          isOpen={isReceiptPrintOpen}
          onClose={() => setIsReceiptPrintOpen(false)}
          invoice={activeInvoiceObject}
          patient={selectedPatient}
        />
      )}

      {/* Void Invoice Confirmation Modal */}
      {invoiceId && (
        <VoidInvoiceModal
          isOpen={isVoidModalOpen}
          onClose={() => setIsVoidModalOpen(false)}
          invoice={{ id: invoiceId }}
          onConfirmVoid={handleConfirmVoid}
        />
      )}

      {/* Add New Patient Registration Modal */}
      {isAddPatientModalOpen && (
        <AddPatientModal
          isOpen={isAddPatientModalOpen}
          onClose={() => setIsAddPatientModalOpen(false)}
          onPatientCreated={handlePatientCreated}
        />
      )}
    </div>
  );
}
