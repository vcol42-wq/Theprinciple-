import React, { useState } from 'react';
import { KeyRound, QrCode, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { AppRole, SchoolConfig } from '../types';
import { verifySchoolPairing } from '../services/supabase';
import { StorageService } from '../services/storage';
import { QrScannerModal } from '../components/QrScannerModal';

interface OnboardingScreenProps {
  role: AppRole;
  onComplete: () => void;
  onBack: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ role, onComplete, onBack }) => {
  const [pairingCode, setPairingCode] = useState('');
  const [teacherName, setTeacherName] = useState(StorageService.getTeacherName());
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const handlePairing = async (codeToVerify: string) => {
    const code = codeToVerify.trim();
    if (!code) {
      setErrorMsg('يرجى إدخال رمز المدرسة أو مسح الباركود');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const result = await verifySchoolPairing(code);
    setIsLoading(false);

    if (result.success && result.school) {
      const currentConfig = StorageService.getConfig();
      const updatedConfig: SchoolConfig = {
        ...currentConfig,
        schoolId: result.school.id,
        schoolName: result.school.name,
        pairingCode: result.school.pairingCode || code,
        isActivated: true,
        role: role
      };
      StorageService.saveConfig(updatedConfig);
      if (teacherName.trim()) {
        StorageService.setTeacherName(teacherName.trim());
      }
      onComplete();
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleQrScanned = (raw: string) => {
    setShowQrModal(false);
    handlePairing(raw);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-5 max-w-md mx-auto">
      {/* Top Header */}
      <div className="pt-6">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-bold mb-6"
        >
          <ArrowRight className="w-4 h-4" />
          <span>تغيير نوع الحساب</span>
        </button>

        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-3xl">🔗</span>
          </div>
          <h2 className="text-xl font-black text-white">ربط واقتران المدرسة</h2>
          <p className="text-xs text-slate-400 mt-1">
            {role === 'teacher'
              ? 'أدخل رمز المدرسة أو امسح الباركود للاتصال بسجلات مدرستك'
              : role === 'student'
              ? 'أدخل كود الطالب أو كود المدرسة لمتابعة النتائج والجدول'
              : 'أدخل كود الإدارة العامة للمشرف والمدير'}
          </p>
        </div>
      </div>

      {/* Main Form */}
      <div className="my-auto space-y-4 py-4">
        {role === 'teacher' && (
          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-slate-300 pr-1">اسم الأستاذ / المعلم:</label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="مثال: أ. أحمد علي"
              className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        <div className="space-y-1.5 text-right">
          <label className="text-xs font-bold text-slate-300 pr-1">رمز التحقق والربط (كود المدرسة):</label>
          <div className="relative">
            <input
              type="text"
              value={pairingCode}
              onChange={(e) => setPairingCode(e.target.value)}
              placeholder="مثال: 112233 أو رمز المدرسة"
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-base font-black tracking-widest text-center focus:outline-none focus:border-indigo-500"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <KeyRound className="w-5 h-5" />
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <p>{errorMsg}</p>
          </div>
        )}

        <div className="pt-2 space-y-3">
          <button
            onClick={() => handlePairing(pairingCode)}
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>تحقق واتصال الآن ✓</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <QrCode className="w-4 h-4 text-indigo-400" />
            <span>مسح باركود المدرسة عبر الكاميرا (QR) 📷</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-6 text-center text-slate-500 text-[10.5px]">
        يتم عزل وحماية البيانات سحابياً برمز مشفر خاص بكل مدرسة
      </div>

      {/* Camera QR Scanner Modal */}
      <QrScannerModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        onScanSuccess={handleQrScanned}
      />
    </div>
  );
};
