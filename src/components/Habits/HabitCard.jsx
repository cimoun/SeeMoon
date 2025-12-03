import { useState } from 'react';
import { Check, Trash2, Edit2, Flame } from 'lucide-react';
import { clsx } from 'clsx';
import { useHabitsStore } from '../../stores/habitsStore';

const iconMap = {
  star: '⭐',
  heart: '❤️',
  fire: '🔥',
  book: '📚',
  run: '🏃',
  water: '💧',
  sleep: '😴',
  gym: '💪',
  meditate: '🧘',
  code: '💻',
};

export function HabitCard({ habit, onEdit }) {
  const { logHabit, deleteHabit } = useHabitsStore();
  const [loading, setLoading] = useState(false);

  const progress = habit.target > 0 ? (habit.today_count / habit.target) * 100 : 0;
  const isComplete = habit.today_count >= habit.target;

  const handleLog = async () => {
    setLoading(true);
    await logHabit(habit.id);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this habit?')) {
      await deleteHabit(habit.id);
    }
  };

  return (
    <div
      className={clsx(
        'group relative p-5 rounded-xl border transition-all',
        isComplete
          ? 'bg-green-900/20 border-green-700'
          : 'bg-moon-800 border-moon-700 hover:border-moon-600'
      )}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={handleLog}
          disabled={loading}
          className={clsx(
            'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all',
            isComplete
              ? 'bg-green-600 shadow-lg shadow-green-600/25'
              : 'bg-moon-700 hover:bg-moon-600'
          )}
          style={{
            backgroundColor: isComplete ? undefined : habit.color + '30',
          }}
        >
          {isComplete ? <Check className="w-6 h-6 text-white" /> : iconMap[habit.icon] || '⭐'}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-moon-100">{habit.name}</h3>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(habit)}
                className="p-1.5 rounded-lg text-moon-400 hover:text-moon-200 hover:bg-moon-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg text-moon-400 hover:text-red-400 hover:bg-moon-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {habit.description && (
            <p className="text-sm text-moon-400 mt-1">{habit.description}</p>
          )}

          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-moon-400">
                {habit.today_count} / {habit.target} {habit.frequency}
              </span>
              <span
                className={clsx(
                  'font-medium',
                  isComplete ? 'text-green-400' : 'text-moon-300'
                )}
              >
                {Math.min(Math.round(progress), 100)}%
              </span>
            </div>
            <div className="h-2 bg-moon-700 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-500',
                  isComplete ? 'bg-green-500' : 'bg-primary-500'
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
