import { useEffect, useState } from 'react';
import { Plus, Search, Filter, X } from 'lucide-react';
import { useTasksStore } from '../../stores/tasksStore';
import { Button, Input, Select, Card } from '../UI';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const priorityOptions = [
  { value: '', label: 'All Priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export function TasksPage() {
  const { tasks, isLoading, filter, fetchTasks, setFilter, clearFilter } =
    useTasksStore();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilter({ search: searchInput });
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const hasFilters = filter.status || filter.priority || filter.search;

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-moon-100">Tasks</h1>
          <p className="text-moon-400 mt-1">
            {pendingTasks.length} pending, {completedTasks.length} completed
          </p>
        </div>
        <Button icon={Plus} onClick={() => setShowForm(true)}>
          New Task
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search tasks..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="flex gap-3">
            <Select
              options={statusOptions}
              value={filter.status || ''}
              onChange={(e) => setFilter({ status: e.target.value || null })}
            />
            <Select
              options={priorityOptions}
              value={filter.priority || ''}
              onChange={(e) => setFilter({ priority: e.target.value || null })}
            />
            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  clearFilter();
                  setSearchInput('');
                }}
                icon={X}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : tasks.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-moon-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-moon-300 mb-2">
            {hasFilters ? 'No tasks found' : 'No tasks yet'}
          </h3>
          <p className="text-moon-500 mb-4">
            {hasFilters
              ? 'Try adjusting your filters'
              : 'Create your first task to get started'}
          </p>
          {!hasFilters && (
            <Button onClick={() => setShowForm(true)} icon={Plus}>
              Create Task
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingTasks.length > 0 && (
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <TaskItem key={task.id} task={task} onEdit={handleEdit} />
              ))}
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-moon-500 mb-3 px-1">
                Completed ({completedTasks.length})
              </h3>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onEdit={handleEdit} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <TaskForm
        isOpen={showForm}
        onClose={handleCloseForm}
        task={editingTask}
      />
    </div>
  );
}
