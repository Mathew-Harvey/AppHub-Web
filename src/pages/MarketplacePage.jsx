import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [sort, setSort] = useState('popular');
  const [searchInput, setSearchInput] = useState('');

  const loadApps = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 24, sort };
      if (search) params.search = search;
      if (activeCategory) params.category = activeCategory;
      const data = await api.listMarketplace(params);
      setApps(p === 1 ? data.apps : prev => [...prev, ...data.apps]);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(p);
    } catch (err) {
      console.error('Marketplace load error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory, sort]);

  useEffect(() => {
    api.getMarketplaceCategories().then(data => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    loadApps(1);
  }, [loadApps]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  function handleCategoryClick(catName) {
    setActiveCategory(prev => prev === catName ? '' : catName);
  }

  return (
    <div className="marketplace-page">
      <div className="marketplace-header">
        <div className="marketplace-header-text">
          <h1>Marketplace</h1>
          <p className="subtitle">Discover and add apps shared by the community</p>
        </div>
      </div>

      <div className="marketplace-controls">
        <div className="marketplace-search-wrap">
          <svg className="marketplace-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="7" cy="7" r="5" />
            <line x1="11" y1="11" x2="14.5" y2="14.5" />
          </svg>
          <input
            className="input marketplace-search"
            type="text"
            placeholder="Search apps..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </div>

        <select
          className="input marketplace-sort"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="popular">Most Popular</option>
          <option value="newest">Newest</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      <div className="marketplace-categories">
        <button
          className={`marketplace-category-pill ${activeCategory === '' ? 'active' : ''}`}
          onClick={() => setActiveCategory('')}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`marketplace-category-pill ${activeCategory === cat.name ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat.name)}
          >
            <span>{cat.icon}</span> {cat.name}
          </button>
        ))}
      </div>

      {loading && apps.length === 0 ? (
        <div className="marketplace-loading">
          <div className="spinner" />
        </div>
      ) : apps.length === 0 ? (
        <div className="marketplace-empty">
          <div className="marketplace-empty-icon">🏪</div>
          <h3>No apps found</h3>
          <p className="text-muted">
            {search || activeCategory
              ? 'Try adjusting your search or filters'
              : 'No public apps are available yet. Be the first to publish!'}
          </p>
        </div>
      ) : (
        <>
          <div className="marketplace-count">
            <span className="text-muted">{total} app{total !== 1 ? 's' : ''} available</span>
          </div>
          <div className="marketplace-grid">
            {apps.map(app => (
              <button
                key={app.id}
                className="marketplace-card"
                onClick={() => navigate(`/marketplace/${app.id}`)}
              >
                <div className="marketplace-card-icon">{app.icon}</div>
                <div className="marketplace-card-body">
                  <h3 className="marketplace-card-name">{app.name}</h3>
                  <p className="marketplace-card-desc">{app.description || 'No description'}</p>
                </div>
                <div className="marketplace-card-footer">
                  <span className="marketplace-card-publisher">{app.publisherName}</span>
                  <span className="marketplace-card-installs">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M8 2v8M4 7l4 4 4-4" />
                      <line x1="2" y1="14" x2="14" y2="14" />
                    </svg>
                    {app.installCount}
                  </span>
                </div>
                {app.marketplaceCategory && (
                  <span className="marketplace-card-category">{app.marketplaceCategory}</span>
                )}
              </button>
            ))}
          </div>

          {page < totalPages && (
            <div className="marketplace-load-more">
              <button
                className="btn btn-secondary"
                onClick={() => loadApps(page + 1)}
                disabled={loading}
              >
                {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
