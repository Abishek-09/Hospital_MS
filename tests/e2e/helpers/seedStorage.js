/**
 * Helper to seed LocalStorage mock data before test execution for strict test isolation.
 * Uses page.addInitScript to guarantee storage exists before React hydration.
 */

export const ADMIN_STORAGE_KEY = 'scc_admin_session_v1';
export const USER_STORAGE_KEY = 'scc_user_session_v1';
export const PATIENTS_STORAGE_KEY = 'scc_patients_v1';
export const VISITS_STORAGE_KEY = 'scc_visits_v1';
export const INVOICES_STORAGE_KEY = 'scc_invoices_v1';

export const MOCK_ADMIN_SESSION = {
  role: 'admin',
  username: 'doctor',
  name: 'Dr. B. Sivakumar',
  degrees: 'M.B.B.S., M.D., (PEDS)',
  title: 'Consultant Pediatrician',
  loggedInAt: '2026-10-22T08:00:00.000Z'
};

export const MOCK_USER_SESSION = {
  role: 'user',
  username: 'reception',
  name: 'Front Desk Reception',
  title: 'System Controller',
  loggedInAt: '2026-10-22T08:00:00.000Z'
};

export const MOCK_PATIENTS = [
  {
    id: 'SCC-P1001',
    name: 'Aarav Kumar (ஆரவ்)',
    phone: '9840122581',
    dob: '2022-04-15',
    sex: 'Male',
    address: '14, College Road, Ambalai',
    createdAt: '2026-01-10T10:00:00.000Z'
  },
  {
    id: 'SCC-P1002',
    name: 'Dhanya Sivakumar (தன்யா)',
    phone: '9443213456',
    dob: '2020-08-20',
    sex: 'Female',
    address: '7, Bharathi Street, Ambalai',
    createdAt: '2026-02-15T11:00:00.000Z'
  }
];

export const MOCK_VISITS = [
  {
    id: 'VIS-2026-1001',
    patientId: 'SCC-P1001',
    date: '2026-10-15T09:30:00.000Z',
    complaint: 'High fever x 2 days, poor feeding',
    notes: 'Pharyngeal congestion, chest clear',
    vitals: {
      weightKg: 13.5,
      heightCm: 92,
      temperatureF: 101.2,
      pulseRate: 110,
      spO2: 99
    },
    prescription: [
      {
        drugName: 'Paracetamol Syrup',
        strength: '120mg/5ml',
        dose: '5 ml',
        frequency: '1-1-1 (TDS)',
        duration: '3 days',
        instructions: 'After food / உணவுக்கு பின்'
      }
    ],
    invoiceId: 'INV-2026-1001',
    status: 'Completed'
  }
];

/**
 * Seeds Admin Session in localStorage before page load.
 */
export async function seedAdminAuth(page) {
  await page.addInitScript(({ key, session }) => {
    window.localStorage.setItem(key, JSON.stringify(session));
  }, { key: ADMIN_STORAGE_KEY, session: MOCK_ADMIN_SESSION });
}

/**
 * Seeds User (Receptionist) Session in localStorage before page load.
 */
export async function seedUserAuth(page) {
  await page.addInitScript(({ key, session }) => {
    window.localStorage.setItem(key, JSON.stringify(session));
  }, { key: USER_STORAGE_KEY, session: MOCK_USER_SESSION });
}

/**
 * Seeds Mock Patients and History in localStorage before page load.
 */
export async function seedPatients(page, patients = MOCK_PATIENTS, visits = MOCK_VISITS) {
  await page.addInitScript(({ pKey, vKey, patientsData, visitsData }) => {
    window.localStorage.setItem(pKey, JSON.stringify(patientsData));
    window.localStorage.setItem(vKey, JSON.stringify(visitsData));
  }, {
    pKey: PATIENTS_STORAGE_KEY,
    vKey: VISITS_STORAGE_KEY,
    patientsData: patients,
    visitsData: visits
  });
}

/**
 * Clears all localStorage keys to test negative/unauthenticated paths.
 */
export async function clearStorage(page) {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
}
