import React from 'react';
import { X, Printer, HeartHandshake, CheckCircle2, AlertCircle } from 'lucide-react';
import { getClinicSettings } from '../../services/storage';
import { formatDate, getPatientAgeDisplay } from '../../utils/date';
import { formatPaise } from '../../utils/currency';

export default function ReceiptPrintModal({ isOpen, onClose, invoice, patient }) {
  if (!isOpen || !invoice || !patient) return null;

  const settings = getClinicSettings();

  const handlePrint = () => {
    window.print();
  };

  const isPaid = (invoice.balancePaise || 0) === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-2xl shadow-elevated border border-brand-border w-full max-w-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Controls */}
        <div className="bg-brand-dark text-white px-6 py-3.5 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-brand-sand" />
            <span className="font-bold text-sm">Receipt / Tax Invoice Print Preview (A5)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="text-stone-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 overflow-y-auto bg-stone-100 flex-1 flex justify-center">
          <div 
            id="printable-receipt" 
            className="bg-white shadow-card rounded-xl p-8 max-w-lg w-full border border-stone-200 text-stone-900 print:shadow-none print:border-none print:p-0 print:max-w-none print:w-full print:rounded-none"
          >
            {/* Header */}
            <div className="border-b-2 border-brand-dark pb-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <HeartHandshake className="w-6 h-6 text-brand-teal" />
                <h2 className="text-xl font-black tracking-tight text-brand-dark font-sans uppercase">
                  {settings.clinicName || 'Santosh Child Care'}
                </h2>
              </div>
              <p className="text-[11px] font-bold text-brand-teal tracking-wide uppercase mt-0.5">
                {settings.doctorName || 'Dr. B. Sivakumar, M.D. (PEDS)'} • Consultant Pediatrician
              </p>
              <p className="text-[11px] text-stone-600 mt-1">
                {settings.address || '7, College Road, Ambalai'} | Ph: {settings.phone || '8300 44 2584'}
              </p>
            </div>

            {/* Receipt Meta Bar */}
            <div className="my-3 py-2 px-3 bg-brand-sage-subtle rounded-lg border border-brand-sage/60 text-xs flex justify-between items-center">
              <div>
                <span className="text-stone-500 text-[10px] uppercase font-bold block">Invoice No</span>
                <span className="font-mono font-bold text-sm text-brand-dark">{invoice.id}</span>
              </div>
              <div className="text-center">
                <span className="text-stone-500 text-[10px] uppercase font-bold block">Status</span>
                <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${
                  invoice.status === 'Void' 
                    ? 'bg-red-100 text-red-800' 
                    : isPaid 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {invoice.status === 'Void' ? 'VOIDED' : isPaid ? 'PAID IN FULL' : 'PARTIALLY PAID'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-stone-500 text-[10px] uppercase font-bold block">Date</span>
                <span className="font-semibold text-brand-dark">{formatDate(invoice.date)}</span>
              </div>
            </div>

            {/* Patient Info */}
            <div className="text-xs border-b border-stone-200 pb-2 mb-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-stone-500">Patient: </span>
                  <strong className="text-brand-dark font-bold">{patient.name}</strong>
                  <span className="text-stone-500 ml-1">({patient.id})</span>
                </div>
                <div>
                  <span className="text-stone-500">Age/Sex: </span>
                  <span className="font-semibold">{getPatientAgeDisplay(patient)} / {patient.sex}</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left text-xs border-collapse mb-4">
              <thead>
                <tr className="border-b border-brand-teal text-brand-dark font-bold uppercase text-[10px]">
                  <th className="py-1.5 pr-2 w-8">#</th>
                  <th className="py-1.5 px-2">Particulars</th>
                  <th className="py-1.5 px-2">Type</th>
                  <th className="py-1.5 pl-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {invoice.items && invoice.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-2 pr-2 text-stone-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-2 font-medium text-stone-800">{item.description}</td>
                    <td className="py-2 px-2">
                      <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-mono">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-2 pl-2 text-right font-semibold text-brand-dark">
                      {formatPaise(item.amountPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Summary (Integer Paise Engine) */}
            <div className="border-t border-stone-200 pt-2 space-y-1 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span className="font-medium">{formatPaise((invoice.totalPaise || 0) + (invoice.discountPaise || 0) - (invoice.taxPaise || 0))}</span>
              </div>

              {(invoice.discountPaise || 0) > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-medium">- {formatPaise(invoice.discountPaise)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Tax / GST ({invoice.taxPercent || 0}%):</span>
                <span className="font-medium">{formatPaise(invoice.taxPaise || 0)}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-brand-dark pt-1.5 border-t border-dashed border-stone-300">
                <span>Total Bill Amount:</span>
                <span className="text-base text-brand-teal">{formatPaise(invoice.totalPaise)}</span>
              </div>

              {/* Payment Mode Splits */}
              <div className="pt-2 border-t border-stone-100 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Payment History:
                </div>
                {invoice.payments && invoice.payments.map((p, pIdx) => (
                  <div key={pIdx} className="flex justify-between text-[11px] text-stone-700">
                    <span>Mode: <strong className="text-brand-dark">{p.mode}</strong></span>
                    <span className="font-semibold text-brand-dark">{formatPaise(p.amountPaise)}</span>
                  </div>
                ))}
              </div>

              {/* Paid and Balance */}
              <div className="flex justify-between text-xs font-bold pt-2 border-t border-stone-200">
                <span className="text-stone-700">Total Paid:</span>
                <span className="text-emerald-700">{formatPaise(invoice.paidPaise)}</span>
              </div>

              <div className="flex justify-between text-xs font-bold">
                <span className="text-stone-700">Balance Due:</span>
                <span className={invoice.balancePaise > 0 ? "text-amber-700 font-extrabold" : "text-stone-600"}>
                  {formatPaise(invoice.balancePaise)}
                </span>
              </div>
            </div>

            {/* Void Remark if applicable */}
            {invoice.status === 'Void' && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-[11px]">
                <strong>Void Reason:</strong> {invoice.voidReason || 'Cancelled by Doctor'}
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-stone-200 flex justify-between items-end text-[10px] text-stone-500">
              <div>
                <p>Thank you for choosing Santosh Child Care.</p>
                <p className="font-semibold text-brand-teal">Wish your child a quick and healthy recovery!</p>
              </div>
              <div className="text-right">
                <div className="w-28 border-b border-stone-400 mb-1 ml-auto"></div>
                <p className="font-bold text-brand-dark">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
