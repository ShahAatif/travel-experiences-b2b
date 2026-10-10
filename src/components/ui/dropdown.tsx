'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DropdownProps {
  children: ReactNode;
}

interface DropdownTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

interface DropdownMenuProps extends React.HTMLAttributes<HTMLUListElement> {
  align?: 'start' | 'end';
  className?: string;
}

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  disabled?: boolean;
  onSelect?: () => void;
}

interface DropdownSeparatorProps extends React.HTMLAttributes<HTMLHRElement> {}

export const Dropdown = ({ children }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {children}
        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <ul
        ref={menuRef}
        className={cn(
          'absolute z-20 mt-1 w-full max-w-xs origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus-visible:outline-none dark:bg-gray-800',
          open && 'animate-in fade-in zoom-in-95 duration-200',
          !open && 'animate-out fade-out zoom-95 duration-150'
        )}
        role="listbox"
        aria-labelledby="dropdown-button"
        tabIndex={-1}
      >
        <slot />
      </ul>
    </div>
  );
};

export const DropdownTrigger = ({ children, ...props }: DropdownTriggerProps) => (
  <button className={cn('', props.className)} {...props}>
    {children}
  </button>
);

export const DropdownMenu = ({ align = 'start', className, ...props }: DropdownMenuProps) => (
  <ul
    className={cn(
      'w-48',
      align === 'start' ? 'left-0' : 'right-0',
      className
    )}
    {...props}
  />
);

export const DropdownItem = ({
  children,
  disabled = false,
  onSelect,
  className,
  ...props
}: DropdownItemProps) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onSelect?.();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'flex cursor-pointer select-none items-center w-full rounded-md px-2 py-1.5 text-sm',
        disabled ? 'opacity-50' : '',
        'data-[state=hover]:bg-gray-100 data-[state=focus-visible]:bg-gray-200 dark:data-[state=hover]:bg-gray-700 dark:data-[state=focus-visible]:bg-gray-600',
        className
      )}
      role="option"
      {...props}
    >
      {children}
    </button>
  );
};

export const DropdownSeparator = ({ className, ...props }: DropdownSeparatorProps) => (
  <hr className={cn('-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-600', className)} {...props} />
);