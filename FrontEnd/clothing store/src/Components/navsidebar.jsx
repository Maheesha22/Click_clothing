import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./navsidebar.css";

const MAX_RECENT_SEARCHES = 5;
const STORAGE_KEY = "navbar_recent_searches";

function NavBar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const blurTimeoutRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
        }
      } catch (e) {
        console.error("Failed to load recent searches", e);
      }
    }
  }, []);

  // Save recent searches
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Fetch categories from backend
  useEffect(() => {
    fetch("http://localhost:3000/api/products/categories/all")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          console.error("Invalid categories response", data);
        }
      })
      .catch(err => console.error("Failed to load categories:", err));
  }, []);

  // ✅ Build navigation tabs – category menu items go to ProductPage with categoryId
  const navTabs = useMemo(() => [
    { label: "New Arrivals", page: "new-arrivals" },
    { label: "Best Sellers", page: "best-sellers" },
    { 
      label: "Men", 
      menu: categories.map(cat => {
        return { 
          label: cat.name, 
          page: `category/${cat.id}`,   // ✅ navigates with categoryId: /category/1, /category/2, etc.
          categoryId: cat.id
        };
      })
    },
    { label: "Men Accessories", page: "men-accessories" },
    { label: "Recently Viewed", page: "recently-viewed" },
  ], [categories]);

  // Flatten all category labels for search suggestions (search works with both tab labels and menu items)
  const allCategories = useMemo(() => {
    const labels = [];
    navTabs.forEach(tab => {
      labels.push(tab.label);
      if (tab.menu) {
        tab.menu.forEach(item => {
          labels.push(item.label);
          if (item.sub) item.sub.forEach(sub => labels.push(sub));
        });
      }
    });
    return [...new Set(labels)];
  }, [navTabs]);

  // Update suggestions based on search query
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = allCategories.filter(cat =>
        cat.toLowerCase().includes(lowerQuery)
      );
      setSuggestions(filtered.slice(0, 8));
      setShowDropdown(true);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, allCategories]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  const addToRecentSearches = (query) => {
    if (!query.trim()) return;
    const trimmed = query.trim();
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== trimmed);
      const updated = [trimmed, ...filtered];
      return updated.slice(0, MAX_RECENT_SEARCHES);
    });
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab.label);
    if (tab.page) navigate(`/${tab.page}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      addToRecentSearches(query);
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setSearchQuery("");
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const matchedTab = navTabs.find(t => t.label === suggestion);
    if (matchedTab && matchedTab.page) {
      setActiveTab(matchedTab.label);
      navigate(`/${matchedTab.page}`);
      addToRecentSearches(suggestion);
    } else {
      const menuItem = navTabs.find(t => t.menu)?.menu.find(m => m.label === suggestion);
      if (menuItem && menuItem.page) {
        navigate(`/${menuItem.page}`);
        addToRecentSearches(suggestion);
      } else {
        addToRecentSearches(suggestion);
        navigate(`/search?q=${encodeURIComponent(suggestion)}`);
      }
    }
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleRecentClick = (recentQuery) => {
    addToRecentSearches(recentQuery);
    navigate(`/search?q=${encodeURIComponent(recentQuery)}`);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    setShowDropdown(false);
  };

  const handleInputFocus = () => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    if (searchQuery.trim() === "" && recentSearches.length > 0) {
      setShowDropdown(true);
    } else if (searchQuery.trim() !== "" && suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  const showRecent = searchQuery.trim() === "" && recentSearches.length > 0;
  const showFilteredSuggestions = searchQuery.trim() !== "" && suggestions.length > 0;
  const showNoResults = searchQuery.trim() !== "" && suggestions.length === 0;

  return (
    <div className="navbar-container">
      <div className="navbar-tabs">
        {navTabs.map((tab) => (
          <div className="navbar-tab-item" key={tab.label}>
            <button
              className={`navbar-tab-btn ${activeTab === tab.label ? "active" : ""}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab.label}
              {tab.menu && " ▾"}
            </button>

            {tab.menu && (
              <div className="navbar-dropdown">
                {tab.menu.map((item) => (
                  <div
                    className={`navbar-dropdown-item ${item.page ? "navbar-dropdown-nav" : ""}`}
                    key={item.label}
                    onClick={() => item.page && navigate(`/${item.page}`)}
                  >
                    {item.label}
                    {item.sub && <span className="navbar-dropdown-arrow">▶</span>}
                    {item.sub && (
                      <div className="navbar-sub-dropdown">
                        {item.sub.map((subItem) => (
                          <div className="navbar-sub-item" key={subItem}>
                            {subItem}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="navbar-search-wrapper" ref={searchRef}>
        <form className="navbar-search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            autoComplete="off"
          />
          <button type="submit" className="navbar-search-icon" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="10.5" cy="10.5" r="7.5" />
              <path d="M15.5 15.5L21 21" />
            </svg>
          </button>
        </form>

        {showDropdown && (
          <div className="navbar-suggestions" ref={dropdownRef}>
            {showRecent && (
              <>
                <div className="navbar-suggestions-header">
                  <span>Recently searched</span>
                  <button type="button" className="navbar-clear-recent" onClick={handleClearRecent}>
                    Clear
                  </button>
                </div>
                {recentSearches.map((query, idx) => (
                  <div key={idx} className="navbar-suggestion-item" onClick={() => handleRecentClick(query)}>
                    <span className="recent-icon">🕒</span> {query}
                  </div>
                ))}
              </>
            )}

            {showFilteredSuggestions && (
              <>
                {suggestions.map((sug, idx) => (
                  <div key={idx} className="navbar-suggestion-item" onClick={() => handleSuggestionClick(sug)}>
                    {sug}
                  </div>
                ))}
              </>
            )}

            {showNoResults && (
              <div className="navbar-suggestion-item navbar-no-results">
                No matching categories
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default NavBar;
