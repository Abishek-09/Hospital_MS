import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ClipboardList, 
  Phone, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowLeft
} from 'lucide-react';
import { getPatients, getVisitsForPatient } from '../../services/storage';
import { formatDate } from '../../utils/date';

export default function UserVisitWorkspace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientIdParam = searchParams.get('patientId');

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);

  useEffect(() => {
    const list = getPatients();
    setPatients(list);

    if (patientIdParam) {
      const p = list.find(item => item.id === patientIdParam);
      if (p) setSelectedPatient(p);
    } else if (list.length > 0) {
      setSelectedPatient(list[0]);
      setSearchParams({ patientId: list[0].id });
    }
  }, [patientIdParam]);

  useEffect(() => {
    if (selectedPatient) {
      setPatientHistory(getVisitsForPatient(selectedPatient.id));
    } else {
      setPatientHistory([]);
    }
  }, [selectedPatient]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Top Header & Patient Switcher */}
      <div className="bg-white rounded-2xl p-4 border border-brand-border/70 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-teal text-brand-sand flex items-center justify-center font-bold">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              Front Desk Visit Workspace Prep
            </div>
            <div className="text-sm font-extrabold text-brand-dark">
              {selectedPatient ? selectedPatient.name : 'Select Patient'}
            </div>
          </div>
        </div>

        {/* Patient Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedPatient?.id || ''}
            onChange={(e) => {
              const p = patients.find(item => item.id === e.target.value);
              if (p) {
                setSelectedPatient(p);
                setSearchParams({ patientId: p.id });
              }
            }}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-brand-teal cursor-pointer w-full md:w-64"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.phone})
              </option>
            ))}
          </select>

          <button
            onClick={() => navigate('/user/patients')}
            className="px-3 py-2 border border-stone-300 hover:border-brand-teal text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Directory</span>
          </button>
        </div>
      </div>

      {/* Role Restriction Notice */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Front Desk Scoped View:</strong> As a receptionist, you can verify the child's registered contact details and view previous consultation complaints for queue preparation. Clinical vitals, prescription writing, and billing are restricted to Doctor Dr. B. Sivakumar.
        </div>
      </div>

      {/* STRICT CONSTRAINT: Patient Details (Name & Mobile ONLY) */}
      {selectedPatient && (
        <div className="bg-white rounded-2xl p-6 border border-brand-border/70 shadow-soft">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
            <h3 className="font-bold text-base text-brand-dark">Registered Patient Details</h3>
            <span className="font-mono text-xs font-bold bg-brand-sand/40 text-brand-dark px-2.5 py-0.5 rounded-full">
              {selectedPatient.id}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-400 block font-bold uppercase text-[10px] mb-0.5">
                Child's Full Name
              </span>
              <span className="font-extrabold text-sm text-brand-dark">
                {selectedPatient.name}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-400 block font-bold uppercase text-[10px] mb-0.5">
                Parent's Mobile Number
              </span>
              <span className="font-mono font-bold text-sm text-brand-dark flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-brand-teal" />
                {selectedPatient.phone}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STRICT CONSTRAINT: Past Medical History Timeline (View-Only, NO Rx, NO Billing) */}
      <div className="bg-white rounded-2xl p-6 border border-brand-border/70 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="font-bold text-base text-brand-dark flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-teal" />
            <span>Past Medical History Timeline ({patientHistory.length} visits)</span>
          </h3>
          <span className="text-xs text-stone-400 font-medium">Doctor: Dr. B. Sivakumar, M.D.</span>
        </div>

        <div className="space-y-3">
          {patientHistory.length > 0 ? (
            patientHistory.map((pastVisit, idx) => (
              <div 
                key={pastVisit.id || idx}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-teal" />
                    <span className="font-bold text-brand-dark">
                      Consultation Date: {formatDate(pastVisit.date)}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-stone-400">
                    {pastVisit.id}
                  </span>
                </div>

                <div className="text-stone-700 pl-4">
                  <span className="font-semibold text-brand-dark">Chief Complaint: </span>
                  {pastVisit.complaint || 'General Checkup'}
                </div>

                <div className="text-[11px] text-stone-500 pl-4 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Examined by Dr. B. Sivakumar, M.B.B.S., M.D., (PEDS)</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-stone-400 text-xs italic">
              No previous visits recorded for this patient yet. Ready for first doctor consultation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
