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
        return getCookie('csrftoken');
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        return null;
    }
}