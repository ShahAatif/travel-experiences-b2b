import { cn } from '@/lib/utils';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function Alert({ className, variant = 'default', children, ...props }: AlertProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center rounded-md border px-4 py-3 text-sm',
        {
          'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300':
            variant === 'default',
          'border-green-500 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300':
            variant === 'success',
          'border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300':
            variant === 'warning',
          'border-red-500 bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300':
            variant === 'error',
        },
        className
      )}
      {...props}
    >
      <svg className="flex-shrink-0 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d={variant === 'success' ? 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2z' : variant === 'warning' ? 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.529 0-2.492-1.646-1.742-2.98l5.58-9.92z' : variant === 'error' ? 'M10 11a2 2 0 100-4 2 2 0 000 4z' : ''} clipRule="evenodd"
        />
      </svg>
      <div className="ml-3 w-0 flex-1">{children}</div>
    </div>
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('font-medium text-sm leading-none', className)} {...props} />
  );
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm leading-none', className)} {...props} />
  );
}