import React from 'react';
import { UserCheck, GraduationCap, ShieldAlert, ArrowLeft, Sparkles, Building2 } from 'lucide-react';
import { AppRole } from '../types';

interface RoleSelectionScreenProps {
  onSelectRole: (role: AppRole) => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectRole }) => {
  const roles = [
    {
      id: 'teacher' as AppRole,
      title: 'بوابة الكادر التدريسي 👨‍🏫',
      subtitle: 'رصد الدرجات، سجل الحضور، استدعاء الشعب، وإدارة الحصص',
      color: 'from-blue-600 to-indigo-700',
      badge: 'المعلم والمدرس',
      icon: '📚'
    },
    {
      id: 'student' as AppRole,
      title: 'بوابة الطلبة وأولياء الأمور 🎓',
      subtitle: 'متابعة جدول الحصص اليومي، الإشعارات، والشهادات والنتائج',
      color: 'from-emerald-600 to-teal-700',
      badge: 'طالب / ولي أمر',
      icon: '🎒'
    },
    {
      id: 'principal' as AppRole,
      title: 'بوابة الإدارة والمشرف العام 👑',
      subtitle: 'بث التوجيهات المدرسية، مراقبة الكادر، وإحصائيات المدرسة الشاملة',
      color: 'from-amber-600 to-amber-800',
      badge: 'المدير / المشرف',
      icon: '🛡️'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-5 max-w-md mx-auto">
      {/* Header */}
      <div className="pt-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>تحديد صفة الدخول للنظام</span>
        </div>
        <h2 className="text-xl font-black text-white">منظومة الإدارة المدرسية الموحدة</h2>
        <p className="text-xs text-slate-400 mt-1">اختر البوابة المناسبة للمتابعة:</p>
      </div>

      {/* Role Cards List */}
      <div className="my-auto space-y-4 py-4">
        {roles.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelectRole(r.id)}
            className="w-full text-right p-4 rounded-3xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 transition-all shadow-xl active:scale-[0.98] group relative overflow-hidden flex flex-col justify-between"
          >
            <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${r.color}`} />
            
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-inner">
                  {r.icon}
                </span>
                <div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white/10 text-amber-300">
                    {r.badge}
                  </span>
                  <h3 className="text-base font-black text-white mt-0.5">{r.title}</h3>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-700/50 text-slate-300 group-hover:text-white group-hover:bg-indigo-600 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pr-1 mt-1">
              {r.subtitle}
            </p>
          </button>
        ))}
      </div>

      {/* Footer Info */}
      <div className="pb-6 text-center text-slate-500 text-[11px]">
        <p>متوافق 100% مع كافة المتصفحات، هواتف آيفون وأندرويد والكمبيوتر</p>
        <p className="text-[10px] text-slate-600 mt-0.5">يعتمد البنية السحابية الآمنة لوزارة التربية</p>
      </div>
    </div>
  );
};
