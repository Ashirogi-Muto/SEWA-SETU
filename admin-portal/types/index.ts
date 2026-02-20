// src/types/index.ts

export type ReportStatus = "Pending" | "In Progress" | "Resolved";
export type ReportCategory = "Infrastructure" | "Safety" | "Public Service" | "Other";

export interface Report {
  id: string;
  description: string;
  status: ReportStatus;
  category: ReportCategory;
  submittedDate: string; // ISO 8601 string
  imageUrl?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  citizenId: string;
}

export interface KpiData {
  totalReports: number;
  reportsResolved: number;
  avgResolutionTime: string;
  activeDepartments: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyReports {
  month: string;
  total: number;
}

export interface ResolutionTimeTrend {
  date: string;
  time: number;
}

export interface AnalyticsData {
  categoryDistribution: CategoryDistribution[];
  monthlyReports: MonthlyReports[];
  resolutionTimeTrend: ResolutionTimeTrend[];
}


export interface RecentReport {
  id: string;
  issue: string;
  status: ReportStatus;
  time: string;
}

export interface DepartmentPerformance {
  name: string;
  resolved: number;
  total: number;
  rate: number;
}

export interface DashboardData {
  kpis: KpiData;
  recentReports: RecentReport[];
  departmentPerformance: DepartmentPerformance[];
}

export interface PaginatedReportsResponse {
  reports: Report[];
  totalCount: number;
}

export interface MonthlyReports {
  month: string;
  total: number;
  date?: Date; // Add optional date for filtering
}

export interface ResolutionTimeTrend {
  date: string;
  time: number;
}