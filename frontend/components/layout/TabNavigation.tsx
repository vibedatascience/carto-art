'use client';

import { Grid, Sliders, User, Sparkles, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { useTheme } from '@/hooks/useTheme';

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
  const { resolvedTheme, toggleTheme } = useTheme();

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
        "flex-1 md:w-full flex flex-col items-center justify-center py-3 md:py-4 px-2 transition-all relative",
        activeTab === id && isDrawerOpen
          ? "text-gray-900 dark:text-white"
          : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
      )}
      title={label}
    >
      <Icon className="w-5 h-5" strokeWidth={activeTab === id && isDrawerOpen ? 2 : 1.5} />
      {activeTab === id && isDrawerOpen && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gray-900 dark:bg-white rounded-full hidden md:block" />
      )}
    </button>
  );

  const AILink = () => (
    <Link
      href="/ai"
      className="flex-1 md:w-full flex flex-col items-center justify-center py-3 md:py-4 px-2 transition-all relative text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
      title="AI"
    >
      <Sparkles className="w-5 h-5" strokeWidth={1.5} />
    </Link>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-14 md:relative md:h-full md:w-14 bg-white dark:bg-gray-900 border-t md:border-t-0 md:border-r border-gray-100 dark:border-gray-800 flex md:flex-col items-center z-50 pb-safe md:pb-0">
      <div className="hidden md:flex h-14 items-center justify-center w-full">
        <Link href="/" title="Cartistry">
          <Logo size="md" />
        </Link>
      </div>

      <div className="flex md:flex-col flex-1 md:flex-none md:w-full">
        <AILink />
        <TabButton id="library" icon={Grid} label="Library" />
        <TabButton id="design" icon={Sliders} label="Design" />
        <div className="md:hidden flex-1">
          <TabButton id="account" icon={User} label="Account" />
        </div>
      </div>

      <div className="hidden md:flex md:flex-col md:w-full md:mt-auto md:mb-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex flex-col items-center justify-center py-4 px-2 transition-all text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-5 h-5" strokeWidth={1.5} />
          ) : (
            <Moon className="w-5 h-5" strokeWidth={1.5} />
          )}
        </button>
        <TabButton id="account" icon={User} label="Account" />
      </div>
    </nav>
  );
}

