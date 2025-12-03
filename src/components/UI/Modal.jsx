import { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          className={clsx(
            'relative w-full rounded-xl bg-moon-800 shadow-2xl animate-fade-in',
            sizes[size]
          )}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-moon-700">
            <h2 className="text-lg font-semibold text-moon-100">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-moon-400 hover:text-moon-200 hover:bg-moon-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
