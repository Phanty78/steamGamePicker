interface RecommendationCardProps {
    title: string;
    appid: number;
    genres: string[];
    score: number | null;
    icon: string;
    playtime: number;
    description: string;
}

export default function RecommendationCard({
    title,
    appid,
    genres,
    score,
    icon,
    playtime,
    description
}: RecommendationCardProps) {
    const playtimeHours = (playtime / 60).toFixed(1);
    const steamUrl = `https://store.steampowered.com/app/${appid}`;

    return (
        <div
            className="w-full rounded-sm p-6 animate-fade-in"
            style={{
                background: '#1b2838',
                border: '2px solid #66c0f4',
                boxShadow: '0 0 20px rgba(102, 192, 244, 0.3)'
            }}
        >
            <div className="flex items-start gap-4 mb-4">
                <div
                    className="w-24 h-24 rounded overflow-hidden flex-shrink-0"
                    style={{ border: '2px solid #66c0f4' }}
                >
                    {icon && (
                        <img
                            src={icon}
                            alt={title}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#c7d5e0' }}>
                        {title}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-3">
                        {genres.map((genre, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 text-sm rounded-sm font-medium"
                                style={{
                                    background: 'rgba(102, 192, 244, 0.2)',
                                    color: '#66c0f4',
                                    border: '1px solid rgba(102, 192, 244, 0.5)'
                                }}
                            >
                                {genre}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm" style={{ color: '#8f98a0' }}>Playtime:</span>
                            <span className="font-semibold" style={{ color: '#66c0f4' }}>{playtimeHours}h</span>
                        </div>

                        {score && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm" style={{ color: '#8f98a0' }}>Metacritic:</span>
                                <span className="font-bold" style={{
                                    color: score >= 75 ? '#5c7e10' : score >= 50 ? '#e5af37' : '#c22d00'
                                }}>
                                    {score}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {description && (
                <p
                    className="text-sm mb-4 leading-relaxed"
                    style={{ color: '#c7d5e0' }}
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            )}

            <a
                href={steamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-sm transition-all duration-300 steam-button"
                style={{ color: '#fff' }}
            >
                <span>View on Steam</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
            </a>
        </div>
    );
}
