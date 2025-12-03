import { clsx } from 'clsx';
import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  { label, error, className, icon: Icon, ...props },
  ref
) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-moon-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-moon-500" />
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'block w-full rounded-lg border bg-moon-800 text-moon-100 placeholder-moon-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-colors',
            Icon ? 'pl-10' : 'pl-4',
            'pr-4 py-2.5',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-moon-700 hover:border-moon-600',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
});

export const TextArea = forwardRef(function TextArea(
  { label, error, className, ...props },
  ref
) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-moon-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={clsx(
          'block w-full rounded-lg border bg-moon-800 text-moon-100 placeholder-moon-500',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-colors px-4 py-2.5 min-h-[100px] resize-y',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-moon-700 hover:border-moon-600',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
});
