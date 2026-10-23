import React from 'react';
import { Calendar, Clock, Video, Building2, Phone, Check, X, RotateCcw } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';
import { formatDate, formatCurrency } from '../../utils/formatters';

export const AppointmentCard = ({
  appointment,
  viewRole = 'patient', // 'patient' | 'doctor' | 'admin'
  onReschedule,
  onCancel,
  onAccept,
  onReject,
  onComplete,
  onViewDetails
}) => {
  const isVideo = appointment.type?.toLowerCase().includes('video');
  const isPending = appointment.status === 'pending';
  const isConfirmed = appointment.status === 'confirmed';
  const isActionable = isPending || isConfirmed;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-blue-200 shadow-xs hover:shadow-sm p-5 transition-all flex flex-col justify-between">
      <div>
        {/* Top Header: Date/Time & Status */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E293B] bg-slate-100 px-3 py-1 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-[#0066FF]" />
              <span>{formatDate(appointment.date)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0066FF] bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200/60">
              <Clock className="w-3.5 h-3.5" />
              <span>{appointment.time}</span>
            </div>
          </div>
          <Badge status={appointment.status} />
        </div>

        {/* Participant Info */}
        <div className="py-4 flex items-center gap-3.5">
          {viewRole === 'patient' ? (
            <>
              {appointment.doctorImage ? (
                <img
                  src={appointment.doctorImage}
                  alt={appointment.doctorName}
                  className="w-13 h-13 rounded-2xl object-cover border border-[#E2E8F0] shrink-0 bg-slate-100"
                />
              ) : (
                <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0066FF] shrink-0 font-bold text-base">
                  {appointment.doctorName?.charAt(0) || 'D'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-[#1E293B] truncate">{appointment.doctorName}</h4>
                <p className="text-xs font-semibold text-[#0066FF] truncate">{appointment.doctorSpecialty}</p>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 truncate">
                  <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{appointment.doctorHospital}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0066FF] shrink-0 font-bold text-base">
                {appointment.patientName?.charAt(0) || 'P'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#1E293B] truncate">{appointment.patientName}</h4>
                  <span className="text-2xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                    {appointment.patientGender || 'Patient'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 truncate">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{appointment.patientPhone || 'Not provided'}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Consultation details & notes */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              {isVideo ? <Video className="w-3.5 h-3.5 text-[#0066FF]" /> : <Building2 className="w-3.5 h-3.5 text-[#0066FF]" />}
              {appointment.type}
            </span>
            <span className="font-extrabold text-[#1E293B]">{formatCurrency(appointment.fee)}</span>
          </div>

          <div className="text-slate-700 pt-1 border-t border-slate-200/60">
            <span className="font-bold text-[#1E293B]">Reason: </span>
            <span className="text-slate-600">{appointment.reason}</span>
          </div>

          {appointment.notes && (
            <p className="text-2xs text-slate-500 italic truncate">
              Note: {appointment.notes}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-end gap-2 flex-wrap">
        {onViewDetails && (
          <Button variant="ghost" size="sm" onClick={() => onViewDetails(appointment)} className="text-xs">
            Details
          </Button>
        )}

        {/* Patient actions */}
        {viewRole === 'patient' && isActionable && (
          <>
            {onReschedule && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={RotateCcw}
                onClick={() => onReschedule(appointment)}
                className="text-xs"
              >
                Reschedule
              </Button>
            )}
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(appointment)}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                Cancel
              </Button>
            )}
          </>
        )}

        {/* Doctor actions */}
        {viewRole === 'doctor' && (
          <>
            {isPending && onAccept && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={Check}
                onClick={() => onAccept(appointment.id)}
                className="text-xs"
              >
                Accept
              </Button>
            )}
            {isPending && onReject && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={X}
                onClick={() => onReject(appointment.id)}
                className="text-xs text-rose-600 hover:bg-rose-50"
              >
                Decline
              </Button>
            )}
            {isConfirmed && onComplete && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={Check}
                onClick={() => onComplete(appointment.id)}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 border-emerald-700/20"
              >
                Complete Visit
              </Button>
            )}
          </>
        )}

        {/* Admin actions */}
        {viewRole === 'admin' && isActionable && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(appointment)}
            className="text-xs text-rose-600 hover:bg-rose-50"
          >
            Cancel Visit
          </Button>
        )}
      </div>
    </div>
  );
};
