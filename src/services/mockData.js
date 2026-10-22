/**
 * Seed Fixtures for Santosh Child Care
 * Dr. B. Sivakumar, M.B.B.S., M.D., (PEDS) - Consultant Pediatrician
 */

export const INITIAL_CLINIC_SETTINGS = {
  clinicName: "Santosh Child Care",
  doctorName: "Dr. B. Sivakumar, M.B.B.S., M.D., (PEDS)",
  qualification: "Consultant Pediatrician",
  regNo: "TNMC-74129",
  address: "7, College Road, Ambalai",
  phone: "8300 44 2584",
  timings: "1:00 PM – 9:00 PM",
  taxPercent: 0, // default 0% as requested
  invoicePrefix: "SCC-2026-",
  defaultConsultationFeePaise: 30000, // ₹300.00
};

export const PEDIATRIC_DRUG_PRESETS = [
  {
    name: "Paracetamol Syrup (Calpol 120)",
    strength: "120mg / 5ml",
    dose: "5 ml",
    frequency: "SOS / TDS",
    duration: "3 days",
    quantity: "1 bottle",
    instructions: "After food / உணவுக்கு பின் (fever > 100°F)"
  },
  {
    name: "Paracetamol Drops (Crocin 100)",
    strength: "100mg / ml",
    dose: "1.2 ml",
    frequency: "SOS",
    duration: "3 days",
    quantity: "1 bottle",
    instructions: "After milk / பாலுக்கு பின் (for fever)"
  },
  {
    name: "Amoxyclav Oral Suspension (Augmentin)",
    strength: "228.5mg / 5ml",
    dose: "4 ml",
    frequency: "1-0-1 (BD)",
    duration: "5 days",
    quantity: "1 bottle",
    instructions: "After food / உணவுக்கு பின்"
  },
  {
    name: "Cefixime Oral Susp (Taxim-O)",
    strength: "50mg / 5ml",
    dose: "5 ml",
    frequency: "1-0-1 (BD)",
    duration: "5 days",
    quantity: "1 bottle",
    instructions: "After food / உணவுக்கு பின்"
  },
  {
    name: "Montelukast + Levocetirizine (Monticope)",
    strength: "2.5mg + 4mg / 5ml",
    dose: "2.5 ml",
    frequency: "0-0-1 (Night)",
    duration: "5 days",
    quantity: "1 bottle",
    instructions: "Night before bed / இரவு தூங்கும் முன்"
  },
  {
    name: "Cetirizine Syrup (Zyrtec)",
    strength: "5mg / 5ml",
    dose: "2.5 ml",
    frequency: "0-0-1 (Night)",
    duration: "3 days",
    quantity: "1 bottle",
    instructions: "At night / இரவு மட்டும்"
  },
  {
    name: "Vitamin D3 Drops (D-3 Must)",
    strength: "400 IU / ml",
    dose: "1 ml",
    frequency: "1-0-0 (Morning)",
    duration: "30 days",
    quantity: "1 bottle",
    instructions: "Morning after feed / காலை பாலுக்குப் பின்"
  },
  {
    name: "Zinc Gluconate Solution (Zinconia)",
    strength: "20mg / 5ml",
    dose: "2.5 ml",
    frequency: "1-0-0 (Morning)",
    duration: "14 days",
    quantity: "1 bottle",
    instructions: "Empty stomach / வெறும் வயிற்றில்"
  },
  {
    name: "ORS Electral Sachet",
    strength: "21.8g Sachet",
    dose: "100 ml after each loose stool",
    frequency: "SOS",
    duration: "3 days",
    quantity: "3 packets",
    instructions: "Mix 1 sachet in 1 litre water / 1 பாக்கெட்டை 1L நீரில் கலக்கவும்"
  },
  {
    name: "Nasoclear Saline Nasal Drops",
    strength: "0.65% w/v",
    dose: "2 drops in each nostril",
    frequency: "TDS / SOS",
    duration: "5 days",
    quantity: "1 bottle",
    instructions: "Before feed / பால் குடிக்கும் முன்"
  },
  {
    name: "Domperidone Oral Drops (Domstal)",
    strength: "10mg / ml",
    dose: "0.5 ml",
    frequency: "TDS / SOS",
    duration: "2 days",
    quantity: "1 bottle",
    instructions: "15 mins before food / உணவுக்கு 15 நிமிடம் முன்"
  }
];

export const INSTRUCTION_PRESETS = [
  { label: "After food / உணவுக்கு பின்", value: "After food / உணவுக்கு பின்" },
  { label: "Before food / உணவுக்கு முன்", value: "Before food / உணவுக்கு முன்" },
  { label: "With milk or after feed / பாலுக்குப் பின்", value: "With milk or after feed / பாலுக்குப் பின்" },
  { label: "Night only before sleep / இரவு தூங்கும் முன் மட்டும்", value: "Night only before sleep / இரவு தூங்கும் முன் மட்டும்" },
  { label: "SOS for fever > 100°F / காய்ச்சல் வந்தால் மட்டும்", value: "SOS for fever > 100°F / காய்ச்சல் வந்தால் மட்டும்" },
  { label: "Dissolve in 1 litre boiled cool water / 1L ஆறிய நீரில் கலக்கவும்", value: "Dissolve in 1 litre boiled cool water / 1L ஆறிய நீரில் கலக்கவும்" },
  { label: "Apply 2 drops before breastfeed / பால் குடிக்கும் முன் 2 சொட்டு", value: "Apply 2 drops before breastfeed / பால் குடிக்கும் முன் 2 சொட்டு" }
];

export const INITIAL_PATIENTS = [
  {
    id: "SCC-P1001",
    name: "Aarav Kumar (ஆரவ்)",
    phone: "8300442581",
    sex: "Male",
    dob: "2023-04-12",
    approxAgeYears: null,
    address: "7, College Road Cross, Ambalai",
    createdAt: "2026-08-10T10:30:00Z"
  },
  {
    id: "SCC-P1002",
    name: "Dhanya Sivakumar (தன்யா)",
    phone: "9840123456",
    sex: "Female",
    dob: "2026-02-15",
    approxAgeYears: null,
    address: "14, Gandhi Nagar, Ambalai",
    createdAt: "2026-09-01T14:15:00Z"
  },
  {
    id: "SCC-P1003",
    name: "Kavin Selvan (கவின்)",
    phone: "9443219870",
    sex: "Male",
    dob: "2021-06-20",
    approxAgeYears: null,
    address: "22, Bazaar Street, Ambalai",
    createdAt: "2026-09-12T16:00:00Z"
  },
  {
    id: "SCC-P1004",
    name: "Ananya Rajesh (அனன்யா)",
    phone: "9884567890",
    sex: "Female",
    dob: "2025-08-05",
    approxAgeYears: null,
    address: "3B, Anna Nagar 2nd St, Ambalai",
    createdAt: "2026-09-25T11:45:00Z"
  },
  {
    id: "SCC-P1005",
    name: "Rithvik N (ரித்விக்)",
    phone: "9790123412",
    sex: "Male",
    dob: null,
    approxAgeYears: 6,
    address: "45, Hospital Road, Ambalai",
    createdAt: "2026-10-02T09:20:00Z"
  },
  {
    id: "SCC-P1006",
    name: "Miruthika S (மிருத்திகா)",
    phone: "9444123890",
    sex: "Female",
    dob: "2024-11-18",
    approxAgeYears: null,
    address: "8, South Street, Ambalai",
    createdAt: "2026-10-10T15:30:00Z"
  },
  {
    id: "SCC-P1007",
    name: "Sai Pranav (சாய் பிரணவ்)",
    phone: "9841098765",
    sex: "Male",
    dob: "2026-06-10",
    approxAgeYears: null,
    address: "12, New Colony, Ambalai",
    createdAt: "2026-10-15T18:00:00Z"
  },
  {
    id: "SCC-P1008",
    name: "Harshitha M (ஹர்ஷிதா)",
    phone: "9710345678",
    sex: "Female",
    dob: null,
    approxAgeYears: 9,
    address: "3, Temple View Road, Ambalai",
    createdAt: "2026-10-18T17:15:00Z"
  }
];

export const INITIAL_VISITS = [
  {
    id: "VIS-2026-0001",
    patientId: "SCC-P1001",
    date: "2026-10-21T14:30:00",
    complaint: "High grade fever since 2 days, dry cough and mild throat pain.",
    notes: "Tonsillar erythema present. Chest clear bilaterally. Hydration adequate.",
    vitals: {
      weightKg: 14.2,
      heightCm: 96,
      temperatureF: 101.4,
      pulseRate: 110,
      spO2: 99,
      headCircumferenceCm: 49.5
    },
    prescription: [
      {
        drugName: "Paracetamol Syrup (Calpol 120)",
        strength: "120mg / 5ml",
        dose: "6 ml",
        frequency: "SOS / TDS",
        duration: "3 days",
        quantity: "1 bottle",
        instructions: "After food / உணவுக்கு பின் (fever > 100°F)"
      },
      {
        drugName: "Amoxyclav Oral Suspension (Augmentin)",
        strength: "228.5mg / 5ml",
        dose: "4.5 ml",
        frequency: "1-0-1 (BD)",
        duration: "5 days",
        quantity: "1 bottle",
        instructions: "After food / உணவுக்கு பின்"
      }
    ],
    invoiceId: "INV-2026-0001",
    status: "Completed",
    updatedAt: "2026-10-21T14:45:00Z"
  },
  {
    id: "VIS-2026-0002",
    patientId: "SCC-P1002",
    date: "2026-10-21T15:15:00",
    complaint: "Routine 8-month developmental checkup & mild diaper rash.",
    notes: "Sits without support, babbling well. Mild contact dermatitis in diaper zone.",
    vitals: {
      weightKg: 8.4,
      heightCm: 71,
      temperatureF: 98.4,
      pulseRate: 122,
      spO2: 100,
      headCircumferenceCm: 44.0
    },
    prescription: [
      {
        drugName: "Vitamin D3 Drops (D-3 Must)",
        strength: "400 IU / ml",
        dose: "1 ml",
        frequency: "1-0-0 (Morning)",
        duration: "30 days",
        quantity: "1 bottle",
        instructions: "Morning after feed / காலை பாலுக்குப் பின்"
      }
    ],
    invoiceId: "INV-2026-0002",
    status: "Completed",
    updatedAt: "2026-10-21T15:30:00Z"
  },
  {
    id: "VIS-2026-0003",
    patientId: "SCC-P1003",
    date: "2026-10-21T16:00:00",
    complaint: "Acute wheezing, nighttime paroxysmal cough.",
    notes: "Bilateral expiratory rhonchi. Nebulized with Levolin + Budecort in clinic. Improved significantly post-neb.",
    vitals: {
      weightKg: 18.0,
      heightCm: 108,
      temperatureF: 98.6,
      pulseRate: 105,
      spO2: 97,
      headCircumferenceCm: 51.0
    },
    prescription: [
      {
        drugName: "Montelukast + Levocetirizine (Monticope)",
        strength: "2.5mg + 4mg / 5ml",
        dose: "5 ml",
        frequency: "0-0-1 (Night)",
        duration: "7 days",
        quantity: "1 bottle",
        instructions: "Night before bed / இரவு தூங்கும் முன்"
      }
    ],
    invoiceId: "INV-2026-0003",
    status: "Completed",
    updatedAt: "2026-10-21T16:25:00Z"
  },
  {
    id: "VIS-2026-0004",
    patientId: "SCC-P1004",
    date: "2026-10-20T17:30:00",
    complaint: "Watery loose stools 4 episodes today, active, accepting oral liquids.",
    notes: "No signs of dehydration. Anterior fontanelle flat, tears present, skin pinch normal.",
    vitals: {
      weightKg: 9.8,
      heightCm: 76,
      temperatureF: 99.0,
      pulseRate: 118,
      spO2: 99,
      headCircumferenceCm: 46.2
    },
    prescription: [
      {
        drugName: "ORS Electral Sachet",
        strength: "21.8g Sachet",
        dose: "50-100 ml after each stool",
        frequency: "SOS",
        duration: "3 days",
        quantity: "2 packets",
        instructions: "Mix 1 sachet in 1 litre water / 1 பாக்கெட்டை 1L நீரில் கலக்கவும்"
      },
      {
        drugName: "Zinc Gluconate Solution (Zinconia)",
        strength: "20mg / 5ml",
        dose: "2.5 ml",
        frequency: "1-0-0 (Morning)",
        duration: "14 days",
        quantity: "1 bottle",
        instructions: "Empty stomach / வெறும் வயிற்றில்"
      }
    ],
    invoiceId: "INV-2026-0004",
    status: "Completed",
    updatedAt: "2026-10-20T17:50:00Z"
  }
];

export const INITIAL_INVOICES = [
  {
    id: "INV-2026-0001",
    visitId: "VIS-2026-0001",
    patientId: "SCC-P1001",
    date: "2026-10-21T14:45:00",
    items: [
      { id: "item-1", description: "Pediatric Consultation", type: "Consultation", amountPaise: 30000 },
      { id: "item-2", description: "Paracetamol & Amoxyclav Starter Pack", type: "Medicine", amountPaise: 25000 }
    ],
    taxPercent: 0,
    taxPaise: 0,
    discountPaise: 0,
    totalPaise: 55000, // ₹550.00
    payments: [
      { mode: "Online (UPI/GPay)", amountPaise: 55000 }
    ],
    paidPaise: 55000,
    balancePaise: 0,
    status: "Issued"
  },
  {
    id: "INV-2026-0002",
    visitId: "VIS-2026-0002",
    patientId: "SCC-P1002",
    date: "2026-10-21T15:30:00",
    items: [
      { id: "item-1", description: "Well Baby Consultation & Growth Charting", type: "Consultation", amountPaise: 30000 },
      { id: "item-2", description: "Vitamin D3 Drops Bottle", type: "Medicine", amountPaise: 18000 }
    ],
    taxPercent: 0,
    taxPaise: 0,
    discountPaise: 0,
    totalPaise: 48000, // ₹480.00
    payments: [
      { mode: "Cash", amountPaise: 48000 }
    ],
    paidPaise: 48000,
    balancePaise: 0,
    status: "Issued"
  },
  {
    id: "INV-2026-0003",
    visitId: "VIS-2026-0003",
    patientId: "SCC-P1003",
    date: "2026-10-21T16:25:00",
    items: [
      { id: "item-1", description: "Emergency Pediatric Consultation", type: "Consultation", amountPaise: 35000 },
      { id: "item-2", description: "In-Clinic Nebulization (Levolin+Budecort)", type: "Procedure", amountPaise: 20000 },
      { id: "item-3", description: "Monticope Syrup", type: "Medicine", amountPaise: 16000 }
    ],
    taxPercent: 0,
    taxPaise: 0,
    discountPaise: 5000, // ₹50.00 discount
    totalPaise: 66000, // ₹660.00
    payments: [
      { mode: "Cash", amountPaise: 50000 } // ₹500 paid, ₹160 pending
    ],
    paidPaise: 50000,
    balancePaise: 16000, // ₹160.00 balance due
    status: "Issued"
  },
  {
    id: "INV-2026-0004",
    visitId: "VIS-2026-0004",
    patientId: "SCC-P1004",
    date: "2026-10-20T17:50:00",
    items: [
      { id: "item-1", description: "Pediatric Consultation", type: "Consultation", amountPaise: 30000 },
      { id: "item-2", description: "ORS Sachet & Zinconia Syrup", type: "Medicine", amountPaise: 19000 }
    ],
    taxPercent: 0,
    taxPaise: 0,
    discountPaise: 0,
    totalPaise: 49000,
    payments: [
      { mode: "Online (UPI/GPay)", amountPaise: 49000 }
    ],
    paidPaise: 49000,
    balancePaise: 0,
    status: "Issued"
  }
];
