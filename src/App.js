import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './App.css';

// --- SVG Icon Components ---
const SunIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

function App() {
  const [searchInput, setSearchInput] = useState('');
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('light');

  const profileRef = useRef(null);
  const reposRef = useRef(null);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const fetchUserData = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setLoading(true);
    setError('');
    setUser(null);
    setRepos([]);

    try {
      const userRes = await fetch(`https://api.github.com/users/${searchInput}`);
      if (!userRes.ok) {
        if (userRes.status === 404) throw new Error('GitHub user not found.');
        throw new Error('Something went wrong fetching the user.');
      }
      const userData = await userRes.json();

      const reposRes = await fetch(
        `https://api.github.com/users/${searchInput}/repos?sort=updated&per_page=5`
      );
      const reposData = await reposRes.json();

      setUser(userData);
      setRepos(reposData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      gsap.fromTo(
        profileRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );

      if (repos.length > 0) {
        gsap.fromTo(
          '.repo-item',
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
        );
      }
    }
  }, [user, repos]);

  return (
    <div className={`app-wrapper ${theme}`}>
      <div className="app-container">
        <header className="header">
          <div className="header-top">
            <h1>GitHub Profile Finder</h1>
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
              {theme === 'light' ? (
                <><MoonIcon /> Dark</>
              ) : (
                <><SunIcon /> Light</>
              )}
            </button>
          </div>
          <form onSubmit={fetchUserData} className="search-form">
            <input
              type="text"
              placeholder="Search GitHub username..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        </header>

        <main className="main-content">
          {loading && <div className="status-message loading">Searching for user...</div>}
          {error && <div className="status-message error">{error}</div>}
          {!loading && !error && !user && (
            <div className="status-message empty">Search for a user to see their profile.</div>
          )}

          {user && (
            <div className="profile-container">
              <div className="user-card" ref={profileRef}>
                <img src={user.avatar_url} alt={`${user.login} avatar`} className="avatar" />
                <div className="user-info">
                  <h2>{user.name || user.login}</h2>
                  <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="username-link">
                    @{user.login}
                  </a>
                  {user.bio && <p className="bio">{user.bio}</p>}
                  
                  <div className="stats-grid">
                    <div className="stat-box">
                      <span className="stat-value">{user.public_repos}</span>
                      <span className="stat-label">Repos</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-value">{user.followers}</span>
                      <span className="stat-label">Followers</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-value">{user.following}</span>
                      <span className="stat-label">Following</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="repos-container" ref={reposRef}>
                <h3>Recently Updated Repositories</h3>
                {repos.length === 0 ? (
                  <p className="no-repos">This user has no public repositories.</p>
                ) : (
                  <ul className="repo-list">
                    {repos.map((repo) => (
                      <li key={repo.id} className="repo-item">
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="repo-name">
                          {repo.name}
                        </a>
                        {repo.description && <p className="repo-desc">{repo.description}</p>}
                        {repo.language && <span className="repo-lang">{repo.language}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;