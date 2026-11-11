import React, { useState, useEffect } from 'react';
import { AppRole, ClassPackage, SchoolConfig } from './types';
import { StorageService } from './services/storage';
import { SplashScreen } from './screens/SplashScreen';
import { RoleSelectionScreen } from './screens/RoleSelectionScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { GradeRegisterScreen } from './screens/GradeRegisterScreen';
import { ScheduleScreen } from './screens/ScheduleScreen';
import { AttendanceScreen } from './screens/AttendanceScreen';
import { SmartBellScreen } from './screens/SmartBellScreen';
import { StudentPortalScreen } from './screens/StudentPortalScreen';
import { PrincipalPortalScreen } from './screens/PrincipalPortalScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar, TabType } from './components/BottomNavBar';

export default function App() {
  const [config, setConfig] = useState<SchoolConfig>(() => StorageService.getConfig());
  const [appState, setAppState] = useState<'splash' | 'role_select' | 'onboarding' | 'main'>('splash');
  const [selectedRole, setSelectedRole] = useState<AppRole>(config.role || 'teacher');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [openedPackage, setOpenedPackage] = useState<ClassPackage | null>(null);

  const refreshConfig = () => {
    setConfig(StorageService.getConfig());
  };

  const handleSplashFinish = () => {
    const currentConfig = StorageService.getConfig();
    if (currentConfig.isActivated) {
      setSelectedRole(currentConfig.role);
      setAppState('main');
    } else {
      setAppState('role_select');
    }
  };

  const handleSelectRole = (role: AppRole) => {
    setSelectedRole(role);
    setAppState('onboarding');
  };

  const handleOnboardingComplete = () => {
    refreshConfig();
    setAppState('main');
  };

  const handleSwitchRole = () => {
    const nextConfig = { ...config, isActivated: false };
    StorageService.saveConfig(nextConfig);
    setConfig(nextConfig);
    setOpenedPackage(null);
    setAppState('role_select');
  };

  // Splash State
  if (appState === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Role Selection State
  if (appState === 'role_select') {
    return <RoleSelectionScreen onSelectRole={handleSelectRole} />;
  }

  // Onboarding / Pairing State
  if (appState === 'onboarding') {
    return (
      <OnboardingScreen
        role={selectedRole}
        onComplete={handleOnboardingComplete}
        onBack={() => setAppState('role_select')}
      />
    );
  }

  // If a specific register is opened (Full-screen Grade Register)
  if (openedPackage) {
    return (
      <GradeRegisterScreen
        pkg={openedPackage}
        onBack={() => setOpenedPackage(null)}
      />
    );
  }

  // Dedicated Student / Parent Portal
  if (selectedRole === 'student') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <TopAppBar
          title="بوابة الطالب وأولياء الأمور"
          subtitle={config.schoolName}
          config={config}
          onOpenSettings={() => setActiveTab('settings')}
        />
        <StudentPortalScreen onBack={handleSwitchRole} />
      </div>
    );
  }

  // Dedicated Principal / Supervisor Portal
  if (selectedRole === 'principal') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <TopAppBar
          title="بوابة الإدارة والمشرف"
          subtitle={config.schoolName}
          config={config}
          onOpenSettings={() => setActiveTab('settings')}
        />
        <PrincipalPortalScreen onBack={handleSwitchRole} />
      </div>
    );
  }

  // Teacher Main Flow with Navigation
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <TopAppBar
        title="سجل الدرجات والإدارة"
        subtitle={config.schoolName}
        config={config}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main Tab Screen Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {activeTab === 'dashboard' && (
          <DashboardScreen
            config={config}
            onOpenRegister={(pkg) => setOpenedPackage(pkg)}
            onOpenSettings={() => setActiveTab('settings')}
          />
        )}
        {activeTab === 'schedule' && <ScheduleScreen />}
        {activeTab === 'attendance' && <AttendanceScreen />}
        {activeTab === 'bell' && <SmartBellScreen />}
        {activeTab === 'settings' && (
          <SettingsScreen
            onSwitchRole={handleSwitchRole}
            onBack={() => setActiveTab('dashboard')}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        role={selectedRole}
      />
    </div>
  );
}
