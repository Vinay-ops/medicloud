import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  CheckCircle,
  Users,
  Settings,
  TrendingUp,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../../components/common/StatsCard';
import { AppointmentCard } from '../../components/common/AppointmentCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';

const actualToday = new Date().toISOString().slice(0, 10);

export const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, doctors, appointments, updateAppointmentStatus } = useApp();

  const [selectedPatientApt, setSelectedPatientApt] = useState(null);

  // Filter doctor's appointments
  const doctorId = currentUser?.doctorId || currentUser?.userId || currentUser?.id;
  const doctorProfile = doctors.find((doctor) => doctor.id === doctorId);
  const myAppointments = appointments.filter((apt) => apt.doctorId === doctorId);

  const isToday = (date) => date === actualToday;

  const todayAppointments = myAppointments.filter(
    (apt) => isToday(apt.date) && apt.status !== 'cancelled'
  );

  const upcomingAppointments = myAppointments.filter(
    (apt) => !isToday(apt.date) && apt.status !== 'cancelled'
  );

  const pendingAppointments = myAppointments.filter((apt) => apt.status === 'pending');
  const completedCount = myAppointments.filter((apt) => apt.status === 'completed').length;

  const handleAccept = (appointmentId) => {
    updateAppointmentStatus(appointmentId, 'confirmed');
  };

  const handleReject = (appointmentId) => {
    updateAppointmentStatus(appointmentId, 'rejected');
  };

  const handleComplete = (appointmentId) => {
    updateAppointmentStatus(appointmentId, 'completed');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Doctor Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-[#0066FF] via-[#0052CC] to-[#06B6D4] rounded-3xl p-6 sm:p-8 text-white shadow-lg"
      >
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 text-white text-2xl font-black grid place-items-center shadow-md" aria-hidden="true">
              {currentUser?.name?.slice(0, 1) || '?'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20 backdrop-blur-xs">
                  Attending Physician
                </span>
                {doctorProfile?.licenseNumber && (
                  <span className="text-xs text-blue-100">License: {doctorProfile.licenseNumber}</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                {currentUser?.name || 'Doctor'}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                {[doctorProfile?.title, doctorProfile?.specialty, doctorProfile?.hospital].filter(Boolean).join(' • ') || 'Doctor profile details are not available.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              leftIcon={Settings}
              onClick={() => navigate('/doctor/schedule')}
              className="bg-white/15 hover:bg-white/25 text-white border-white/30 font-bold backdrop-blur-sm"
            >
              Manage Slots
            </Button>
            <Button
              variant="secondary"
              leftIcon={Calendar}
              onClick={() => navigate('/doctor/schedule')}
              className="bg-white hover:bg-slate-50 text-[#0066FF] font-bold border-none shadow-md"
            >
              Schedule
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Doctor KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Patients"
          value={todayAppointments.length}
          subtitle="In today's clinic queue"
          icon={Users}
        />
        <StatsCard
          title="Pending Approval"
          value={pendingAppointments.length}
          subtitle="Awaiting confirmation"
          icon={Clock}
          trend={pendingAppointments.length > 0 ? `${pendingAppointments.length} action required` : 'No pending items'}
          trendPositive={null}
        />
        <StatsCard
          title="Upcoming Visits"
          value={upcomingAppointments.length}
          subtitle="Confirmed future consults"
          icon={Calendar}
        />
        <StatsCard
          title="Completed"
          value={completedCount}
          subtitle="Total consultations done"
          icon={CheckCircle}
          trend="All time"
          trendPositive={true}
        />
      </div>

      {/* TODAY'S APPOINTMENTS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#1E293B] tracking-tight flex items-center gap-2">
              <span>Today's Appointment Queue</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#0066FF] text-white">
                {todayAppointments.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled consultations for today ({formatDate(actualToday)})
            </p>
          </div>
        </div>

        {todayAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {todayAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                viewRole="doctor"
                onAccept={handleAccept}
                onReject={handleReject}
                onComplete={handleComplete}
                onViewDetails={(appointment) => setSelectedPatientApt(appointment)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CheckCircle}
            title="No appointments scheduled for today"
            description="Your clinic queue for today is complete or has no pending consults."
          />
        )}
      </div>

      {/* UPCOMING & PENDING REQUESTS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#1E293B] tracking-tight">
              Upcoming Consultations & Requests
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Future bookings requiring your preparation or approval
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={ChevronRight}
            onClick={() => navigate('/doctor/schedule')}
            className="text-[#0066FF] hover:bg-blue-50"
          >
            Full Calendar
          </Button>
        </div>

        {upcomingAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {upcomingAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                viewRole="doctor"
                onAccept={handleAccept}
                onReject={handleReject}
                onComplete={handleComplete}
                onViewDetails={(appointment) => setSelectedPatientApt(appointment)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No upcoming future visits"
            description="No upcoming appointments on the calendar beyond today."
          />
        )}
      </div>

      {/* Patient Details Modal */}
      {selectedPatientApt && (
        <Modal
          isOpen={!!selectedPatientApt}
          onClose={() => setSelectedPatientApt(null)}
          title={`Patient Case: ${selectedPatientApt.patientName}`}
          subtitle={`Appointment ID: ${selectedPatientApt.id} • ${formatDate(selectedPatientApt.date)}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">Patient Demographics</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{selectedPatientApt.patientGender || 'Not provided'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">Contact Phone</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{selectedPatientApt.patientPhone || 'Not provided'}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Chief Consultation Reason</span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-800">
                {selectedPatientApt.reason}
              </div>
            </div>

            {selectedPatientApt.notes && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Clinical Notes</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 italic">
                  {selectedPatientApt.notes}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Badge status={selectedPatientApt.status} />

              <div className="flex items-center gap-2">
                {selectedPatientApt.status === 'pending' && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        handleReject(selectedPatientApt.id);
                        setSelectedPatientApt(null);
                      }}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        handleAccept(selectedPatientApt.id);
                        setSelectedPatientApt(null);
                      }}
                    >
                      Accept
                    </Button>
                  </>
                )}
                {selectedPatientApt.status === 'confirmed' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      handleComplete(selectedPatientApt.id);
                      setSelectedPatientApt(null);
                    }}
                  >
                    Mark Consult Completed
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
