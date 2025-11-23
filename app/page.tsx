'use client';

import { useState, useEffect } from 'react';
import GameList from '@/components/GameList';
import RecommendationCard from '@/components/RecommendationCard';
import { LOADING_MESSAGES } from '@/lib/constants';
import { saveGameData, getGameData } from '@/lib/cache';
import { Game, Recommendation } from '@/lib/types';


export default function Home() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  // Rotate loading messages every 2 seconds in random order
  useEffect(() => {
    if (!loadingDetails) return;

    // Create a shuffled copy of messages
    const shuffledMessages = [...LOADING_MESSAGES].sort(() => Math.random() - 0.5);
    let messageIndex = 0;

    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % shuffledMessages.length;
      setLoadingMessage(shuffledMessages[messageIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, [loadingDetails]);

  // Progressive loading function to fetch game details in the background
  const loadGameDetailsProgressively = async (gamesToLoad: Game[]) => {
    setLoadingDetails(true);

    // Process games one by one with throttling
    for (let i = 0; i < gamesToLoad.length; i++) {
      const game = gamesToLoad[i];

      try {
        const detailsRes = await fetch(`/api/steam/details?appids=${game.appid}`);

        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          const gameDetails = detailsData[game.appid];

          // Update this specific game with details
          if (gameDetails && gameDetails.success && gameDetails.data) {
            setGames(prevGames => {
              const updatedGames = prevGames.map(g =>
                g.appid === game.appid
                  ? {
                    ...g,
                    details: {
                      genres: gameDetails.data.genres,
                      metacritic: gameDetails.data.metacritic || null,
                      categories: gameDetails.data.categories,
                      short_description: gameDetails.data.short_description,
                      header_image: gameDetails.data.header_image
                    }
                  }
                  : g
              );

              // Save to cache after each update
              saveGameData(username, updatedGames);

              return updatedGames;
            });
          }
        }
      } catch (err) {
        console.error(`Failed to fetch details for game ${game.appid}`, err);
      }

      // il faut jouer ici pour éviter le rate limiting
      if (i < gamesToLoad.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    setLoadingDetails(false);
  };


  const analyzeLibrary = async () => {
    if (!username.trim()) {
      setError('Please enter a Steam username');
      return;
    }

    setLoading(true);
    setError('');
    setGames([]);
    setRecommendation(null);

    try {
      // Step 1: Resolve vanity username
      const resolveRes = await fetch(`/api/steam/resolve?vanity=${encodeURIComponent(username)}`);
      const resolveData = await resolveRes.json();

      if (!resolveRes.ok) {
        throw new Error(resolveData.error || 'Failed to resolve username');
      }

      const steamid = resolveData.steamid;

      // Step 2: Fetch library
      const libraryRes = await fetch(`/api/steam/library?id=${steamid}`);
      const libraryData = await libraryRes.json();

      if (!libraryRes.ok) {
        throw new Error(libraryData.error || 'Failed to fetch library');
      }

      // Step 3: Filter games with < 60 minutes
      const lowPlaytimeGames = libraryData.games.filter((game: Game) => game.playtime_forever < 60);

      if (lowPlaytimeGames.length === 0) {
        setError('No games with less than 1 hour of playtime found!');
        setLoading(false);
        return;
      }

      // Step 4: Display games immediately, then load details progressively
      const gamesToFetch = lowPlaytimeGames.slice(0, 300);

      // Show games immediately without details
      setGames(gamesToFetch);

      // Load details in the background
      loadGameDetailsProgressively(gamesToFetch);
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendation = async (filter: string) => {
    setLoadingRecommendation(true);
    setRecommendation(null);
    setError('');

    try {
      // Get games from cache first
      const cachedGames = getGameData(username);

      if (!cachedGames || cachedGames.length === 0) {
        throw new Error('No games loaded. Please analyze your library first.');
      }

      // Filter games that have details and low playtime
      let filteredGames = cachedGames.filter(
        g => g.details && g.playtime_forever < 60
      );

      // Apply specific filters
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
        throw new Error(`No games found matching filter: ${filter}`);
      }

      // Select game based on filter
      let selectedGame;
      if (filter === 'top') {
        selectedGame = filteredGames[0];
      } else {
        // Random selection
        selectedGame = filteredGames[Math.floor(Math.random() * filteredGames.length)];
      }

      // Build recommendation object
      setRecommendation({
        title: selectedGame.name,
        appid: selectedGame.appid,
        genres: selectedGame.details?.genres?.map(g => g.description) || [],
        score: selectedGame.details?.metacritic?.score || null,
        icon: selectedGame.details?.header_image || '',
        playtime: selectedGame.playtime_forever,
        description: selectedGame.details?.short_description || '',
      });
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to get recommendation');
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const filterButtons = [
    { label: 'Surprise me', value: 'random', icon: '🎲' },
    { label: 'RPG', value: 'rpg', icon: '⚔️' },
    { label: 'FPS', value: 'fps', icon: '🔫' },
    { label: 'Multiplayer', value: 'multiplayer', icon: '👥' },
    { label: 'Top rated', value: 'top', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#171a21' }}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#c7d5e0' }}>
            steamGamePicker
          </h1>
          <p className="text-lg" style={{ color: '#8f98a0' }}>
            Discover hidden gems in your Steam library
          </p>
        </div>

        {/* Input Section */}
        <div className="rounded-sm p-8 mb-8" style={{ background: '#1b2838' }}>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeLibrary()}
              placeholder="Enter your Steam username"
              className="flex-1 px-6 py-4 rounded-sm outline-none transition-all"
              style={{
                background: '#2a475e',
                color: '#c7d5e0',
                border: '1px solid #1b2838'
              }}
              onFocus={(e) => e.target.style.border = '1px solid #66c0f4'}
              onBlur={(e) => e.target.style.border = '1px solid #1b2838'}
              disabled={loading}
            />
            <button
              onClick={analyzeLibrary}
              disabled={loading}
              className="px-8 py-4 font-semibold rounded-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed steam-button"
              style={{ color: '#fff' }}
            >
              {loading ? 'Analyzing...' : 'Analyze my library'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-sm" style={{ background: 'rgba(194, 45, 0, 0.2)', border: '1px solid #c22d00', color: '#ff6161' }}>
              {error}
            </div>
          )}
        </div>

        {/* Filter Buttons */}
        {games.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#c7d5e0' }}>
              Get a Recommendation
            </h2>
            <div className="flex flex-wrap gap-3">
              {filterButtons.map((button) => (
                <button
                  key={button.value}
                  onClick={() => getRecommendation(button.value)}
                  disabled={loadingRecommendation}
                  className="px-6 py-3 font-medium rounded-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{
                    background: '#2a475e',
                    color: '#c7d5e0',
                    border: '1px solid #1b2838'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#66c0f4';
                    e.currentTarget.style.borderColor = '#66c0f4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#2a475e';
                    e.currentTarget.style.borderColor = '#1b2838';
                  }}
                >
                  <span>{button.icon}</span>
                  <span>{button.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        {loadingRecommendation && (
          <div className="mb-8 text-center">
            <div className="inline-block px-6 py-3 rounded-sm" style={{ background: 'rgba(102, 192, 244, 0.1)', border: '1px solid #66c0f4', color: '#66c0f4' }}>
              Finding the perfect game for you...
            </div>
          </div>
        )}

        {recommendation && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#c7d5e0' }}>
              Recommended for You
            </h2>
            <RecommendationCard {...recommendation} />
          </div>
        )}

        {/* Loading Details Progress Bar */}
        {loadingDetails && games.length > 0 && (
          <div className="mb-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-3 flex justify-between items-center">
                <span
                  className="text-xl font-bold"
                  style={{
                    color: '#66c0f4',
                    textShadow: '0 0 20px rgba(102, 192, 244, 0.8), 0 0 30px rgba(102, 192, 244, 0.4)',
                    letterSpacing: '0.5px'
                  }}
                >
                  {loadingMessage}
                </span>
                <span className="text-sm font-medium" style={{ color: '#8f98a0' }}>
                  {games.filter(g => g.details).length} / {games.length}
                </span>
              </div>
              <div
                className="w-full rounded-sm overflow-hidden"
                style={{
                  background: '#1b2838',
                  height: '8px',
                  border: '1px solid #2a475e'
                }}
              >
                <div
                  className="h-full transition-all duration-300 ease-out"
                  style={{
                    width: `${(games.filter(g => g.details).length / games.length) * 100}%`,
                    background: 'linear-gradient(90deg, #66c0f4 0%, #417a9b 100%)',
                    boxShadow: '0 0 10px rgba(102, 192, 244, 0.5)'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Games List */}
        {games.length > 0 && (
          <GameList games={games} />
        )}
      </div>
    </div>
  );
}
