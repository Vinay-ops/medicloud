import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  CalendarCheck,
  Plus,
  ArrowRight,
  Clock,
  Layers,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../../components/common/StatsCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatDate, formatCurrency } from '../../utils/formatters';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { doctors, appointments, specialties, toggleDoctorStatus, currentUser } = useApp();

  const activeDoctorsCount = doctors.filter((d) => d.status === 'active').length;
  const pendingAppointmentsCount = appointments.filter((a) => a.status === 'pending').length;
  const confirmedAppointmentsCount = appointments.filter((a) => a.status === 'confirmed').length;
  const completedAppointmentsCount = appointments.filter((a) => a.status === 'completed').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-[#0066FF] via-[#0052CC] to-[#06B6D4] rounded-3xl p-6 sm:p-8 text-white shadow-lg"
      >
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                Clinical Administration
              </span>
              <span className="text-xs text-blue-100">
                Operator: {currentUser?.name || 'Administrator'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Hospital System Control Center
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
              Real-time platform operations, physician roster governance, and appointment telemetry
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/appointments')}
              className="bg-white/15 hover:bg-white/25 text-white border-white/30 font-bold backdrop-blur-sm"
            >
              All Appointments
            </Button>
            <Button
              variant="secondary"
              leftIcon={Plus}
              onClick={() => navigate('/admin/doctors')}
              className="bg-white hover:bg-slate-50 text-[#0066FF] font-bold border-none shadow-md"
            >
              Manage Providers
            </Button>
          </div>
        </div>
      </motion.div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Doctors"
          value={activeDoctorsCount}
          subtitle={`Out of ${doctors.length} registered`}
          icon={Stethoscope}
          trend="Current directory count"
          trendPositive={null}
        />
        <StatsCard
          title="Total Consultations"
          value={appointments.length}
          subtitle="System booking records"
          icon={CalendarCheck}
          trend="All time"
          trendPositive={true}
        />
        <StatsCard
          title="Pending Approvals"
          value={pendingAppointmentsCount}
          subtitle="Awaiting triage"
          icon={Clock}
          trend={pendingAppointmentsCount > 0 ? 'Requires attention' : 'No pending items'}
          trendPositive={null}
        />
        <StatsCard
          title="Clinical Specialties"
          value={specialties.length}
          subtitle="Hospital departments"
          icon={Layers}
        />
      </div>

      {/* RECENT PLATFORM APPOINTMENTS TABLE */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Recent Platform Appointments</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live transaction stream across all specialties</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={ArrowRight}
            onClick={() => navigate('/admin/appointments')}
            className="text-[#0066FF] hover:bg-blue-50"
          >
            Full Appointment Log
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Doctor & Specialty</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Fee</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {appointments.slice(0, 5).map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#0066FF]">
                    {apt.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#1E293B]">{apt.patientName}</div>
                    <div className="text-[10px] text-slate-400">{apt.patientPhone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#1E293B]">{apt.doctorName}</div>
                    <div className="text-[10px] text-[#0066FF] font-semibold">{apt.doctorSpecialty}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="font-medium">{formatDate(apt.date)}</div>
                    <div className="text-[10px] text-slate-400">{apt.time}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#1E293B]">
                    {formatCurrency(apt.fee)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge status={apt.status} />
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-medium">
                    No appointment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK DOCTOR ROSTER MANAGEMENT STRIP */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Doctor Quick Status Control</h2>
            <p className="text-xs text-slate-500 mt-0.5">Activate or deactivate clinician availability</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/doctors')}
          >
            Add / Edit Doctors
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {doctors.slice(0, 4).map((doc) => {
            const isActive = doc.status === 'active';
            return (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  {doc.image ? (
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066FF] to-[#06B6D4] text-white font-bold flex items-center justify-center text-sm">
                      {doc.name?.slice(0, 1) || '?'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-[#1E293B] truncate">{doc.name}</h5>
                    <p className="text-[10px] text-[#0066FF] font-semibold truncate">{doc.specialty}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <Badge status={doc.status} />
                  <button
                    type="button"
                    onClick={() => toggleDoctorStatus(doc.id)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                      isActive
                        ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
