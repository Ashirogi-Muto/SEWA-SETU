// src/pages/Dashboard.tsx
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, Building } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardData, ReportStatus } from "@/types";

// TODO: Switch to live API by changing the import below
import { fetchDashboardData } from "@/lib/api";


const KpiSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-5 w-5 rounded-full" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-3 w-40" />
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });
  
  const kpiData = data?.kpis;
  const resolutionRate = kpiData ? Math.round((kpiData.reportsResolved / kpiData.totalReports) * 100) : 0;
  
  const statusToVariant = (status: ReportStatus) => {
    if (status === "Pending") return "pending";
    if (status === "In Progress") return "progress";
    return "resolved";
  };

  if (isError) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="text-destructive">Failed to load dashboard data. Please try again later.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
                  <FileText className="h-5 w-5 text-kpi-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{kpiData?.totalReports.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                 <CardHeader className="flex flex-row items-center justify-between pb-2">
                   <CardTitle className="text-sm font-medium text-muted-foreground">Reports Resolved</CardTitle>
                   <CheckCircle className="h-5 w-5 text-kpi-success" />
                 </CardHeader>
                 <CardContent>
                   <div className="text-2xl font-bold">{kpiData?.reportsResolved.toLocaleString()}</div>
                   <p className="text-xs text-muted-foreground mt-1">{resolutionRate}% resolution rate</p>
                 </CardContent>
               </Card>
               <Card>
                 <CardHeader className="flex flex-row items-center justify-between pb-2">
                   <CardTitle className="text-sm font-medium text-muted-foreground">Avg Resolution Time</CardTitle>
                   <Clock className="h-5 w-5 text-kpi-secondary" />
                 </CardHeader>
                 <CardContent>
                   <div className="text-2xl font-bold">{kpiData?.avgResolutionTime}</div>
                 </CardContent>
               </Card>
               <Card>
                 <CardHeader className="flex flex-row items-center justify-between pb-2">
                   <CardTitle className="text-sm font-medium text-muted-foreground">Active Departments</CardTitle>
                   <Building className="h-5 w-5 text-kpi-warning" />
                 </CardHeader>
                 <CardContent>
                   <div className="text-2xl font-bold">{kpiData?.activeDepartments}</div>
                 </CardContent>
               </Card>
            </>
          )}
        </div>

        {/* Recent Activity & Department Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              ) : (
                data?.recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{report.issue}</p>
                      <p className="text-xs text-muted-foreground">{report.id} • {report.time}</p>
                    </div>
                    <Badge variant={statusToVariant(report.status)}>{report.status}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Department Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-12" /></div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))
              ) : (
                data?.departmentPerformance.map((dept) => (
                  <div key={dept.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{dept.name}</span>
                      <span className="text-muted-foreground">{dept.rate}%</span>
                    </div>
                    <Progress value={dept.rate} className="h-2" />
                  </div>
                ))
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}