import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChartIcon } from "lucide-react";

interface AnalyticsDashboardProps {
  reports: any[];
}

const AnalyticsDashboard = ({ reports }: AnalyticsDashboardProps) => {
  // Process data for charts

  // 1. Issues by Category (Pie Chart)
  const categoryData = reports.reduce((acc: any, report) => {
    const category = report.category || 'Other';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category]++;
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  }));

  // 2. Reports vs Resolutions over last 6 months (Bar Chart)
  // 2. Reports vs Resolutions over last 6 months (Bar Chart)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthName = d.toLocaleString('default', { month: 'short' });
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    const reportsInMonth = reports.filter(r => {
      const rDate = new Date(r.created_at || r.submittedDate);
      return rDate >= monthStart && rDate <= monthEnd;
    }).length;

    const resolvedInMonth = reports.filter(r => {
      const rDate = new Date(r.created_at || r.submittedDate);
      return rDate >= monthStart && rDate <= monthEnd && r.status?.toLowerCase() === 'resolved';
    }).length;

    return {
      month: monthName,
      reports: reportsInMonth,
      resolved: resolvedInMonth
    };
  });

  const COLORS = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#6366f1'  // indigo
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-xl bg-white/90 border border-white/20 rounded-lg p-3 shadow-2xl">
          <p className="text-sm font-semibold text-slate-900">{payload[0].name}</p>
          <p className="text-xs text-slate-600">{`Count: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart - Issues by Category */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="backdrop-blur-xl bg-white/80 border-white/10 shadow-2xl h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                  <PieChartIcon className="w-5 h-5 text-white" />
                </div>
                <span>Issues by Category</span>
              </CardTitle>
              <div className="text-xs text-slate-500 font-medium">
                Total: {reports.length}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1000}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs font-medium text-slate-700">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bar Chart - Reports vs Resolutions */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="backdrop-blur-xl bg-white/80 border-white/10 shadow-2xl h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span>Reports vs Resolutions</span>
              </CardTitle>
              <div className="text-xs text-slate-500 font-medium">
                Last 6 months
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}
                />
                <Bar
                  dataKey="reports"
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                />
                <Bar
                  dataKey="resolved"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                  animationBegin={200}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Insights */}
            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <p className="text-xs font-semibold text-slate-700">
                  Resolution Rate: <span className="text-emerald-600">
                    {monthlyData[5].reports > 0
                      ? ((monthlyData[5].resolved / monthlyData[5].reports) * 100).toFixed(0)
                      : 0}%
                  </span> this month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;
