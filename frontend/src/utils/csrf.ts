export function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

export async function fetchCSRFToken(): Promise<string | null> {
    try {
        // Use the API_BASE_URL constant
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://saas-onboarding-platform-react.onrender.com';
        
        // First try to get existing cookie
        let csrfToken = getCookie('csrftoken');
        if (csrfToken) {
            return csrfToken;
        }
        
        // If no token in cookies, fetch from server
        const response = await fetch(`${API_BASE_URL}/api/auth/csrf/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            },
            // Add cache busting parameter to avoid caching issues
            cache: 'no-store',
        });
        
        if (!response.ok) {
            console.error(`Failed to fetch CSRF token: ${response.status}`);
            
            // Try to extract token from response data even if response wasn't OK
            try {
                const data = await response.json();
                if (data && data.token) {
                    return data.token;
                }
            } catch (e) {
                // Ignore JSON parsing errors
            }
            
            return null;
        }
        
        // Try to get token from response data
        const data = await response.json();
        if (data && data.token) {
            return data.token;
        }
        
        // Check if cookie was set by the response
        csrfToken = getCookie('csrftoken');
        if (csrfToken) {
            return csrfToken;
        }
        
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
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    console.error('Failed to get CSRF token after multiple attempts');
    
    // Fallback to a static middleware token approach if nothing else works
    const middlewareToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (middlewareToken) {
        return middlewareToken;
    }
    
    return null;
}