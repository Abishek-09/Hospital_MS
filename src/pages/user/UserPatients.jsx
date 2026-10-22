import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  UserPlus,
  Edit3,
  Trash2,
  Phone,
  User,
  ArrowRight,
  ClipboardList,
  X,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { getPatients, savePatient, deletePatient, findPotentialDuplicates } from '../../services/storage';
import { formatDate } from '../../utils/date';
import { useToast } from '../../context/ToastContext';

export default function UserPatients() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State for Add / Edit (STRICT CONSTRAINT: ONLY Name and Mobile)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null); // null if adding, patient object if editing
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [formErrors, setFormErrors] = useState({});

  // Delete Confirmation State
  const [patientToDelete, setPatientToDelete] = useState(null);

  const loadData = () => {
    setPatients(getPatients());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('scc_storage_change', loadData);
    return () => window.removeEventListener('scc_storage_change', loadData);
  }, []);

  const filteredPatients = patients.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    return !term || p.name.toLowerCase().includes(term) || p.phone.includes(term) || p.id.toLowerCase().includes(term);
  });

  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setFormData({ name: '', phone: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (patient) => {
    setEditingPatient(patient);
    setFormData({ name: patient.name, phone: patient.phone });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Patient name is required';
    }
    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!cleanPhone) {
      errors.phone = 'Mobile number is required';
    } else if (cleanPhone.length !== 10) {
      errors.phone = 'Mobile number must be exactly 10 digits';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePatient = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');

    if (editingPatient) {
      // Update
      const updated = savePatient({
        ...editingPatient,
        name: formData.name.trim(),
        phone: cleanPhone
      });
      addToast({
        title: "Patient Updated",
        message: `${updated.name} (${updated.id}) details updated.`,
        type: "success"
      });
    } else {
      // Create (STRICT: ONLY Name & Mobile Number)
      const created = savePatient({
        name: formData.name.trim(),
        phone: cleanPhone,
        sex: 'Other',
        address: 'Ambalai'
      });
      addToast({
        title: "Patient Enrolled",
        message: `Registered ${created.name} with ID ${created.id}.`,
        type: "success"
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!patientToDelete) return;
    deletePatient(patientToDelete.id);
    addToast({
      title: "Patient Record Removed",
      message: `Deleted patient ${patientToDelete.name} (${patientToDelete.id}).`,
      type: "warning"
    });
    setPatientToDelete(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">
            Front Desk Patient Directory (CRUD)
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Register new child patients, update contact mobile numbers, and queue for doctor consultation
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-brand-sand" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-brand-border/70 shadow-soft flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Search by Child Name or 10-digit Mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-stone-300 focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
          />
        </div>

        <div className="text-xs font-mono text-stone-500 font-bold">
          {filteredPatients.length} Registered Patients
        </div>
      </div>

      {/* Patients Data Table */}
      <div className="bg-white rounded-2xl border border-brand-border/70 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-brand-dark font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Child Name</th>
                <th className="py-3 px-4">Mobile Number</th>
                <th className="py-3 px-4">Enrollment Date</th>
                <th className="py-3 px-4 text-right">Actions (CRUD & Prep)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-brand-sage-subtle/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-600">
                      {patient.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-brand-dark text-sm">
                      {patient.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-stone-700">
                      {patient.phone}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">
                      {formatDate(patient.createdAt || patient.dob || new Date().toISOString())}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Queue / Visit Workspace Prep */}
                        <button
                          onClick={() => navigate(`/user/workspace?patientId=${patient.id}`)}
                          className="px-2.5 py-1.5 bg-brand-teal/10 hover:bg-brand-teal text-brand-teal hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                          title="Open Visit Workspace"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span>View History</span>
                        </button>

                        {/* Edit (Name & Mobile ONLY) */}
                        <button
                          onClick={() => handleOpenEditModal(patient)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-brand-dark hover:bg-stone-100 transition-colors"
                          title="Edit Patient"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setPatientToDelete(patient)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Patient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400">
                    <Users className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                    <p className="text-sm font-semibold text-stone-600">No patients found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STRICT CONSTRAINT MODAL: Add / Edit with ONLY Name and Mobile Number */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white rounded-2xl shadow-elevated border border-brand-border w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-brand-dark text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-brand-sand" />
                <h3 className="font-bold text-base">
                  {editingPatient ? 'Edit Patient Contact' : 'Register New Child Patient'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form with STRICT CONSTRAINT: Only Name and Mobile Number */}
            <form onSubmit={handleSavePatient} className="p-6 space-y-4">
              <div className="p-3 bg-brand-sage-subtle rounded-xl border border-brand-sage/60 text-xs text-brand-dark">
                <strong>Front Desk Enrollment:</strong> Enter the child's name and parent's 10-digit mobile number.
              </div>

              {/* Field 1: Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                  Child's Full Name <span className="text-red-500">*</span>
                  <span className="text-[10px] font-normal text-stone-500 ml-1">(Supports தமிழ்)</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type="text"
                    placeholder="e.g. Aarav Kumar or ஆரவ் குமார்"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-teal/30 ${formErrors.name ? 'border-red-400 bg-red-50/30' : 'border-stone-300 focus:border-brand-teal'
                      }`}
                  />
                </div>
                {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
              </div>

              {/* Field 2: Mobile Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit parent mobile"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    className={`w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-teal/30 ${formErrors.phone ? 'border-red-400 bg-red-50/30' : 'border-stone-300 focus:border-brand-teal'
                      }`}
                  />
                </div>
                {formErrors.phone && <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  {editingPatient ? 'Update Patient' : 'Save Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white rounded-2xl shadow-elevated border border-red-200 w-full max-w-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-stone-900">Delete Patient?</h3>
                <p className="text-xs text-stone-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              Are you sure you want to delete patient record for <strong>{patientToDelete.name}</strong> ({patientToDelete.id})?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPatientToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
