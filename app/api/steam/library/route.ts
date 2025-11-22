import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const steamid = searchParams.get('id');

    if (!steamid) {
        return NextResponse.json(
            { error: 'Steam ID is required' },
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
        const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true&format=json`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.response && data.response.games) {
            return NextResponse.json({ games: data.response.games });
        } else {
            return NextResponse.json(
                { error: 'Library is private or no games found' },
                { status: 403 }
            );
        }
    } catch (error) {
        console.error('Error fetching library:', error);
        return NextResponse.json(
            { error: 'Failed to fetch library' },
            { status: 500 }
        );
    }
}
