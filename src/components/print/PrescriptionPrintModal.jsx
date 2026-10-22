import React from 'react';
import { X, Printer, HeartHandshake } from 'lucide-react';
import { getClinicSettings } from '../../services/storage';
import { formatDate, getPatientAgeDisplay } from '../../utils/date';

export default function PrescriptionPrintModal({ isOpen, onClose, visit, patient }) {
  if (!isOpen || !visit || !patient) return null;

  const settings = getClinicSettings();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-2xl shadow-elevated border border-brand-border w-full max-w-3xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Controls (Hidden in Print) */}
        <div className="bg-brand-dark text-white px-6 py-3.5 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-brand-sand" />
            <span className="font-bold text-sm">Prescription Print Preview (A4 / A5)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Prescription</span>
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
            id="printable-rx" 
            className="bg-white shadow-card rounded-xl p-8 max-w-2xl w-full border border-stone-200 text-stone-900 print:shadow-none print:border-none print:p-0 print:max-w-none print:w-full print:rounded-none"
          >
            {/* Clinic Header */}
            <div className="border-b-2 border-brand-dark pb-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-dark text-brand-sand flex items-center justify-center print:border print:border-brand-dark">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-brand-dark font-sans leading-none uppercase">
                      {settings.clinicName || 'Santosh Child Care'}
                    </h2>
                    <p className="text-xs font-bold text-brand-teal tracking-wide uppercase mt-1">
                      Comprehensive Child Health & Vaccination Centre
                    </p>
                  </div>
                </div>
                <div className="text-xs text-stone-600 mt-2 space-y-0.5">
                  <p>{settings.address || '7, College Road, Ambalai'}</p>
                  <p>Ph: <strong className="text-brand-dark">{settings.phone || '8300 44 2584'}</strong> | Timings: <strong>{settings.timings || '1:00 PM – 9:00 PM'}</strong></p>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="text-right">
                <h3 className="text-base font-extrabold text-brand-dark">
                  {settings.doctorName || 'Dr. B. Sivakumar'}
                </h3>
                <p className="text-xs font-semibold text-stone-700">M.B.B.S., M.D., (PEDS)</p>
                <p className="text-xs text-brand-teal font-medium">Consultant Pediatrician</p>
                <p className="text-[11px] text-stone-500 font-mono mt-0.5">Reg No: {settings.regNo || 'TNMC-74129'}</p>
              </div>
            </div>

            {/* Patient Demographics & Vitals Bar */}
            <div className="my-4 p-3 bg-brand-sage-subtle rounded-lg border border-brand-sage/60 text-xs text-brand-dark grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-bold">Patient Name</span>
                <span className="font-bold text-sm text-brand-dark">{patient.name}</span>
                <span className="text-[10px] text-stone-500 block font-mono">{patient.id}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-bold">Age / Sex</span>
                <span className="font-semibold">{getPatientAgeDisplay(patient)} / {patient.sex}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-bold">Date & Time</span>
                <span className="font-semibold">{formatDate(visit.date)}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-bold">Weight & Temp</span>
                <span className="font-bold text-brand-dark">
                  {visit.vitals?.weightKg ? `${visit.vitals.weightKg} kg` : '--'}
                  {visit.vitals?.temperatureF ? ` | ${visit.vitals.temperatureF}°F` : ''}
                </span>
              </div>
            </div>

            {/* Clinical Notes / Findings */}
            {(visit.complaint || visit.notes) && (
              <div className="mb-4 text-xs border-b border-stone-200 pb-3">
                {visit.complaint && (
                  <p className="text-stone-700 mb-1">
                    <strong className="text-brand-dark">Chief Complaint:</strong> {visit.complaint}
                  </p>
                )}
                {visit.notes && (
                  <p className="text-stone-600">
                    <strong className="text-brand-dark">Clinical Remarks:</strong> {visit.notes}
                  </p>
                )}
              </div>
            )}

            {/* Rx Symbol */}
            <div className="text-xl font-serif font-black text-brand-dark mb-2 flex items-center gap-2">
              <span className="tracking-tight">℞</span>
              <span className="text-[11px] font-sans font-semibold text-stone-500 uppercase tracking-widest">
                Prescription (மருந்து குறிப்பு)
              </span>
            </div>

            {/* Prescription Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-brand-teal text-brand-dark text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-2 pr-2 w-8">#</th>
                    <th className="py-2 px-2">Medicine & Strength</th>
                    <th className="py-2 px-2 text-center">Dose</th>
                    <th className="py-2 px-2 text-center">Frequency</th>
                    <th className="py-2 px-2 text-center">Duration</th>
                    <th className="py-2 pl-2">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {visit.prescription && visit.prescription.length > 0 ? (
                    visit.prescription.map((rx, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        <td className="py-2.5 pr-2 font-mono text-stone-400">{idx + 1}</td>
                        <td className="py-2.5 px-2">
                          <div className="font-bold text-brand-dark text-[13px]">{rx.drugName}</div>
                          {rx.strength && <div className="text-[11px] text-stone-500">{rx.strength}</div>}
                        </td>
                        <td className="py-2.5 px-2 text-center font-semibold text-stone-800">
                          {rx.dose || '-'}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className="inline-block px-2 py-0.5 rounded bg-brand-sand/30 font-bold text-brand-dark font-mono text-[11px]">
                            {rx.frequency || '-'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center font-medium text-stone-700">
                          {rx.duration || '-'}
                        </td>
                        <td className="py-2.5 pl-2">
                          <div className="text-stone-800 font-medium">{rx.instructions || '-'}</div>
                          {rx.quantity && <div className="text-[10px] text-stone-500">Qty: {rx.quantity}</div>}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-stone-400 italic">
                        No medicines prescribed for this visit.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Doctor Signature & Advice Footer */}
            <div className="mt-12 pt-6 border-t border-stone-200 flex justify-between items-end">
              <div className="text-[11px] text-stone-500 max-w-xs space-y-1">
                <p className="font-semibold text-stone-700">General Pediatric Instructions:</p>
                <p>• Ensure adequate fluids (boiled and cooled water).</p>
                <p>• Review immediately if child is unusually lethargic or refuses feed.</p>
              </div>

              <div className="text-right">
                <div className="w-36 border-b border-stone-400 mb-1 ml-auto"></div>
                <div className="font-bold text-xs text-brand-dark">Dr. B. Sivakumar</div>
                <div className="text-[10px] text-stone-500">Authorized Signature & Seal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
