import { CacheService } from "./cache.service";
import api from '../api.service';

const CATEGORY_CACHE_KEY = "myclip_categories";
const TTL_HOURS = 12;

export async function getCategoriesCached() {
    // 1. Intentar leer cache
    const cached = CacheService.get(CATEGORY_CACHE_KEY, TTL_HOURS);
    if (cached) return cached;

    // 2. Llamar backend usando API SERVICE
    const res = await api.get("/videos/categories");

    const categories = res.data;

    // 3. Guardar en cache
    CacheService.set(CATEGORY_CACHE_KEY, categories);

    return categories;
}

export function invalidateCategoryCache() {
    CacheService.clear(CATEGORY_CACHE_KEY);
}
