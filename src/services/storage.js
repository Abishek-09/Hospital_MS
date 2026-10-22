import {
  INITIAL_CLINIC_SETTINGS,
  INITIAL_PATIENTS,
  INITIAL_VISITS,
  INITIAL_INVOICES,
  PEDIATRIC_DRUG_PRESETS,
  INSTRUCTION_PRESETS
} from './mockData';

const KEYS = {
  SETTINGS: 'scc_clinic_settings_v1',
  PATIENTS: 'scc_patients_v1',
  VISITS: 'scc_visits_v1',
  INVOICES: 'scc_invoices_v1',
  ACTIVE_DRAFT: 'scc_active_visit_draft_v1'
};

// Dispatch change event to keep UI reactive across tabs or components
function notifyChange(key, data) {
  window.dispatchEvent(new CustomEvent('scc_storage_change', { detail: { key, data } }));
}

// Ensure database is populated with initial pediatric seed data
export function initStorage() {
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_CLINIC_SETTINGS));
  }
  if (!localStorage.getItem(KEYS.PATIENTS)) {
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
  }
  if (!localStorage.getItem(KEYS.VISITS)) {
    localStorage.setItem(KEYS.VISITS, JSON.stringify(INITIAL_VISITS));
  }
  if (!localStorage.getItem(KEYS.INVOICES)) {
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  }
}

// Auto-run on import
initStorage();

// ==================== PATIENTS API ====================

export function getPatients() {
  try {
    const raw = localStorage.getItem(KEYS.PATIENTS);
    return raw ? JSON.parse(raw) : INITIAL_PATIENTS;
  } catch (e) {
    console.error("Error reading patients", e);
    return INITIAL_PATIENTS;
  }
}

export function getPatientById(id) {
  const patients = getPatients();
  return patients.find(p => p.id === id) || null;
}

/**
 * Checks if a patient with matching phone or normalized name exists
 */
export function findPotentialDuplicates(name = '', phone = '', currentPatientId = null) {
  const patients = getPatients();
  const cleanPhone = phone.trim().replace(/\D/g, '');
  const cleanName = name.trim().toLowerCase();

  return patients.filter(p => {
    if (currentPatientId && p.id === currentPatientId) return false;
    
    const pPhone = (p.phone || '').trim().replace(/\D/g, '');
    const pName = (p.name || '').trim().toLowerCase();

    // Check exact phone match or name similarity
    const exactPhone = cleanPhone && pPhone && cleanPhone === pPhone;
    const exactName = cleanName && pName && (cleanName === pName || pName.includes(cleanName) || cleanName.includes(pName));

    return exactPhone || (exactName && cleanPhone.length > 5 && pPhone.startsWith(cleanPhone.slice(0, 5)));
  });
}

export function savePatient(patientData) {
  const patients = getPatients();
  let updated;

  if (patientData.id) {
    // Update existing
    updated = patients.map(p => p.id === patientData.id ? { ...p, ...patientData, updatedAt: new Date().toISOString() } : p);
  } else {
    // Generate sequential ID
    const nextNum = patients.length + 1001;
    const newPatient = {
      ...patientData,
      id: `SCC-P${nextNum}`,
      createdAt: new Date().toISOString()
    };
    updated = [newPatient, ...patients];
    patientData = newPatient;
  }

  localStorage.setItem(KEYS.PATIENTS, JSON.stringify(updated));
  notifyChange(KEYS.PATIENTS, updated);
  return patientData;
}

export function deletePatient(patientId) {
  const patients = getPatients();
  const updated = patients.filter(p => p.id !== patientId);
  localStorage.setItem(KEYS.PATIENTS, JSON.stringify(updated));
  notifyChange(KEYS.PATIENTS, updated);
  return true;
}

// ==================== VISITS API ====================

export function getVisits() {
  try {
    const raw = localStorage.getItem(KEYS.VISITS);
    return raw ? JSON.parse(raw) : INITIAL_VISITS;
  } catch (e) {
    console.error("Error reading visits", e);
    return INITIAL_VISITS;
  }
}

export function getVisitsForPatient(patientId) {
  const visits = getVisits();
  return visits
    .filter(v => v.patientId === patientId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getVisitById(visitId) {
  const visits = getVisits();
  return visits.find(v => v.id === visitId) || null;
}

export function saveVisit(visitData) {
  const visits = getVisits();
  let updated;
  let finalVisit = { ...visitData };

  if (visitData.id) {
    finalVisit.updatedAt = new Date().toISOString();
    updated = visits.map(v => v.id === visitData.id ? finalVisit : v);
  } else {
    const nextSeq = String(visits.length + 1).padStart(4, '0');
    finalVisit.id = `VIS-2026-${nextSeq}`;
    finalVisit.date = finalVisit.date || new Date().toISOString();
    finalVisit.updatedAt = new Date().toISOString();
    updated = [finalVisit, ...visits];
  }

  localStorage.setItem(KEYS.VISITS, JSON.stringify(updated));
  notifyChange(KEYS.VISITS, updated);
  return finalVisit;
}

// ==================== DRAFT AUTO-SAVE ====================

export function getActiveVisitDraft(patientId) {
  try {
    const raw = localStorage.getItem(`${KEYS.ACTIVE_DRAFT}_${patientId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveActiveVisitDraft(patientId, draftData) {
  if (!patientId) return;
  try {
    localStorage.setItem(
      `${KEYS.ACTIVE_DRAFT}_${patientId}`,
      JSON.stringify({ ...draftData, autoSavedAt: new Date().toISOString() })
    );
  } catch (e) {
    console.warn("Failed to auto-save draft", e);
  }
}

export function clearActiveVisitDraft(patientId) {
  if (!patientId) return;
  localStorage.removeItem(`${KEYS.ACTIVE_DRAFT}_${patientId}`);
}

// ==================== INVOICES API (PAISE ACCOUNTING) ====================

export function getInvoices() {
  try {
    const raw = localStorage.getItem(KEYS.INVOICES);
    return raw ? JSON.parse(raw) : INITIAL_INVOICES;
  } catch (e) {
    console.error("Error reading invoices", e);
    return INITIAL_INVOICES;
  }
}

export function getInvoiceById(invoiceId) {
  const invoices = getInvoices();
  return invoices.find(inv => inv.id === invoiceId) || null;
}

export function getInvoiceByVisitId(visitId) {
  const invoices = getInvoices();
  return invoices.find(inv => inv.visitId === visitId) || null;
}

export function saveInvoice(invoiceData) {
  const invoices = getInvoices();
  let updated;
  let finalInvoice = { ...invoiceData };

  // Calculate paid & balance in paise
  const totalPaidPaise = (finalInvoice.payments || []).reduce((sum, p) => sum + (Number(p.amountPaise) || 0), 0);
  finalInvoice.paidPaise = totalPaidPaise;
  finalInvoice.balancePaise = Math.max(0, (finalInvoice.totalPaise || 0) - totalPaidPaise);

  if (finalInvoice.id) {
    // If invoice was already issued, do not allow mutating items unless it's voided
    const existing = invoices.find(i => i.id === finalInvoice.id);
    if (existing && existing.status === 'Issued' && finalInvoice.status === 'Issued') {
      // Keep immutable invoice values
      finalInvoice = { ...existing, payments: finalInvoice.payments, paidPaise: totalPaidPaise, balancePaise: Math.max(0, existing.totalPaise - totalPaidPaise) };
    }
    updated = invoices.map(i => i.id === finalInvoice.id ? finalInvoice : i);
  } else {
    const settings = getClinicSettings();
    const nextNum = String(invoices.length + 1).padStart(4, '0');
    finalInvoice.id = `${settings.invoicePrefix || 'SCC-2026-'}${nextNum}`;
    finalInvoice.date = finalInvoice.date || new Date().toISOString();
    finalInvoice.status = finalInvoice.status || 'Draft';
    updated = [finalInvoice, ...invoices];
  }

  localStorage.setItem(KEYS.INVOICES, JSON.stringify(updated));
  notifyChange(KEYS.INVOICES, updated);
  return finalInvoice;
}

/**
 * Issues an invoice (makes it immutable)
 */
export function issueInvoice(invoiceId) {
  const invoices = getInvoices();
  const invoice = invoices.find(i => i.id === invoiceId);
  if (!invoice) return null;

  invoice.status = 'Issued';
  invoice.issuedAt = new Date().toISOString();

  localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  notifyChange(KEYS.INVOICES, invoices);
  return invoice;
}

/**
 * Voids an issued invoice with a required reason
 */
export function voidInvoice(invoiceId, reason = 'Voided by Doctor') {
  const invoices = getInvoices();
  const invoice = invoices.find(i => i.id === invoiceId);
  if (!invoice) return null;

  invoice.status = 'Void';
  invoice.voidReason = reason;
  invoice.voidedAt = new Date().toISOString();
  invoice.balancePaise = 0; // Cleared

  localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  notifyChange(KEYS.INVOICES, invoices);
  return invoice;
}

// ==================== CLINIC SETTINGS API ====================

export function getClinicSettings() {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : INITIAL_CLINIC_SETTINGS;
  } catch (e) {
    return INITIAL_CLINIC_SETTINGS;
  }
}

export function saveClinicSettings(settings) {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  notifyChange(KEYS.SETTINGS, settings);
  return settings;
}

// ==================== BACKUP & RESTORE ====================

export function exportDatabaseBackup() {
  const data = {
    app: "Santosh Child Care",
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    settings: getClinicSettings(),
    patients: getPatients(),
    visits: getVisits(),
    invoices: getInvoices()
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `santosh_child_care_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

export function importDatabaseBackup(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.patients || !data.visits || !data.invoices) {
      throw new Error("Invalid backup structure");
    }

    if (data.settings) localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(data.patients));
    localStorage.setItem(KEYS.VISITS, JSON.stringify(data.visits));
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(data.invoices));

    notifyChange(KEYS.PATIENTS, data.patients);
    notifyChange(KEYS.VISITS, data.visits);
    notifyChange(KEYS.INVOICES, data.invoices);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function resetToSeedData() {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_CLINIC_SETTINGS));
  localStorage.setItem(KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
  localStorage.setItem(KEYS.VISITS, JSON.stringify(INITIAL_VISITS));
  localStorage.setItem(KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  
  notifyChange(KEYS.SETTINGS, INITIAL_CLINIC_SETTINGS);
  notifyChange(KEYS.PATIENTS, INITIAL_PATIENTS);
  notifyChange(KEYS.VISITS, INITIAL_VISITS);
  notifyChange(KEYS.INVOICES, INITIAL_INVOICES);
}
