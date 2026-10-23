import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  MapPin,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  Award,
  BookOpen,
  Languages,
  CheckCircle2,
  ArrowLeft,
  Video,
  ChevronRight,
  Phone,
  Mail,
  HeartPulse,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BookingModal } from '../../components/booking/BookingModal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

const dateTomorrow = new Date();
dateTomorrow.setDate(dateTomorrow.getDate() + 1);
const DEFAULT_WIZARD_DATE = new Date(dateTomorrow.getTime() - dateTomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export const DoctorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { doctors, appointments, bookAppointment } = useApp();

  const doctor = doctors.find((d) => d.id === id || d.doctorId === id) || doctors[0];

  // Wizard state inside profile
  const [wizardStep, setWizardStep] = useState(1); // 1: Date & Time, 2: Consultation Type & Symptoms, 3: Review & Confirm
  const [selectedDate, setSelectedDate] = useState(DEFAULT_WIZARD_DATE);
  const [selectedSlot, setSelectedSlot] = useState(doctor?.availableSlots?.[0] || '10:00 AM');
  const [consultType, setConsultType] = useState('In-Person Consultation');
  const [symptoms, setSymptoms] = useState('');
  const [reason, setReason] = useState('Routine Medical Consultation');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-xl font-bold text-[#1E293B]">Doctor not found</h2>
        <Button onClick={() => navigate('/doctors')} className="mt-4">Back to Doctors Directory</Button>
      </div>
    );
  }

  // Check booked slots for this doctor
  const isSlotBooked = (slot) => {
    return appointments.some(
      (apt) =>
        apt.doctorId === doctor.id &&
        apt.date === selectedDate &&
        apt.time === slot &&
        apt.status !== 'cancelled'
    );
  };

  const handleConfirmScheduleWizard = async () => {
    setIsBooking(true);
    try {
      const fullReason = [reason, symptoms ? `Symptoms: ${symptoms}` : ''].filter(Boolean).join(' • ');
      const res = await bookAppointment({
        doctorId: doctor.id,
        date: selectedDate,
        time: selectedSlot,
        type: consultType,
        reason: fullReason,
      });
      if (res.success && res.appointment) {
        setBookingSuccess(res.appointment);
        setWizardStep(4); // Success step
      }
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Back button and breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/doctors" className="hover:text-[#0066FF] flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Doctors Directory</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-[#0066FF] font-bold">{doctor.name}</span>
      </div>

      {/* Main Grid: Left Doctor Profile Details, Right Interactive Booking Wizard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Doctor Profile & Background (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-blue-50 shadow-md"
                />
                <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white" title="Active Specialist" />
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0066FF] border border-blue-200">
                    {doctor.specialty}
                  </span>
                  {doctor.featured && (
                    <span className="px-2.5 py-1 rounded-full text-2xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Top Rated
                    </span>
                  )}
                  <Badge status={doctor.status} />
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B] tracking-tight">
                  {doctor.name}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  {doctor.title}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
                  <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{doctor.rating || 4.9}</span>
                    <span className="text-slate-400 font-normal">({doctor.reviewCount || 120} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-[#0066FF]" />
                    <span className="font-semibold text-slate-700">{doctor.experience || 12} Years Experience</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinic & Location Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#E2E8F0] text-xs">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <Building2 className="w-5 h-5 text-[#0066FF] shrink-0" />
                <div className="min-w-0">
                  <span className="text-2xs text-slate-400 font-bold uppercase block">Hospital Center</span>
                  <span className="font-bold text-[#1E293B] truncate block">{doctor.hospital}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <MapPin className="w-5 h-5 text-[#0066FF] shrink-0" />
                <div className="min-w-0">
                  <span className="text-2xs text-slate-400 font-bold uppercase block">Clinic Location</span>
                  <span className="font-bold text-[#1E293B] truncate block">{doctor.location}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Biography & Approach */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-4"
          >
            <h3 className="text-lg font-bold text-[#1E293B] tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0066FF]" />
              <span>Professional Biography & Care Approach</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {doctor.bio || `${doctor.name} is a renowned medical specialist with dedicated focus on modern clinical outcomes, personalized care plans, and preventive diagnosis. Providing consultations both via clinic visit and telehealth video sessions.`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E2E8F0] text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-2xs font-extrabold uppercase text-slate-400 block tracking-wider">
                  Education & Board Certifications
                </span>
                <span className="font-bold text-[#1E293B] block">
                  {doctor.education || 'Columbia University College of Physicians & Surgeons'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-2xs font-extrabold uppercase text-slate-400 block tracking-wider">
                  Languages Spoken
                </span>
                <span className="font-bold text-[#1E293B] block">
                  {doctor.languages?.join(', ') || 'English, Spanish'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Typical Available Consulting Days */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-4"
          >
            <h3 className="text-base font-bold text-[#1E293B] tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0066FF]" />
              <span>Configured Available Days & Routine Slots</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {(doctor.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']).map((day) => (
                <span key={day} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                  {day}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {(doctor.availableSlots || ['09:00 AM', '11:00 AM', '02:00 PM']).map((slot) => (
                <span key={slot} className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0066FF] border border-blue-200 text-2xs font-bold">
                  {slot}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Interactive Appointment Scheduling Wizard (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white rounded-3xl border-2 border-blue-200/90 shadow-xl overflow-hidden">
            {/* Wizard Header Strip */}
            <div className="bg-gradient-to-r from-[#0066FF] to-[#06B6D4] p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xs font-extrabold uppercase tracking-widest text-cyan-200 block">
                    Interactive Scheduling Wizard
                  </span>
                  <h3 className="text-xl font-black tracking-tight">Book Consultation</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xs uppercase text-blue-100 block">Fee</span>
                  <span className="text-xl font-black">{formatCurrency(doctor.fee)}</span>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20 text-xs">
                <div className={`flex items-center gap-1.5 ${wizardStep >= 1 ? 'font-bold text-white' : 'text-blue-200 opacity-60'}`}>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-2xs">1</span>
                  <span>Date & Slot</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                <div className={`flex items-center gap-1.5 ${wizardStep >= 2 ? 'font-bold text-white' : 'text-blue-200 opacity-60'}`}>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-2xs">2</span>
                  <span>Symptoms</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                <div className={`flex items-center gap-1.5 ${wizardStep >= 3 ? 'font-bold text-white' : 'text-blue-200 opacity-60'}`}>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-2xs">3</span>
                  <span>Review</span>
                </div>
              </div>
            </div>

            {/* Wizard Body */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* STEP 1: Date & Time Slot */}
                {wizardStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                        Select Appointment Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        min={DEFAULT_WIZARD_DATE}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl border border-slate-300 py-2.5 px-3.5 focus:bg-white focus:border-[#0066FF] outline-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                        Choose Available Time Slot
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(doctor.availableSlots || ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']).map((slot) => {
                          const booked = isSlotBooked(slot);
                          const isSelected = selectedSlot === slot && !booked;

                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={booked}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                                booked
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                  : isSelected
                                  ? 'bg-[#0066FF] text-white border-[#0066FF] shadow-xs'
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              {slot} {booked && '(Booked)'}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#E2E8F0]">
                      <Button
                        variant="primary"
                        className="w-full justify-center bg-[#0066FF] hover:bg-[#0052CC] py-3 rounded-xl font-bold shadow-md"
                        onClick={() => setWizardStep(2)}
                      >
                        Continue to Visit Details
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Consultation Type & Patient Symptoms */}
                {wizardStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                        Consultation Mode
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setConsultType('In-Person Consultation')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            consultType === 'In-Person Consultation'
                              ? 'border-[#0066FF] bg-blue-50/50 text-[#0066FF] ring-2 ring-[#0066FF]/20 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <Building2 className="w-5 h-5 mb-1 text-[#0066FF]" />
                          <span className="text-xs block">Clinic Visit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConsultType('Video Telehealth')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            consultType === 'Video Telehealth'
                              ? 'border-[#0066FF] bg-blue-50/50 text-[#0066FF] ring-2 ring-[#0066FF]/20 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <Video className="w-5 h-5 mb-1 text-[#0066FF]" />
                          <span className="text-xs block">Video Call</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                        Reason for Consultation
                      </label>
                      <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Heart checkup, prescription refill"
                        className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-300 p-2.5 focus:bg-white focus:border-[#0066FF] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                        Current Symptoms & Medical Notes
                      </label>
                      <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        rows={3}
                        placeholder="Describe any symptoms, pain level, or medical concerns..."
                        className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-300 p-2.5 focus:bg-white focus:border-[#0066FF] outline-none resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-[#E2E8F0]">
                      <Button
                        variant="secondary"
                        onClick={() => setWizardStep(1)}
                        className="w-1/3 justify-center"
                      >
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => setWizardStep(3)}
                        className="w-2/3 justify-center bg-[#0066FF] hover:bg-[#0052CC] font-bold"
                      >
                        Review Booking
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Review & Live Confirmation */}
                {wizardStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="bg-slate-50 rounded-2xl p-4 border border-[#E2E8F0] space-y-3 text-xs">
                      <div className="flex justify-between pb-2 border-b border-slate-200">
                        <span className="text-slate-500">Doctor</span>
                        <span className="font-bold text-[#1E293B]">{doctor.name}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-slate-200">
                        <span className="text-slate-500">Date & Slot</span>
                        <span className="font-bold text-[#0066FF]">{formatDate(selectedDate)} at {selectedSlot}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-slate-200">
                        <span className="text-slate-500">Mode</span>
                        <span className="font-bold text-[#1E293B]">{consultType}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-slate-200">
                        <span className="text-slate-500">Facility</span>
                        <span className="font-bold text-[#1E293B]">{doctor.hospital}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-[#1E293B] pt-1">
                        <span>Total Due</span>
                        <span className="text-[#0066FF]">{formatCurrency(doctor.fee)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        variant="secondary"
                        onClick={() => setWizardStep(2)}
                        disabled={isBooking}
                        className="w-1/3 justify-center"
                      >
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleConfirmScheduleWizard}
                        isLoading={isBooking}
                        className="w-2/3 justify-center bg-[#0066FF] hover:bg-[#0052CC] font-bold shadow-md"
                      >
                        Confirm & Save
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Success Screen */}
                {wizardStep === 4 && bookingSuccess && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>

                    <div>
                      <h4 className="text-xl font-black text-[#1E293B]">Appointment Scheduled!</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Your booking has been saved persistently to your MediCloud schedule.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ref ID:</span>
                        <span className="font-mono font-bold text-[#0066FF] uppercase">{bookingSuccess.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Schedule:</span>
                        <span className="font-bold text-[#1E293B]">{formatDate(bookingSuccess.date)} at {bookingSuccess.time}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <Button
                        variant="primary"
                        className="w-full justify-center bg-[#0066FF] hover:bg-[#0052CC] font-bold"
                        onClick={() => navigate('/appointments')}
                      >
                        View in My Appointments
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full justify-center"
                        onClick={() => {
                          setWizardStep(1);
                          setBookingSuccess(null);
                        }}
                      >
                        Book Another Slot
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
