import { useState, useEffect, useRef, useMemo } from 'react';
import { CATEGORIES, CATEGORY_EMOJIS, suggestEmojis, searchEmojis, getAllEmojis } from '../utils/emojiData';

export default function IconPicker({ value, onChange, appName }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('suggested');
  const gridRef = useRef(null);
  const searchRef = useRef(null);

  const suggestions = useMemo(() => suggestEmojis(appName), [appName]);
  const hasSuggestions = suggestions.length > 0;

  useEffect(() => {
    if (hasSuggestions) {
      setActiveCategory('suggested');
    } else if (activeCategory === 'suggested') {
      setActiveCategory('all');
    }
  }, [hasSuggestions]);

  const displayEmojis = useMemo(() => {
    if (search.trim()) {
      return searchEmojis(search);
    }
    if (activeCategory === 'suggested') {
      return hasSuggestions ? suggestions : getAllEmojis();
    }
    if (activeCategory === 'all') {
      return getAllEmojis();
    }
    return CATEGORY_EMOJIS[activeCategory] || [];
  }, [search, activeCategory, suggestions, hasSuggestions]);

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = 0;
    }
  }, [activeCategory, search]);

  const categoryKeys = Object.keys(CATEGORIES).filter(
    k => k !== 'suggested' || hasSuggestions
  );

  return (
    <div className="icon-picker">
      <div className="icon-picker-search">
        <span className="icon-picker-search-icon">🔍</span>
        <input
          ref={searchRef}
          type="text"
          className="icon-picker-input"
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className="icon-picker-clear"
            onClick={() => { setSearch(''); searchRef.current?.focus(); }}
          >
            ✕
          </button>
        )}
      </div>

      {!search && (
        <div className="icon-picker-categories">
          {categoryKeys.map((key) => (
            <button
              key={key}
              type="button"
              className={`icon-picker-cat ${activeCategory === key ? 'active' : ''}`}
              onClick={() => setActiveCategory(key)}
              title={CATEGORIES[key].label}
            >
              <span className="icon-picker-cat-icon">{CATEGORIES[key].icon}</span>
              <span className="icon-picker-cat-label">{CATEGORIES[key].label}</span>
            </button>
          ))}
        </div>
      )}

      {search && displayEmojis.length === 0 && (
        <div className="icon-picker-empty">
          No icons match "{search}"
        </div>
      )}

      <div className="icon-picker-grid" ref={gridRef}>
        {displayEmojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className={`icon-picker-item ${value === emoji ? 'selected' : ''}`}
            onClick={() => onChange(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>

      {hasSuggestions && activeCategory === 'suggested' && !search && (
        <div className="icon-picker-hint">
          Suggested based on "{appName}"
        </div>
      )}
    </div>
  );
}
