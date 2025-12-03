import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  CheckCircle,
  Circle,
  FileText,
  Target,
  TrendingUp,
  ArrowRight,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useHabitsStore } from '../../stores/habitsStore';
import { Card, CardTitle, Button, Badge, PriorityBadge } from '../UI';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { tasks, fetchTasks } = useTasksStore();
  const { habits, fetchHabits } = useHabitsStore();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([fetchTasks(), fetchHabits()]);
      const overviewData = await api.getOverview();
      setOverview(overviewData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const pendingTasks = tasks.filter((t) => t.status !== 'completed').slice(0, 5);
  const completedHabitsToday = habits.filter((h) => h.today_count >= h.target);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-moon-100">
          {greeting()}, {user?.username || 'there'}!
        </h1>
        <p className="text-moon-400 mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-900/50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-moon-100">
              {overview?.tasks?.pending || 0}
            </p>
            <p className="text-sm text-moon-400">Pending Tasks</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-900/50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-moon-100">
              {overview?.tasks?.due_today || 0}
            </p>
            <p className="text-sm text-moon-400">Due Today</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-900/50 flex items-center justify-center">
            <Target className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-moon-100">
              {completedHabitsToday.length}/{habits.length}
            </p>
            <p className="text-sm text-moon-400">Habits Done</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-900/50 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-moon-100">
              {overview?.habits?.streak || 0}
            </p>
            <p className="text-sm text-moon-400">Day Streak</p>
          </div>
        </Card>
      </div>

      {/* Overdue Warning */}
      {overview?.tasks?.overdue > 0 && (
        <Card className="border-red-900/50 bg-red-900/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-900/50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-moon-100">
                You have {overview.tasks.overdue} overdue{' '}
                {overview.tasks.overdue === 1 ? 'task' : 'tasks'}
              </p>
              <p className="text-sm text-moon-400">
                Review and update your tasks to stay on track
              </p>
            </div>
            <Link to="/tasks">
              <Button size="sm" variant="danger">
                View Tasks
              </Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Upcoming Tasks</CardTitle>
            <Link to="/tasks">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 text-moon-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>All caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-moon-900/50 hover:bg-moon-900 transition-colors"
                >
                  <Circle className="w-5 h-5 text-moon-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-moon-200 truncate">{task.title}</p>
                    {task.due_date && (
                      <p className="text-xs text-moon-500">
                        Due {format(new Date(task.due_date), 'MMM d')}
                      </p>
                    )}
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Today's Habits */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Today's Habits</CardTitle>
            <Link to="/habits">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-8 text-moon-500">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No habits yet</p>
              <Link to="/habits" className="mt-2 inline-block">
                <Button size="sm">Create Habit</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.slice(0, 5).map((habit) => {
                const isComplete = habit.today_count >= habit.target;
                const progress = (habit.today_count / habit.target) * 100;

                return (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-moon-900/50"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                        isComplete ? 'bg-green-600' : ''
                      }`}
                      style={{
                        backgroundColor: isComplete ? undefined : habit.color + '30',
                      }}
                    >
                      {isComplete ? '✓' : habit.icon === 'star' ? '⭐' : '🎯'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-moon-200 truncate">{habit.name}</p>
                      <div className="h-1.5 bg-moon-700 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isComplete ? 'bg-green-500' : 'bg-primary-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-moon-400">
                      {habit.today_count}/{habit.target}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-moon-100">
            {overview?.tasks?.completed || 0}
          </p>
          <p className="text-sm text-moon-400 mt-1">Tasks Completed</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-moon-100">
            {overview?.tasks?.completion_rate || 0}%
          </p>
          <p className="text-sm text-moon-400 mt-1">Completion Rate</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-moon-100">
            {overview?.notes?.count || 0}
          </p>
          <p className="text-sm text-moon-400 mt-1">Notes</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-moon-100">
            {overview?.habits?.total || 0}
          </p>
          <p className="text-sm text-moon-400 mt-1">Active Habits</p>
        </Card>
      </div>
    </div>
  );
}
