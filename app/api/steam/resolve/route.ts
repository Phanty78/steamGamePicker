import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const vanity = searchParams.get('vanity');

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
    const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${vanity}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.response.success === 1) {
      return NextResponse.json({ steamid: data.response.steamid });
    } else {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error resolving vanity URL:', error);
    return NextResponse.json(
      { error: 'Failed to resolve username' },
      { status: 500 }
    );
  }
}
