import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200': variant === 'default',
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200': variant === 'secondary',
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': variant === 'success',
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': variant === 'warning',
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': variant === 'danger',
          'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}