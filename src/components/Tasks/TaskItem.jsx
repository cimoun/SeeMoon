import { useState } from 'react';
import { format } from 'date-fns';
import { Check, Trash2, Edit2, Calendar, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { useTasksStore } from '../../stores/tasksStore';
import { PriorityBadge, Badge } from '../UI';

export function TaskItem({ task, onEdit }) {
  const { toggleTaskStatus, deleteTask } = useTasksStore();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await toggleTaskStatus(task.id);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
    }
  };

  const isCompleted = task.status === 'completed';
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    !isCompleted;

  return (
    <div
      className={clsx(
        'group flex items-start gap-4 p-4 rounded-xl border transition-all',
        isCompleted
          ? 'bg-moon-800/50 border-moon-700'
          : 'bg-moon-800 border-moon-700 hover:border-moon-600'
      )}
    >
      <button
        onClick={handleToggle}
        disabled={loading}
        className={clsx(
          'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-0.5',
          isCompleted
            ? 'bg-green-500 border-green-500'
            : 'border-moon-500 hover:border-primary-500'
        )}
      >
        {isCompleted && <Check className="w-4 h-4 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h4
              className={clsx(
                'font-medium truncate',
                isCompleted ? 'text-moon-500 line-through' : 'text-moon-100'
              )}
            >
              {task.title}
            </h4>
            {task.description && (
              <p className="text-sm text-moon-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
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

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <PriorityBadge priority={task.priority} />

          {task.due_date && (
            <Badge variant={isOverdue ? 'danger' : 'default'} size="sm">
              <Calendar className="w-3 h-3 mr-1" />
              {format(new Date(task.due_date), 'MMM d')}
            </Badge>
          )}

          {task.tags?.map((tag) => (
            <Badge key={tag} variant="purple" size="sm">
              {tag}
            </Badge>
          ))}

          {isCompleted && task.completed_at && (
            <Badge variant="success" size="sm">
              <Clock className="w-3 h-3 mr-1" />
              Done {format(new Date(task.completed_at), 'MMM d')}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
