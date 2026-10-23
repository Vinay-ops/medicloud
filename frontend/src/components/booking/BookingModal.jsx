import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Video, Building2, CheckCircle2, AlertCircle, Calendar, Sparkles, User, FileText } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

const dateAtMidnight = new Date();
const MIN_BOOKING_DATE = new Date(dateAtMidnight.getTime() - dateAtMidnight.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
dateAtMidnight.setDate(dateAtMidnight.getDate() + 1);
const DEFAULT_BOOKING_DATE = new Date(dateAtMidnight.getTime() - dateAtMidnight.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export const BookingModal = ({ isOpen, onClose, doctor, initialDate, initialSlot }) => {
  const { bookAppointment, appointments, currentUser } = useApp();

  const [date, setDate] = useState(initialDate || DEFAULT_BOOKING_DATE);
  const [selectedSlot, setSelectedSlot] = useState(initialSlot || doctor?.availableSlots?.[0] || '10:00 AM');
  const [type, setType] = useState('In-Person Consultation');
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedApt, setConfirmedApt] = useState(null);
  const [slotError, setSlotError] = useState('');

  // Check which slots for this doctor on this date are already booked
  const isSlotBooked = (slot, checkDate = date) => {
    return appointments.some(
      (apt) =>
        apt.doctorId === doctor?.id &&
        apt.date === checkDate &&
        apt.time === slot &&
        apt.status !== 'cancelled' &&
        apt.status !== 'rejected'
    );
  };

  if (!doctor) return null;

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSlotError('');
    const firstUnbooked = doctor.availableSlots?.find((slot) => !isSlotBooked(slot, newDate));
    setSelectedSlot(firstUnbooked || doctor.availableSlots?.[0] || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSlotError('');

    if (!date) {
      setSlotError('Please choose an appointment date.');
      return;
    }
    if (!selectedSlot) {
      setSlotError('Please select an available time slot.');
      return;
    }

    if (isSlotBooked(selectedSlot)) {
      setSlotError(`The slot (${selectedSlot}) is already booked for ${doctor.name} on ${date}. Please select another time.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const fullReason = [reason.trim(), symptoms.trim() ? `Symptoms: ${symptoms.trim()}` : ''].filter(Boolean).join(' • ');
      const result = await bookAppointment({
        doctorId: doctor.id,
        date,
        time: selectedSlot,
        type,
        reason: fullReason || 'Standard Consultation',
      });
      if (result.success && result.appointment) {
        setConfirmedApt(result.appointment);
      } else {
        setSlotError(result.error || 'The appointment could not be booked.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={confirmedApt ? 'Booking Confirmed' : `Schedule with ${doctor.name}`}
      subtitle={confirmedApt ? 'Your appointment is confirmed and synced to your schedule' : `${doctor.specialty} • ${doctor.hospital}`}
      maxWidth="max-w-2xl"
    >
      {confirmedApt ? (
        // Confirmation Screen with Framer Motion Entrance
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center py-4 space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h4 className="text-2xl font-black text-[#1E293B]">Appointment Confirmed!</h4>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Your consultation with <span className="font-bold text-[#0066FF]">{confirmedApt.doctorName}</span> is saved to your account.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-[#E2E8F0] text-left space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">Reference Code</span>
              <span className="font-mono font-bold text-[#0066FF] uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {confirmedApt.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Date & Time</span>
                <span className="font-bold text-[#1E293B] mt-0.5 block">
                  {formatDate(confirmedApt.date)} at {confirmedApt.time}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Consultation Type</span>
                <span className="font-bold text-[#1E293B] mt-0.5 block">{confirmedApt.type}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Patient Name</span>
                <span className="font-bold text-[#1E293B] mt-0.5 block">{confirmedApt.patientName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Consultation Fee</span>
                <span className="font-bold text-[#0066FF] mt-0.5 block">{formatCurrency(confirmedApt.fee)}</span>
              </div>
            </div>

            {confirmedApt.reason && (
              <div className="pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500 block font-medium">Details & Symptoms:</span>
                <span className="text-slate-700 mt-0.5 block font-normal">{confirmedApt.reason}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-center">
            <Button
              variant="primary"
              className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-8 py-2.5 rounded-xl font-bold shadow-md"
              onClick={onClose}
            >
              Done & Return
            </Button>
          </div>
        </motion.div>
      ) : (
        // Booking Form
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Doctor Brief Banner */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50/60 to-cyan-50/40 rounded-2xl border border-blue-200/80">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-[#1E293B] truncate">{doctor.name}</h4>
              <p className="text-xs font-semibold text-[#0066FF]">{doctor.specialty} • {doctor.hospital}</p>
              <p className="text-xs text-slate-500 mt-0.5">{doctor.location}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xs text-slate-400 uppercase font-bold block">Fee</span>
              <span className="text-lg font-black text-[#0066FF]">{formatCurrency(doctor.fee)}</span>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase block mb-1.5">
              1. Choose Appointment Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              min={MIN_BOOKING_DATE}
              onChange={(e) => handleDateChange(e.target.value)}
              required
              className="w-full bg-white text-slate-900 text-sm rounded-xl border border-slate-300 py-2.5 px-3.5 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/15 outline-none cursor-pointer"
            />
          </div>

          {/* Time Slots Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                2. Select Available Time Slot <span className="text-rose-500">*</span>
              </label>
              <span className="text-2xs text-slate-500 font-medium">
                {doctor.availableSlots?.length || 0} slots configured
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {doctor.availableSlots && doctor.availableSlots.length > 0 ? (
                doctor.availableSlots.map((slot) => {
                  const booked = isSlotBooked(slot);
                  const isSelected = selectedSlot === slot && !booked;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={booked}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setSlotError('');
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                        booked
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-[#0066FF] text-white border-[#0066FF] shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{slot}</span>
                      </div>
                      {booked && <span className="text-2xs block text-slate-400 mt-0.5">Booked</span>}
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 col-span-3">No regular slots available.</p>
              )}
            </div>
          </div>

          {/* Consultation Type */}
          <div>
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase block mb-1.5">
              3. Consultation Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('In-Person Consultation')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  type === 'In-Person Consultation'
                    ? 'border-[#0066FF] bg-blue-50/50 text-[#0066FF] ring-2 ring-[#0066FF]/20 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Building2 className={`w-5 h-5 ${type === 'In-Person Consultation' ? 'text-[#0066FF]' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold block">In-Clinic Visit</span>
                  <span className="text-2xs text-slate-500 font-normal">Attend at {doctor.hospital}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('Video Telehealth')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  type === 'Video Telehealth'
                    ? 'border-[#0066FF] bg-blue-50/50 text-[#0066FF] ring-2 ring-[#0066FF]/20 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Video className={`w-5 h-5 ${type === 'Video Telehealth' ? 'text-[#0066FF]' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold block">Video Telehealth</span>
                  <span className="text-2xs text-slate-500 font-normal">Encrypted digital consult</span>
                </div>
              </button>
            </div>
          </div>

          {/* Symptoms and Reason */}
          <div className="space-y-3">
            <Input
              label="Consultation Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Annual routine heart checkup, second opinion"
              required
            />

            <div>
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase block mb-1">
                Patient Symptoms or Notes (Optional)
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={2}
                placeholder="Describe current symptoms, duration, or any medications..."
                className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-300 p-3 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/15 outline-none resize-none"
              />
            </div>
          </div>

          <AnimatePresence>
            {slotError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{slotError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Consultation Total: <span className="font-extrabold text-[#1E293B] text-sm">{formatCurrency(doctor.fee)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="bg-[#0066FF] hover:bg-[#0052CC] text-white shadow-md rounded-xl font-bold"
                isLoading={isSubmitting}
              >
                Confirm Appointment
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
