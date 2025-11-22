import GameCard from './GameCard';

interface Game {
    appid: number;
    name: string;
    playtime_forever: number;
    img_icon_url?: string;
    details?: {
        genres?: Array<{ description: string }>;
        metacritic?: { score: number } | null;
    };
}

interface GameListProps {
    games: Game[];
}

export default function GameList({ games }: GameListProps) {
    return (
        <div className="w-full">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#c7d5e0' }}>
                    Your Unplayed Games
                </h2>
                <p style={{ color: '#8f98a0' }}>
                    Found <span className="font-semibold" style={{ color: '#66c0f4' }}>{games.length}</span> games with less than 1 hour of playtime
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {games.map((game) => (
                    <GameCard
                        key={game.appid}
                        name={game.name}
                        appid={game.appid}
                        playtime={game.playtime_forever}
                        icon={game.img_icon_url}
                        genres={game.details?.genres?.map(g => g.description)}
                        score={game.details?.metacritic?.score}
                    />
                ))}
            </div>
        </div>
    );
}
