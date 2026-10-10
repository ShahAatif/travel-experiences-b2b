'use client';

export function LoadingSpinner({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]} ${className}`}
    />
  );
}

export function PageLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mb-2 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mt-4 h-10 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-4 flex-1 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      ))}
    </div>
  );
}
