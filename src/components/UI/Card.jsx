import { clsx } from 'clsx';

export function Card({ children, className, padding = true, hover = false, ...props }) {
  return (
    <div
      className={clsx(
        'bg-moon-800 rounded-xl border border-moon-700',
        padding && 'p-6',
        hover && 'hover:border-moon-600 transition-colors cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={clsx('text-lg font-semibold text-moon-100', className)}>
      {children}
    </h3>
  );
}
