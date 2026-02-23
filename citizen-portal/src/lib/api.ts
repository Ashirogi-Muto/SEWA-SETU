import type { Report } from "@/types";

type RegisterPayload = { name: string; email: string; password: string };
type LoginPayload = { email: string; password: string };
type ReportPayload = { description: string; latitude: number; longitude: number; file?: FileList };

const API_URL = import.meta.env.VITE_PUBLIC_API_URL && import.meta.env.VITE_PUBLIC_API_URL.startsWith('http')
    ? import.meta.env.VITE_PUBLIC_API_URL
    : ""; // Empty string means requests will be relative to the current domain

console.log('🔥 API URL:', API_URL);

// A helper to get the JWT from local storage
const getToken = () => {
    return localStorage.getItem('authToken');
};

// --- Authentication Functions ---

export const registerUser = async (userData: RegisterPayload) => {
    const url = `${API_URL}/api/auth/register`;
    console.log('🌐 Fetching from:', url);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify(userData),
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
            window.location.href = '/auth';
            throw new Error('Invalid authentication token');
        }

        if (!response.ok) {
            let errorMessage = 'Registration failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorData.message || errorMessage;
            } catch (e) {
                errorMessage = `Registration failed: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error(`Cannot connect to backend at ${API_URL}. Is the server running?`);
        }
        throw error;
    }
};

export const loginUser = async (credentials: LoginPayload) => {
    const url = `${API_URL}/api/auth/login`;
    console.log('🌐 Fetching from:', url);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify(credentials),
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
            window.location.href = '/auth';
            throw new Error('Invalid authentication token');
        }

        if (!response.ok) {
            let errorMessage = 'Login failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorData.message || errorMessage;
            } catch (e) {
                errorMessage = `Login failed: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (data.access_token) {
            localStorage.setItem('authToken', data.access_token);
        }

        return data;
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error(`Cannot connect to backend at ${API_URL}. Is the server running?`);
        }
        throw error;
    }
};

// --- Report Functions ---

export const fetchReports = async (): Promise<Report[]> => {
    const token = getToken();
    if (!token) {
        return [];
    }

    const url = `${API_URL}/api/reports`;
    console.log('🌐 Fetching from:', url);

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
            window.location.href = '/auth';
            throw new Error('Invalid authentication token');
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch reports: ${response.status}`);
        }

        const data = await response.json();

        // Validate and clean the data
        if (!Array.isArray(data)) {
            throw new Error('Invalid response format: expected array');
        }

        // Ensure each report has the required properties with enhanced AI fields
        const validReports = data.map((report: any) => ({
            id: report.id || 'unknown',
            description: report.description || 'No description',
            status: report.status || 'pending',
            submittedDate: report.created_at || report.submittedDate || new Date().toISOString(),
            created_at: report.created_at || new Date().toISOString(),
            imageUrl: report.image_url || report.imageUrl,
            image_url: report.image_url,
            category: report.category || 'Uncategorized',
            severity: report.severity || 'Medium',
            impact: report.impact || '',
            estimated_repair_time: report.estimated_repair_time || 'TBD',
            confidence: report.confidence || 0,
            latitude: report.latitude || (report.location?.latitude),
            longitude: report.longitude || (report.location?.longitude),
            location: report.location &&
                typeof report.location.latitude === 'number' &&
                typeof report.location.longitude === 'number'
                ? report.location
                : report.latitude && report.longitude
                    ? { latitude: report.latitude, longitude: report.longitude }
                    : undefined
        }));

        return validReports;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Network error: Failed to fetch reports');
    }
};

export const submitNewReport = async (values: ReportPayload) => {
    const token = getToken();
    if (!token) {
        throw new Error('You must be logged in to submit a report.');
    }

    try {
        // Test backend connection first
        console.log('🔍 Testing backend connection...');
        const pingResponse = await fetch(`${API_URL}/api/health`, { method: 'GET' });
        if (!pingResponse.ok) {
            throw new Error('Backend is not responding');
        }
        console.log('✅ Backend is reachable');

        const formData = new FormData();
        formData.append('description', values.description);
        formData.append('latitude', values.latitude.toString());
        formData.append('longitude', values.longitude.toString());
        // formData.append('report_data_json', JSON.stringify(reportDetails)); // Removed mismatch

        if (values.file && values.file.length > 0) {
            formData.append('images', values.file[0]);
            console.log('📷 Image attached:', values.file[0].name, values.file[0].size, 'bytes');
        } else {
            console.log('⚠️ No image attached');
        }

        console.log('🌐 Submitting report to:', `${API_URL}/api/reports`);
        console.log('📦 FormData contents:', {
            description: values.description,
            latitude: values.latitude,
            longitude: values.longitude,
            images: values.file && values.file.length > 0 ? values.file[0].name : 'none',
            token: token ? 'present' : 'missing'
        });

        const url = `${API_URL}/api/reports`;
        console.log('🚀 Starting fetch request...');

        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        console.log('📥 Response received:', response.status, response.statusText);

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
            window.location.href = '/auth';
            throw new Error('Invalid authentication token');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to submit report');
        }

        return response.json();
    } catch (error) {
        console.error('❌ Submit report failed:', error);
        console.error('Error details:', {
            name: (error as Error).name,
            message: (error as Error).message,
            stack: (error as Error).stack
        });

        if (error instanceof TypeError && error.message.includes('fetch')) {
            alert(`❌ Network Error: Cannot reach backend at ${API_URL}. Make sure backend is running!`);
            throw new Error(`Backend not reachable at ${API_URL}`);
        }

        alert(`❌ Submission Failed: ${(error as Error).message}`);
        throw error;
    }
};

// --- Public Report Functions ---

export const transcribeAudio = async (
    audioBlob: Blob,
    provider?: 'sarvam' | 'legacy'
): Promise<{ text: string; language?: string; model?: string }> => {
    const params = provider ? `?provider=${provider}` : '';
    const url = `${API_URL}/api/transcribe${params}`;
    console.log('🌐 Submitting audio to:', url);

    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');

    try {
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            body: formData,
        });

        if (!response.ok) {
            let errorText = 'Transcription failed';
            try {
                const errorData = await response.json();
                errorText = errorData.detail || errorText;
            } catch (e) {
                errorText = `Server error: ${response.statusText}`;
            }
            throw new Error(errorText);
        }

        return await response.json();
    } catch (error) {
        console.error('STT API Error:', error);
        throw error;
    }
};

// Fetches ALL reports for the public map view
export const fetchAllReports = async (): Promise<Report[]> => {
    const url = `${API_URL}/api/reports/all`;
    console.log('🌐 Fetching from:', url);

    try {
        const response = await fetch(url);

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
            window.location.href = '/auth';
            throw new Error('Invalid authentication token');
        }

        if (!response.ok) {
            throw new Error('Failed to fetch reports for map');
        }

        return response.json();
    } catch (error) {
        throw error;
    }
};

export const updateReportStatus = async (reportId: string, newStatus: string) => {
    const url = `${API_URL}/api/reports/${reportId}/status?status=${newStatus}`;
    console.log('🌐 Updating status:', url);

    try {
        const response = await fetch(url, {
            method: 'PATCH',
        });

        if (!response.ok) {
            throw new Error('Failed to update status');
        }

        return response.json();
    } catch (error) {
        throw error;
    }
};