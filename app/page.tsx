'use client';

import { useState } from 'react';
import GameList from '@/components/GameList';
import RecommendationCard from '@/components/RecommendationCard';

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

interface Recommendation {
  title: string;
  appid: number;
  genres: string[];
  score: number | null;
  icon: string;
  playtime: number;
  description: string;
}

export default function Home() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

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

      // Step 4: Fetch details for games (limit to 300 to balance between showing more games and API rate limits)
      const gamesToFetch = lowPlaytimeGames.slice(0, 300);
      const gamesWithDetails = await Promise.all(
        gamesToFetch.map(async (game: Game) => {
          try {
            const detailsRes = await fetch(`/api/steam/details?appid=${game.appid}`);
            if (detailsRes.ok) {
              const details = await detailsRes.json();
              return { ...game, details };
            }
          } catch (err) {
            console.error(`Failed to fetch details for ${game.appid}`);
          }
          return game;
        })
      );

      setGames(gamesWithDetails);
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
      const res = await fetch(`/api/steam/recommend?vanity=${encodeURIComponent(username)}&filter=${filter}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get recommendation');
      }

      setRecommendation(data);
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

        {/* Games List */}
        {games.length > 0 && (
          <GameList games={games} />
        )}
      </div>
    </div>
  );
}
