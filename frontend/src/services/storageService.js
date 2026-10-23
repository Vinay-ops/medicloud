// LocalStorage Service Wrapper for MediCloud Platform
// Persists active session, tokens, and offline cached data.

const STORAGE_KEYS = {
  AUTH_USER: 'medicloud_current_user',
  AUTH_TOKEN: 'medicloud_access_token',
  DOCTORS: 'medicloud_doctors_roster',
  APPOINTMENTS: 'medicloud_appointments_list',
  SPECIALTIES: 'medicloud_specialties_list',
  USERS_ROSTER: 'medicloud_registered_users',
};

// Safe JSON parser with fallback
const getStorageItem = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
};

const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
};

// Clean legacy mock users and dummy patient credentials from storage if present
export const initializeMediCloudStorage = () => {
  const currentUser = getStorageItem(STORAGE_KEYS.AUTH_USER, null);
  if (currentUser?.email === 'patient@medicloud.demo' || currentUser?.email === 'sarah.jenkins@example.com' || currentUser?.name === 'Sarah Jenkins') {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }
  // Clear any dummy seeded mock users roster
  const users = getStorageItem(STORAGE_KEYS.USERS_ROSTER, []);
  if (users.some((u) => u.email?.includes('@medicloud.demo') || u.name === 'Sarah Jenkins')) {
    localStorage.removeItem(STORAGE_KEYS.USERS_ROSTER);
  }
};

export const storageService = {
  // Auth
  getCurrentUser: () => getStorageItem(STORAGE_KEYS.AUTH_USER, null),
  setCurrentUser: (user) => (user ? setStorageItem(STORAGE_KEYS.AUTH_USER, user) : localStorage.removeItem(STORAGE_KEYS.AUTH_USER)),
  getAuthToken: () => getStorageItem(STORAGE_KEYS.AUTH_TOKEN, null),
  setAuthToken: (token) => (token ? setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token) : localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)),
  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  // Doctors
  getDoctors: () => getStorageItem(STORAGE_KEYS.DOCTORS, []),
  setDoctors: (doctors) => setStorageItem(STORAGE_KEYS.DOCTORS, doctors || []),
  getDoctorById: (id) => {
    const docs = getStorageItem(STORAGE_KEYS.DOCTORS, []);
    return docs.find((d) => d.id === id || d.doctorId === id) || null;
  },
  saveDoctor: (doctor) => {
    const docs = getStorageItem(STORAGE_KEYS.DOCTORS, []);
    const existingIndex = docs.findIndex((d) => d.id === doctor.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...docs];
      updated[existingIndex] = { ...updated[existingIndex], ...doctor };
    } else {
      updated = [doctor, ...docs];
    }
    setStorageItem(STORAGE_KEYS.DOCTORS, updated);
    return doctor;
  },

  // Appointments
  getAppointments: () => getStorageItem(STORAGE_KEYS.APPOINTMENTS, []),
  setAppointments: (appointments) => setStorageItem(STORAGE_KEYS.APPOINTMENTS, appointments || []),
  addAppointment: (appointment) => {
    const list = getStorageItem(STORAGE_KEYS.APPOINTMENTS, []);
    const updated = [appointment, ...list];
    setStorageItem(STORAGE_KEYS.APPOINTMENTS, updated);
    return appointment;
  },
  updateAppointment: (id, updates) => {
    const list = getStorageItem(STORAGE_KEYS.APPOINTMENTS, []);
    const updated = list.map((apt) => (apt.id === id ? { ...apt, ...updates } : apt));
    setStorageItem(STORAGE_KEYS.APPOINTMENTS, updated);
    return updated.find((a) => a.id === id);
  },

  // Specialties
  getSpecialties: () => getStorageItem(STORAGE_KEYS.SPECIALTIES, []),
  addSpecialty: (specialty) => {
    const list = getStorageItem(STORAGE_KEYS.SPECIALTIES, []);
    const updated = [...list, specialty];
    setStorageItem(STORAGE_KEYS.SPECIALTIES, updated);
    return specialty;
  },

  // Users
  getUsers: () => getStorageItem(STORAGE_KEYS.USERS_ROSTER, []),
  addUser: (user) => {
    const list = getStorageItem(STORAGE_KEYS.USERS_ROSTER, []);
    const updated = [...list, user];
    setStorageItem(STORAGE_KEYS.USERS_ROSTER, updated);
    return user;
  },
};
