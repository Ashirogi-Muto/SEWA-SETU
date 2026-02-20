import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, FileText, Clock, Activity, CheckCircle2 } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface StatsOverviewProps {
  reports: any[];
}

const StatsOverview = ({ reports }: StatsOverviewProps) => {
  // Calculate statistics
  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status?.toLowerCase() === 'pending').length;
  const inProgressReports = reports.filter(r => r.status?.toLowerCase() === 'in progress' || r.status?.toLowerCase() === 'in_progress').length;
  const resolvedReports = reports.filter(r => r.status?.toLowerCase() === 'resolved').length;

  // Helper to calculate weekly trend (this week vs last week)
  const calculateTrend = (filterFn: (r: any) => boolean) => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekCount = reports.filter(r => {
      const d = new Date(r.created_at || r.submittedDate);
      return d >= lastWeek && filterFn(r);
    }).length;

    const lastWeekCount = reports.filter(r => {
      const d = new Date(r.created_at || r.submittedDate);
      return d >= twoWeeksAgo && d < lastWeek && filterFn(r);
    }).length;

    if (lastWeekCount === 0) return thisWeekCount > 0 ? "+100%" : "0%";
    const diff = ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100;
    return `${diff > 0 ? '+' : ''}${diff.toFixed(0)}%`;
  };

  // Helper to generate sparkline data (last 7 days counts)
  const calculateSparkline = (filterFn: (r: any) => boolean) => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));

      const count = reports.filter(r => {
        const rDate = new Date(r.created_at || r.submittedDate);
        return rDate >= dayStart && rDate <= dayEnd && filterFn(r);
      }).length;
      data.push({ value: count });
    }
    return data;
  };

  const getTrendDirection = (trend: string) => trend.includes('-') ? 'down' : 'up';

  const stats = [
    {
      title: "Total Reports",
      value: totalReports,
      change: calculateTrend(() => true),
      trend: getTrendDirection(calculateTrend(() => true)),
      icon: FileText,
      color: "from-blue-500 to-indigo-600",
      sparklineColor: "#3b82f6",
      data: calculateSparkline(() => true)
    },
    {
      title: "Pending",
      value: pendingReports,
      change: calculateTrend(r => r.status?.toLowerCase() === 'pending'),
      trend: getTrendDirection(calculateTrend(r => r.status?.toLowerCase() === 'pending')),
      icon: Clock,
      color: "from-yellow-500 to-orange-600",
      sparklineColor: "#eab308",
      data: calculateSparkline(r => r.status?.toLowerCase() === 'pending')
    },
    {
      title: "In Progress",
      value: inProgressReports,
      change: calculateTrend(r => ['in progress', 'in_progress'].includes(r.status?.toLowerCase())),
      trend: getTrendDirection(calculateTrend(r => ['in progress', 'in_progress'].includes(r.status?.toLowerCase()))),
      icon: Activity,
      color: "from-purple-500 to-pink-600",
      sparklineColor: "#a855f7",
      data: calculateSparkline(r => ['in progress', 'in_progress'].includes(r.status?.toLowerCase()))
    },
    {
      title: "Resolved",
      value: resolvedReports,
      change: calculateTrend(r => r.status?.toLowerCase() === 'resolved'),
      trend: getTrendDirection(calculateTrend(r => r.status?.toLowerCase() === 'resolved')),
      icon: CheckCircle2,
      color: "from-emerald-500 to-teal-600",
      sparklineColor: "#10b981",
      data: calculateSparkline(r => r.status?.toLowerCase() === 'resolved')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;

        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="backdrop-blur-xl bg-white/80 border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden group">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className={`flex items-center space-x-1 text-xs font-semibold ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                    <TrendIcon className="w-3 h-3" />
                    <span>{stat.change}</span>
                  </div>
                </div>

                {/* Value */}
                <div className="mb-3">
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {stat.title}
                  </div>
                </div>

                {/* Sparkline */}
                <div className="h-12 -mx-2 -mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stat.data}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={stat.sparklineColor}
                        strokeWidth={2}
                        dot={false}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Subtle trend text */}
                <div className="text-xs text-slate-400 mt-2">
                  This week
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatsOverview;
