import React, { useState } from 'react';
import {
  BarChart3,
  Droplets,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  X,
} from 'lucide-react';
import { ActiveView, UserRole } from '../types';
import { PureFlowLogo } from './PureFlowLogo';

interface DashboardLayoutProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  username: string;
  role: UserRole;
  onRoleSwitch: (role: UserRole) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: ActiveView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'record-sale', label: 'Record Sale', icon: Plus },
  { id: 'container-monitor', label: 'Container Monitor', icon: Package },
  { id: 'water-bill', label: 'Water & COWD Bill', icon: Droplets },
  { id: 'sales-reports', label: 'Daily Sales Reports', icon: FileSpreadsheet },
];

const VIEW_TITLES: Record<ActiveView, { section: string; title: string }> = {
  overview: { section: 'PureFlow 360', title: 'Station Overview' },
  'record-sale': { section: 'Point of Sale', title: 'Record Daily Sale' },
  'container-monitor': { section: 'Operations', title: '20L Container Monitor' },
  'water-bill': { section: 'Utilities & Rates', title: 'Water Consumption & COWD Bill' },
  'sales-reports': { section: 'Reports', title: 'Daily Sales Reports' },
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeView,
  onNavigate,
  username,
  role,
  onRoleSwitch,
  onLogout,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: ActiveView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const currentHeading = VIEW_TITLES[activeView];

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#D6E6F8]">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-[#E5EFFB] flex items-center gap-3">
        <PureFlowLogo size={46} className="shrink-0" />
        <div className="min-w-0">
          <p className="font-display font-bold text-[17px] leading-tight text-[#0F2942] truncate">
            PureFlow 360
          </p>
          <p className="text-[11px] font-medium text-[#52779E] truncate">
            Water Refilling Station
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Primary Navigation" className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#E7F3FF] text-[#0E5AA7] font-semibold'
                  : 'text-[#3A5978] hover:bg-[#F3F8FF] hover:text-[#0F2942]'
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] shrink-0 ${
                  isActive ? 'text-[#0BA8C7]' : 'text-[#6A8CAE]'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Account & Role Section */}
      <div className="p-4 border-t border-[#E5EFFB] space-y-3 bg-[#F9FCFF]">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#0F2942] truncate">{username}</p>
            <p className="text-[12px] text-[#5B7FA4]">{role} Account</p>
          </div>
          <div className="flex items-center bg-[#EAF3FE] rounded-lg p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => onRoleSwitch(UserRole.OWNER)}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                role === UserRole.OWNER
                  ? 'bg-white text-[#0F2942] shadow-xs'
                  : 'text-[#5B7FA4] hover:text-[#0F2942]'
              }`}
            >
              Owner
            </button>
            <button
              type="button"
              onClick={() => onRoleSwitch(UserRole.CASHIER)}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                role === UserRole.CASHIER
                  ? 'bg-white text-[#0F2942] shadow-xs'
                  : 'text-[#5B7FA4] hover:text-[#0F2942]'
              }`}
            >
              Cashier
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[#D4E6FA] bg-white hover:bg-[#F1F7FF] text-[#335577] text-[13px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
        >
          <LogOut className="w-4 h-4 text-[#5B7FA4]" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pureflow-app-bg flex text-[#0F2942]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen no-print">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <div
            className="fixed inset-0 bg-[#0F2942]/35 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-64 max-w-[80vw] h-full shadow-xl">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation"
              className="absolute top-4 right-3 p-1.5 rounded-lg text-[#52779E] hover:bg-[#EDF5FF]"
            >
              <X className="w-5 h-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar Contract: Breadcrumb/Title on left, 1 primary CTA on right */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#D6E6F8] px-4 sm:px-8 h-16 flex items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-xl text-[#3A5978] hover:bg-[#EDF5FF] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="hidden sm:inline text-[#6A8CAE] font-medium whitespace-nowrap">
                {currentHeading.section}
              </span>
              <span className="hidden sm:inline text-[#B3CBE4]" aria-hidden="true">
                /
              </span>
              <h1 className="font-display font-bold text-[18px] sm:text-[20px] text-[#0F2942] truncate">
                {currentHeading.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeView !== 'record-sale' ? (
              <button
                type="button"
                onClick={() => onNavigate('record-sale')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#14CFF0] hover:bg-[#0EC0E0] text-white font-display font-bold text-[13px] tracking-wide shadow-[0_4px_14px_-2px_rgba(20,207,240,0.45)] transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Record Sale</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('sales-reports')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#62A1EB] hover:bg-[#4F92E3] text-white font-display font-semibold text-[13px] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Reports</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-[1320px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
