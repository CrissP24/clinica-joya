// Utility to reset localStorage data
export const resetLocalStorageData = () => {
  // Clear all medical data
  const keys = [
    'medical_patients',
    'medical_records', 
    'medical_appointments',
    'medical_certificates',
    'medical_users',
    'medical_laboratory_exams',
    'medical_notifications',
    'medical_user' // Current user session
  ];
  
  keys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('LocalStorage data cleared. Please refresh the page.');
};

// Auto-reset if needed (uncomment the line below to enable)
// resetLocalStorageData();
