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

interface DiscogsReleaseDetail {
  id: number;
  title: string;
  year: number;
  released: string;
  released_formatted: string;
  country: string;
  artists: Array<{
    name: string;
    id: number;
    anv?: string;
    join?: string;
    role?: string;
    tracks?: string;
  }>;
  artists_sort: string;
  labels: Array<{
    name: string;
    catno: string;
    entity_type: string;
    id: number;
  }>;
  formats: Array<{
    name: string;
    qty: string;
    descriptions?: string[];
    text?: string;
  }>;
  genres: string[];
  styles: string[];
  tracklist: Array<{
    position: string;
    type_: string;
    title: string;
    duration: string;
    artists?: Array<{
      name: string;
      id: number;
    }>;
  }>;
  extraartists?: Array<{
    name: string;
    id: number;
    role: string;
    anv?: string;
  }>;
  images: Array<{
    type: string;
    uri: string;
    uri150: string;
    width: number;
    height: number;
  }>;
  thumb: string;
  notes?: string;
  data_quality: string;
  master_id?: number;
  master_url?: string;
  uri: string;
  resource_url: string;
  estimated_weight?: number;
  videos?: Array<{
    uri: string;
    title: string;
    description: string;
    duration: number;
  }>;
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
  const [selectedReleaseDetail, setSelectedReleaseDetail] = useState<DiscogsReleaseDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchReleaseDetail = async (releaseId: number) => {
    setLoadingDetail(true);
    try {
      const response = await axios.get<DiscogsReleaseDetail>(
        `https://api.discogs.com/releases/${releaseId}`,
        {
          /*headers: {
            'User-Agent': 'Waxly/1.0',
          },*/
        }
      );
      setSelectedReleaseDetail(response.data);
    } catch (err: any) {
      console.error('Error fetching release details:', err);
      setError('Failed to fetch release details');
    } finally {
      setLoadingDetail(false);
    }
  };

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
            /*headers: {
              'User-Agent': 'Waxly/1.0',
            },*/
          }
        );

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
                <div
                  key={release.instance_id}
                  className="release-card"
                  onClick={() => fetchReleaseDetail(release.id)}
                >
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

        {selectedReleaseDetail && (
          <div className="modal-overlay" onClick={() => setSelectedReleaseDetail(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedReleaseDetail(null)}>
                ×
              </button>

              {loadingDetail ? (
                <div className="detail-loading">Loading details...</div>
              ) : (
                <div className="detail-container">
                  <div className="detail-header">
                    {selectedReleaseDetail.images && selectedReleaseDetail.images.length > 0 && (
                      <img
                        src={selectedReleaseDetail.images[0].uri}
                        alt={selectedReleaseDetail.title}
                        className="detail-image"
                      />
                    )}
                    <div className="detail-main-info">
                      <h2 className="detail-title">{selectedReleaseDetail.title}</h2>
                      <p className="detail-artist">
                        {selectedReleaseDetail.artists.map((artist) => artist.name).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="detail-sections">
                    {selectedReleaseDetail.tracklist && selectedReleaseDetail.tracklist.length > 0 && (
                      <div className="detail-section">
                        <h3>Tracklist</h3>
                        <div className="tracklist">
                          {selectedReleaseDetail.tracklist.map((track, idx) => (
                            <div key={idx} className="track-item">
                              <span className="track-position">{track.position}</span>
                              <div className="track-info">
                                <span className="track-title">{track.title}</span>
                                {track.duration && <span className="track-duration">{track.duration}</span>}
                                {track.artists && track.artists.length > 0 && (
                                  <span className="track-artists">
                                    {track.artists.map((a) => a.name).join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="detail-section">
                      <h3>Release Information</h3>
                      <div className="detail-info-grid">
                        <div className="info-item">
                          <span className="info-label">Year:</span>
                          <span className="info-value">{selectedReleaseDetail.year || 'Unknown'}</span>
                        </div>
                        {selectedReleaseDetail.released_formatted && (
                          <div className="info-item">
                            <span className="info-label">Released:</span>
                            <span className="info-value">{selectedReleaseDetail.released_formatted}</span>
                          </div>
                        )}
                        <div className="info-item">
                          <span className="info-label">Country:</span>
                          <span className="info-value">{selectedReleaseDetail.country || 'Unknown'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Release ID:</span>
                          <span className="info-value">{selectedReleaseDetail.id}</span>
                        </div>
                        {selectedReleaseDetail.master_id && (
                          <div className="info-item">
                            <span className="info-label">Master ID:</span>
                            <span className="info-value">{selectedReleaseDetail.master_id}</span>
                          </div>
                        )}
                        {selectedReleaseDetail.data_quality && (
                          <div className="info-item">
                            <span className="info-label">Data Quality:</span>
                            <span className="info-value">{selectedReleaseDetail.data_quality}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedReleaseDetail.formats && selectedReleaseDetail.formats.length > 0 && (
                      <div className="detail-section">
                        <h3>Format</h3>
                        {selectedReleaseDetail.formats.map((format, idx) => (
                          <div key={idx} className="format-item">
                            <div className="info-item">
                              <span className="info-label">Type:</span>
                              <span className="info-value">
                                {format.name} {format.qty && `(${format.qty})`}
                              </span>
                            </div>
                            {format.descriptions && format.descriptions.length > 0 && (
                              <div className="info-item">
                                <span className="info-label">Details:</span>
                                <span className="info-value">{format.descriptions.join(', ')}</span>
                              </div>
                            )}
                            {format.text && (
                              <div className="info-item">
                                <span className="info-label">Text:</span>
                                <span className="info-value">{format.text}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedReleaseDetail.labels && selectedReleaseDetail.labels.length > 0 && (
                      <div className="detail-section">
                        <h3>Label & Catalog</h3>
                        {selectedReleaseDetail.labels.map((label, idx) => (
                          <div key={idx} className="info-item">
                            <span className="info-label">{label.name}:</span>
                            <span className="info-value">{label.catno}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedReleaseDetail.extraartists && selectedReleaseDetail.extraartists.length > 0 && (
                      <div className="detail-section">
                        <h3>Credits</h3>
                        <div className="credits-list">
                          {selectedReleaseDetail.extraartists.map((artist, idx) => (
                            <div key={idx} className="credit-item">
                              <span className="credit-name">{artist.name}</span>
                              <span className="credit-role">{artist.role}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedReleaseDetail.genres && selectedReleaseDetail.genres.length > 0 && (
                      <div className="detail-section">
                        <h3>Genres</h3>
                        <div className="tags">
                          {selectedReleaseDetail.genres.map((genre, idx) => (
                            <span key={idx} className="tag">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedReleaseDetail.styles && selectedReleaseDetail.styles.length > 0 && (
                      <div className="detail-section">
                        <h3>Styles</h3>
                        <div className="tags">
                          {selectedReleaseDetail.styles.map((style, idx) => (
                            <span key={idx} className="tag tag-secondary">
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedReleaseDetail.notes && (
                      <div className="detail-section">
                        <h3>Notes</h3>
                        <div className="note-item">{selectedReleaseDetail.notes}</div>
                      </div>
                    )}

                    {selectedReleaseDetail.videos && selectedReleaseDetail.videos.length > 0 && (
                      <div className="detail-section">
                        <h3>Videos</h3>
                        <div className="videos-list">
                          {selectedReleaseDetail.videos.map((video, idx) => (
                            <a
                              key={idx}
                              href={video.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="video-link"
                            >
                              <span className="video-title">{video.title}</span>
                              {video.duration && (
                                <span className="video-duration">
                                  {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                                </span>
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="detail-section">
                      <h3>Links</h3>
                      <div className="detail-links">
                        <a
                          href={`https://www.discogs.com/release/${selectedReleaseDetail.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="detail-link"
                        >
                          View on Discogs →
                        </a>
                        {selectedReleaseDetail.master_id && (
                          <a
                            href={`https://www.discogs.com/master/${selectedReleaseDetail.master_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="detail-link"
                          >
                            View Master Release →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
