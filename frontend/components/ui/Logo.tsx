'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className }: LogoProps) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizes[size], className)}
    >
      {/* Background */}
      <rect width="32" height="32" rx="8" className="fill-gray-900 dark:fill-white" />

      {/* Contour lines forming stylized 'C' */}
      <path
        d="M22 8C22 8 12 8 10 16C8 24 18 24 22 24"
        className="stroke-white/30 dark:stroke-gray-900/30"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M21 10C21 10 13 10 11 16C9 22 17 22 21 22"
        className="stroke-white/50 dark:stroke-gray-900/50"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 12C20 12 14 12 12 16C10 20 16 20 20 20"
        className="stroke-white/70 dark:stroke-gray-900/70"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M19 14C19 14 15 14 14 16C13 18 15 18 19 18"
        className="stroke-white dark:stroke-gray-900"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Marker dot */}
      <circle cx="23" cy="11" r="2.5" fill="#ff2d95" />
      <circle cx="23" cy="11" r="1" fill="white" opacity="0.8" />
    </svg>
  );
}

export function LogoWithText({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Logo size="md" />
      <span className="font-semibold text-sm text-gray-900 dark:text-white">Cartistry</span>
    </div>
  );
}
