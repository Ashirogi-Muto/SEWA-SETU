// src/lib/api.ts
import { toast } from "sonner";
import {
  DashboardData,
  PaginatedReportsResponse,
  Report,
  ReportStatus
} from "../../types";

// Department types
export interface Department {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface DepartmentCreate {
  name: string;
  email: string;
}

export interface DepartmentUpdate {
  name?: string;
  email?: string;
}

// Backend Report type (different from frontend Report type)
interface BackendReport {
  id: number;
  description: string;
  status: string;
  category: string;
  created_at: string;
  latitude: number;
  longitude: number;
  image_urls?: string[];
  user_id?: number;
  department_id?: number;
}

const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.startsWith('http')
    ? import.meta.env.VITE_API_BASE_URL
    : "";
  const adminApiKey = import.meta.env.VITE_ADMIN_API_KEY;
  const token = getAuthToken();

  const headers = new Headers({
    "Content-Type": "application/json",
    ...options.headers,
  });

  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  if (options.method && options.method.toUpperCase() !== "GET") {
    headers.append("X-API-Key", adminApiKey);
  }

  try {
    const fullUrl = `${baseUrl}${endpoint}`;

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "An unknown error occurred" }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) { // No Content
      return null as T;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    toast.error("API Error", {
      description: error instanceof Error ? error.message : "An unexpected error occurred.",
    });
    throw error;
  }
};

// Auth API functions
export const login = async (credentials: { email: string; password: string }): Promise<{ access_token: string }> => {
  return apiFetch<{ access_token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

export const logout = async (): Promise<{ message: string }> => {
  try {
    return await apiFetch<{ message: string }>("/api/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    // Even if API call fails, we still clear local data
    console.warn("Logout API call failed, but proceeding with local cleanup", error);
    return { message: "Logged out locally" };
  }
};

// Dashboard API functions
export const fetchDashboardData = async (): Promise<DashboardData> => {
  return apiFetch<DashboardData>("/api/dashboard");
};

// Reports API functions
export const fetchReports = async (
  status: string,
  category: string,
  page: number,
  limit: number,
  // Location filtering parameters
  centerLat?: number,
  centerLon?: number,
  radiusKm?: number,
  departmentId?: number
): Promise<PaginatedReportsResponse> => {
  const params = new URLSearchParams();

  if (status !== "all") params.append("status", status);
  if (category !== "all") params.append("category", category);
  if (departmentId) params.append("department_id", departmentId.toString());
  if (centerLat !== undefined) params.append("center_lat", centerLat.toString());
  if (centerLon !== undefined) params.append("center_lon", centerLon.toString());
  if (radiusKm !== undefined) params.append("radius_km", radiusKm.toString());
  params.append("skip", ((page - 1) * limit).toString());
  params.append("limit", limit.toString());

  const queryString = params.toString();
  const endpoint = `/api/reports/all${queryString ? `?${queryString}` : ""}`;

  const data = await apiFetch<BackendReport[]>(endpoint);

  // Transform backend data to match frontend expectations
  const transformedReports: Report[] = data.map(report => ({
    id: report.id.toString(), // Ensure ID is string for frontend
    description: report.description,
    status: report.status as ReportStatus, // Cast to frontend status type
    category: report.category as any, // Cast to frontend category type
    submittedDate: report.created_at, // Map created_at to submittedDate
    imageUrl: report.image_urls?.[0], // Map first image URL
    location: {
      latitude: report.latitude,
      longitude: report.longitude
    },
    citizenId: report.user_id?.toString() || "Unknown"
  }));

  // For pagination, we need to make a separate call or modify backend to return total count
  // For now, we'll estimate total count (this should be improved in backend)
  return {
    reports: transformedReports,
    totalCount: transformedReports.length >= limit ? transformedReports.length * 2 : transformedReports.length // rough estimate
  };
};

export const updateReportStatus = async ({ id, status }: { id: string; status: ReportStatus }): Promise<Report> => {
  // Convert frontend status format to backend format
  const backendStatus = status.toLowerCase().replace(" ", "_");

  return apiFetch<Report>(`/api/reports/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status: backendStatus }),
  });
};


// Departments API functions
export const fetchDepartments = async (): Promise<Department[]> => {
  try {
    const result = await apiFetch<Department[]>("/api/departments");
    return result;
  } catch (error) {
    console.error('Error in fetchDepartments:', error);
    throw error;
  }
};

export const fetchDepartment = async (id: number): Promise<Department> => {
  return apiFetch<Department>(`/api/departments/${id}`);
};

export const createDepartment = async (department: DepartmentCreate): Promise<Department> => {
  return apiFetch<Department>("/api/departments", {
    method: "POST",
    body: JSON.stringify(department),
  });
};

export const updateDepartment = async (id: number, department: DepartmentUpdate): Promise<Department> => {
  return apiFetch<Department>(`/api/departments/${id}`, {
    method: "PUT",
    body: JSON.stringify(department),
  });
};

export const deleteDepartment = async (id: number): Promise<{ message: string }> => {
  return apiFetch<{ message: string }>(`/api/departments/${id}`, {
    method: "DELETE",
  });
};