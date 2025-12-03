import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, CheckCircle, Target, Calendar } from 'lucide-react';
import { api } from '../../api/client';
import { Card, CardTitle } from '../UI';

const COLORS = ['#58a6ff', '#7ee787', '#d29922', '#f85149'];

export function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [priorityStats, setPriorityStats] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [overviewData, timelineData, priorityData, weeklyData] =
        await Promise.all([
          api.getOverview(),
          api.getTasksTimeline(30),
          api.getTasksPriority(),
          api.getWeeklyStats(),
        ]);

      setOverview(overviewData);
      setTimeline(timelineData);
      setPriorityStats(priorityData);
      setWeeklyStats(weeklyData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-moon-100">Analytics</h1>
        <p className="text-moon-400 mt-1">Track your productivity over time</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-900/50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-moon-100">
              {overview?.tasks?.completed || 0}
            </p>
            <p className="text-sm text-moon-400">Tasks Completed</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-900/50 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-moon-100">
              {overview?.tasks?.completion_rate || 0}%
            </p>
            <p className="text-sm text-moon-400">Completion Rate</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-900/50 flex items-center justify-center">
            <Target className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-moon-100">
              {overview?.habits?.streak || 0}
            </p>
            <p className="text-sm text-moon-400">Day Streak</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-900/50 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-moon-100">
              {overview?.tasks?.due_today || 0}
            </p>
            <p className="text-sm text-moon-400">Due Today</p>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Timeline */}
        <Card>
          <CardTitle className="mb-6">Tasks Completed (Last 30 Days)</CardTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).getDate()}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(date) =>
                    new Date(date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#58a6ff"
                  strokeWidth={2}
                  dot={{ fill: '#58a6ff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#58a6ff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardTitle className="mb-6">Tasks by Priority</CardTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="priority"
                  label={({ priority, percent }) =>
                    `${priority} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {priorityStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card>
        <CardTitle className="mb-6">Weekly Activity</CardTitle>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="day"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="tasks" name="Tasks" fill="#58a6ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="habits" name="Habits" fill="#7ee787" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
