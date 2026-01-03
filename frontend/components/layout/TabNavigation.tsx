'use client';

import { Sparkles, Pencil, User, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export type Tab = 'library' | 'design' | 'account';

interface TabNavigationProps {
  activeTab: Tab;
  isDrawerOpen: boolean;
  onTabChange: (tab: Tab) => void;
  onToggleDrawer: (open: boolean) => void;
}

export function TabNavigation({ 
  activeTab, 
  isDrawerOpen, 
  onTabChange, 
  onToggleDrawer 
}: TabNavigationProps) {
  
  const handleTabClick = (id: Tab) => {
    if (activeTab === id && isDrawerOpen) {
      onToggleDrawer(false);
    } else {
      onTabChange(id);
      onToggleDrawer(true);
    }
  };

  const TabButton = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => (
    <button
      onClick={() => handleTabClick(id)}
      className={cn(
        "flex-1 md:w-full flex flex-col items-center justify-center py-2.5 md:py-5 px-3 space-y-1.5 transition-colors relative",
        activeTab === id && isDrawerOpen
          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
          : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
      title={label}
    >
      <Icon className="w-5 h-5 md:w-6 md:h-6" />
      <span className="text-[11px] font-medium hidden md:block">{label}</span>
      {activeTab === id && isDrawerOpen && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-400 hidden md:block" />
          <div className="absolute left-0 right-0 top-0 h-1 bg-blue-600 dark:bg-blue-400 md:hidden" />
        </>
      )}
    </button>
  );

  const AILink = () => (
    <Link
      href="/ai"
      className="flex-1 md:w-full flex flex-col items-center justify-center py-2.5 md:py-5 px-3 space-y-1.5 transition-colors relative text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
      title="AI Map Generator"
    >
      <Wand2 className="w-5 h-5 md:w-6 md:h-6" />
      <span className="text-[11px] font-medium hidden md:block">AI</span>
    </Link>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 md:relative md:h-full md:w-20 bg-white dark:bg-gray-800 border-t md:border-t-0 md:border-r border-gray-200 dark:border-gray-700 flex md:flex-col items-center z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:shadow-sm pb-safe md:pb-0">
      <div className="hidden md:flex h-16 items-center justify-center w-full border-b border-gray-100 dark:border-gray-700 mb-2">
        <Link href="/" className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg" />
      </div>

      {/* AI Link - Desktop only, positioned prominently */}
      <div className="hidden md:block md:w-full md:mb-2 md:border-b md:border-gray-200 dark:md:border-gray-700 md:pb-2">
        <AILink />
      </div>

      <div className="flex md:flex-col flex-1 md:flex-none md:w-full md:space-y-1">
        <TabButton id="library" icon={Sparkles} label="Library" />
        <TabButton id="design" icon={Pencil} label="Design" />
        {/* AI Link on mobile - in bottom nav */}
        <div className="md:hidden flex-1">
          <AILink />
        </div>
        {/* Account tab on mobile - shows in bottom nav with others */}
        <div className="md:hidden flex-1">
          <TabButton id="account" icon={User} label="Account" />
        </div>
      </div>

      {/* Account tab on desktop - shows at bottom of sidenav */}
      <div className="hidden md:flex md:flex-col md:w-full md:space-y-1 md:mt-auto md:mb-2 md:border-t md:border-gray-200 dark:md:border-gray-700 md:pt-2">
        <TabButton id="account" icon={User} label="Account" />
      </div>
    </nav>
  );
}

