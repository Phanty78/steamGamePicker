import { NextRequest, NextResponse } from 'next/server';

interface Game {
    appid: number;
    name: string;
    playtime_forever: number;
    img_icon_url: string;
}

interface GameDetails {
    appid: number;
    name: string;
    genres: Array<{ description: string }>;
    categories: Array<{ description: string }>;
    metacritic: { score: number } | null;
    short_description: string;
    header_image: string;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const vanity = searchParams.get('vanity');
    const filter = searchParams.get('filter') || 'random';

    if (!vanity) {
        return NextResponse.json(
            { error: 'Vanity username is required' },
            { status: 400 }
        );
    }

    const apiKey = process.env.STEAM_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'Steam API key not configured' },
            { status: 500 }
        );
    }

    try {
        // Step 1: Resolve vanity to steamid
        const resolveUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${vanity}`;
        const resolveRes = await fetch(resolveUrl);
        const resolveData = await resolveRes.json();

        if (resolveData.response.success !== 1) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const steamid = resolveData.response.steamid;

        // Step 2: Get library
        const libraryUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true&format=json`;
        const libraryRes = await fetch(libraryUrl);
        const libraryData = await libraryRes.json();

        if (!libraryData.response || !libraryData.response.games) {
            return NextResponse.json(
                { error: 'Library is private or no games found' },
                { status: 403 }
            );
        }

        // Step 3: Filter games with < 60 minutes
        const lowPlaytimeGames: Game[] = libraryData.response.games.filter(
            (game: Game) => game.playtime_forever < 60
        );

        if (lowPlaytimeGames.length === 0) {
            return NextResponse.json(
                { error: 'No games with less than 1 hour playtime found' },
                { status: 404 }
            );
        }

        // Step 4: Fetch details for low playtime games
        const gamesWithDetails: Array<Game & { details: GameDetails | null }> = [];

        for (const game of lowPlaytimeGames) {
            try {
                const detailsUrl = `https://store.steampowered.com/api/appdetails?appids=${game.appid}`;
                const detailsRes = await fetch(detailsUrl);
                const detailsData = await detailsRes.json();

                if (detailsData[game.appid]?.success && detailsData[game.appid]?.data) {
                    gamesWithDetails.push({
                        ...game,
                        details: detailsData[game.appid].data,
                    });
                }
            } catch (error) {
                console.error(`Failed to fetch details for ${game.appid}:`, error);
            }
        }

        // Step 5: Apply filter
        let filteredGames = gamesWithDetails.filter(g => g.details !== null);

        if (filter === 'rpg') {
            filteredGames = filteredGames.filter(g =>
                g.details?.genres?.some(genre =>
                    genre.description.toLowerCase().includes('rpg')
                )
            );
        } else if (filter === 'fps') {
            filteredGames = filteredGames.filter(g =>
                g.details?.genres?.some(genre =>
                    genre.description.toLowerCase().includes('action') ||
                    genre.description.toLowerCase().includes('shooter')
                ) ||
                g.details?.categories?.some(cat =>
                    cat.description.toLowerCase().includes('fps')
                )
            );
        } else if (filter === 'multiplayer') {
            filteredGames = filteredGames.filter(g =>
                g.details?.categories?.some(cat =>
                    cat.description.toLowerCase().includes('multi-player') ||
                    cat.description.toLowerCase().includes('multiplayer')
                )
            );
        } else if (filter === 'top') {
            filteredGames = filteredGames
                .filter(g => g.details?.metacritic?.score)
                .sort((a, b) =>
                    (b.details?.metacritic?.score || 0) - (a.details?.metacritic?.score || 0)
                );
        }

        if (filteredGames.length === 0) {
            return NextResponse.json(
                { error: `No games found matching filter: ${filter}` },
                { status: 404 }
            );
        }

        // Step 6: Select game based on filter
        let selectedGame;
        if (filter === 'top') {
            selectedGame = filteredGames[0];
        } else {
            // Random selection
            selectedGame = filteredGames[Math.floor(Math.random() * filteredGames.length)];
        }

        return NextResponse.json({
            title: selectedGame.name,
            appid: selectedGame.appid,
            genres: selectedGame.details?.genres?.map(g => g.description) || [],
            score: selectedGame.details?.metacritic?.score || null,
            icon: selectedGame.details?.header_image || '',
            playtime: selectedGame.playtime_forever,
            description: selectedGame.details?.short_description || '',
        });

    } catch (error) {
        console.error('Error in recommend endpoint:', error);
        return NextResponse.json(
            { error: 'Failed to generate recommendation' },
            { status: 500 }
        );
    }
}
