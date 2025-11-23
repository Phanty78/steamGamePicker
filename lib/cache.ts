interface Game {
    appid: number;
    name: string;
    playtime_forever: number;
    img_icon_url?: string;
    details?: {
        genres?: Array<{ description: string }>;
        metacritic?: { score: number } | null;
        categories?: Array<{ description: string }>;
        short_description?: string;
        header_image?: string;
    };
}

interface CachedData {
    username: string;
    games: Game[];
    timestamp: number;
}

const CACHE_KEY_PREFIX = 'steam_games_';

/**
 * Save game data to sessionStorage
 */
export function saveGameData(username: string, games: Game[]): void {
    if (typeof window === 'undefined') return;

    try {
        const cacheData: CachedData = {
            username,
            games,
            timestamp: Date.now(),
        };

        sessionStorage.setItem(
            `${CACHE_KEY_PREFIX}${username.toLowerCase()}`,
            JSON.stringify(cacheData)
        );
    } catch (error) {
        console.error('Failed to save game data to cache:', error);
    }
}

/**
 * Get game data from sessionStorage
 */
export function getGameData(username: string): Game[] | null {
    if (typeof window === 'undefined') return null;

    try {
        const cached = sessionStorage.getItem(`${CACHE_KEY_PREFIX}${username.toLowerCase()}`);

        if (!cached) return null;

        const cacheData: CachedData = JSON.parse(cached);

        // Verify it's for the same username
        if (cacheData.username.toLowerCase() !== username.toLowerCase()) {
            return null;
        }

        return cacheData.games;
    } catch (error) {
        console.error('Failed to retrieve game data from cache:', error);
        return null;
    }
}

/**
 * Clear game data from sessionStorage
 */
export function clearGameData(username: string): void {
    if (typeof window === 'undefined') return;

    try {
        sessionStorage.removeItem(`${CACHE_KEY_PREFIX}${username.toLowerCase()}`);
    } catch (error) {
        console.error('Failed to clear game data from cache:', error);
    }
}

/**
 * Clear all cached game data
 */
export function clearAllGameData(): void {
    if (typeof window === 'undefined') return;

    try {
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
            if (key.startsWith(CACHE_KEY_PREFIX)) {
                sessionStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.error('Failed to clear all game data from cache:', error);
    }
}
