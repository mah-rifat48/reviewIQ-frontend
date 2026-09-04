import Cookies from "js-cookie";

export const getUserIdFromToken = () => {
    const token = Cookies.get("accessToken");
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        return decoded.sub; // The user_id is in the 'sub' claim
    } catch (e) {
        console.error("Error decoding token:", e);
        return null;
    }
};
export const getSubscriptionFromCookie = () => {
    const subCookie = Cookies.get("subscription");
    if (!subCookie) return null;
    
    // 1. Try direct JSON parse
    try {
        return JSON.parse(subCookie);
    } catch (e) {}

    // 2. Try base64 decoding (as used in login/callback)
    try {
        const decoded = atob(subCookie);
        return JSON.parse(decoded);
    } catch (e) {}

    // 3. Try JWT decoding
    try {
        if (subCookie.split('.').length === 3) {
            const base64Url = subCookie.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        }
    } catch (e) {}

    return null;
};
