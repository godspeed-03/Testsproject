'use client';

import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface ActionTooltipProps {
  label: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export default function ActionTooltip({
  label,
  children,
  side = 'top',
  align = 'center',
}: ActionTooltipProps) {
  const [open, setOpen] = React.useState(false);
  if (!label) return <>{children}</>;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild onClick={() => setOpen((prev) => !prev)}>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="max-w-xs text-xs font-bold text-slate-100 bg-slate-900/95 border border-slate-700/80 shadow-xl backdrop-blur-md px-3 py-1.5 rounded-xl z-50 pointer-events-none"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
