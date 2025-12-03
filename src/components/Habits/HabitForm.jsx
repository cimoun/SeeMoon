import { useState, useEffect } from 'react';
import { useHabitsStore } from '../../stores/habitsStore';
import { Button, Input, TextArea, Select, Modal } from '../UI';
import { clsx } from 'clsx';

const iconOptions = [
  { value: 'star', label: '⭐ Star' },
  { value: 'heart', label: '❤️ Heart' },
  { value: 'fire', label: '🔥 Fire' },
  { value: 'book', label: '📚 Book' },
  { value: 'run', label: '🏃 Run' },
  { value: 'water', label: '💧 Water' },
  { value: 'sleep', label: '😴 Sleep' },
  { value: 'gym', label: '💪 Gym' },
  { value: 'meditate', label: '🧘 Meditate' },
  { value: 'code', label: '💻 Code' },
];

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

const colorOptions = [
  '#58a6ff', // blue
  '#7ee787', // green
  '#a371f7', // purple
  '#f85149', // red
  '#d29922', // yellow
  '#79c0ff', // cyan
  '#ff7b72', // coral
  '#ffa657', // orange
];

export function HabitForm({ isOpen, onClose, habit }) {
  const { addHabit, updateHabit } = useHabitsStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'star',
    color: '#58a6ff',
    frequency: 'daily',
    target: 1,
  });

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        description: habit.description || '',
        icon: habit.icon || 'star',
        color: habit.color || '#58a6ff',
        frequency: habit.frequency || 'daily',
        target: habit.target || 1,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: 'star',
        color: '#58a6ff',
        frequency: 'daily',
        target: 1,
      });
    }
  }, [habit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (habit) {
        await updateHabit(habit.id, formData);
      } else {
        await addHabit(formData);
      }
      onClose();
    } catch (error) {
      console.error('Habit save error:', error);
    }

    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habit ? 'Edit Habit' : 'New Habit'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Name"
          placeholder="e.g., Drink water, Exercise, Read..."
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <TextArea
          label="Description (optional)"
          placeholder="Why is this habit important?"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="min-h-[80px]"
        />

        <div>
          <label className="block text-sm font-medium text-moon-300 mb-2">
            Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {iconOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormData({ ...formData, icon: opt.value })}
                className={clsx(
                  'w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all',
                  formData.icon === opt.value
                    ? 'bg-primary-600 ring-2 ring-primary-400'
                    : 'bg-moon-700 hover:bg-moon-600'
                )}
              >
                {opt.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-moon-300 mb-2">
            Color
          </label>
          <div className="flex gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={clsx(
                  'w-8 h-8 rounded-full transition-all',
                  formData.color === color
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-moon-800 scale-110'
                    : ''
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Frequency"
            options={frequencyOptions}
            value={formData.frequency}
            onChange={(e) =>
              setFormData({ ...formData, frequency: e.target.value })
            }
          />

          <Input
            label="Daily Target"
            type="number"
            min="1"
            max="100"
            value={formData.target}
            onChange={(e) =>
              setFormData({ ...formData, target: parseInt(e.target.value) || 1 })
            }
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {habit ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
