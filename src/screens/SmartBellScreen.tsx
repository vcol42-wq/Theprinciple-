import React, { useState, useEffect } from 'react';
import { Bell, Clock, Volume2, Play, Pause, Check } from 'lucide-react';

export const SmartBellScreen: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString('ar-IQ'));
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('ar-IQ'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const bells = [
    { period: 'بداية الدوام والاصطفاف', time: '08:00 ص', type: 'صباحي' },
    { period: 'الدرس الأول', time: '08:15 ص', type: 'حصة' },
    { period: 'الدرس الثاني', time: '09:00 ص', type: 'حصة' },
    { period: 'الدرس الثالث', time: '09:45 ص', type: 'حصة' },
    { period: 'الفرصة الكبرى (الاستراحة)', time: '10:30 ص', type: 'استراحة' },
    { period: 'الدرس الرابع', time: '10:55 ص', type: 'حصة' },
    { period: 'الدرس الخامس', time: '11:40 ص', type: 'حصة' },
    { period: 'الدرس السادس ونهاية الدوام', time: '12:25 م', type: 'انصراف' },
  ];

  return (
    <div className="flex-1 pb-24 px-4 pt-3 max-w-md mx-auto w-full">
      {/* Current Clock Card */}
      <div className="rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-700 to-amber-800 p-6 text-center text-white shadow-xl mb-4 border border-amber-500/40">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <Bell className="w-8 h-8 text-amber-200 animate-bounce" />
        </div>
        <p className="text-xs font-bold text-amber-200">الجرس المدرسي الذكي التلقائي</p>
        <h2 className="text-3xl font-black my-1 font-mono tracking-wider">{currentTime}</h2>
        <p className="text-[11px] text-amber-100">التوقيت المحلي لمدارس جمهورية العراق</p>
      </div>

      {/* Bell Schedule List */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-black text-white px-1 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>مواعيد الرنين المعتمدة</span>
        </h3>

        {bells.map((b, i) => (
          <div
            key={i}
            className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-md flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {b.type === 'استراحة' ? '☕' : b.type === 'انصراف' ? '🚪' : '🔔'}
              </span>
              <div>
                <h4 className="text-xs font-black text-white">{b.period}</h4>
                <span className="text-[10px] text-slate-400 font-bold">{b.type}</span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono font-black text-xs">
              {b.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
