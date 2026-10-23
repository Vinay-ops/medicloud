import React from 'react';

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs hover:border-blue-200 hover:shadow-sm transition-all flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <h4 className="text-2xl font-extrabold text-[#1E293B] mt-1.5 tracking-tight">{value}</h4>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-[#0066FF] shrink-0 shadow-2xs">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="pt-3 mt-2 border-t border-slate-100">
          <p className={`text-xs font-semibold flex items-center gap-1 ${
            trendPositive === true ? 'text-emerald-600' : trendPositive === false ? 'text-rose-600' : 'text-slate-500'
          }`}>
            {trendPositive === true && <span>↑</span>}
            {trendPositive === false && <span>↓</span>}
            <span>{trend}</span>
          </p>
        </div>
      )}
    </div>
  );
};
