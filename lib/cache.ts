import { Game, CachedData } from './types';

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

