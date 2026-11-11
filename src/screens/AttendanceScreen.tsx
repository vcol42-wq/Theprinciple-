import React, { useState } from 'react';
import { CheckSquare, UserCheck, UserX, Calendar, CloudUpload, Search, CheckCircle2 } from 'lucide-react';
import { StorageService } from '../services/storage';

export const AttendanceScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [students, setStudents] = useState(() => StorageService.getStudents());
  const [absentIds, setAbsentIds] = useState<Set<string>>(new Set());
  const [savedMsg, setSavedMsg] = useState(false);

  const toggleStudent = (id: string) => {
    setAbsentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSaveAttendance = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="flex-1 pb-24 px-4 pt-3 max-w-md mx-auto w-full">
      {/* Date & Period Controls */}
      <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xs">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>التاريخ:</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-700">
          <span className="text-[11px] font-bold text-slate-400 ml-1">الحصة:</span>
          {[1, 2, 3, 4, 5, 6].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`flex-1 py-1 rounded-lg text-xs font-black transition-all ${
                selectedPeriod === p
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Row */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <UserCheck className="w-4 h-4" />
            <span>حاضر: {students.length - absentIds.size}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
            <UserX className="w-4 h-4" />
            <span>غائب: {absentIds.size}</span>
          </div>
        </div>

        <button
          onClick={handleSaveAttendance}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition-all active:scale-95"
        >
          <CloudUpload className="w-4 h-4" />
          <span>حفظ الغياب</span>
        </button>
      </div>

      {savedMsg && (
        <div className="p-2.5 mb-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>تم تسجيل وحفظ الغيابات بنجاح!</span>
        </div>
      )}

      {/* Students List */}
      <div className="space-y-2">
        {students.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            لا يوجد طلاب مسجلين. استدعِ شعبة أولاً من شاشة السجلات.
          </div>
        ) : (
          students.map((std, idx) => {
            const isAbsent = absentIds.has(std.id);
            return (
              <div
                key={std.id}
                onClick={() => toggleStudent(std.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isAbsent
                    ? 'bg-rose-950/40 border-rose-600/60 text-rose-200'
                    : 'bg-slate-800/80 border-slate-700/80 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                    isAbsent ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-300'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-black">{std.fullName}</h4>
                    <p className="text-[10px] text-slate-400">رقم القيد: {std.recordNumber}</p>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-xl text-xs font-black ${
                  isAbsent
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {isAbsent ? 'غائب ✖' : 'حاضر ✓'}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
