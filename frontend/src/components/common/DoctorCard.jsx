import React from 'react';
import { Star, MapPin, Building2, Calendar, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { formatCurrency } from '../../utils/formatters';

export const DoctorCard = ({ doctor, onBook, onViewDetails }) => {
  const isAvailable = doctor.status === 'active';

  // Get initial letters or abbreviation for avatar fallback
  const getInitials = (name = '') => {
    const parts = name.replace(/^Dr\.\s*/i, '').trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0]?.[0]?.toUpperCase() || 'DR';
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Top subtle highlight gradient */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header section */}
      <div className="p-5 pb-4">
        {/* Badges bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
            {doctor.specialty || 'General Physician'}
          </span>

          <div className="flex items-center gap-1.5">
            {doctor.featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                Featured
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                isAvailable
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>

        {/* Doctor Identity */}
        <div className="flex items-start gap-3.5">
          {/* Avatar with fallback */}
          <div className="relative shrink-0">
            {doctor.image ? (
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm group-hover:ring-blue-100 group-hover:scale-105 transition-all duration-300 bg-slate-100"
                loading="lazy"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg grid place-items-center shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                {getInitials(doctor.name)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h3
              onClick={() => onViewDetails && onViewDetails(doctor)}
              title={doctor.name}
              className="text-base font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors cursor-pointer leading-snug"
            >
              {doctor.name}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5 font-medium" title={doctor.title}>
              {doctor.title || 'Specialist'}
            </p>

            {/* Experience & Rating badges */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {Number.isFinite(doctor.rating) && (
                <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{doctor.rating}</span>
                  {doctor.reviewCount && (
                    <span className="text-[10px] text-amber-600 font-normal">({doctor.reviewCount})</span>
                  )}
                </div>
              )}
              {Number.isFinite(doctor.experience) && (
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {doctor.experience} yrs exp
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hospital & Location info */}
      <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100/90 text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center gap-2" title={doctor.hospital}>
          <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate font-medium text-slate-700">{doctor.hospital || 'Hospital / Clinic'}</span>
        </div>
        <div className="flex items-center gap-2" title={doctor.location}>
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate text-slate-500">{doctor.location || 'Location available on request'}</span>
        </div>
      </div>

      {/* Available Slots Preview */}
      <div className="px-5 py-3 flex-1 flex flex-col justify-end border-t border-slate-100/90">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-400" />
            Next Available
          </span>
          {doctor.availableSlots && doctor.availableSlots.length > 0 ? (
            <span className="text-blue-600 font-bold capitalize text-xs tracking-normal">
              {doctor.availableSlots.length} open
            </span>
          ) : (
            <span className="text-slate-400 text-xs capitalize tracking-normal">No slots</span>
          )}
        </div>

        {doctor.availableSlots && doctor.availableSlots.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 items-center">
            {doctor.availableSlots.slice(0, 3).map((slot, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/40 transition-colors"
              >
                {slot}
              </span>
            ))}
            {doctor.availableSlots.length > 3 && (
              <span className="px-1.5 py-0.5 text-xs text-blue-600 font-bold bg-blue-50/70 rounded-md">
                +{doctor.availableSlots.length - 3}
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Check profile for schedule</p>
        )}
      </div>

      {/* Footer / Fee & Actions */}
      <div className="px-5 py-3.5 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-between gap-3 mt-auto">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block leading-tight">
            Consult Fee
          </span>
          <span className="text-base font-extrabold text-slate-900 tracking-tight">
            {formatCurrency(doctor.fee)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onViewDetails && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onViewDetails(doctor)}
              className="text-xs font-semibold rounded-xl px-3 py-1.5 hover:bg-slate-100"
            >
              Profile
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => onBook(doctor)}
            disabled={!isAvailable}
            leftIcon={Calendar}
            className="text-xs font-bold rounded-xl px-3.5 py-1.5 shadow-sm shadow-blue-500/20 active:scale-95"
          >
            {isAvailable ? 'Book' : 'Unavailable'}
          </Button>
        </div>
      </div>
    </div>
  );
};

