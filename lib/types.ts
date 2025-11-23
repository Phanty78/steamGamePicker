export interface Game {
    appid: number;
    name: string;
    playtime_forever: number;
    img_icon_url?: string;
    details?: GameDetails;
}

export interface GameDetails {
    genres?: Array<{ description: string }>;
    metacritic?: { score: number } | null;
    categories?: Array<{ description: string }>;
    short_description?: string;
    header_image?: string;
}

export interface Recommendation {
    title: string;
    appid: number;
    genres: string[];
    score: number | null;
    icon: string;
    playtime: number;
    description: string;
}

export interface CachedData {
    username: string;
    games: Game[];
    timestamp: number;
}
