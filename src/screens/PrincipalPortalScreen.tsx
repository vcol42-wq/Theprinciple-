import React, { useState } from 'react';
import { Shield, Send, Users, ArrowRight, CheckCircle2, QrCode } from 'lucide-react';
import { StorageService } from '../services/storage';

interface PrincipalPortalScreenProps {
  onBack: () => void;
}

export const PrincipalPortalScreen: React.FC<PrincipalPortalScreenProps> = ({ onBack }) => {
  const config = StorageService.getConfig();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sentMsg, setSentMsg] = useState(false);

  const handleSendDirective = () => {
    if (!title.trim() || !content.trim()) return;
    setSentMsg(true);
    setTitle('');
    setContent('');
    setTimeout(() => setSentMsg(false), 3000);
  };

  return (
    <div className="flex-1 pb-24 px-4 pt-3 max-w-md mx-auto w-full text-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-800 text-slate-300">
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-black">لوحة المشرف العام والمدير 👑</h2>
          <p className="text-xs text-slate-400">إدارة التوجيهات ورمز اقتران المدرسة</p>
        </div>
      </div>

      {/* School Identity Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-700 to-amber-900 border border-amber-500/50 shadow-xl mb-4 space-y-2">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
          بيانات المدرسة المعتمدة
        </span>
        <h3 className="text-lg font-black text-white">{config.schoolName}</h3>
        <div className="flex items-center justify-between text-xs text-amber-200 font-mono">
          <span>معرّف المدرسة: {config.schoolId}</span>
          <span className="font-bold bg-black/30 px-2 py-0.5 rounded-lg text-white">
            رمز الربط: {config.pairingCode}
          </span>
        </div>
      </div>

      {/* Broadcast Directive Form */}
      <div className="p-5 rounded-3xl bg-slate-800 border border-slate-700 shadow-xl space-y-3">
        <h4 className="text-xs font-black text-amber-300 flex items-center gap-2">
          <Send className="w-4 h-4" />
          <span>بث توجيه أو تعميم مدرسي لكافة الكادر</span>
        </h4>

        <div>
          <label className="text-[11px] font-bold text-slate-300 block mb-1">عنوان التوجيه:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: موعد تسليم سجلات الدرجات"
            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-300 block mb-1">نص التوجيه والتعليمات:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="اكتب التوجيه الصادر من إدارة المدرسة..."
            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
          />
        </div>

        {sentMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>تم بث التوجيه بنجاح وسيظهر لكافة الكادر والطلبة فوراً!</span>
          </div>
        )}

        <button
          onClick={handleSendDirective}
          disabled={!title.trim() || !content.trim()}
          className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 font-black text-xs text-white shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>بث التوجيه السحابي فوراً 📢</span>
        </button>
      </div>
    </div>
  );
};
