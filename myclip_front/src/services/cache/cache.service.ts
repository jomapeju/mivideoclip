/**
 * CacheService — sistema genérico de cache basado en localStorage
 * Reutilizable para cualquier endpoint.
 */

export class CacheService {
    static get(key: string, ttlHours: number) {
        try {
            const data = localStorage.getItem(key);
            const date = localStorage.getItem(`${key}_date`);

            if (!data || !date) return null;

            const ageHours = (Date.now() - Number(date)) / (1000 * 60 * 60);

            if (ageHours > ttlHours) return null; // expirado

            return JSON.parse(data);
        } catch {
            return null;
        }
    }

    static set(key: string, value: any) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            localStorage.setItem(`${key}_date`, Date.now().toString());
        } catch {
            // fallback silencioso
        }
    }

    static clear(key: string) {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_date`);
    }
}
