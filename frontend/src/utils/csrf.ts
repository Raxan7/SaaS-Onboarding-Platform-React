export function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

export async function fetchCSRFToken(): Promise<string | null> {
    try {
        // Use the API_BASE_URL constant
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://saas-onboarding.onrender.com';
        
        // First try to get existing cookie
        let csrfToken = getCookie('csrftoken');
        if (csrfToken) {
            return csrfToken;
        }
        
        // If no token in cookies, fetch from server
        console.log('No CSRF token found in cookies, fetching from server...');
        const response = await fetch(`${API_BASE_URL}/api/auth/csrf/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            },
        });
        
        if (!response.ok) {
            console.error(`Failed to fetch CSRF token: ${response.status} ${response.statusText}`);
            return null;
        }
        
        // Try to get token from response data
        const data = await response.json();
        if (data && data.token) {
            console.log('Got CSRF token from response data');
            return data.token;
        }
        
        // Check if cookie was set by the response
        csrfToken = getCookie('csrftoken');
        if (csrfToken) {
            console.log('Got CSRF token from cookies after fetch');
            return csrfToken;
        }
        
        console.warn('CSRF token not found in cookies or response after fetch.');
        return null;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        return null;
    }
}

export async function ensureCsrfToken() {
    // Try multiple times to get a token
    for (let attempt = 0; attempt < 3; attempt++) {
        const token = await fetchCSRFToken();
        if (token) {
            return token;
        }
        
        // Wait a short time before retry
        if (attempt < 2) {
            console.log(`CSRF token fetch attempt ${attempt + 1} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    console.error('Failed to get CSRF token after multiple attempts');
    return null;
}