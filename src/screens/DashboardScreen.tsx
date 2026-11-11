import React, { useState } from 'react';
import { 
  CloudDownload, 
  Plus, 
  BookOpen, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Sparkles, 
  Users, 
  School,
  CheckCircle2,
  X
} from 'lucide-react';
import { ClassPackage, SchoolConfig } from '../types';
import { StorageService } from '../services/storage';

interface DashboardScreenProps {
  config: SchoolConfig;
  onOpenRegister: (pkg: ClassPackage) => void;
  onOpenSettings: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ config, onOpenRegister, onOpenSettings }) => {
  const [packages, setPackages] = useState<ClassPackage[]>(() => StorageService.getPackages());
  const [teacherName, setTeacherName] = useState(() => StorageService.getTeacherName());
  
  // Dialogs
  const [showSummonModal, setShowSummonModal] = useState(false);
  const [newGrade, setNewGrade] = useState('الأول المتوسط');
  const [newSection, setNewSection] = useState('أ');
  const [newSubject, setNewSubject] = useState('الرياضيات');
  const [isSummoning, setIsSummoning] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [packageToDelete, setPackageToDelete] = useState<ClassPackage | null>(null);

  const quickSubjects = [
    'التربية الإسلامية', 'اللغة العربية', 'اللغة الإنكليزية', 'الرياضيات',
    'العلوم', 'الفيزياء', 'الكيمياء', 'الأحياء', 'الاجتماعيات', 'الحاسوب'
  ];

  const handleSummonClass = async () => {
    if (!newSubject.trim()) return;
    setIsSummoning(true);
    setStatusMsg(null);

    // 1. Add class package locally
    const newPkg: ClassPackage = {
      id: `pkg_${Date.now()}`,
      grade: newGrade,
      section: newSection,
      subject: newSubject.trim(),
      studentsCount: 0
    };
    StorageService.addPackage(newPkg);

    // 2. Fetch students from cloud
    const res = await StorageService.syncRosterFromCloud(newGrade, newSection, newSubject.trim());
    setIsSummoning(false);

    setPackages(StorageService.getPackages());
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        setShowSummonModal(false);
        setStatusMsg(null);
      }, 1500);
    } else {
      setStatusMsg({ type: 'success', text: 'تمت إضافة الشعبة بنجاح! يمكنك إضافة الطلاب يدوياً أو مزامنتهم لاحقاً.' });
      setTimeout(() => {
        setShowSummonModal(false);
        setStatusMsg(null);
      }, 1800);
    }
  };

  const handleDeletePackage = (pkg: ClassPackage) => {
    StorageService.deletePackage(pkg.id);
    setPackages(StorageService.getPackages());
    setPackageToDelete(null);
  };

  return (
    <div className="flex-1 pb-24 px-4 pt-3 max-w-md mx-auto w-full">
      {/* 1. Teacher & School Banner Card */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-4 border border-indigo-700/50 shadow-xl text-white mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shadow-inner">
              👨‍🏫
            </div>
            <div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                كادر التدريس
              </span>
              <h2 className="text-base font-black tracking-tight">{teacherName}</h2>
              <p className="text-xs text-indigo-200/90 font-medium">{config.schoolName}</p>
            </div>
          </div>

          <button
            onClick={() => setShowSummonModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 text-xs font-black text-white shadow-md transition-all"
          >
            <CloudDownload className="w-4 h-4 text-amber-300" />
            <span>استدعاء شعبة</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-indigo-700/40 text-[11px] text-indigo-200">
          <span>الشعب المسندة: {packages.length}</span>
          <span className="text-emerald-300 font-bold">● متصل بالسحابة الموحدة</span>
        </div>
      </div>

      {/* 2. Classes Packages List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>سجلات المواد والشعب المقررة</span>
          </h3>
          <span className="text-xs text-slate-500 font-bold">({packages.length}) سجل</span>
        </div>

        {packages.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-black text-slate-800 dark:text-white mb-1">لا توجد سجلات مضافة بعد</h4>
            <p className="text-xs text-slate-500 mb-4">انقر على استدعاء شعبة لإضافة صفوفك وموادك</p>
            <button
              onClick={() => setShowSummonModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>استدعاء شعبة الآن</span>
            </button>
          </div>
        ) : (
          packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => onOpenRegister(pkg)}
              className="p-4 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-black border border-indigo-100 dark:border-indigo-800">
                    الصف {pkg.grade}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 text-xs font-black">
                    شعبة ({pkg.section})
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPackageToDelete(pkg);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  title="حذف السجل"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                    {pkg.section}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-white">
                      مادة {pkg.subject} 📖
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium">
                      انقر لفتح سجل الدرجات ورصد الطلاب
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-indigo-600 dark:text-indigo-400">
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summon Class Modal */}
      {showSummonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CloudDownload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-black text-slate-800 dark:text-white">استدعاء شعبة من السحابة</h3>
              </div>
              <button onClick={() => setShowSummonModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">الصف الدراسي:</label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="الأول المتوسط">الأول المتوسط</option>
                  <option value="الثاني المتوسط">الثاني المتوسط</option>
                  <option value="الثالث المتوسط">الثالث المتوسط</option>
                  <option value="الرابع الإعدادي">الرابع الإعدادي</option>
                  <option value="الخامس الإعدادي">الخامس الإعدادي</option>
                  <option value="السادس الإعدادي">السادس الإعدادي</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">الشعبة:</label>
                <div className="flex gap-2">
                  {['أ', 'ب', 'ج', 'د', 'هـ'].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setNewSection(sec)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                        newSection === sec
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">المادة الدراسية:</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="اسم المادة..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {quickSubjects.slice(0, 6).map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setNewSubject(sub)}
                      className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10.5px] font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {statusMsg && (
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-1.5 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200'
              }`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <p>{statusMsg.text}</p>
              </div>
            )}

            <button
              onClick={handleSummonClass}
              disabled={isSummoning}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isSummoning ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CloudDownload className="w-4 h-4" />
                  <span>تنزيل واستدعاء الشعبة الآن ✓</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {packageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white">تأكيد حذف السجل</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              هل أنت متأكد من حذف سجل مادة ({packageToDelete.subject}) للصف {packageToDelete.grade} ({packageToDelete.section})؟
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleDeletePackage(packageToDelete)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black"
              >
                تأكيد الحذف
              </button>
              <button
                onClick={() => setPackageToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
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
