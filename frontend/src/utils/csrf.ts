export function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

export async function fetchCSRFToken(): Promise<string | null> {
    try {
        // Use the API_BASE_URL constant
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${API_BASE_URL}/api/auth/csrf/`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            console.error('Failed to fetch CSRF token:', response.statusText);
            return null;
        }
        const token = getCookie('csrftoken');
        if (!token) {
            console.warn('CSRF token not found in cookies.');
        }
        return token;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        return null;
    }
}

export async function ensureCsrfToken() {
    // First try to get existing cookie
    let csrfToken = getCookie('csrftoken');

    if (!csrfToken) {
        // If no token, fetch one from the server
        try {
            // Use the API_BASE_URL constant for consistency
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
            const response = await fetch(`${API_BASE_URL}/api/auth/csrf/`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                csrfToken = getCookie('csrftoken');
            } else {
                console.error(`Failed to fetch CSRF token: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
        }
    }

    return csrfToken;
}