import { useMemo, useEffect, useState } from 'react';
import { safeCreateDate } from '../../../utils/dateUtils';
import { employeeService } from '../../../services/api';

interface PersonnelData {
  id: number;
  name: string;
  designation: string;
  department: string;
  cfmsId: string;
  employeeId: string;
  birthday: string;
  retirementDate: string;
  responsibilities: string;
}

interface EmployeeStats {
  total: number;
  regular: number;
  incharge: number;
  birthdaysThisMonth: number;
  birthdaysNextMonth: number;
  retiringThisYear: number;
  suspended: number;
  onLeaveToday: number;
  leaveTomorrow: number;
  upcomingLeaves: number;
}

interface StatsSectionProps {
  data: PersonnelData[];
  totalEmployees?: number; // Backend total count (deprecated - use stats instead)
  activeFilter?: string;
  onCardClick?: (filterKey: string) => void;
}

export default function StatsSection({ data, totalEmployees, activeFilter, onCardClick }: StatsSectionProps) {
  const [backendStats, setBackendStats] = useState<EmployeeStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Fetch stats from backend on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        console.log('[StatsSection] Fetching stats from backend...');
        const stats = await employeeService.getEmployeeStats();
        console.log('[StatsSection] Stats received from backend:', stats);
        setBackendStats(stats);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch stats';
        console.error('[StatsSection] Error fetching stats:', errorMessage, err);
        setStatsError(errorMessage);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const nextMonth = (currentMonth + 1) % 12;
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    // Use backend stats if available, otherwise fallback to computed values from data
    const totalUsers = backendStats?.total ?? totalEmployees ?? data.length;
    const regularCount = backendStats?.regular ?? data.filter(p => p.responsibilities === 'Regular').length;
    const inchargeCount = backendStats?.incharge ?? data.filter(p => p.responsibilities === 'Incharge').length;
    const birthdaysThisMonthCount = backendStats?.birthdaysThisMonth ?? 0;
    const birthdaysNextMonthCount = backendStats?.birthdaysNextMonth ?? 0;
    const retiringThisYearCount = backendStats?.retiringThisYear ?? 0;
    const suspendedCount = backendStats?.suspended ?? 0;
    const onLeaveTodayCount = backendStats?.onLeaveToday ?? 0;
    const onLeaveTomorrowCount = backendStats?.leaveTomorrow ?? 0;
    const upcomingLeavesCount = backendStats?.upcomingLeaves ?? 0;
    
    console.log('[StatsSection] Card counts:', {
      pageRowsCount: data.length,
      backendStats: backendStats,
      totalUsersUsed: totalUsers,
      regularCount,
      inchargeCount,
      birthdaysThisMonth: birthdaysThisMonthCount,
      birthdaysNextMonth: birthdaysNextMonthCount,
      retiringThisYear: retiringThisYearCount,
      suspended: suspendedCount
    });

    // Upcoming birthdays (next 7 days) - still computed from data for display list
    const upcomingBirthdays = data.filter(person => {
      const bday = safeCreateDate(person.birthday);
      if (!bday) return false;
      const thisYearBday = new Date(currentYear, bday.getMonth(), bday.getDate());
      if (thisYearBday < today) {
        thisYearBday.setFullYear(currentYear + 1);
      }
      const diffDays = Math.ceil((thisYearBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });

    // Retirements next 30 days - still computed from data for display list
    const upcomingRetirements = data.filter(person => {
      const retDate = safeCreateDate(person.retirementDate);
      if (!retDate) return false;
      const diffDays = Math.ceil((retDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    });

    return {
      totalUsers,
      birthdaysThisMonth: birthdaysThisMonthCount,
      birthdaysNextMonth: birthdaysNextMonthCount,
      upcomingBirthdays: upcomingBirthdays.length, // Still computed for display list
      retirementsThisYear: retiringThisYearCount,
      upcomingRetirements: upcomingRetirements.length, // Still computed for display list
      regularCount,
      inchargeCount,
      onLeaveToday: onLeaveTodayCount,
      onLeaveTomorrow: onLeaveTomorrowCount,
      upcomingLeaves: upcomingLeavesCount,
      suspendedCount,
      birthdaysList: upcomingBirthdays,
      retirementsList: upcomingRetirements
    };
  }, [data, backendStats, totalEmployees]);

  const statCards = [
    {
      title: 'Total Personnel',
      value: stats.totalUsers,
      icon: 'ri-team-line',
      gradient: 'from-indigo-500 to-violet-600',
      iconBg: 'bg-white',
      iconColor: 'text-indigo-600',
      filterKey: 'all'
    },
    {
      title: 'Regular',
      value: stats.regularCount,
      icon: 'ri-user-follow-line',
      gradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-white',
      iconColor: 'text-emerald-600',
      filterKey: 'regular'
    },
    {
      title: 'Incharge',
      value: stats.inchargeCount,
      icon: 'ri-user-shared-line',
      gradient: 'from-amber-500 to-orange-500',
      iconBg: 'bg-white',
      iconColor: 'text-orange-600',
      filterKey: 'incharge'
    },
    {
      title: 'Birthdays This Month',
      value: stats.birthdaysThisMonth,
      icon: 'ri-cake-2-line',
      gradient: 'from-pink-500 to-rose-500',
      iconBg: 'bg-white',
      iconColor: 'text-pink-600',
      filterKey: 'birthdaysThisMonth'
    },
    {
      title: 'Birthdays Next Month',
      value: stats.birthdaysNextMonth,
      icon: 'ri-gift-line',
      gradient: 'from-rose-500 to-red-500',
      iconBg: 'bg-white',
      iconColor: 'text-rose-600',
      filterKey: 'birthdaysNextMonth'
    },
    {
      title: 'On Leave Today',
      value: stats.onLeaveToday,
      icon: 'ri-calendar-check-line',
      gradient: 'from-orange-500 to-amber-500',
      iconBg: 'bg-white',
      iconColor: 'text-orange-600',
      filterKey: 'leaveToday'
    },
    {
      title: 'Leave Tomorrow',
      value: stats.onLeaveTomorrow,
      icon: 'ri-calendar-todo-line',
      gradient: 'from-yellow-500 to-yellow-600',
      iconBg: 'bg-white',
      iconColor: 'text-yellow-600',
      filterKey: 'leaveTomorrow'
    },
    {
      title: 'Upcoming Leaves',
      value: stats.upcomingLeaves,
      icon: 'ri-calendar-event-line',
      gradient: 'from-cyan-500 to-teal-500',
      iconBg: 'bg-white',
      iconColor: 'text-cyan-600',
      filterKey: 'upcomingLeaves'
    },
    {
      title: 'Suspended',
      value: stats.suspendedCount,
      icon: 'ri-user-forbid-line',
      gradient: 'from-red-500 to-red-600',
      iconBg: 'bg-white',
      iconColor: 'text-red-600',
      filterKey: 'suspended'
    },
    {
      title: 'Retiring This Year',
      value: stats.retirementsThisYear,
      icon: 'ri-user-unfollow-line',
      gradient: 'from-slate-500 to-slate-600',
      iconBg: 'bg-white',
      iconColor: 'text-slate-600',
      filterKey: 'retiringThisYear'
    }
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            onClick={() => onCardClick?.(stat.filterKey)}
            className={`bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg p-4 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer ${
              activeFilter === stat.filterKey 
                ? 'ring-4 ring-white/50 scale-105' 
                : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-white uppercase tracking-wide drop-shadow-md">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-1 drop-shadow-lg">{stat.value}</p>
              </div>
              <div className={`${stat.iconBg} p-2.5 rounded-lg shadow-md`}>
                <i className={`${stat.icon} ${stat.iconColor} text-xl w-6 h-6 flex items-center justify-center`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Info Panels */}
      {(stats.upcomingBirthdays > 0 || stats.upcomingRetirements > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {stats.upcomingBirthdays > 0 && (
            <div className="relative overflow-hidden bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500 rounded-xl shadow-lg p-3 max-w-xs">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="absolute top-2 right-10 text-base animate-bounce">🎂</div>
              <div className="absolute top-4 right-4 text-xs animate-pulse">🎈</div>
              <div className="absolute bottom-2 right-2 text-xs animate-bounce delay-100">🎉</div>
              
              {/* Confetti dots */}
              <div className="absolute top-3 left-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
              <div className="absolute top-6 right-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-ping delay-75"></div>
              <div className="absolute bottom-5 left-1/3 w-1 h-1 bg-green-300 rounded-full animate-ping delay-150"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg">
                    <i className="ri-cake-2-fill text-white text-sm w-4 h-4 flex items-center justify-center"></i>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Upcoming Birthdays</h3>
                    <p className="text-[9px] text-white/70">Next 7 Days</p>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  {stats.birthdaysList.slice(0, 3).map((person, idx) => {
                    const bday = safeCreateDate(person.birthday);
                    if (!bday) return null;
                    const today = new Date();
                    const thisYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
                    if (thisYearBday < today) thisYearBday.setFullYear(today.getFullYear() + 1);
                    const daysUntil = Math.ceil((thisYearBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div 
                        key={idx} 
                        className="relative flex items-center justify-between bg-white/25 backdrop-blur-md rounded-lg px-2 py-1.5 border border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.15)] hover:shadow-[0_0_12px_rgba(255,255,255,0.25)] hover:bg-white/30 hover:scale-[1.01] transition-all duration-300"
                        style={{
                          animation: `fadeSlideIn 0.4s ease-out ${idx * 0.1}s both`
                        }}
                      >
                        {/* Highlight shimmer */}
                        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                          <div 
                            className="absolute inset-0 -translate-x-full"
                            style={{
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                              animation: `shimmer 3s infinite ${idx * 0.5}s`
                            }}
                          ></div>
                        </div>
                        
                        <div className="relative flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-white/30 border border-white/40 flex items-center justify-center text-white font-bold text-[9px] shadow-inner">
                            {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <span className="text-white font-semibold text-[10px] block drop-shadow-sm leading-tight">{person.name}</span>
                            <span className="text-white/70 text-[9px] font-medium">
                              {thisYearBday.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                        <div className={`relative px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-sm ${
                          daysUntil === 0 
                            ? 'bg-yellow-400 text-yellow-900 animate-pulse shadow-yellow-400/40' 
                            : daysUntil === 1 
                              ? 'bg-orange-400 text-orange-900 shadow-orange-400/30' 
                              : 'bg-white/30 text-white border border-white/30 shadow-white/10'
                        }`}>
                          {daysUntil === 0 ? '🎉 Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {stats.upcomingBirthdays > 3 && (
                  <div className="mt-1.5 text-center">
                    <span className="text-white/70 text-[9px]">+{stats.upcomingBirthdays - 3} more</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {stats.upcomingRetirements > 0 && (
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-user-unfollow-line text-slate-500 w-5 h-5 flex items-center justify-center"></i>
                <h3 className="text-sm font-semibold text-slate-700">Upcoming Retirements (Next 30 Days)</h3>
              </div>
              <div className="space-y-2">
                {stats.retirementsList.slice(0, 3).map((person, idx) => {
                  const retDate = safeCreateDate(person.retirementDate);
                  if (!retDate) return null;
                  return (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{person.name}</span>
                      <span className="text-slate-600 font-medium">
                        {retDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
