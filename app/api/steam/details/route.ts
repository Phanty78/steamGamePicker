import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const appid = searchParams.get('appid');

    if (!appid) {
        return NextResponse.json(
            { error: 'App ID is required' },
            { status: 400 }
        );
    }

    try {
        const url = `https://store.steampowered.com/api/appdetails?appids=${appid}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data[appid]?.success && data[appid]?.data) {
            const gameData = data[appid].data;

            return NextResponse.json({
                appid: parseInt(appid),
                name: gameData.name,
                short_description: gameData.short_description,
                genres: gameData.genres || [],
                categories: gameData.categories || [],
                metacritic: gameData.metacritic || null,
                header_image: gameData.header_image,
            });
        } else {
            return NextResponse.json(
                { error: 'Game details not found' },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Error fetching game details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch game details' },
            { status: 500 }
        );
    }
}
