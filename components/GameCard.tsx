interface GameCardProps {
    name: string;
    appid: number;
    playtime: number;
    icon?: string;
    genres?: string[];
    score?: number | null;
}

export default function GameCard({ name, appid, playtime, icon, genres, score }: GameCardProps) {
    const iconUrl = icon || `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${icon}.jpg`;
    const playtimeHours = (playtime / 60).toFixed(1);

    return (
        <div
            className="rounded-sm p-4 transition-all duration-300"
            style={{
                background: '#1b2838',
                border: '1px solid #2a475e'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#66c0f4';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(102, 192, 244, 0.2)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2a475e';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div className="flex items-start gap-4">
                {icon && (
                    <img
                        src={iconUrl}
                        alt={name}
                        className="w-16 h-16 rounded object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                )}
                <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1" style={{ color: '#c7d5e0' }}>
                        {name}
                    </h3>
                    <p className="text-sm mb-2" style={{ color: '#8f98a0' }}>
                        Playtime: <span style={{ color: '#66c0f4' }}>{playtimeHours}h</span>
                    </p>
                    {genres && genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {genres.slice(0, 3).map((genre, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-1 text-xs rounded-sm"
                                    style={{
                                        background: 'rgba(102, 192, 244, 0.1)',
                                        color: '#66c0f4',
                                        border: '1px solid rgba(102, 192, 244, 0.3)'
                                    }}
                                >
                                    {genre}
                                </span>
                            ))}
                        </div>
                    )}
                    {score && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: '#8f98a0' }}>Metacritic:</span>
                            <span className={`font-bold text-sm`} style={{
                                color: score >= 75 ? '#5c7e10' : score >= 50 ? '#e5af37' : '#c22d00'
                            }}>
                                {score}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
