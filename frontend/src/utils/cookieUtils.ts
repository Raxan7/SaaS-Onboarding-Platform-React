// utils/cookieUtils.ts
export function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift();
        if (!cookieValue) {
            console.error(`Cookie '${name}' found but has no value.`);
        } else {
            console.log(`Cookie '${name}' retrieved successfully: ${cookieValue}`); // Debugging log
        }
        return cookieValue || null;
    } else {
        console.error(`Cookie '${name}' not found in document.cookie.`);
        return null;
    }
}