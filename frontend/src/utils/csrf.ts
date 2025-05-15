export function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

export async function fetchCSRFToken(): Promise<string | null> {
    try {
        const response = await fetch('/api/get_csrf_token', {
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
            const response = await fetch('/api/auth/csrf/', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                csrfToken = getCookie('csrftoken');
            }
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
        }
    }

    return csrfToken;
}