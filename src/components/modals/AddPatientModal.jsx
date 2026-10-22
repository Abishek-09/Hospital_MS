import React, { useState } from 'react';
import { X, UserPlus, AlertTriangle, ArrowRight, UserCheck, Check, Calendar, Phone, MapPin, User } from 'lucide-react';
import { savePatient, findPotentialDuplicates } from '../../services/storage';
import { useToast } from '../../context/ToastContext';
import { getPatientAgeDisplay } from '../../utils/date';

export default function AddPatientModal({ isOpen, onClose, onPatientCreated, initialPhone = '' }) {
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: initialPhone,
    sex: 'Male',
    useApproxAge: false,
    dob: '',
    approxAgeYears: '',
    address: 'Ambalai'
  });

  const [errors, setErrors] = useState({});
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Patient name is required';
    }

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = 'Phone number is required';
    } else if (cleanPhone.length !== 10) {
      errs.phone = 'Phone number must be exactly 10 digits';
    }

    if (formData.useApproxAge) {
      const ageNum = Number(formData.approxAgeYears);
      if (formData.approxAgeYears === '' || isNaN(ageNum) || ageNum < 0 || ageNum > 21) {
        errs.age = 'Please enter a valid pediatric age (0 - 21 yrs)';
      }
    } else {
      if (!formData.dob) {
        errs.dob = 'Date of birth is required';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e, bypassDuplicateCheck = false) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    if (!bypassDuplicateCheck) {
      const duplicates = findPotentialDuplicates(formData.name, formData.phone);
      if (duplicates.length > 0) {
        setDuplicateWarning(duplicates[0]);
        return;
      }
    }

    // Process patient creation
    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim().replace(/\D/g, ''),
      sex: formData.sex,
      dob: formData.useApproxAge ? null : formData.dob,
      approxAgeYears: formData.useApproxAge ? Number(formData.approxAgeYears) : null,
      address: formData.address.trim() || 'Ambalai'
    };

    const newPatient = savePatient(payload);
    addToast({
      title: "Patient Registered",
      message: `${newPatient.name} has been enrolled as ID: ${newPatient.id}`,
      type: "success"
    });

    handleClose();
    if (onPatientCreated) {
      onPatientCreated(newPatient);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      phone: '',
      sex: 'Male',
      useApproxAge: false,
      dob: '',
      approxAgeYears: '',
      address: 'Ambalai'
    });
    setErrors({});
    setDuplicateWarning(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-2xl shadow-elevated border border-brand-border w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-brand-dark text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-teal flex items-center justify-center text-brand-sand">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Add New Patient</h3>
              <p className="text-xs text-brand-sand/80">Santosh Child Care Registration</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-stone-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5">
          {duplicateWarning ? (
            /* Duplicate Match Warning Screen */
            <div className="space-y-4 animate-scale-up">
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 text-amber-900">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-base text-amber-950">Possible Match Found</h4>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      A patient with this phone or similar name already exists in the clinic database.
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 bg-white/80 rounded-lg p-3 border border-amber-200 space-y-1 text-sm">
                  <div className="font-semibold text-brand-dark flex items-center justify-between">
                    <span>{duplicateWarning.name}</span>
                    <span className="text-xs font-mono bg-brand-sand/40 px-2 py-0.5 rounded text-brand-dark font-bold">
                      {duplicateWarning.id}
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 flex gap-4 mt-1">
                    <span>Age: <strong>{getPatientAgeDisplay(duplicateWarning)}</strong></span>
                    <span>Sex: <strong>{duplicateWarning.sex}</strong></span>
                    <span>Phone: <strong>{duplicateWarning.phone}</strong></span>
                  </div>
                  <div className="text-xs text-stone-500 truncate mt-0.5">
                    {duplicateWarning.address}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    if (onPatientCreated) {
                      onPatientCreated(duplicateWarning);
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-brand-teal text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-brand-teal-light transition-all shadow-sm"
                >
                  <UserCheck className="w-4 h-4 text-brand-sand" />
                  Open Existing Patient ({duplicateWarning.name})
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  className="w-full py-2 px-4 border border-stone-300 hover:border-brand-muted text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
                >
                  Proceed Anyway & Create as New Patient
                </button>

                <button
                  type="button"
                  onClick={() => setDuplicateWarning(null)}
                  className="text-xs text-stone-500 hover:text-stone-800 text-center py-1 underline"
                >
                  Go Back & Edit Info
                </button>
              </div>
            </div>
          ) : (
            /* Patient Registration Form */
            <form id="add-patient-form" onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                  Child's Full Name <span className="text-red-500">*</span>
                  <span className="text-[11px] font-normal text-stone-500 ml-1.5">(Supports தமிழ்)</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type="text"
                    placeholder="e.g. Aarav Kumar or ஆரவ் குமார்"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all ${
                      errors.name ? 'border-red-400 bg-red-50/30' : 'border-stone-300 focus:border-brand-teal'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>

              {/* Phone & Sex */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                    Parent's Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="10-digit mobile"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal/30 transition-all ${
                        errors.phone ? 'border-red-400 bg-red-50/30' : 'border-stone-300 focus:border-brand-teal'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                    Sex <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200">
                    {['Male', 'Female', 'Other'].map((sex) => (
                      <button
                        type="button"
                        key={sex}
                        onClick={() => setFormData({ ...formData, sex })}
                        className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          formData.sex === sex
                            ? 'bg-brand-dark text-brand-sand shadow-sm'
                            : 'text-stone-600 hover:text-brand-dark'
                        }`}
                      >
                        {sex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Age / DOB Section with Mode Toggle */}
              <div className="bg-brand-sage-subtle p-3.5 rounded-xl border border-brand-sage/50">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                    Age & Birth Info
                  </span>
                  {/* Toggle between Exact DOB and Approximate Age */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-medium ${!formData.useApproxAge ? 'text-brand-teal font-semibold' : 'text-stone-500'}`}>
                      Exact DOB
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, useApproxAge: !formData.useApproxAge })}
                      className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                        formData.useApproxAge ? 'bg-brand-teal' : 'bg-stone-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          formData.useApproxAge ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={`font-medium ${formData.useApproxAge ? 'text-brand-teal font-semibold' : 'text-stone-500'}`}>
                      Approx Age
                    </span>
                  </div>
                </div>

                {formData.useApproxAge ? (
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">
                      Approximate Age (in completed years)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="21"
                        placeholder="e.g. 4"
                        value={formData.approxAgeYears}
                        onChange={(e) => setFormData({ ...formData, approxAgeYears: e.target.value })}
                        className={`w-32 px-3 py-2 rounded-lg border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-teal/30 ${
                          errors.age ? 'border-red-400 bg-red-50' : 'border-stone-300 focus:border-brand-teal'
                        }`}
                      />
                      <span className="text-sm font-medium text-stone-700">Years</span>
                    </div>
                    {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age}</p>}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                      <input
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal/30 ${
                          errors.dob ? 'border-red-400 bg-red-50' : 'border-stone-300 focus:border-brand-teal'
                        }`}
                      />
                    </div>
                    {errors.dob && <p className="text-xs text-red-600 mt-1">{errors.dob}</p>}
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                  Residential Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Area / Town (e.g. College Road, Ambalai)"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm font-medium focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/30"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!duplicateWarning && (
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-patient-form"
              className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <span>Save & Register Patient</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
