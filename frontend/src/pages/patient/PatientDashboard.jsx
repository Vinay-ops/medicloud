import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  CalendarCheck,
  ShieldCheck,
  Heart,
  ChevronRight,
  ArrowRight,
  Sparkles,
  MapPin,
  Stethoscope,
  HeartPulse,
  Brain,
  Baby,
  Bone,
  Eye,
  Activity,
  User,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DoctorCard } from '../../components/common/DoctorCard';
import { StatsCard } from '../../components/common/StatsCard';
import { BookingModal } from '../../components/booking/BookingModal';
import { Button } from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';

const iconMap = {
  HeartPulse,
  Sparkles,
  Brain,
  Baby,
  Bone,
  Stethoscope,
  Eye,
  Activity,
};

export const PatientDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, appointments, doctors, specialties } = useApp();

  const [searchDoctor, setSearchDoctor] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState(null);

  // User's appointments
  const myAppointments = appointments.filter(
    (apt) => currentUser && (apt.patientId === currentUser.userId || apt.patientId === currentUser.id || apt.patientEmail === currentUser.email)
  );

  const upcomingAppointments = myAppointments.filter(
    (apt) => apt.status === 'confirmed' || apt.status === 'pending'
  );

  const nextAppointment = upcomingAppointments[0] || null;

  // Filter doctors live
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        !searchDoctor ||
        doc.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchDoctor.toLowerCase()) ||
        doc.hospital.toLowerCase().includes(searchDoctor.toLowerCase()) ||
        doc.location.toLowerCase().includes(searchDoctor.toLowerCase());

      const matchesSpecialty =
        !selectedSpecialty || doc.specialty.toLowerCase() === selectedSpecialty.toLowerCase();

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchDoctor, selectedSpecialty]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Live User Profile Header Greeting Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden bg-gradient-to-r from-[#0066FF] via-[#0052CC] to-[#06B6D4] rounded-3xl p-6 sm:p-8 text-white shadow-lg"
      >
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 text-white text-2xl font-black grid place-items-center shadow-md">
              {currentUser?.name?.slice(0, 1) || 'P'}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mt-1">
                Good day, {currentUser?.name || 'Valued Patient'}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
                Welcome to your MediCloud health center. Schedule consultations, browse certified specialists, and review treatment history.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              leftIcon={Plus}
              onClick={() => navigate('/doctors')}
              className="bg-white hover:bg-slate-50 text-[#0066FF] font-bold border-none shadow-md"
            >
              Book Specialist
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/appointments')}
              className="border-white/40 text-white hover:bg-white/10 font-semibold"
            >
              My Appointments ({myAppointments.length})
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 2. Upcoming Appointment Notification Banner */}
      <AnimatePresence>
        {nextAppointment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-gradient-to-r from-blue-50/80 via-white to-cyan-50/50 rounded-2xl p-5 border-2 border-blue-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0066FF] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#0066FF] text-white">
                    Next Upcoming Consultation
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    {formatDate(nextAppointment.date)} at {nextAppointment.time}
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#1E293B] mt-0.5">
                  Consultation with {nextAppointment.doctorName}
                </h4>
                <p className="text-xs text-slate-500">
                  {nextAppointment.type} • {nextAppointment.doctorSpecialty} • {nextAppointment.doctorHospital}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              <Button
                variant="primary"
                size="sm"
                className="bg-[#0066FF] hover:bg-[#0052CC] font-bold"
                onClick={() => navigate('/appointments')}
                rightIcon={ChevronRight}
              >
                View Full Schedule
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Upcoming Appointments"
          value={upcomingAppointments.length}
          subtitle="Confirmed consultations"
          icon={CalendarCheck}
        />
        <StatsCard
          title="Available Specialists"
          value={doctors.filter((d) => d.status === 'active').length}
          subtitle="Ready for booking"
          icon={Stethoscope}
        />
        <StatsCard
          title="Health Insurance"
          value={currentUser?.insuranceProvider || 'MediCloud Premier'}
          subtitle={currentUser?.policyNumber || 'Active coverage'}
          icon={ShieldCheck}
        />
        <StatsCard
          title="Blood Group & Vitals"
          value={currentUser?.bloodGroup || 'O+ Positive'}
          subtitle="Verified profile record"
          icon={Heart}
        />
      </div>

      {/* 3. Dynamic Service Category Selector Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0066FF]">
              <Sparkles className="w-4 h-4" />
              <span>Medical Categories</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E293B] tracking-tight">
              Explore Healthcare Specialties
            </h2>
          </div>
          {selectedSpecialty && (
            <button
              onClick={() => setSelectedSpecialty('')}
              className="text-xs font-bold text-[#0066FF] hover:underline cursor-pointer"
            >
              Reset Category Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
          {specialties.map((spec) => {
            const Icon = iconMap[spec.icon] || Stethoscope;
            const isSelected = selectedSpecialty.toLowerCase() === spec.name.toLowerCase();

            return (
              <motion.button
                key={spec.id}
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedSpecialty(isSelected ? '' : spec.name)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#0066FF] to-[#0052CC] text-white border-[#0066FF] shadow-md ring-2 ring-[#0066FF]/30'
                    : 'bg-slate-50 hover:bg-blue-50/60 text-[#1E293B] border-slate-200/90 hover:border-blue-200'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-white text-[#0066FF] shadow-2xs border border-slate-100'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold tracking-tight line-clamp-1">{spec.name}</span>
                <span className={`text-2xs mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  {doctors.filter((d) => d.specialty.toLowerCase() === spec.name.toLowerCase()).length} Doctors
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 4. Live-Filtered Doctors Directory Section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0066FF]">
              <Stethoscope className="w-4 h-4" />
              <span>Verified Doctors</span>
            </div>
            <h3 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
              Schedule with Specialists
            </h3>
            <p className="text-xs text-slate-500">
              Instant appointment scheduling with persistent calendar confirmation
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time search filter */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search doctor or clinic..."
                value={searchDoctor}
                onChange={(e) => setSearchDoctor(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-[#1E293B] focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/15 outline-none transition-all"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/doctors')}
              rightIcon={ArrowRight}
            >
              Full Roster
            </Button>
          </div>
        </div>

        {/* Doctor Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filteredDoctors.length > 0 ? (
            filteredDoctors.slice(0, 8).map((doc) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <DoctorCard
                  doctor={doc}
                  onBook={(doctor) => setBookingDoctor(doctor)}
                  onViewDetails={(doctor) => navigate(`/doctors/${doctor.id}`)}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-[#E2E8F0]">
              <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-[#1E293B]">No specialists found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No doctors matched "{searchDoctor}". Try clearing filters or searching for another condition.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchDoctor('');
                  setSelectedSpecialty('');
                }}
              >
                Reset Search
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Booking Modal */}
      {bookingDoctor && (
        <BookingModal
          isOpen={!!bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          doctor={bookingDoctor}
        />
      )}
    </div>
  );
};
