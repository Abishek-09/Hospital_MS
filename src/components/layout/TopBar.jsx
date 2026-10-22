import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Calendar, Stethoscope, Clock, ShieldCheck } from 'lucide-react';
import { getClinicSettings } from '../../services/storage';
import AddPatientModal from '../modals/AddPatientModal';

export default function TopBar() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(getClinicSettings());
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    const handleStorageUpdate = () => setSettings(getClinicSettings());
    window.addEventListener('scc_storage_change', handleStorageUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener('scc_storage_change', handleStorageUpdate);
    };
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const handlePatientCreated = (newPatient) => {
    // Navigate straight to the visit workspace for this patient
    navigate(`/workspace?patientId=${newPatient.id}`);
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-brand-border/80 px-6 flex items-center justify-between shadow-soft shrink-0 z-20 no-print">
        {/* Left: Date & Clinic Timing */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-brand-dark">
            <div className="w-8 h-8 rounded-lg bg-brand-sage-subtle border border-brand-sage/60 flex items-center justify-center text-brand-dark">
              <Calendar className="w-4 h-4 text-brand-teal" />
            </div>
            <div>
              <div className="text-brand-dark font-bold">{formattedDate}</div>
              <div className="text-[10px] text-brand-muted flex items-center gap-1 font-normal">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Clinic Hours: {settings.timings || '1:00 PM – 9:00 PM'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Doctor Badge & Quick Action Button */}
        <div className="flex items-center gap-4">
          {/* Doctor Pill */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-brand-teal-subtle border border-brand-teal/20 text-xs">
            <div className="w-7 h-7 rounded-lg bg-brand-teal text-brand-sand flex items-center justify-center font-bold">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-bold text-brand-dark leading-tight">
                {settings.doctorName || 'Dr. B. Sivakumar, M.D.'}
              </div>
              <div className="text-[10px] text-brand-muted font-medium">
                {settings.qualification || 'Consultant Pediatrician'}
              </div>
            </div>
          </div>

          {/* Quick Add Patient Button */}
          <button
            onClick={() => setIsAddPatientOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-200 hover:shadow active:scale-95"
            id="quick-add-patient-btn"
          >
            <UserPlus className="w-4 h-4 text-brand-sand" />
            <span>Quick Add Patient</span>
          </button>
        </div>
      </header>

      {/* Global Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onPatientCreated={handlePatientCreated}
      />
    </>
  );
}
