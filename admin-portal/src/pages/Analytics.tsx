// src/pages/Analytics.tsx
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsData } from "@/types";

// TODO: Switch to live API by changing the import below
import { fetchAnalytics } from "@/lib/api";


export default function Analytics() {
  const { data, isLoading, isError } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  });

  if (isError) return <DashboardLayout title="Analytics"><p>Error loading analytics.</p></DashboardLayout>;

  return (
    <DashboardLayout title="Analytics & Reports">
      <div className="grid gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Reports by Category</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={data?.categoryDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {data?.categoryDistribution.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Monthly New Reports</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.monthlyReports}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Resolution Time Trend (Avg. Days)</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.resolutionTimeTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="time" stroke="hsl(var(--secondary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}