import React from 'react';
import { BookOpen, Calendar, CheckSquare, Bell, UserCheck, Shield } from 'lucide-react';
import { AppRole } from '../types';

export type TabType = 'dashboard' | 'schedule' | 'attendance' | 'bell' | 'settings';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  role: AppRole;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange, role }) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'السجلات', icon: BookOpen },
    { id: 'schedule' as TabType, label: 'الجدول', icon: Calendar },
    { id: 'attendance' as TabType, label: 'الغيابات', icon: CheckSquare },
    { id: 'bell' as TabType, label: 'الجرس', icon: Bell },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-black scale-105'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-indigo-100 dark:bg-indigo-950/60 shadow-sm' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
