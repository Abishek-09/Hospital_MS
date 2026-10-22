import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  Building2, 
  FileText, 
  Clock, 
  Phone, 
  CheckCircle2,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { 
  getClinicSettings, 
  saveClinicSettings, 
  exportDatabaseBackup, 
  importDatabaseBackup,
  resetToSeedData 
} from '../services/storage';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState(getClinicSettings());
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveClinicSettings(settings);
    setIsSaved(true);
    addToast({
      title: "Settings Saved",
      message: "Clinic profile, tax config, and invoice settings updated.",
      type: "success"
    });
  };

  const handleBackupDownload = () => {
    const success = exportDatabaseBackup();
    if (success) {
      addToast({
        title: "Backup Downloaded",
        message: "Offline encrypted database backup file saved to your device.",
        type: "success"
      });
    }
  };

  const handleBackupRestore = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const res = importDatabaseBackup(content);
      if (res.success) {
        setSettings(getClinicSettings());
        addToast({
          title: "Database Restored",
          message: "All patient records, visits, and invoices successfully restored.",
          type: "success"
        });
      } else {
        addToast({
          title: "Restore Failed",
          message: res.error || "Invalid backup file format.",
          type: "error"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset to initial seed data? All custom additions will be replaced.")) {
      resetToSeedData();
      setSettings(getClinicSettings());
      addToast({
        title: "Database Reset",
        message: "Restored initial pediatric mock dataset.",
        type: "info"
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-brand-dark tracking-tight">
          Clinic Configuration & Backup
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Manage Dr. Sivakumar's credentials, tax rules, invoice numbering, and offline data safety
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-brand-border/70 shadow-soft space-y-6">
        {/* Section: Clinic & Doctor Details */}
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-brand-dark uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">
            <Building2 className="w-4 h-4 text-brand-teal" />
            <span>Clinic & Doctor Profile</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Clinic Name
              </label>
              <input
                type="text"
                value={settings.clinicName || ''}
                onChange={(e) => handleChange('clinicName', e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 focus:outline-none focus:border-brand-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Doctor Full Name & Degrees
              </label>
              <input
                type="text"
                value={settings.doctorName || ''}
                onChange={(e) => handleChange('doctorName', e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 focus:outline-none focus:border-brand-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Designation / Qualification
              </label>
              <input
                type="text"
                value={settings.qualification || ''}
                onChange={(e) => handleChange('qualification', e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 focus:outline-none focus:border-brand-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Medical Council Reg No
              </label>
              <input
                type="text"
                value={settings.regNo || ''}
                onChange={(e) => handleChange('regNo', e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 focus:outline-none focus:border-brand-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Clinic Address
              </label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 focus:outline-none focus:border-brand-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 focus:outline-none focus:border-brand-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Consultation Timings
              </label>
              <input
                type="text"
                value={settings.timings || ''}
                onChange={(e) => handleChange('timings', e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 focus:outline-none focus:border-brand-teal"
              />
            </div>
          </div>
        </div>

        {/* Section: Tax & Billing Config */}
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-brand-dark uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">
            <FileText className="w-4 h-4 text-brand-teal" />
            <span>Tax & Invoice Rules</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Invoice Sequential Prefix
              </label>
              <input
                type="text"
                value={settings.invoicePrefix || ''}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                placeholder="SCC-2026-"
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-stone-300 focus:outline-none focus:border-brand-teal"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">Invoices generated as SCC-2026-0001</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Default Tax Rate (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.taxPercent ?? 0}
                  onChange={(e) => handleChange('taxPercent', parseFloat(e.target.value) || 0)}
                  className="w-28 px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:border-brand-teal"
                />
                <span className="text-xs text-stone-500 font-semibold">% (Default: 0% as requested)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-brand-sand" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Backup & Disaster Recovery Card */}
      <div className="bg-white rounded-2xl p-6 border border-brand-border/70 shadow-soft space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-brand-dark uppercase tracking-wider border-b border-stone-100 pb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Local Data Persistence & One-Click Backup</span>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          Because this system runs as a purely local client-side clinical app without external servers, all patient records, medical visits, vitals, and billing receipts are stored securely within your browser's persistent storage. Download periodic offline encrypted backups to keep your data safe.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* One-Click Backup Button */}
          <button
            type="button"
            onClick={handleBackupDownload}
            className="px-4 py-2.5 bg-brand-teal hover:bg-brand-teal-light text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-brand-sand" />
            <span>One-Click Backup (Download .json)</span>
          </button>

          {/* Restore Backup File Trigger */}
          <label className="px-4 py-2.5 border border-stone-300 hover:border-brand-teal text-stone-700 text-xs font-bold rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-stone-500" />
            <span>Restore Backup File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleBackupRestore}
              className="hidden"
            />
          </label>

          {/* Reset Seed Data */}
          <button
            type="button"
            onClick={handleResetData}
            className="px-4 py-2.5 text-stone-500 hover:text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center gap-1.5 ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
