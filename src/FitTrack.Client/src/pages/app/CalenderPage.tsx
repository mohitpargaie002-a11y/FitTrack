import { useState, useEffect } from 'react';
import { getCalendar } from '../../api/logs';
import { getPlans } from '../../api/workoutPlans';
import type { CalendarDayDto, WorkoutPlan } from '../../types';
import DayDetailDrawer from '../../components/DayDetailDrawer';

const DAY_COLORS: Record<string, string> = {
  Chest:  'bg-violet-100 border-violet-300 text-violet-800',
  Back:   'bg-teal-100 border-teal-300 text-teal-800',
  Abs:    'bg-amber-100 border-amber-300 text-amber-800',
  Rest:   'bg-gray-100 border-gray-200 text-gray-400',
};

const DAY_DONE_COLORS: Record<string, string> = {
  Chest:  'bg-violet-500 border-violet-600 text-white',
  Back:   'bg-teal-500 border-teal-600 text-white',
  Abs:    'bg-amber-500 border-amber-600 text-white',
  Rest:   'bg-gray-300 border-gray-400 text-gray-600',
};

const DAY_LABELS: Record<string, string> = {
  Chest: 'C+S', Back: 'B+S', Abs: 'Abs', Rest: 'Rest',
};

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [days, setDays] = useState<CalendarDayDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    getPlans().then(plans => {
      if (plans.length > 0) setPlan(plans[0]);
    });
  }, []);

  useEffect(() => {
    if (!plan) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getCalendar(plan.id, year, month)
      .then(setDays)
      .finally(() => setLoading(false));
  }, [plan, year, month]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const totalDone = days.filter(d => d.isCompleted).length;
  const totalWorkout = days.filter(d => d.dayType !== 'Rest').length;
  const pct = totalWorkout > 0 ? Math.round(totalDone / totalWorkout * 100) : 0;

  const handleDayClick = (date: string, dayType: string) => {
    if (dayType === 'Rest') return;
    const d = new Date(date);
    if (d > today) return;
    setSelectedDate(date);
  };

  const handleDrawerClose = () => {
    setSelectedDate(null);
    if (plan) {
      getCalendar(plan.id, year, month).then(setDays);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-medium text-gray-900">FitTrack</h1>
        <div className="text-sm text-gray-500">{plan?.name}</div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Done this month', value: totalDone },
            { label: 'Workouts', value: totalWorkout },
            { label: 'Consistency', value: `${pct}%` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
              <div className="text-xl font-medium text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Month nav */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              ‹
            </button>
            <span className="font-medium text-gray-900">
              {MONTHS[month - 1]} {year}
            </span>
            <button onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              ›
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          {loading ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              Loading...
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map(day => {
                const date = new Date(day.date);
                const isToday = day.date.slice(0, 10) === today.toISOString().slice(0, 10);
                const isFuture = date > today;
                const colorClass = day.isCompleted
                  ? DAY_DONE_COLORS[day.dayType]
                  : DAY_COLORS[day.dayType] ?? DAY_COLORS.Rest;
                const isClickable = day.dayType !== 'Rest' && !isFuture;

                return (
                  <div
                    key={day.date}
                    onClick={() => handleDayClick(day.date, day.dayType)}
                    className={`
                      aspect-square rounded-lg border flex flex-col items-center justify-center
                      text-xs font-medium transition-transform select-none
                      ${colorClass}
                      ${isFuture ? 'opacity-40' : ''}
                      ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                      ${isToday ? 'ring-2 ring-violet-500 ring-offset-1' : ''}
                    `}
                  >
                    <span className="text-[11px] font-semibold leading-none">
                      {date.getDate()}
                    </span>
                    <span className="text-[9px] opacity-75 leading-none mt-0.5">
                      {DAY_LABELS[day.dayType]}
                    </span>
                    {day.isCompleted && (
                      <span className="text-[9px] leading-none mt-0.5">✓</span>
                    )}
                    {!day.isCompleted && day.completedExercises > 0 && (
                      <span className="text-[8px] opacity-60 leading-none mt-0.5">
                        {day.completedExercises}/{day.totalExercises}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {Object.entries(DAY_LABELS).map(([type, label]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded border ${DAY_COLORS[type]}`} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedDate && plan && (
        <DayDetailDrawer
          planId={plan.id}
          date={selectedDate}
          onClose={handleDrawerClose}
        />
      )}
    </div>
  );
}