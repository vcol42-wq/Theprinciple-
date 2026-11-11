import React, { useState } from 'react';
import { GraduationCap, Search, Award, Calendar, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Student } from '../types';

interface StudentPortalScreenProps {
  onBack: () => void;
}

export const StudentPortalScreen: React.FC<StudentPortalScreenProps> = ({ onBack }) => {
  const [recordNumber, setRecordNumber] = useState('');
  const [matchedStudent, setMatchedStudent] = useState<Student | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = () => {
    const q = recordNumber.trim();
    if (!q) return;

    const all = StorageService.getStudents();
    const found = all.find(s => s.recordNumber === q || s.fullName.includes(q));

    if (found) {
      setMatchedStudent(found);
      setNotFound(false);
    } else {
      setMatchedStudent(null);
      setNotFound(true);
    }
  };

  return (
    <div className="flex-1 pb-24 px-4 pt-3 max-w-md mx-auto w-full text-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-800 text-slate-300">
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-black">بوابة الطلبة والنتائج 🎓</h2>
          <p className="text-xs text-slate-400">استعلم عن بطاقة درجاتك وجدولك</p>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="p-4 rounded-3xl bg-slate-800 border border-slate-700 shadow-xl mb-4 space-y-3">
        <label className="text-xs font-bold text-slate-300 block">أدخل رقم القيد المدرسي أو الاسم:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={recordNumber}
            onChange={(e) => setRecordNumber(e.target.value)}
            placeholder="مثال: 1042 أو اسم الطالب"
            className="flex-1 p-3 rounded-2xl bg-slate-900 border border-slate-700 text-sm font-bold text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-black text-xs shadow-md transition-all flex items-center gap-1"
          >
            <Search className="w-4 h-4" />
            <span>استعلام</span>
          </button>
        </div>

        {notFound && (
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>لم يتم العثور على طالب بهذا الرقم في السجلات الحالية.</span>
          </div>
        )}
      </div>

      {/* Student Result Card */}
      {matchedStudent && (
        <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-800 to-indigo-950 border border-indigo-700/50 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center text-2xl font-black">
                🎓
              </div>
              <div>
                <h3 className="text-base font-black text-white">{matchedStudent.fullName}</h3>
                <p className="text-xs text-amber-300 font-bold">
                  الصف {matchedStudent.currentGrade} ({matchedStudent.section})
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-slate-300 font-mono font-bold">
              القيد: {matchedStudent.recordNumber}
            </span>
          </div>

          {/* Grades Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>نتائج المادة: {matchedStudent.subject}</span>
            </h4>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-bold">الشهر 1</span>
                <span className="text-base font-black text-white">{matchedStudent.marks.m1MonthAvg || '-'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-bold">الشهر 2</span>
                <span className="text-base font-black text-white">{matchedStudent.marks.m2MonthAvg || '-'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-950 border border-indigo-700">
                <span className="text-[10px] text-indigo-300 block font-bold">نصف السنة</span>
                <span className="text-base font-black text-amber-300">{matchedStudent.marks.midtermFinalGrade || '-'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-bold">السعي السنوي</span>
                <span className="text-base font-black text-indigo-300">{matchedStudent.marks.annualPursuit || '-'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-700">
                <span className="text-[10px] text-emerald-300 block font-bold">النتيجة النهائية</span>
                <span className={`text-base font-black ${
                  (matchedStudent.marks.finalDecidedGrade || 0) >= 50 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {matchedStudent.marks.finalDecidedGrade || 'مستمر'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
