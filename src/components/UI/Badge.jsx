import { clsx } from 'clsx';

const variants = {
  default: 'bg-moon-700 text-moon-200',
  primary: 'bg-primary-900/50 text-primary-300 border border-primary-700',
  success: 'bg-green-900/50 text-green-300 border border-green-700',
  warning: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
  danger: 'bg-red-900/50 text-red-300 border border-red-700',
  purple: 'bg-purple-900/50 text-purple-300 border border-purple-700',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function Badge({ children, variant = 'default', size = 'md', className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const config = {
    low: { variant: 'default', label: 'Low' },
    medium: { variant: 'primary', label: 'Medium' },
    high: { variant: 'warning', label: 'High' },
    urgent: { variant: 'danger', label: 'Urgent' },
  };

  const { variant, label } = config[priority] || config.medium;

  return <Badge variant={variant}>{label}</Badge>;
}

export function StatusBadge({ status }) {
  const config = {
    pending: { variant: 'default', label: 'Pending' },
    in_progress: { variant: 'primary', label: 'In Progress' },
    completed: { variant: 'success', label: 'Completed' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
  };

  const { variant, label } = config[status] || config.pending;

  return <Badge variant={variant}>{label}</Badge>;
}
