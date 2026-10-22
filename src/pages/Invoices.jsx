import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Receipt, 
  Search, 
  Printer, 
  AlertCircle, 
  CheckCircle2, 
  AlertOctagon, 
  ExternalLink,
  Filter,
  IndianRupee,
  Clock
} from 'lucide-react';
import { 
  getInvoices, 
  getPatients, 
  getVisits,
  voidInvoice 
} from '../services/storage';
import { formatPaise } from '../utils/currency';
import { formatDate } from '../utils/date';
import { useToast } from '../context/ToastContext';
import ReceiptPrintModal from '../components/print/ReceiptPrintModal';
import VoidInvoiceModal from '../components/modals/VoidInvoiceModal';

export default function Invoices() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);
  const [selectedPatientForPrint, setSelectedPatientForPrint] = useState(null);
  const [invoiceToVoid, setInvoiceToVoid] = useState(null);

  const loadData = () => {
    setInvoices(getInvoices());
    setPatients(getPatients());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('scc_storage_change', loadData);
    return () => window.removeEventListener('scc_storage_change', loadData);
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const patient = patients.find(p => p.id === inv.patientId);
    const term = searchTerm.toLowerCase().trim();
    
    const matchesSearch = 
      !term ||
      inv.id.toLowerCase().includes(term) ||
      (patient && patient.name.toLowerCase().includes(term)) ||
      (patient && patient.phone.includes(term));

    let matchesStatus = true;
    if (statusFilter === 'Unpaid') {
      matchesStatus = inv.status === 'Issued' && (inv.balancePaise || 0) > 0;
    } else if (statusFilter !== 'All') {
      matchesStatus = inv.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const totalBilledPaise = invoices
    .filter(i => i.status !== 'Void')
    .reduce((sum, i) => sum + (i.totalPaise || 0), 0);

  const totalCollectedPaise = invoices
    .filter(i => i.status !== 'Void')
    .reduce((sum, i) => sum + (i.paidPaise || 0), 0);

  const totalPendingPaise = invoices
    .filter(i => i.status === 'Issued')
    .reduce((sum, i) => sum + (i.balancePaise || 0), 0);

  const handleOpenPrint = (invoice) => {
    const patient = patients.find(p => p.id === invoice.patientId);
    setSelectedInvoiceForPrint(invoice);
    setSelectedPatientForPrint(patient);
  };

  const handleConfirmVoid = (id, reason) => {
    const voided = voidInvoice(id, reason);
    if (voided) {
      addToast({
        title: "Invoice Voided",
        message: `Invoice ${id} has been voided. Audit trail recorded.`,
        type: "warning"
      });
      loadData();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">
            Billing & Invoices
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Audit-compliant clinical receipts, integer-paise calculations, and immutable invoice tracking
          </p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-brand-border/70 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Total Billed</span>
          <div className="text-2xl font-extrabold text-brand-dark mt-1">
            {formatPaise(totalBilledPaise)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Across all active receipts</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-brand-border/70 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Total Collected</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            {formatPaise(totalCollectedPaise)}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Cash & Online UPI settled</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-brand-border/70 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Pending Balance</span>
          <div className={`text-2xl font-extrabold mt-1 ${totalPendingPaise > 0 ? 'text-amber-800' : 'text-stone-700'}`}>
            {formatPaise(totalPendingPaise)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Outstanding from patients</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-brand-border/70 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Search by Invoice ID (e.g. SCC-2026-), Patient Name, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-stone-300 focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-stone-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['All', 'Issued', 'Unpaid', 'Void', 'Draft'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-brand-teal text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-brand-border/70 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-brand-dark font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Line Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const patient = patients.find(p => p.id === inv.patientId);
                  const isVoid = inv.status === 'Void';
                  const isPaid = (inv.balancePaise || 0) === 0;

                  return (
                    <tr key={inv.id} className="hover:bg-brand-sage-subtle/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-dark">
                        {inv.id}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {formatDate(inv.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-dark">
                          {patient?.name || 'Unknown Patient'}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          {patient?.phone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                        {inv.items?.map(it => it.description).join(', ') || '-'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-brand-dark">
                        {formatPaise(inv.totalPaise)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700">
                        {formatPaise(inv.paidPaise)}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        {inv.balancePaise > 0 ? (
                          <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {formatPaise(inv.balancePaise)}
                          </span>
                        ) : (
                          <span className="text-stone-400">₹0.00</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isVoid
                            ? 'bg-red-100 text-red-800'
                            : inv.status === 'Issued'
                            ? (isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenPrint(inv)}
                            className="p-1.5 rounded-lg text-stone-600 hover:text-brand-orange hover:bg-stone-100 transition-colors"
                            title="Print Receipt (A5)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {inv.status === 'Issued' && (
                            <button
                              onClick={() => setInvoiceToVoid(inv)}
                              className="px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
                            >
                              Void
                            </button>
                          )}

                          <button
                            onClick={() => navigate(`/admin/workspace?patientId=${inv.patientId}&visitId=${inv.visitId}`)}
                            className="p-1.5 rounded-lg text-brand-teal hover:bg-brand-teal-subtle transition-colors"
                            title="Open Visit in Workspace"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-400">
                    <Receipt className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                    <p className="text-sm font-semibold text-stone-600">No invoices found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Receipt Modal */}
      {selectedInvoiceForPrint && selectedPatientForPrint && (
        <ReceiptPrintModal
          isOpen={!!selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
          invoice={selectedInvoiceForPrint}
          patient={selectedPatientForPrint}
        />
      )}

      {/* Void Modal */}
      {invoiceToVoid && (
        <VoidInvoiceModal
          isOpen={!!invoiceToVoid}
          onClose={() => setInvoiceToVoid(null)}
          invoice={invoiceToVoid}
          onConfirmVoid={handleConfirmVoid}
        />
      )}
    </div>
  );
}
