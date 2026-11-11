import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRight, 
  CloudUpload, 
  CloudDownload, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  Printer,
  Sparkles,
  Calculator,
  Lock,
  Edit2
} from 'lucide-react';
import { ClassPackage, Student, StudentMarks } from '../types';
import { StorageService } from '../services/storage';
import { calculateTotals, defaultStudentMarks, isSpecialSubject } from '../services/gradeCalculator';

interface GradeRegisterScreenProps {
  pkg: ClassPackage;
  onBack: () => void;
}

type MainMode = 'daily' | 'teacher' | 'admin';
type DailySubTab = 'm1' | 'm2' | 'midterm' | 'm3' | 'm4' | 'final' | 'all';

export const GradeRegisterScreen: React.FC<GradeRegisterScreenProps> = ({ pkg, onBack }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    return StorageService.getStudents(pkg.grade, pkg.section, pkg.subject);
  });

  const [mainMode, setMainMode] = useState<MainMode>('daily');
  const [dailySubTab, setDailySubTab] = useState<DailySubTab>('m1');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add / Edit Student Dialog States
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newRecordNumber, setNewRecordNumber] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editName, setEditName] = useState('');

  const isSpecial = useMemo(() => isSpecialSubject(pkg.subject), [pkg.subject]);

  // Initial sync if empty
  useEffect(() => {
    if (students.length === 0) {
      handleDownloadFromCloud();
    }
  }, []);

  const handleDownloadFromCloud = async () => {
    setIsSyncing(true);
    setMsg(null);
    const res = await StorageService.syncRosterFromCloud(pkg.grade, pkg.section, pkg.subject);
    setIsSyncing(false);
    if (res.success) {
      setStudents(StorageService.getStudents(pkg.grade, pkg.section, pkg.subject));
      setMsg({ type: 'success', text: res.message });
    } else {
      setMsg({ type: 'error', text: res.message });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const handleUploadToCloud = async () => {
    setIsSyncing(true);
    setMsg(null);
    const res = await StorageService.uploadGradesToCloud(pkg.grade, pkg.section, pkg.subject);
    setIsSyncing(false);
    if (res.success) {
      setMsg({ type: 'success', text: res.message });
    } else {
      setMsg({ type: 'error', text: res.message });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const handleMarkChange = (studentId: string, mutator: (m: StudentMarks) => void) => {
    const updated = students.map((s) => {
      if (s.id === studentId) {
        const nextMarks = JSON.parse(JSON.stringify(s.marks));
        mutator(nextMarks);
        const calculated = calculateTotals(nextMarks, s.subject);
        return { ...s, marks: calculated };
      }
      return s;
    });

    setStudents(updated);
    // Persist to StorageService
    const all = StorageService.getStudents();
    const merged = all.map(s => {
      const match = updated.find(u => u.id === s.id);
      return match || s;
    });
    StorageService.saveStudents(merged);
  };

  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;
    const recNum = newRecordNumber.trim() || `${Date.now()}`.slice(-4);
    const newStd: Student = {
      id: `std_${recNum}_${pkg.subject}`,
      recordNumber: recNum,
      fullName: newStudentName.trim(),
      currentGrade: pkg.grade,
      section: pkg.section,
      subject: pkg.subject,
      marks: calculateTotals(defaultStudentMarks(), pkg.subject),
      status: 'مستمر'
    };

    const updated = [...students, newStd];
    setStudents(updated);
    
    const all = StorageService.getStudents();
    all.push(newStd);
    StorageService.saveStudents(all);

    setShowAddStudent(false);
    setNewStudentName('');
    setNewRecordNumber('');
    setMsg({ type: 'success', text: 'تمت إضافة الطالب للسجل بنجاح!' });
    setTimeout(() => setMsg(null), 2500);
  };

  const handleSaveEditName = () => {
    if (!editingStudent || !editName.trim()) return;
    const updated = students.map(s => s.id === editingStudent.id ? { ...s, fullName: editName.trim() } : s);
    setStudents(updated);
    
    const all = StorageService.getStudents();
    const merged = all.map(s => s.id === editingStudent.id ? { ...s, fullName: editName.trim() } : s);
    StorageService.saveStudents(merged);

    setEditingStudent(null);
    setMsg({ type: 'success', text: 'تم تعديل اسم الطالب بنجاح!' });
    setTimeout(() => setMsg(null), 2000);
  };

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.trim().toLowerCase();
    return students.filter(s => s.fullName.toLowerCase().includes(q) || s.recordNumber.includes(q));
  }, [students, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = students.length;
    if (total === 0) return { total: 0, passed: 0, failed: 0, passRate: 0 };

    let passed = 0;
    let evaluatedCount = 0;

    students.forEach(s => {
      const score = s.marks.finalDecidedGrade ?? s.marks.annualPursuit;
      if (score > 0) {
        evaluatedCount++;
        if (score >= 50) passed++;
      }
    });

    const failed = evaluatedCount - passed;
    const passRate = evaluatedCount > 0 ? Math.round((passed / evaluatedCount) * 100) : 0;
    return { total, passed, failed, passRate };
  }, [students]);

  // Format Helper for Numbers in Inputs
  const fmtInput = (val: number | null | undefined): string => {
    if (val === null || val === undefined || val === 0) return '';
    return String(val);
  };

  const parseVal = (str: string): number => {
    if (!str.trim()) return 0;
    const num = parseFloat(str);
    if (isNaN(num)) return 0;
    return Math.min(100, Math.max(0, Math.round(num)));
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden dir-rtl">
      {/* 1. TOP APP BAR (طابق أندرويد بالكامل) */}
      <header className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-900/60 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer"
            title="رجوع للقائمة الرئيسية"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-black text-white">
                {pkg.grade} ({pkg.section})
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-indigo-950 shadow-sm">
                ● {pkg.subject}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-bold mt-0.5">
              العدد: {students.length} طالب | سجل الدرجات الوزاري العراقي المعتمد
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer active:scale-95"
            title="طباعة السجل الرسمي"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>طباعة</span>
          </button>

          <button
            onClick={handleUploadToCloud}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs font-black text-white shadow-md shadow-emerald-950 transition-all cursor-pointer disabled:opacity-50"
            title="حفظ ومزامنة الدرجات مع السحابة"
          >
            <CloudUpload className="w-4 h-4" />
            <span>رفع سحابي ☁️</span>
          </button>

          <button
            onClick={handleDownloadFromCloud}
            disabled={isSyncing}
            className="p-2 rounded-xl bg-indigo-800/60 hover:bg-indigo-700 text-indigo-200 cursor-pointer active:scale-95 transition-all"
            title="استدعاء وتحديث القائمة من السحابة"
          >
            <CloudDownload className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MODE SWITCHER TABS (سجل اليومي | سجل المدرس | سجل الإدارة) */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 z-10">
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 gap-1">
          <button
            onClick={() => setMainMode('daily')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mainMode === 'daily'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            سجل اليومي
          </button>
          <button
            onClick={() => setMainMode('teacher')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mainMode === 'teacher'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            سجل المدرس
          </button>
          <button
            onClick={() => setMainMode('admin')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mainMode === 'admin'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            سجل الإدارة
          </button>
        </div>

        {/* Search Bar & Add Student */}
        <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث باسم الطالب أو رقمه..."
              className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => setShowAddStudent(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shrink-0 active:scale-95 cursor-pointer shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">إضافة طالب</span>
          </button>
        </div>
      </div>

      {/* 3. DAILY REGISTER SUB-TABS (عند اختيار سجل اليومي) */}
      {mainMode === 'daily' && (
        <div className="bg-indigo-950/40 border-b border-indigo-900/50 px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 z-10">
          {[
            { id: 'm1', label: 'الشهر 1' },
            { id: 'm2', label: 'الشهر 2' },
            { id: 'midterm', label: 'نصف السنة' },
            { id: 'm3', label: 'الشهر 3' },
            { id: 'm4', label: 'الشهر 4' },
            { id: 'final', label: 'السعي والنهائي' },
            { id: 'all', label: 'السجل الشامل (كامل السنة 📋)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDailySubTab(tab.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                dailySubTab === tab.id
                  ? 'bg-amber-400 text-indigo-950 shadow-md scale-102'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Feedback Toast */}
      {msg && (
        <div className={`py-1.5 px-4 text-xs font-bold text-center flex items-center justify-center gap-2 ${
          msg.type === 'success' ? 'bg-emerald-600/90 text-white' : 'bg-rose-600/90 text-white'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* 4. MAIN GRADE TABLE (مطابقة 1:1 لورق وسجلات الأندرويد) */}
      <div className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        <table className="w-full border-collapse text-center text-xs">
          {/* Table Head */}
          <thead className="sticky top-0 z-20 shadow-md">
            {/* 1. Header Groups Row */}
            <tr className="bg-slate-900 border-b border-slate-700 text-[11px] font-black">
              {/* Fixed Right: Seq & Student Name */}
              <th className="sticky right-0 z-30 bg-indigo-950 border-l border-b border-indigo-800 text-indigo-200 py-2 w-9">
                ت
              </th>
              <th className="sticky right-9 z-30 bg-indigo-950 border-l border-b border-indigo-800 text-white py-2 px-3 text-right min-w-[170px] max-w-[210px]">
                اسم الطالب الرباعي
              </th>

              {/* Dynamic Header Columns based on Main Mode and Sub-Tab */}
              {mainMode === 'daily' && dailySubTab === 'm1' && (
                <>
                  <th colSpan={4} className="bg-blue-900 border-l border-b border-blue-700 text-blue-100 py-1.5">
                    الامتحانات اليومية (الشهر الأول)
                  </th>
                  <th className="bg-amber-900/90 border-l border-b border-amber-700 text-amber-200 py-1.5 w-16">
                    التحريري
                  </th>
                  <th className="bg-blue-950 border-l border-b border-blue-800 text-emerald-300 py-1.5 w-16">
                    معدل ش1
                  </th>
                </>
              )}

              {mainMode === 'daily' && dailySubTab === 'm2' && (
                <>
                  <th colSpan={4} className="bg-purple-900 border-l border-b border-purple-700 text-purple-100 py-1.5">
                    الامتحانات اليومية (الشهر الثاني)
                  </th>
                  <th className="bg-amber-900/90 border-l border-b border-amber-700 text-amber-200 py-1.5 w-16">
                    التحريري
                  </th>
                  <th className="bg-purple-950 border-l border-b border-purple-800 text-emerald-300 py-1.5 w-16">
                    معدل ش2
                  </th>
                </>
              )}

              {mainMode === 'daily' && dailySubTab === 'midterm' && (
                <>
                  <th className="bg-blue-900 border-l border-b border-blue-700 text-blue-200 py-1.5 w-20">
                    معدل الفصل الأول
                  </th>
                  <th className="bg-teal-900 border-l border-b border-teal-700 text-teal-200 py-1.5 w-16">
                    شفهي نصف
                  </th>
                  <th className="bg-teal-900 border-l border-b border-teal-700 text-teal-200 py-1.5 w-20">
                    تحريري نصف
                  </th>
                  <th className="bg-emerald-900 border-l border-b border-emerald-700 text-emerald-200 py-1.5 w-20">
                    درجة نصف السنة
                  </th>
                </>
              )}

              {mainMode === 'daily' && dailySubTab === 'm3' && (
                <>
                  <th colSpan={4} className="bg-indigo-900 border-l border-b border-indigo-700 text-indigo-100 py-1.5">
                    الامتحانات اليومية (الشهر الثالث)
                  </th>
                  <th className="bg-amber-900/90 border-l border-b border-amber-700 text-amber-200 py-1.5 w-16">
                    التحريري
                  </th>
                  <th className="bg-indigo-950 border-l border-b border-indigo-800 text-emerald-300 py-1.5 w-16">
                    معدل ش3
                  </th>
                </>
              )}

              {mainMode === 'daily' && dailySubTab === 'm4' && (
                <>
                  <th colSpan={4} className="bg-violet-900 border-l border-b border-violet-700 text-violet-100 py-1.5">
                    الامتحانات اليومية (الشهر الرابع)
                  </th>
                  <th className="bg-amber-900/90 border-l border-b border-amber-700 text-amber-200 py-1.5 w-16">
                    التحريري
                  </th>
                  <th className="bg-violet-950 border-l border-b border-violet-800 text-emerald-300 py-1.5 w-16">
                    معدل ش4
                  </th>
                </>
              )}

              {mainMode === 'daily' && dailySubTab === 'final' && (
                <>
                  <th className="bg-purple-900 border-l border-b border-purple-700 text-purple-200 py-1.5 w-20">
                    معدل ف2
                  </th>
                  <th className="bg-amber-800 border-l border-b border-amber-600 text-amber-100 py-1.5 w-20">
                    السعي السنوي
                  </th>
                  <th className="bg-emerald-900 border-l border-b border-emerald-700 text-emerald-200 py-1.5 w-16">
                    نهائي د1
                  </th>
                  <th className="bg-slate-800 border-l border-b border-slate-600 text-slate-300 py-1.5 w-16">
                    نهائي د2
                  </th>
                  <th className="bg-emerald-950 border-l border-b border-emerald-800 text-emerald-300 py-1.5 w-20">
                    الدرجة النهائية
                  </th>
                  <th className="bg-slate-900 border-l border-b border-slate-700 text-white py-1.5 w-18">
                    النتيجة
                  </th>
                </>
              )}

              {/* Comprehensive All-Year Grid Mode */}
              {mainMode === 'daily' && dailySubTab === 'all' && (
                <>
                  <th className="bg-blue-900 border-l border-b border-blue-700 text-blue-200 py-1.5 w-14">معدل ش1</th>
                  <th className="bg-purple-900 border-l border-b border-purple-700 text-purple-200 py-1.5 w-14">معدل ش2</th>
                  <th className="bg-blue-950 border-l border-b border-blue-800 text-blue-100 py-1.5 w-14">معدل ف1</th>
                  <th className="bg-teal-900 border-l border-b border-teal-700 text-teal-200 py-1.5 w-16">درجة نصف</th>
                  <th className="bg-indigo-900 border-l border-b border-indigo-700 text-indigo-200 py-1.5 w-14">معدل ش3</th>
                  <th className="bg-violet-900 border-l border-b border-violet-700 text-violet-200 py-1.5 w-14">معدل ش4</th>
                  <th className="bg-purple-950 border-l border-b border-purple-800 text-purple-100 py-1.5 w-14">معدل ف2</th>
                  <th className="bg-amber-800 border-l border-b border-amber-600 text-amber-200 py-1.5 w-16 font-black">السعي</th>
                  <th className="bg-emerald-900 border-l border-b border-emerald-700 text-emerald-200 py-1.5 w-16">نهائي د1</th>
                  <th className="bg-slate-800 border-l border-b border-slate-700 text-slate-300 py-1.5 w-14">نهائي د2</th>
                  <th className="bg-emerald-950 border-l border-b border-emerald-800 text-emerald-300 py-1.5 w-16 font-black">النهائية</th>
                  <th className="bg-slate-900 border-l border-b border-slate-700 text-white py-1.5 w-16">النتيجة</th>
                </>
              )}

              {/* Teacher Register Table Headers */}
              {mainMode === 'teacher' && (
                <>
                  <th className="bg-blue-900 border-l border-b border-blue-700 text-blue-200 py-1.5 w-14">معدل ش1</th>
                  <th className="bg-blue-900 border-l border-b border-blue-700 text-blue-200 py-1.5 w-14">معدل ش2</th>
                  <th className="bg-blue-950 border-l border-b border-blue-800 text-blue-100 py-1.5 w-14">درجة فص1</th>
                  <th className="bg-teal-900 border-l border-b border-teal-700 text-teal-200 py-1.5 w-16">درجة نصف</th>
                  <th className="bg-purple-900 border-l border-b border-purple-700 text-purple-200 py-1.5 w-14">معدل ش3</th>
                  <th className="bg-purple-900 border-l border-b border-purple-700 text-purple-200 py-1.5 w-14">معدل ش4</th>
                  <th className="bg-purple-950 border-l border-b border-purple-800 text-purple-100 py-1.5 w-14">درجة فص2</th>
                  <th className="bg-amber-800 border-l border-b border-amber-600 text-amber-200 py-1.5 w-16 font-black">السعي</th>
                  <th className="bg-emerald-900 border-l border-b border-emerald-700 text-emerald-200 py-1.5 w-16">نهائي د1</th>
                  <th className="bg-slate-800 border-l border-b border-slate-700 text-slate-300 py-1.5 w-14">د2</th>
                  <th className="bg-emerald-950 border-l border-b border-emerald-800 text-emerald-300 py-1.5 w-16 font-black">النهائية</th>
                  <th className="bg-slate-900 border-l border-b border-slate-700 text-white py-1.5 w-16">النتيجة</th>
                </>
              )}

              {/* Admin Register Table Headers */}
              {mainMode === 'admin' && (
                <>
                  <th className="bg-blue-900 border-l border-b border-blue-700 text-blue-200 py-1.5 w-16">معدل ف1</th>
                  <th className="bg-teal-900 border-l border-b border-teal-700 text-teal-200 py-1.5 w-18">درجة نصف</th>
                  <th className="bg-purple-900 border-l border-b border-purple-700 text-purple-200 py-1.5 w-16">معدل ف2</th>
                  <th className="bg-amber-800 border-l border-b border-amber-600 text-amber-100 py-1.5 w-18 font-black">السعي السنوي</th>
                  <th className="bg-emerald-900 border-l border-b border-emerald-700 text-emerald-200 py-1.5 w-16">نهائي د1</th>
                  <th className="bg-slate-800 border-l border-b border-slate-700 text-slate-300 py-1.5 w-16">نهائي د2</th>
                  <th className="bg-emerald-950 border-l border-b border-emerald-800 text-emerald-300 py-1.5 w-20 font-black">الدرجة النهائية</th>
                  <th className="bg-slate-900 border-l border-b border-slate-700 text-white py-1.5 w-18">النتيجة</th>
                </>
              )}
            </tr>

            {/* 2. Sub-Headers Row (For Daily Sub-Tabs 1-4) */}
            {mainMode === 'daily' && (dailySubTab === 'm1' || dailySubTab === 'm2' || dailySubTab === 'm3' || dailySubTab === 'm4') && (
              <tr className="bg-slate-800 border-b border-slate-700 text-[10px] text-slate-300">
                <th className="sticky right-0 z-30 bg-indigo-950 border-l border-b border-indigo-800"></th>
                <th className="sticky right-9 z-30 bg-indigo-950 border-l border-b border-indigo-800"></th>
                <th className="border-l border-slate-700 py-1 w-14">يومي 1</th>
                <th className="border-l border-slate-700 py-1 w-14">يومي 2</th>
                <th className="border-l border-slate-700 py-1 w-14">يومي 3</th>
                <th className="border-l border-slate-700 py-1 w-14">يومي 4</th>
                <th className="border-l border-slate-700 py-1 w-16 text-amber-300">تحريري</th>
                <th className="border-l border-slate-700 py-1 w-16 text-emerald-400 font-bold">المعدل</th>
              </tr>
            )}
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-800">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500 font-bold">
                  لا يوجد طلاب مطابقين للبحث
                </td>
              </tr>
            ) : (
              filteredStudents.map((std, idx) => {
                const m = std.marks;
                const finalDecided = m.finalDecidedGrade ?? m.annualPursuit;
                const isPassing = finalDecided >= 50;
                const hasGrade = (m.annualPursuit > 0 || m.finalExamTotal > 0);
                const resultText = !hasGrade ? 'مستمر' : isPassing ? 'ناجح' : 'مكمل';

                return (
                  <tr
                    key={std.id}
                    className={`hover:bg-indigo-950/30 transition-colors ${
                      idx % 2 === 0 ? 'bg-slate-900/60' : 'bg-slate-900/20'
                    }`}
                  >
                    {/* Fixed Right: Sequence */}
                    <td className="sticky right-0 z-10 bg-slate-900 border-l border-slate-800 py-1.5 text-slate-400 font-mono text-[11px] font-bold">
                      {idx + 1}
                    </td>

                    {/* Fixed Right: Student Name & Record Number */}
                    <td className="sticky right-9 z-10 bg-slate-900 border-l border-slate-800 py-1.5 px-3 text-right">
                      <div className="flex items-center justify-between group">
                        <span className="font-black text-white text-xs truncate max-w-[150px]" title={std.fullName}>
                          {std.fullName}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[9.5px] text-slate-500 font-mono">
                            {std.recordNumber}
                          </span>
                          <button
                            onClick={() => {
                              setEditingStudent(std);
                              setEditName(std.fullName);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-amber-300"
                            title="تعديل اسم الطالب"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* DYNAMIC CELLS PER MODE */}
                    {/* Daily: Month 1 */}
                    {mainMode === 'daily' && dailySubTab === 'm1' && (
                      <>
                        {[0, 1, 2, 3].map((dIdx) => (
                          <td key={dIdx} className="border-l border-slate-800 p-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={fmtInput(m.m1Daily[dIdx])}
                              onChange={(e) => {
                                const val = parseVal(e.target.value);
                                handleMarkChange(std.id, (mark) => {
                                  mark.m1Daily[dIdx] = val;
                                });
                              }}
                              className="w-12 h-8 text-center text-xs font-black rounded-lg bg-slate-950 border border-slate-700/80 text-white focus:outline-none focus:border-indigo-400 focus:bg-slate-900"
                            />
                          </td>
                        ))}
                        <td className="border-l border-slate-800 p-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={fmtInput(m.m1Written)}
                            onChange={(e) => {
                              const val = parseVal(e.target.value);
                              handleMarkChange(std.id, (mark) => {
                                mark.m1Written = val;
                              });
                            }}
                            className="w-14 h-8 text-center text-xs font-black rounded-lg bg-slate-950 border border-amber-500/50 text-amber-300 focus:outline-none focus:border-amber-400"
                          />
                        </td>
                        <td className="border-l border-slate-800 p-1">
                          <div className={`w-14 h-8 mx-auto flex items-center justify-center rounded-lg text-xs font-black ${
                            m.m1MonthAvg >= 50
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : m.m1MonthAvg > 0
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : 'bg-slate-950 text-slate-500 border border-slate-800'
                          }`}>
                            {m.m1MonthAvg || 0}
                          </div>
                        </td>
                      </>
                    )}

                    {/* Daily: Month 2 */}
                    {mainMode === 'daily' && dailySubTab === 'm2' && (
                      <>
                        {[0, 1, 2, 3].map((dIdx) => (
                          <td key={dIdx} className="border-l border-slate-800 p-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={fmtInput(m.m2Daily[dIdx])}
                              onChange={(e) => {
                                const val = parseVal(e.target.value);
                                handleMarkChange(std.id, (mark) => {
                                  mark.m2Daily[dIdx] = val;
                                });
                              }}
                              className="w-12 h-8 text-center text-xs font-black rounded-lg bg-slate-950 border border-slate-700/80 text-white focus:outline-none focus:border-indigo-400"
                            />
                          </td>
                        ))}
                        <td className="border-l border-slate-800 p-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={fmtInput(m.m2Written)}
                            onChange={(e) => {
                              const val = parseVal(e.target.value);
                              handleMarkChange(std.id, (mark) => {
                                mark.m2Written = val;
                              });
                            }}
                            className="w-14 h-8 text-center text-xs font-black rounded-lg bg-slate-950 border border-amber-500/50 text-amber-300 focus:outline-none focus:border-amber-400"
                          />
                        </td>
                        <td className="border-l border-slate-800 p-1">
                          <div className={`w-14 h-8 mx-auto flex items-center justify-center rounded-lg text-xs font-black ${
                            m.m2MonthAvg >= 50
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : m.m2MonthAvg > 0
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : 'bg-slate-950 text-slate-500 border border-slate-800'
                          }`}>
                            {m.m2MonthAvg || 0}
                          </div>
                        </td>
                      </>
                    )}

                    {/* Daily: Midterm */}
                    {mainMode === 'daily' && dailySubTab === 'midterm' && (
                      <>
                        <td className="border-l border-slate-800 p-1 font-bold text-indigo-300">
                          {m.firstTermAvg || 0}
                        </td>
                        <td className="border-l border-slate-800 p-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={fmtInput(m.midtermOral[0])}
                            onChange={(e) => {
                              const val = parseVal(e.target.value);
                              handleMarkChange(std.id, (mark) => {
                                mark.midtermOral[0] = val;
                              });
                            }}
                            className="w-14 h-8 text-center text-xs font-black rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none"
                          />
                        </td>
                        <td className="border-l border-slate-800 p-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={fmtInput(m.midtermScore)}
                            onChange={(e) => {
                              const val = parseVal(e.target.value);
                              handleMarkChange(std.id, (mark) => {
                                mark.midtermScore = val;
                              });
                            }}
                            className="w-16 h-8 text-center text-xs font-black rounded-lg bg-slate-950 border border-amber-500/50 text-amber-300 focus:outline-none"
                          />
                        </td>
                        <td className="border-l border-slate-800 p-1">
                          <div className={`w-16 h-8 mx-auto flex items-center justify-center rounded-lg text-xs font-black ${
                            m.midtermFinalGrade >= 50
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : m.midtermFinalGrade > 0
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : 'bg-slate-950 text-slate-500 border border-slate-800'
                          }`}>
                            {m.midtermFinalGrade || 0}
                          </div>
                        </td>
                      </>
                    )}

                    {/* Daily: Month 3 */}
                    {mainMode === 'daily' && dailySubTab === 'm3' && (
                      <>
                        {[0, 1, 2, 3].map((dIdx) => (
                          <td key={dIdx} className="border-l border-slate-800 p-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={fmtInput(m.m3Daily[dIdx])}
                              onChange={(e) => {
                                const val = parseVal(e.target.value);
                                handleMarkChange(std.id, (mark) => {
                                  mark.m3Daily[dIdx] = val;
                                });
                              }}
                              className="w-12 h-8 text-center text-xs font-black rounded-lg bg-slate-950 border border-slate-700/80 text-white focus:outline-none"
                            />
                          </td>
                        ))}
                        <td className="border-l border-slate-800 p-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={fmtInput(m.m3Written)}
                            onChange={(e) => {
                              const val = parseVal(e.target.value);
                              handleMarkChange(std.id, (mark) => {
                                mark.m3Written = val;
                              });
                            }}
                            className="w-14 h-8 text-center text-xs font-black rounded-lg bg-slate-950 border border-amber-500/50 text-amber-300 focus:outline-none"
                          />
                        </td>
                        <td className="border-l border-slate-800 p-1">
                          <div className={`w-14 h-8 mx-auto flex items-center justify-center rounded-lg text-xs font-black ${
                            m.m3MonthAvg >= 50
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : m.m3MonthAvg > 0
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : 'bg-slate-950 text-slate-500 border border-slate-800'
                          }`}>
                            {m.m3MonthAvg || 0}
                          </div>
                        </td>
                      </>
                    )}

                    {/* Daily: Month 4 */}
                    {mainMode === 'daily' && dailySubTab === 'm4' && (
                      <>
                        {[0, 1, 2, 3].map((dIdx) => (
                          <td key={dIdx} className="border-l border-slate-800 p-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={fmtInput(m.m4Daily[dIdx])}
                              onChange={(e) => {
                                const val = parseVal(e.target.value);
                                handleMarkChange(std.id, (mark) => {
                                  mark.m4Daily[dIdx] = val;
                                });
                              }}
                              className="w-12 h-8 text-center text-xs font-black rounded-lg bg-slate-950 border border-slate-700/80 text-white focus:outline-none"
                            />
                          </td>
                        ))}
                        <td className="border-l border-slate-800 p-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={fmtInput(m.m4Written)}
                            onChange={(e) => {
                              const val = parseVal(e.target.value);
                              handleMarkChange(std.id, (mark) => {
                                mark.m4Written = val;
                              });
                            }}
                            className="w-14 h-8 text-center text-xs font-black rounded-lg bg-slate-950 border border-amber-500/50 text-amber-300 focus:outline-none"
                          />
                        </td>
                        <td className="border-l border-slate-800 p-1">
                          <div className={`w-14 h-8 mx-auto flex items-center justify-center rounded-lg text-xs font-black ${
                            m.m4MonthAvg >= 50
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : m.m4MonthAvg > 0
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : 'bg-slate-950 text-slate-500 border border-slate-800'
                          }`}>
                            {m.m4MonthAvg || 0}
                          </div>
                        </td>
                      </>
                    )}

                    {/* Daily: Pursuit & Final */}
                    {mainMode === 'daily' && dailySubTab === 'final' && (
                      <>
                        <td className="border-l border-slate-800 p-1 font-bold text-purple-300">
                          {m.secondTermAvg || 0}
                        </td>
                        <td className="border-l border-slate-800 p-1 font-black text-amber-300 text-sm">
                          {m.annualPursuit || 0}
                        </td>
                        <td className="border-l border-slate-800 p-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={fmtInput(m.finalWrittenD1)}
                            onChange={(e) => {
                              const val = parseVal(e.target.value);
                              handleMarkChange(std.id, (mark) => {
                                mark.finalWrittenD1 = val;
                              });
                            }}
                            className="w-14 h-8 text-center text-xs font-black rounded-lg bg-slate-950 border border-emerald-500/50 text-emerald-300 focus:outline-none"
                          />
                        </td>
                        <td className="border-l border-slate-800 p-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={fmtInput(m.finalWrittenD2)}
                            onChange={(e) => {
                              const val = e.target.value.trim() ? parseVal(e.target.value) : null;
                              handleMarkChange(std.id, (mark) => {
                                mark.finalWrittenD2 = val;
                              });
                            }}
                            className="w-14 h-8 text-center text-xs font-black rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
                          />
                        </td>
                        <td className="border-l border-slate-800 p-1 font-black text-emerald-400 text-sm">
                          {finalDecided || 0}
                        </td>
                        <td className="border-l border-slate-800 p-1">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black ${
                            resultText === 'ناجح'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : resultText === 'مكمل'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {resultText}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Comprehensive All-Year Grid Mode */}
                    {mainMode === 'daily' && dailySubTab === 'all' && (
                      <>
                        <td className="border-l border-slate-800 p-1 font-bold text-blue-300">{m.m1MonthAvg || 0}</td>
                        <td className="border-l border-slate-800 p-1 font-bold text-purple-300">{m.m2MonthAvg || 0}</td>
                        <td className="border-l border-slate-800 p-1 font-bold text-blue-200">{m.firstTermAvg || 0}</td>
                        <td className="border-l border-slate-800 p-1 font-bold text-teal-300">{m.midtermFinalGrade || 0}</td>
                        <td className="border-l border-slate-800 p-1 font-bold text-indigo-300">{m.m3MonthAvg || 0}</td>
                        <td className="border-l border-slate-800 p-1 font-bold text-violet-300">{m.m4MonthAvg || 0}</td>
                        <td className="border-l border-slate-800 p-1 font-bold text-purple-200">{m.secondTermAvg || 0}</td>
                        <td className="border-l border-slate-800 p-1 font-black text-amber-300 bg-amber-950/20">{m.annualPursuit || 0}</td>
                        <td className="border-l border-slate-800 p-1 font-bold text-emerald-300">{m.finalExamTotal || 0}</td>
                        <td className="border-l border-slate-800 p-1 text-slate-400">{m.finalWrittenD2 || '-'}</td>
                        <td className="border-l border-slate-800 p-1 font-black text-emerald-400 bg-emerald-950/20">{finalDecided || 0}</td>
                        <td className="border-l border-slate-800 p-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            resultText === 'ناجح' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                          }`}>
                            {resultText}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Teacher Register Table Mode */}
                    {mainMode === 'teacher' && (
                      <>
                        <td className="border-l border-slate-800 p-1 font-bold text-blue-300">{m.m1MonthAvg || 0}</td>
                        <td className="border-l border-slate-800 p-1 font-bold text-blue-300">{m.m2MonthAvg || 0}</td>
                        <td className="border-l border-slate-800 p-1 font-bold text-blue-200">{m.firstTermAvg || 0}</td>
                        <td className="border-l border-slate-800 p-1 font-bold text-teal-300">{m.midtermFinalGrade || 0}</td>
                        <td className="border-l border-slate-800 p-1 font-bold text-purple-300">{m.m3MonthAvg || 0}</td>
                        <td className="border-l border-slate-800 p-1 font-bold text-purple-300">{m.m4MonthAvg || 0}</td>
                        <td className="border-l border-slate-800 p-1 font-bold text-purple-200">{m.secondTermAvg || 0}</td>
                        <td className="border-l border-slate-800 p-1 font-black text-amber-300 bg-amber-950/20 text-sm">{m.annualPursuit || 0}</td>
                        <td className="border-l border-slate-800 p-1 font-bold text-emerald-300">{m.finalExamTotal || 0}</td>
                        <td className="border-l border-slate-800 p-1 text-slate-400">{m.finalWrittenD2 || '-'}</td>
                        <td className="border-l border-slate-800 p-1 font-black text-emerald-400 bg-emerald-950/20 text-sm">{finalDecided || 0}</td>
                        <td className="border-l border-slate-800 p-1">
                          <span className={`px-2 py-1 rounded text-[10px] font-black ${
                            resultText === 'ناجح' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                          }`}>
                            {resultText}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Admin Register Table Mode */}
                    {mainMode === 'admin' && (
                      <>
                        <td className="border-l border-slate-800 p-1.5 font-bold text-blue-200">{m.firstTermAvg || 0}</td>
                        <td className="border-l border-slate-800 p-1.5 font-bold text-teal-300">{m.midtermFinalGrade || 0}</td>
                        <td className="border-l border-slate-800 p-1.5 font-bold text-purple-200">{m.secondTermAvg || 0}</td>
                        <td className="border-l border-slate-800 p-1.5 font-black text-amber-300 bg-amber-950/20 text-sm">{m.annualPursuit || 0}</td>
                        <td className="border-l border-slate-800 p-1.5 font-bold text-emerald-300">{m.finalExamTotal || 0}</td>
                        <td className="border-l border-slate-800 p-1.5 text-slate-400">{m.finalWrittenD2 || '-'}</td>
                        <td className="border-l border-slate-800 p-1.5 font-black text-emerald-400 bg-emerald-950/20 text-sm">{finalDecided || 0}</td>
                        <td className="border-l border-slate-800 p-1.5">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black ${
                            resultText === 'ناجح' ? 'text-emerald-400 bg-emerald-500/20' : 'text-rose-400 bg-rose-500/20'
                          }`}>
                            {resultText}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. STATS SUMMARY FOOTER BAR (مطابقة 1:1 للوحة الإحصاءات في أندرويد) */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between text-xs font-bold shrink-0 z-10 gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">عدد الطلاب الكلي:</span>
            <span className="text-white font-black">{stats.total}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400">الناجحين:</span>
            <span className="text-emerald-300 font-black">{stats.passed}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-rose-400">المكملين / الراسبين:</span>
            <span className="text-rose-300 font-black">{stats.failed}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-blue-400">نسبة النجاح:</span>
            <span className="text-blue-300 font-black">{stats.passRate}%</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          وزارة التربية العراقية • نظام الإدارة المدرسية الموحد
        </div>
      </footer>

      {/* 6. ADD STUDENT MODAL DIALOG */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                <span>إضافة طالب جديد للسجل</span>
              </h3>
              <button onClick={() => setShowAddStudent(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">اسم الطالب الرباعي واللقب</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="مثال: علي محمد حسن الكرخي"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">رقم القيد / السجل (اختياري)</label>
                <input
                  type="text"
                  value={newRecordNumber}
                  onChange={(e) => setNewRecordNumber(e.target.value)}
                  placeholder="مثال: 1042"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleAddStudent}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-black text-xs text-white transition-all cursor-pointer shadow-md"
              >
                تأكيد الإضافة ✓
              </button>
              <button
                onClick={() => setShowAddStudent(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. EDIT STUDENT NAME MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Edit2 className="w-4 h-4 text-amber-400" />
              <span>تعديل اسم الطالب</span>
            </h3>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">الاسم الرباعي الجديد</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSaveEditName}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-black text-xs text-indigo-950 transition-all cursor-pointer shadow-md"
              >
                حفظ التعديل ✓
              </button>
              <button
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
