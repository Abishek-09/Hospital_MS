import React, { useState } from 'react';
import { X, AlertOctagon, AlertTriangle } from 'lucide-react';

export default function VoidInvoiceModal({ isOpen, onClose, invoice, onConfirmVoid }) {
  const [reason, setReason] = useState('Billing error / Entry adjustment');

  if (!isOpen || !invoice) return null;

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirmVoid(invoice.id, reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-2xl shadow-elevated border border-red-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 text-red-200" />
            <h3 className="font-bold text-base">Void Invoice {invoice.id}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-red-200 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleConfirm} className="p-6 space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 leading-relaxed">
            <p className="font-semibold text-red-950 flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              Immutable Invoice Void Warning
            </p>
            Voiding will cancel this official receipt and invalidate its audit trail. A mandatory cancellation reason must be recorded.
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Reason for Voiding <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Duplicate entry, incorrect line items, or payment cancelled..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Keep Invoice
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              Confirm & Void Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
