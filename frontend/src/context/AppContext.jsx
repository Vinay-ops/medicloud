import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest, getAccessToken, setAccessToken } from '../utils/api';
import { storageService, initializeMediCloudStorage } from '../services/storageService';

const AppContext = createContext(null);
const normalizeDoctor = (doctor) => ({ ...doctor, id: doctor.doctorId || doctor.id });
const normalizeAppointment = (appointment) => ({ ...appointment, id: appointment.appointmentId || appointment.id });

export const AppProvider = ({ children }) => {
  // Ensure storage is initialized with data
  useEffect(() => {
    initializeMediCloudStorage();
  }, []);

  const [currentUser, setCurrentUser] = useState(() => storageService.getCurrentUser());
  const [currentRole, setCurrentRole] = useState(() => storageService.getCurrentUser()?.role || null);
  const [authLoading, setAuthLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [pendingRegistrationProfile, setPendingRegistrationProfile] = useState(null);

  const showToast = (message, type = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((previous) => [...previous, { id, message, type }]);
    setTimeout(() => setToasts((previous) => previous.filter((toast) => toast.id !== id)), 4500);
  };
  const removeToast = (id) => setToasts((previous) => previous.filter((toast) => toast.id !== id));

  const clearSession = () => {
    setAccessToken(null);
    storageService.clearAuth();
    setCurrentUser(null);
    setCurrentRole(null);
    setPendingRegistrationProfile(null);
  };

  // Restore authenticated session from backend on mount if access token exists
  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      const token = getAccessToken();
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const profile = await apiRequest('/auth/me');
        if (active && profile?.user) {
          setCurrentUser(profile.user);
          setCurrentRole(profile.user.role || 'patient');
          storageService.setCurrentUser(profile.user);
        }
      } catch {
        if (active) {
          clearSession();
        }
      } finally {
        if (active) setAuthLoading(false);
      }
    };
    restoreSession();
    return () => { active = false; };
  }, []);

  // Fetch doctors and specialties from real backend API on mount
  useEffect(() => {
    let active = true;
    const fetchBackendData = async () => {
      setDataLoading(true);
      try {
        const [doctorResult, specialtyResult] = await Promise.allSettled([
          apiRequest('/doctors'),
          apiRequest('/doctors/specialties'),
        ]);
        if (!active) return;
        if (doctorResult.status === 'fulfilled' && doctorResult.value?.doctors) {
          const fetchedDocs = doctorResult.value.doctors.map(normalizeDoctor);
          setDoctors(fetchedDocs);
          storageService.setDoctors(fetchedDocs);
        }
        if (specialtyResult.status === 'fulfilled' && specialtyResult.value?.specialties) {
          setSpecialties(specialtyResult.value.specialties);
          storageService.setSpecialties(specialtyResult.value.specialties);
        }
      } catch (err) {
        console.error('Error fetching backend data:', err);
      } finally {
        if (active) setDataLoading(false);
      }
    };
    fetchBackendData();
    return () => { active = false; };
  }, []);

  // Refresh user appointments whenever user or role changes
  useEffect(() => {
    if (currentUser) {
      refreshAppointments();
    } else {
      setAppointments([]);
    }
  }, [currentUser?.id, currentRole]);

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password, ...(pendingRegistrationProfile || {}) },
      });
      if (result.token) {
        setAccessToken(result.token);
        storageService.setAuthToken(result.token);
      }
      const profile = await apiRequest('/auth/me');
      setCurrentUser(profile.user);
      setCurrentRole(profile.user.role);
      storageService.setCurrentUser(profile.user);
      setPendingRegistrationProfile(null);
      showToast(`Welcome back, ${profile.user.name}!`);
      return profile.user;
    } finally {
      setAuthLoading(false);
    }
  };

  const registerPatient = async (form) => {
    const fullName = `${form.firstName || ''} ${form.lastName || ''}`.trim() || form.name || 'Patient';
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password,
        name: fullName,
        phone: form.phone,
        dateOfBirth: form.dob || undefined,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
      },
    });
    if (result.token) {
      setAccessToken(result.token);
      storageService.setAuthToken(result.token);
      setCurrentUser(result.user);
      setCurrentRole(result.user.role || 'patient');
      storageService.setCurrentUser(result.user);
      setPendingRegistrationProfile(null);
    }
    showToast('Registration initiated! Please verify your email.');
    return result;
  };

  const confirmRegistration = async (email, code) => {
    return await apiRequest('/auth/confirm', {
      method: 'POST',
      body: { email, code },
    });
  };

  const resendRegistrationCode = async (email) => {
    return await apiRequest('/auth/resend-confirmation', {
      method: 'POST',
      body: { email },
    });
  };

  const logout = async () => {
    try {
      if (getAccessToken()) await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    clearSession();
    showToast('Signed out of MediCloud session.');
  };

  const refreshAppointments = async () => {
    try {
      let path = currentRole === 'patient' ? '/appointments/me'
        : currentRole === 'doctor' ? `/appointments/doctor/${encodeURIComponent(currentUser?.doctorId || currentUser?.userId || currentUser?.id)}`
          : '/admin/appointments';
      const result = await apiRequest(path);
      if (result.appointments) {
        const normalized = result.appointments.map(normalizeAppointment);
        setAppointments(normalized);
        storageService.setAppointments(normalized);
      }
    } catch (err) {
      console.error('Failed to refresh appointments from API:', err);
    }
  };

  // BOOK APPOINTMENT - directly creates via backend API
  const bookAppointment = async (input) => {
    const apiResult = await apiRequest('/appointments', {
      method: 'POST',
      body: {
        doctorId: input.doctorId,
        date: input.date,
        time: input.time,
        type: input.type,
        reason: input.reason,
      },
    });
    if (apiResult?.appointment) {
      const normalized = normalizeAppointment(apiResult.appointment);
      setAppointments((prev) => [normalized, ...prev.filter((a) => a.id !== normalized.id)]);
      showToast('Appointment booked successfully!');
      return { success: true, appointment: normalized };
    }
    return { success: false, error: 'Could not book appointment.' };
  };

  const rescheduleAppointment = async (appointmentId, date, time) => {
    try {
      await apiRequest(`/appointments/${encodeURIComponent(appointmentId)}/reschedule`, {
        method: 'PATCH',
        body: { date, time },
      });
    } catch {
      // Local persistence fallback
    }
    const updated = storageService.updateAppointment(appointmentId, { date, time, status: 'confirmed' });
    setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? { ...a, date, time, status: 'confirmed' } : a)));
    showToast('Appointment rescheduled.');
    return { success: true, appointment: updated };
  };

  const cancelAppointment = async (appointmentId, reason = 'Cancelled by user') => {
    try {
      await apiRequest(`/appointments/${encodeURIComponent(appointmentId)}/cancel`, {
        method: 'PATCH',
        body: { reason },
      });
    } catch {
      // Local persistence fallback
    }
    const updated = storageService.updateAppointment(appointmentId, { status: 'cancelled', notes: reason });
    setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? { ...a, status: 'cancelled', notes: reason } : a)));
    showToast('Appointment cancelled.');
    return { success: true, appointment: updated };
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await apiRequest(`/appointments/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: { status },
      });
    } catch {
      // Local persistence fallback
    }
    const updated = storageService.updateAppointment(id, { status });
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    showToast(`Status updated to ${status}.`);
    return { success: true, appointment: updated };
  };

  const toggleDoctorStatus = async (id) => {
    const doc = doctors.find((item) => item.id === id);
    const newStatus = doc?.status === 'active' ? 'inactive' : 'active';
    try {
      await apiRequest(`/doctors/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
    } catch {
      // Local persistence
    }
    const updated = { ...doc, status: newStatus };
    storageService.saveDoctor(updated);
    setDoctors((prev) => prev.map((d) => (d.id === id ? updated : d)));
    showToast(`Doctor status changed to ${newStatus}.`);
    return { success: true, doctor: updated };
  };

  const addDoctor = async (doctor) => {
    const apiResult = await apiRequest('/doctors', { method: 'POST', body: doctor });
    if (apiResult?.doctor) {
      const norm = normalizeDoctor(apiResult.doctor);
      setDoctors((prev) => [norm, ...prev]);
      showToast('Doctor profile created.');
      return norm;
    }
    return null;
  };

  const updateDoctor = async (id, updates) => {
    await apiRequest(`/doctors/${encodeURIComponent(id)}`, { method: 'PUT', body: updates });
    const existing = doctors.find((d) => d.id === id);
    const updated = { ...existing, ...updates };
    setDoctors((prev) => prev.map((d) => (d.id === id ? updated : d)));
    showToast('Doctor profile updated.');
    return { success: true, doctor: updated };
  };

  const updateDoctorSlots = async (id, availableSlots, availableDays) => {
    await apiRequest(`/doctors/${encodeURIComponent(id)}/slots`, {
      method: 'PUT',
      body: { availableSlots, availableDays },
    });
    const existing = doctors.find((d) => d.id === id);
    const updated = { ...existing, availableSlots, availableDays };
    setDoctors((prev) => prev.map((d) => (d.id === id ? updated : d)));
    showToast('Availability schedule saved.');
    return { success: true, doctor: updated };
  };

  const addSpecialty = async (name, description, icon) => {
    const res = await apiRequest('/doctors/specialties', {
      method: 'POST',
      body: { name, description, icon },
    });
    const newSpec = res?.specialty || { id: `spec-${Date.now()}`, name, description };
    setSpecialties((prev) => [...prev, newSpec]);
    showToast('Specialty added.');
    return { success: true, specialty: newSpec };
  };

  const updateProfile = async (updates) => {
    const res = await apiRequest('/auth/me', { method: 'PUT', body: updates });
    const updatedUser = res?.user || { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    storageService.setCurrentUser(updatedUser);
    showToast('Profile updated successfully.');
    return { success: true, user: updatedUser };
  };

  const value = {
    currentUser,
    currentRole,
    authLoading,
    dataLoading,
    login,
    registerPatient,
    confirmRegistration,
    resendRegistrationCode,
    logout,
    doctors,
    appointments,
    specialties,
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    updateAppointmentStatus,
    addDoctor,
    updateDoctor,
    toggleDoctorStatus,
    updateDoctorSlots,
    addSpecialty,
    updateProfile,
    refreshAppointments,
    toasts,
    showToast,
    removeToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
