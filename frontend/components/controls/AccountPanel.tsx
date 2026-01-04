'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import {
  LogIn,
  LogOut,
  User as UserIcon,
  Map,
  Share2,
  Compass,
  Upload,
  EyeOff,
  MessageCircle,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { PublishModal } from '@/components/profile/PublishModal';
import { publishMap, unpublishMap } from '@/lib/actions/maps';
import { ControlSection } from '@/components/ui/control-components';

interface AccountPanelProps {
  onShareMap?: () => void;
  currentMapId?: string | null;
  currentMapName?: string | null;
  currentMapStatus?: {
    isSaved: boolean;
    isPublished: boolean;
    hasUnsavedChanges: boolean;
  } | null;
  onPublishSuccess?: () => void;
}

export function AccountPanel({
  onShareMap,
  currentMapId,
  currentMapName,
  currentMapStatus,
  onPublishSuccess
}: AccountPanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: unknown, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleShareMap = async () => {
    if (onShareMap) {
      onShareMap();
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      const button = document.querySelector('[data-share-button]');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText || 'Share';
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handlePublish = async (subtitle?: string) => {
    if (!currentMapId) return;

    try {
      await publishMap(currentMapId, subtitle);
      onPublishSuccess?.();
      setShowPublishModal(false);
    } catch (error: any) {
      console.error('Failed to publish map:', error);
      throw error;
    }
  };

  const handleUnpublish = async () => {
    if (!currentMapId) return;
    if (!confirm('Unpublish this map?')) return;

    try {
      await unpublishMap(currentMapId);
      onPublishSuccess?.();
    } catch (error: any) {
      console.error('Failed to unpublish map:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  const ActionButton = ({
    icon: Icon,
    label,
    onClick,
    primary = false,
    ...props
  }: {
    icon: any;
    label: string;
    onClick: () => void;
    primary?: boolean;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors",
        primary
          ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
      )}
      {...props}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <ControlSection title="Account">
        {user ? (
          <div className="flex items-center gap-2 py-1">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <UserIcon className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
              {user.email}
            </p>
          </div>
        ) : (
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Sign in to save maps
          </p>
        )}
      </ControlSection>

      {currentMapId && currentMapStatus && user && (
        <ControlSection title="Current Map">
          <div className="space-y-2">
            <p className="text-xs text-gray-700 dark:text-gray-300 truncate">{currentMapName}</p>
            <div className="flex items-center gap-1.5">
              {currentMapStatus.isPublished && (
                <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] rounded">
                  Published
                </span>
              )}
              {currentMapStatus.hasUnsavedChanges && (
                <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[9px] rounded">
                  Unsaved
                </span>
              )}
            </div>
            {currentMapStatus.isPublished ? (
              <ActionButton icon={EyeOff} label="Unpublish" onClick={handleUnpublish} />
            ) : (
              <ActionButton icon={Upload} label="Publish" onClick={() => setShowPublishModal(true)} primary />
            )}
          </div>
        </ControlSection>
      )}

      <ControlSection title="Navigation">
        <div className="space-y-0.5">
          {user ? (
            <>
              <ActionButton icon={Map} label="My Maps" onClick={() => router.push('/profile')} primary />
              <ActionButton icon={Compass} label="Browse Feed" onClick={() => router.push('/feed')} />
              <ActionButton icon={MessageCircle} label="Discord" onClick={() => window.open('https://discord.gg/UVKEfcfZVc', '_blank')} />
              <ActionButton icon={Share2} label="Share" onClick={handleShareMap} data-share-button />
              <div className="pt-1.5 mt-1.5 border-t border-gray-100 dark:border-gray-800">
                <ActionButton icon={LogOut} label="Sign Out" onClick={handleSignOut} />
              </div>
            </>
          ) : (
            <>
              <ActionButton icon={LogIn} label="Sign In" onClick={() => router.push('/login')} primary />
              <ActionButton icon={Compass} label="Browse Feed" onClick={() => router.push('/feed')} />
              <ActionButton icon={MessageCircle} label="Discord" onClick={() => window.open('https://discord.gg/UVKEfcfZVc', '_blank')} />
              <ActionButton icon={Share2} label="Share" onClick={handleShareMap} data-share-button />
            </>
          )}
        </div>
      </ControlSection>

      <ControlSection title="Appearance">
        <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] transition-colors",
              theme === 'light'
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <Sun className="w-3 h-3" />
            Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] transition-colors",
              theme === 'dark'
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <Moon className="w-3 h-3" />
            Dark
          </button>
          <button
            onClick={() => setTheme('system')}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] transition-colors",
              theme === 'system'
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <Monitor className="w-3 h-3" />
            Auto
          </button>
        </div>
      </ControlSection>

      {showPublishModal && currentMapId && currentMapName && (
        <PublishModal
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
          mapTitle={currentMapName}
          currentSubtitle={undefined}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
}
