import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, User, RefreshCw } from 'lucide-react';

export const ScheduleScreen: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'>('الأحد');

  const days: ('الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس')[] = [
    'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'
  ];

  // Sample standard timetable slots
  const sampleSchedule = [
    { period: 1, time: '08:00 - 08:45', subject: 'التربية الإسلامية', grade: 'الأول المتوسط', section: 'أ' },
    { period: 2, time: '08:50 - 09:35', subject: 'اللغة العربية', grade: 'الأول المتوسط', section: 'أ' },
    { period: 3, time: '09:40 - 10:25', subject: 'الرياضيات', grade: 'الأول المتوسط', section: 'ب' },
    { period: 4, time: '10:45 - 11:30', subject: 'العلوم', grade: 'الثاني المتوسط', section: 'أ' },
    { period: 5, time: '11:35 - 12:20', subject: 'اللغة الإنكليزية', grade: 'الثاني المتوسط', section: 'ب' },
    { period: 6, time: '12:25 - 01:10', subject: selectedDay === 'الخميس' ? 'نشاط حر' : 'الاجتماعيات', grade: 'الأول المتوسط', section: 'أ' },
  ];

  return (
    <div className="flex-1 pb-24 px-4 pt-3 max-w-md mx-auto w-full">
      {/* Days Ribbon */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-800 border border-slate-700/80 mb-4 overflow-x-auto scrollbar-none">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap text-center ${
              selectedDay === d
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Timetable Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>جدول حصص يوم {selectedDay}</span>
        </h3>
        <span className="text-[11px] font-bold text-amber-300">6 حصص يومياً</span>
      </div>

      {/* Lesson Cards */}
      <div className="space-y-2.5">
        {sampleSchedule.map((item) => (
          <div
            key={item.period}
            className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-md flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-950 border border-indigo-800 text-indigo-300 flex flex-col items-center justify-center font-black">
                <span className="text-[10px] text-slate-400 leading-none">الدرس</span>
                <span className="text-sm">{item.period}</span>
              </div>

              <div>
                <h4 className="text-sm font-black text-white">{item.subject}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-bold text-amber-300">{item.grade}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-bold">
                    شعبة ({item.section})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
