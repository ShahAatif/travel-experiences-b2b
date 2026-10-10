'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

interface TooltipProviderProps {
  children: ReactNode;
  delay?: number;
}

interface TooltipProps {
  children: ReactNode;
}

interface TooltipTriggerProps {
  children: ReactNode;
}

interface TooltipContentProps {
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function TooltipProvider({ children, delay = 500 }: TooltipProviderProps) {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const openTooltip = (el: HTMLElement) => {
    setAnchorEl(el);
    setTimeout(() => setOpen(true), delay);
  };

  const closeTooltip = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  return (
    <TooltipContext.Provider value={{ open, anchorEl, openTooltip, closeTooltip }}>
      {children}
    </TooltipContext.Provider>
  );
}

const TooltipContext = createContext<{
  open: boolean;
  anchorEl: HTMLElement | null;
  openTooltip: (el: HTMLElement) => void;
  closeTooltip: () => void;
}>({
  open: false,
  anchorEl: null,
  openTooltip: () => {},
  closeTooltip: () => {},
});

export const Tooltip = ({ children }: TooltipProps) => {
  const context = useContext(TooltipContext);
  if (!context) throw new Error('Tooltip must be used within TooltipProvider');

  const child = React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>;

  return React.cloneElement(child, {
    onMouseEnter: (e: MouseEvent<HTMLElement>) => context.openTooltip(e.currentTarget as HTMLElement),
    onMouseLeave: () => context.closeTooltip(),
    onFocus: (e: FocusEvent<HTMLElement>) => context.openTooltip(e.currentTarget as HTMLElement),
    onBlur: () => context.closeTooltip(),
  });
};

export function TooltipTrigger({ children }: TooltipTriggerProps) {
  return <span className="relative inline-block">{children}</span>;
}

export function TooltipContent({
  children,
  side = 'top',
  align = 'center',
  className,
}: TooltipContentProps) {
  const context = React.useContext(TooltipContext);
  if (!context) return null;
  if (!context.open || !context.anchorEl) return null;

  const rect = context.anchorEl.getBoundingClientRect();
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 50,
  };

  if (side === 'top') {
    tooltipStyle.bottom = `calc(100% + ${window.innerHeight - rect.top}px)`;
    tooltipStyle[align === 'start' ? 'left' : align === 'end' ? 'right' : 'left'] =
      rect.left +
      (align === 'start'
        ? 0
        : align === 'end'
        ? rect.width
        : rect.width / 2) +
      'px';
    tooltipStyle.transform = 'translateX(-50%)';
  }

  return (
    <div
      className={cn(
        'z-50 max-w-xs rounded-md border bg-popover p-2 text-sm text-popover-foreground shadow-lg blur-md',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:data-[state=open]:animate-in-from data-[side=bottom]:data-[state=closed]:animate-out-to data-[side=left]:data-[state=open]:animate-in-from data-[side=left]:data-[state=closed]:animate-out-to data-[side=right]:data-[state=open]:animate-in-from data-[side=right]:data-[state=closed]:animate-out-to',
        className
      )}
      style={tooltipStyle}
      role="tooltip"
    >
      <div className="w-0 h-0 flip-${side} flip-${align}" aria-hidden="true">
        <div className="reverse-arrow" />
      </div>
      {children}
    </div>
  );
}