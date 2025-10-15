import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// Maximum number of releases to fetch initially (can be more than 100, will make multiple API calls)
const INITIAL_FETCH_LIMIT = 200;
const API_MAX_PER_PAGE = 100; // Discogs API maximum per page

interface DiscogsRelease {
  id: number;
  instance_id: number;
  basic_information: {
    id: number;
    title: string;
    year: number;
    artists: Array<{
      name: string;
      id: number;
    }>;
    formats: Array<{
      name: string;
      qty: string;
    }>;
    thumb: string;
    cover_image: string;
  };
}

interface DiscogsResponse {
  pagination: {
    page: number;
    pages: number;
    items: number;
    per_page: number;
  };
  releases: DiscogsRelease[];
}

const App: React.FC = () => {
  const [username, setUsername] = useState('');
  const [releases, setReleases] = useState<DiscogsRelease[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCollection = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError('');
    setReleases([]);

    try {
      // Calculate how many pages we need to fetch
      const perPage = API_MAX_PER_PAGE;
      const pagesToFetch = Math.ceil(INITIAL_FETCH_LIMIT / perPage);

      let allReleases: DiscogsRelease[] = [];
      let totalItems = 0;

      // Fetch multiple pages if needed
      for (let page = 1; page <= pagesToFetch; page++) {
        const response = await axios.get<DiscogsResponse>(
          `https://api.discogs.com/users/${username}/collection/folders/0/releases`,
          {
            params: {
              page,
              per_page: perPage,
              sort: 'artist',
              sort_order: 'asc',
            },
            headers: {
              'User-Agent': 'Waxly/1.0',
            },
          }
        );

        console.log(response.data.releases);

        allReleases = [...allReleases, ...response.data.releases];
        totalItems = response.data.pagination.items;

        // Stop if we've fetched all available releases or reached our limit
        if (allReleases.length >= INITIAL_FETCH_LIMIT ||
            allReleases.length >= totalItems) {
          break;
        }

        // Add a small delay between requests to avoid rate limiting
        if (page < pagesToFetch) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Trim to exact limit if we fetched more
      const limitedReleases = allReleases.slice(0, INITIAL_FETCH_LIMIT);

      setReleases(limitedReleases);
      setTotalItems(totalItems);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('User not found');
      } else if (err.response?.status === 429) {
        setError('Rate limit exceeded. Please try again later.');
      } else {
        setError('Failed to fetch collection. Please try again.');
      }
      console.error('Error fetching collection:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Waxly</h1>
        <p className="subtitle">Your Discogs Collection Manager</p>
      </header>
      <main className="app-main">
        <div className="search-box">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Discogs username..."
            onKeyPress={(e) => e.key === 'Enter' && fetchCollection()}
          />
          <button onClick={fetchCollection} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch Collection'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {releases.length > 0 && (
          <div className="releases-container">
            <h2>
              Collection (showing {releases.length} of {totalItems} releases)
            </h2>
            <div className="releases-grid">
              {releases.map((release) => (
                <div key={release.instance_id} className="release-card">
                  <img
                    src={release.basic_information.thumb}
                    alt={release.basic_information.title}
                    className="release-image"
                  />
                  <div className="release-info">
                    <h3 className="release-title">
                      {release.basic_information.title}
                    </h3>
                    <p className="release-artist">
                      {release.basic_information.artists
                        .map((artist) => artist.name)
                        .join(', ')}
                    </p>
                    <div className="release-details">
                      <span className="release-year">
                        {release.basic_information.year || 'N/A'}
                      </span>
                      {release.basic_information.formats.length > 0 && (
                        <span className="release-format">
                          {release.basic_information.formats[0].name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
