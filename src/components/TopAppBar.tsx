import React from 'react';
import { Cloud, Wifi, ArrowRight, Settings, Bell, Shield, User } from 'lucide-react';
import { SchoolConfig } from '../types';

interface TopAppBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  config: SchoolConfig;
  onOpenSettings?: () => void;
  actions?: React.ReactNode;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  subtitle,
  showBack,
  onBack,
  config,
  onOpenSettings,
  actions
}) => {
  return (
    <header className="sticky top-0 z-40 bg-indigo-950/95 backdrop-blur-md text-white border-b border-indigo-800/40 shadow-md px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
              title="رجوع"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md flex items-center justify-center">
              <span className="text-lg">🏫</span>
            </div>
          )}

          <div className="flex flex-col">
            <h1 className="text-base font-black tracking-tight leading-tight flex items-center gap-1.5 text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] font-medium text-amber-200/90 truncate max-w-[200px]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actions}

          {/* Cloud Status Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10.5px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>سحابي</span>
          </div>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-indigo-100"
              title="الإعدادات"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
