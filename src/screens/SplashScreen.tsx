import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 flex flex-col items-center justify-between p-8 text-white z-50 animate-in fade-in">
      <div className="pt-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-3 shadow-lg">
          <span className="text-3xl">🇮🇶</span>
        </div>
        <p className="text-xs font-bold text-amber-300 tracking-wider">جمهورية العراق</p>
        <p className="text-[11px] text-slate-300">وزارة التربية - المنظومة السحابية الموحدة</p>
      </div>

      <div className="flex flex-col items-center justify-center my-auto">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 p-1 shadow-2xl flex items-center justify-center animate-bounce duration-1000">
            <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
              <span className="text-5xl">🏛️</span>
            </div>
          </div>
          <div className="absolute -top-2 -right-2 bg-amber-400 text-indigo-950 p-1.5 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-2">
          The Principal
        </h1>
        <p className="text-xs font-medium text-indigo-200/90 text-center max-w-xs">
          نظام الإدارة المدرسية الموحد السحابي
        </p>
        <div className="mt-4 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold text-amber-300">
          Super Edition v7.4.1 (Web Universal)
        </div>
      </div>

      <div className="pb-8 flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] text-slate-400">جاري فحص الاتصال وتجهيز الجلسة...</p>
      </div>
    </div>
  );
};
