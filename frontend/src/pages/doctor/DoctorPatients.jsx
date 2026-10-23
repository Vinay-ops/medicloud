import React, { useState } from 'react';
import { Search, Users, Mail, Phone, ChevronRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';

export const DoctorPatients = () => {
  const { appointments, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const doctorId = currentUser?.doctorId || currentUser?.userId || currentUser?.id;

  // Get unique patients associated with this doctor from appointments
  const patientsMap = {};
  appointments
    .filter((a) => a.doctorId === doctorId)
    .forEach((apt) => {
      if (!patientsMap[apt.patientEmail]) {
        patientsMap[apt.patientEmail] = {
          id: apt.patientId,
          name: apt.patientName,
          email: apt.patientEmail,
          phone: apt.patientPhone,
          gender: apt.patientGender,
          lastVisit: apt.date,
          lastReason: apt.reason,
          consultationCount: 1,
          history: [apt]
        };
      } else {
        patientsMap[apt.patientEmail].consultationCount += 1;
        patientsMap[apt.patientEmail].history.push(apt);
        if (apt.date > patientsMap[apt.patientEmail].lastVisit) {
          patientsMap[apt.patientEmail].lastVisit = apt.date;
          patientsMap[apt.patientEmail].lastReason = apt.reason;
        }
      }
    });

  const patientList = Object.values(patientsMap).filter(
    (p) =>
      !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastReason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0066FF] mb-1">
            <Users className="w-4 h-4" />
            <span>Patient Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            My Patients
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Patients who have attended or scheduled appointments at your clinic
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or symptom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-[#1E293B] focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/15 outline-none transition-all"
          />
        </div>
      </motion.div>

      {/* Patient List */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-semibold">
            {patientList.length} patient{patientList.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4">Chief Complaint</th>
                <th className="py-3 px-4">Visits</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {patientList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">No patients found</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {searchTerm ? 'Try a different search term.' : 'No patients have booked appointments yet.'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                patientList.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0066FF] to-[#06B6D4] text-white font-bold flex items-center justify-center shrink-0 text-sm">
                          {patient.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-bold text-[#1E293B]">{patient.name}</div>
                          <div className="text-[10px] text-slate-400">{patient.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {patient.phone || 'Not provided'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {formatDate(patient.lastVisit)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-[200px]">
                      <span className="truncate block">{patient.lastReason}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0066FF] border border-blue-200/60">
                        {patient.consultationCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        rightIcon={ChevronRight}
                        onClick={() => setSelectedPatient(patient)}
                        className="text-xs text-[#0066FF] hover:bg-blue-50"
                      >
                        View Chart
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Chart Modal */}
      {selectedPatient && (
        <Modal
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          title={`Clinical History: ${selectedPatient.name}`}
          subtitle={`${selectedPatient.consultationCount} Consultation${selectedPatient.consultationCount !== 1 ? 's' : ''}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">Email</span>
                <span className="font-bold text-slate-800 mt-0.5 block truncate">{selectedPatient.email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">Phone</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{selectedPatient.phone || 'Not provided'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Consultation History Records
              </h4>
              {selectedPatient.history.map((apt) => (
                <div key={apt.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1E293B]">
                      {formatDate(apt.date)} at {apt.time}
                    </span>
                    <Badge status={apt.status} />
                  </div>
                  <p className="text-slate-600 font-medium">{apt.reason}</p>
                  {apt.notes && <p className="text-[10px] text-slate-400 italic">Notes: {apt.notes}</p>}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedPatient(null)}>
                Close Chart
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
