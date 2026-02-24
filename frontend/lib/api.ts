/**
 * Centralized API module for SewaSetu Frontend
 * Replaces all Prisma/Supabase/AI calls with fetch() to the Python FastAPI backend.
 * All requests are proxied through Next.js rewrites (see next.config.js).
 */

// --- Token Management ---

export function getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('authToken')
}

export function setToken(token: string): void {
    localStorage.setItem('authToken', token)
}

export function clearToken(): void {
    localStorage.removeItem('authToken')
}

// --- Base Fetch Wrapper ---

export async function apiFetch<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken()

    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    }

    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json'
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(endpoint, {
        ...options,
        headers,
    })

    if (response.status === 401 || response.status === 403) {
        clearToken()
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        throw new Error('Authentication failed')
    }

    if (!response.ok) {
        let errorMessage = `Request failed: ${response.status}`
        try {
            const errorData = await response.json()
            errorMessage = errorData.detail || errorData.message || errorMessage
        } catch (_) { }
        throw new Error(errorMessage)
    }

    if (response.status === 204) {
        return null as T
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('text/csv')) {
        return response.text() as unknown as T
    }

    return response.json()
}

// --- Auth ---

export interface LoginResponse {
    access_token: string
    token_type: string
    user_id: number
    role: string
    name: string
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
    const data = await apiFetch<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    })
    if (data.access_token) {
        setToken(data.access_token)
    }
    return data
}

export async function registerUser(name: string, email: string, password: string): Promise<LoginResponse> {
    const data = await apiFetch<LoginResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    })
    if (data.access_token) {
        setToken(data.access_token)
    }
    return data
}

// --- Users ---

export interface UserProfile {
    id: number
    name: string
    email: string
    role: string
    phone?: string
    location: string
    language?: string
    karma: number
    rank: string
    stats: {
        total_reports: number
        resolved_reports: number
        pending_reports: number
    }
}

export async function fetchUserProfile(): Promise<UserProfile> {
    return apiFetch<UserProfile>('/api/users/me')
}

export async function updateUserProfile(data: Partial<UserProfile>): Promise<any> {
    return apiFetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(data)
    })
}

export async function exportUserData(): Promise<string> {
    return apiFetch('/api/users/me/export', {
        headers: { 'Accept': 'text/csv' }
    })
}

// --- Reports ---

export interface BackendReport {
    id: number
    description: string
    status: string
    category: string
    created_at: string
    updated_at: string
    latitude: number
    longitude: number
    location_name?: string
    image_url?: string
    user_id?: number
    confidence?: number
    impact_score?: number
    escalation_level?: number
    duplicate_of?: number
}

export async function fetchReports(filters?: {
    status?: string
    category?: string
    skip?: number
    limit?: number
}): Promise<BackendReport[]> {
    const params = new URLSearchParams()
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category)
    if (filters?.skip !== undefined) params.append('skip', filters.skip.toString())
    if (filters?.limit !== undefined) params.append('limit', filters.limit.toString())

    const queryString = params.toString()
    const endpoint = `/api/reports/all${queryString ? `?${queryString}` : ''}`
    return apiFetch<BackendReport[]>(endpoint)
}

export async function fetchMyReports(): Promise<BackendReport[]> {
    return apiFetch<BackendReport[]>('/api/reports')
}

export async function fetchAssignedReports(): Promise<BackendReport[]> {
    return apiFetch<BackendReport[]>('/api/reports/assigned')
}

export async function submitReport(formData: FormData): Promise<any> {
    return apiFetch('/api/reports', {
        method: 'POST',
        body: formData,
    })
}

export async function updateReportStatus(reportId: number, status: string): Promise<any> {
    return apiFetch(`/api/reports/${reportId}/status?status=${status}`, {
        method: 'PATCH',
    })
}

// --- STT ---

export async function transcribeAudio(
    audioBlob: Blob,
    provider?: 'sarvam' | 'legacy'
): Promise<{ text: string; language?: string; model?: string }> {
    const formData = new FormData()
    formData.append('file', audioBlob, 'recording.webm')
    const params = provider ? `?provider=${provider}` : ''
    return apiFetch(`/api/transcribe${params}`, {
        method: 'POST',
        body: formData,
    })
}

// --- Dashboard & Analytics (Admin) ---

export interface DashboardData {
    kpis: {
        totalReports: number
        reportsResolved: number
        avgResolutionTime: string
        activeDepartments: number
    }
    recentReports: Array<{
        id: string
        issue: string
        time: string
        status: string
    }>
    departmentDistribution: Array<{
        name: string
        value: number
        color: string
    }>
}

export async function fetchDashboard(): Promise<DashboardData> {
    return apiFetch<DashboardData>('/api/dashboard')
}

export async function fetchAnalytics(): Promise<any> {
    return apiFetch('/api/analytics')
}

// --- Escalations ---

export interface Escalation {
    id: string
    department: string
    location: string
    severity: string
    time_elapsed: string
}

export async function fetchEscalations(): Promise<Escalation[]> {
    return apiFetch<Escalation[]>('/api/escalations')
}

// --- Departments ---

export async function fetchDepartments(): Promise<any[]> {
    return apiFetch('/api/departments')
}

// --- Alerts ---

export interface AppAlert {
    id: string
    type: string
    title: string
    message: string
    time: string
    icon: string
    is_read: boolean
}

export async function fetchAlerts(): Promise<AppAlert[]> {
    return apiFetch<AppAlert[]>('/api/alerts')
}

export async function markAlertRead(alertId: string | number): Promise<any> {
    return apiFetch(`/api/alerts/${alertId.toString().replace('alert-', '')}/read`, {
        method: 'PUT'
    })
}

export async function markAllAlertsRead(): Promise<any> {
    return apiFetch('/api/alerts/read/all', {
        method: 'PUT'
    })
}
