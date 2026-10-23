import React, { useState } from 'react';
import { Clock, Plus, Trash2, Calendar, Save, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';

export const DoctorSchedule = () => {
  const { currentUser, doctors } = useApp();
  const doctor = doctors.find((item) => item.id === (currentUser?.doctorId || currentUser?.userId));
  if (!doctor) return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
      Your doctor profile and availability could not be loaded.
    </div>
  );
  return <DoctorScheduleEditor key={doctor.id} doctor={doctor} />;
};

const DoctorScheduleEditor = ({ doctor }) => {
  const { updateDoctorSlots, showToast } = useApp();
  const [slots, setSlots] = useState(doctor.availableSlots || []);
  const [workingDays, setWorkingDays] = useState(doctor.availableDays || []);
  const [newSlotTime, setNewSlotTime] = useState('01:00 PM');
  const [isSaving, setIsSaving] = useState(false);

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleToggleDay = (day) => {
    if (workingDays.includes(day)) {
      if (workingDays.length === 1) {
        showToast('At least one active working day is required', 'error');
        return;
      }
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!newSlotTime.trim()) return;
    if (slots.includes(newSlotTime.trim())) {
      showToast('This time slot is already listed in your availability', 'error');
      return;
    }
    setSlots([...slots, newSlotTime.trim()]);
    showToast(`Added ${newSlotTime} to active slots`, 'success');
  };

  const handleRemoveSlot = (slotToRemove) => {
    if (slots.length <= 1) {
      showToast('You must maintain at least one consultation slot', 'error');
      return;
    }
    setSlots(slots.filter((s) => s !== slotToRemove));
    showToast(`Removed ${slotToRemove}`, 'info');
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try { await updateDoctorSlots(doctor.id, slots, workingDays); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0066FF] mb-1">
            <Calendar className="w-4 h-4" />
            <span>Availability Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Schedule & Time Slots
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure your weekly consulting days and bookable appointment hours
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={Save}
          onClick={handleSaveAll}
          isLoading={isSaving}
          className="bg-[#0066FF] hover:bg-[#0052CC] font-bold shadow-md rounded-xl"
        >
          Save Availability
        </Button>
      </motion.div>

      {/* Working Days Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#1E293B] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0066FF]" />
            <span>Active Consultation Days</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Patients can only book appointments on selected days.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2">
          {allDays.map((day) => {
            const isActive = workingDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => handleToggleDay(day)}
                className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-b from-[#0066FF] to-[#0052CC] border-[#0066FF] text-white font-bold shadow-sm ring-2 ring-[#0066FF]/20'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-blue-50 hover:border-blue-200 font-medium'
                }`}
              >
                <span className="text-xs block">{day.slice(0, 3)}</span>
                <span className={`text-[10px] block mt-1 font-semibold ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  {isActive ? 'Active' : 'Off'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Consultation Time Slots Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-6">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#1E293B] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0066FF]" />
            <span>Bookable Time Slots</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Appointment times visible to patients when booking with you.
          </p>
        </div>

        {/* Add Slot Form */}
        <form onSubmit={handleAddSlot} className="flex items-end gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex-1 max-w-xs">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              New Time Slot
            </label>
            <input
              type="text"
              placeholder="e.g. 05:00 PM"
              value={newSlotTime}
              onChange={(e) => setNewSlotTime(e.target.value)}
              className="w-full bg-white text-[#1E293B] text-xs rounded-xl border border-slate-200 py-2.5 px-3.5 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/15 outline-none transition-all"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" leftIcon={Plus} className="bg-[#0066FF] hover:bg-[#0052CC] font-bold rounded-xl">
            Add Slot
          </Button>
        </form>

        {/* Existing Slots Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Configured Slots ({slots.length})</span>
            <span>Click trash icon to remove</span>
          </div>

          {slots.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-500">
              No time slots configured yet. Add your first slot above.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {slots.map((slot) => (
                <div
                  key={slot}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-[#0066FF]/30 shadow-xs group"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B]">
                    <Clock className="w-3.5 h-3.5 text-[#0066FF]" />
                    <span>{slot}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(slot)}
                    className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                    title="Remove this slot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
