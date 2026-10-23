import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Search,
  Plus,
  AlertCircle,
  Clock,
  Video,
  Building2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  User,
  Filter,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { RescheduleModal } from '../../components/booking/RescheduleModal';
import { Modal } from '../../components/common/Modal';
import { formatDate, formatCurrency } from '../../utils/formatters';

export const PatientAppointments = () => {
  const navigate = useNavigate();
  const { currentUser, appointments, cancelAppointment, updateAppointmentStatus } = useApp();

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'completed', 'cancelled', 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [reschedulingApt, setReschedulingApt] = useState(null);
  const [cancelingApt, setCancelingApt] = useState(null);

  // Filter appointments for active user or demo fallback
  const myAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (!currentUser) return true;
      return (
        apt.patientId === currentUser.userId ||
        apt.patientId === currentUser.id ||
        apt.patientEmail === currentUser.email ||
        apt.patientName?.toLowerCase() === currentUser.name?.toLowerCase()
      );
    });
  }, [appointments, currentUser]);

  const categorizedAppointments = useMemo(() => {
    return {
      upcoming: myAppointments.filter((a) => a.status === 'confirmed' || a.status === 'pending'),
      completed: myAppointments.filter((a) => a.status === 'completed'),
      cancelled: myAppointments.filter((a) => a.status === 'cancelled' || a.status === 'rejected'),
      all: myAppointments,
    };
  }, [myAppointments]);

  const filteredList = useMemo(() => {
    const list = categorizedAppointments[activeTab] || [];
    if (!searchTerm) return list;
    return list.filter(
      (apt) =>
        apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctorSpecialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctorHospital?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categorizedAppointments, activeTab, searchTerm]);

  const handleConfirmCancel = () => {
    if (cancelingApt) {
      cancelAppointment(cancelingApt.id, 'Cancelled by patient via portal');
      setCancelingApt(null);
    }
  };

  const handleMarkCompleted = (id) => {
    updateAppointmentStatus(id, 'completed');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Consultation Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Live schedule of your medical consultations with instant persistent updates
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={Plus}
          onClick={() => navigate('/doctors')}
          className="bg-[#0066FF] hover:bg-[#0052CC] font-bold shadow-md rounded-xl"
        >
          Book New Consultation
        </Button>
      </div>

      {/* Tabs and Live Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Category Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'upcoming'
                ? 'bg-white text-[#0066FF] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming ({categorizedAppointments.upcoming.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({categorizedAppointments.completed.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cancelled'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancelled ({categorizedAppointments.cancelled.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white text-[#1E293B] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All History ({categorizedAppointments.all.length})
          </button>
        </div>

        {/* Live Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by doctor or clinic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-[#0066FF] outline-none transition-all"
          />
        </div>
      </div>

      {/* Appointment Cards Grid */}
      <AnimatePresence mode="popLayout">
        {filteredList.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {filteredList.map((apt) => {
              const isVideo = apt.type?.toLowerCase().includes('video');
              const isUpcoming = apt.status === 'confirmed' || apt.status === 'pending';

              return (
                <motion.div
                  key={apt.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-3xl border border-[#E2E8F0] hover:border-blue-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header: Date and Badge */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-[#1E293B] bg-slate-100 px-3 py-1 rounded-xl">
                          <Calendar className="w-3.5 h-3.5 text-[#0066FF]" />
                          <span>{formatDate(apt.date)}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-[#0066FF] bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200/60">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{apt.time}</span>
                        </span>
                      </div>
                      <Badge status={apt.status} />
                    </div>

                    {/* Doctor Info */}
                    <div className="flex items-center gap-4">
                      <img
                        src={apt.doctorImage}
                        alt={apt.doctorName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0 bg-slate-100"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base font-bold text-[#1E293B] truncate">{apt.doctorName}</h4>
                        <p className="text-xs font-semibold text-[#0066FF] truncate">{apt.doctorSpecialty}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{apt.doctorHospital}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-2xs text-slate-400 font-bold uppercase block">Fee</span>
                        <span className="text-sm font-black text-[#1E293B]">{formatCurrency(apt.fee)}</span>
                      </div>
                    </div>

                    {/* Details Box */}
                    <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-600 font-medium">
                        <span className="flex items-center gap-1.5">
                          {isVideo ? <Video className="w-3.5 h-3.5 text-[#0066FF]" /> : <Building2 className="w-3.5 h-3.5 text-[#0066FF]" />}
                          {apt.type}
                        </span>
                        <span className="text-2xs uppercase tracking-wider text-slate-400 font-mono">{apt.id}</span>
                      </div>
                      <p className="text-slate-800 font-semibold pt-1 border-t border-slate-200/60">
                        <span className="text-slate-400 font-normal">Reason: </span>
                        {apt.reason}
                      </p>
                      {apt.notes && (
                        <p className="text-2xs text-slate-500 italic">
                          Note: {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {isUpcoming && (
                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={RotateCcw}
                        onClick={() => setReschedulingApt(apt)}
                        className="text-xs font-semibold rounded-xl"
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCancelingApt(apt)}
                        className="text-xs text-rose-600 hover:bg-rose-50 rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={Check}
                        onClick={() => handleMarkCompleted(apt.id)}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                      >
                        Completed
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <EmptyState
            icon={Calendar}
            title={`No ${activeTab} appointments found`}
            description={
              activeTab === 'upcoming'
                ? 'You do not have any upcoming medical appointments scheduled right now.'
                : 'No appointment records in this category.'
            }
            actionLabel="Schedule an Appointment"
            onAction={() => navigate('/doctors')}
          />
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      {reschedulingApt && (
        <RescheduleModal
          isOpen={!!reschedulingApt}
          onClose={() => setReschedulingApt(null)}
          appointment={reschedulingApt}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {cancelingApt && (
        <Modal
          isOpen={!!cancelingApt}
          onClose={() => setCancelingApt(null)}
          title="Cancel Consultation"
          subtitle={`With ${cancelingApt.doctorName}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>
                Are you sure you want to cancel your appointment on <strong>{cancelingApt.date}</strong> at <strong>{cancelingApt.time}</strong>?
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setCancelingApt(null)}>
                Keep Appointment
              </Button>
              <Button variant="danger" onClick={handleConfirmCancel}>
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
