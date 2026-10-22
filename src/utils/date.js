/**
 * Date and Pediatric Age Helpers
 */

export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Calculates human-readable pediatric age
 * Takes a patient object with either dob or approxAgeYears
 */
export function getPatientAgeDisplay(patient) {
  if (!patient) return '';

  if (patient.dob) {
    const birthDate = new Date(patient.dob);
    const today = new Date();
    if (isNaN(birthDate.getTime())) return '';

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      // Get days in previous month
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years === 0 && months === 0) {
      return `${Math.max(1, days)} day${days > 1 ? 's' : ''}`;
    }
    if (years === 0) {
      return `${months} mo${months > 1 ? 's' : ''}${days > 0 ? ` ${days}d` : ''}`;
    }
    if (years < 3) {
      return `${years} yr${years > 1 ? 's' : ''}${months > 0 ? ` ${months} mo${months > 1 ? 's' : ''}` : ''}`;
    }
    return `${years} yrs`;
  }

  if (patient.approxAgeYears !== undefined && patient.approxAgeYears !== null) {
    const yrs = patient.approxAgeYears;
    return `~${yrs} yr${yrs !== 1 ? 's' : ''}`;
  }

  return 'Age unknown';
}
