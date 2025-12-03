import { useEffect, useState } from 'react';
import { Plus, Target, Flame } from 'lucide-react';
import { useHabitsStore } from '../../stores/habitsStore';
import { Button, Card, CardTitle } from '../UI';
import { HabitCard } from './HabitCard';
import { HabitForm } from './HabitForm';

export function HabitsPage() {
  const { habits, isLoading, fetchHabits } = useHabitsStore();
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingHabit(null);
  };

  const completedToday = habits.filter((h) => h.today_count >= h.target).length;
  const totalHabits = habits.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-moon-100">Habits</h1>
          <p className="text-moon-400 mt-1">
            {completedToday} of {totalHabits} completed today
          </p>
        </div>
        <Button icon={Plus} onClick={() => setShowForm(true)}>
          New Habit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-900/50 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-moon-100">{totalHabits}</p>
            <p className="text-sm text-moon-400">Total Habits</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-900/50 flex items-center justify-center">
            <Flame className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-moon-100">{completedToday}</p>
            <p className="text-sm text-moon-400">Completed Today</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-900/50 flex items-center justify-center text-2xl">
            🎯
          </div>
          <div>
            <p className="text-2xl font-bold text-moon-100">
              {totalHabits > 0
                ? Math.round((completedToday / totalHabits) * 100)
                : 0}%
            </p>
            <p className="text-sm text-moon-400">Today's Progress</p>
          </div>
        </Card>
      </div>

      {/* Habits List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : habits.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-moon-500 mb-4">
            <Target className="w-16 h-16 mx-auto opacity-50" />
          </div>
          <h3 className="text-lg font-medium text-moon-300 mb-2">
            No habits yet
          </h3>
          <p className="text-moon-500 mb-4">
            Start building better habits today
          </p>
          <Button onClick={() => setShowForm(true)} icon={Plus}>
            Create Habit
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <HabitForm
        isOpen={showForm}
        onClose={handleCloseForm}
        habit={editingHabit}
      />
    </div>
  );
}
