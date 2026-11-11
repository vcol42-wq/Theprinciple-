import React, { useState } from 'react';
import { Settings, User, Building2, LogOut, ArrowRight, ShieldCheck, Moon, Sun, Smartphone } from 'lucide-react';
import { StorageService } from '../services/storage';

interface SettingsScreenProps {
  onSwitchRole: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onSwitchRole, onBack }) => {
  const config = StorageService.getConfig();
  const [teacherName, setTeacherName] = useState(() => StorageService.getTeacherName());
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    StorageService.setTeacherName(teacherName);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex-1 pb-24 px-4 pt-3 max-w-md mx-auto w-full text-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-800 text-slate-300">
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-black">إعدادات النظام والاتصال ⚙️</h2>
          <p className="text-xs text-slate-400">تخصيص البيانات والتحكم بالجلسة</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Profile Card */}
        <div className="p-4 rounded-3xl bg-slate-800 border border-slate-700 shadow-md space-y-3">
          <h3 className="text-xs font-black text-indigo-300 flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>بيانات حساب الأستاذ</span>
          </h3>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">اسم الأستاذ الكامل:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
              />
              <button
                onClick={handleSave}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black text-xs"
              >
                {isSaved ? 'تم ✓' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>

        {/* School Info */}
        <div className="p-4 rounded-3xl bg-slate-800 border border-slate-700 shadow-md space-y-2">
          <h3 className="text-xs font-black text-indigo-300 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>بيانات المدرسة والاقتران</span>
          </h3>

          <div className="text-xs text-slate-300 space-y-1">
            <p>اسم المدرسة: <strong className="text-white">{config.schoolName}</strong></p>
            <p>رمز الاقتران المعتمد: <strong className="text-amber-300 font-mono">{config.pairingCode}</strong></p>
            <p>معرّف المدرسة: <strong className="text-slate-400 font-mono text-[11px]">{config.schoolId}</strong></p>
          </div>
        </div>

        {/* PWA Installation Guide */}
        <div className="p-4 rounded-3xl bg-indigo-950/50 border border-indigo-700/50 shadow-md space-y-2">
          <h3 className="text-xs font-black text-indigo-300 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span>التثبيت كتطبيق أصلي (PWA)</span>
          </h3>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            يمكنك تثبيت هذه المنظومة على شاشة هاتفك الرئيسية بنقرة واحدة:
          </p>
          <ul className="text-[10.5px] text-slate-400 list-disc pr-4 space-y-1">
            <li><strong>على آيفون (iOS Safari):</strong> اضغط على زر المشاركة ثم اختر <em>"إضافة إلى الصفحة الرئيسية"</em>.</li>
            <li><strong>على أندرويد (Chrome):</strong> اضغط على القائمة (⋮) ثم اختر <em>"تثبيت التطبيق"</em>.</li>
          </ul>
        </div>

        {/* Switch Role / Disconnect */}
        <button
          onClick={onSwitchRole}
          className="w-full py-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 font-black text-xs transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>التبديل لحساب آخر أو تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};
