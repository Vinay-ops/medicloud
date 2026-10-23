import React from 'react';
import { Star, MapPin, Building2, Calendar, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { formatCurrency } from '../../utils/formatters';

export const DoctorCard = ({ doctor, onBook, onViewDetails }) => {
  const isAvailable = doctor.status === 'active';

  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] hover:border-blue-200 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col h-full overflow-hidden group">
      {/* Top Banner / Image Area */}
      <div className="p-5 pb-0">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            {doctor.image ? (
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-xs group-hover:scale-105 transition-transform duration-200 bg-slate-100"
                loading="lazy"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl border-2 border-white shadow-xs bg-blue-50 text-[#0066FF] text-xl font-bold grid place-items-center">
                {doctor.name?.slice(0, 1) || '?'}
              </div>
            )}
            {isAvailable ? (
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title="Available" />
            ) : (
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-slate-400 border-2 border-white" title="Unavailable" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-blue-50 text-[#0066FF] border border-blue-200/60">
                {doctor.specialty}
              </span>
              {doctor.featured && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-2xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                  Featured
                </span>
              )}
            </div>

            <h3
              onClick={() => onViewDetails && onViewDetails(doctor)}
              className="text-base font-bold text-[#1E293B] mt-1.5 truncate group-hover:text-[#0066FF] transition-colors cursor-pointer"
            >
              {doctor.name}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">{doctor.title}</p>

            {(Number.isFinite(doctor.rating) || Number.isFinite(doctor.experience)) && (
              <div className="flex items-center gap-3 mt-2 text-xs">
                {Number.isFinite(doctor.rating) && (
                  <div className="flex items-center gap-1 font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{doctor.rating}</span>
                  </div>
                )}
                {Number.isFinite(doctor.experience) && (
                  <span className="font-semibold text-slate-500">
                    {doctor.experience}y exp
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle info */}
      <div className="px-5 py-4 flex-1 flex flex-col justify-between border-t border-slate-100 mt-4 space-y-3">
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-3.5 h-3.5 text-[#0066FF] shrink-0" />
            <span className="truncate">{doctor.hospital}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{doctor.location}</span>
          </div>
        </div>

        {/* Available slots preview */}
        {doctor.availableSlots && doctor.availableSlots.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-2xs uppercase tracking-wider font-bold text-slate-400 mb-1.5">
              <span>Next Slots</span>
              <span className="text-[#0066FF] font-semibold">{doctor.availableSlots.length} open</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {doctor.availableSlots.slice(0, 3).map((slot, i) => (
                <span key={i} className="px-2 py-0.5 rounded-lg text-2xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                  {slot}
                </span>
              ))}
              {doctor.availableSlots.length > 3 && (
                <span className="px-1.5 py-0.5 text-2xs text-[#0066FF] font-bold">
                  +{doctor.availableSlots.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer / CTA */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-2xs uppercase text-slate-400 font-bold block">Fee</span>
          <span className="text-base font-extrabold text-[#1E293B]">{formatCurrency(doctor.fee)}</span>
        </div>

        <div className="flex items-center gap-2">
          {onViewDetails && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onViewDetails(doctor)}
              className="text-xs font-bold rounded-xl"
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
            className="text-xs font-bold bg-[#0066FF] hover:bg-[#0052CC] text-white shadow-xs rounded-xl"
          >
            {isAvailable ? 'Book' : 'Unavailable'}
          </Button>
        </div>
      </div>
    </div>
  );
};
