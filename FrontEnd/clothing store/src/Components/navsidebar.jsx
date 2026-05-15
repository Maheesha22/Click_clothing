import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./navsidebar.css";

const MAX_RECENT_SEARCHES = 7;
const API_BASE_URL = 'http://localhost:3000/api/search';

// Helper to transform API product to card-ready format
const stringToHexColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  let color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - color.length) + color;
};

const colorHexMap = {
  red: "#FF0000", blue: "#0000FF", black: "#000000",
  white: "#FFFFFF", green: "#00FF00", yellow: "#FFFF00",
  gray: "#808080", navy: "#000080", brown: "#8B4513",
  pink: "#FFC0CB", orange: "#FFA500", purple: "#800080",
  beige: "#F5F5DC", khaki: "#F0E68C", maroon: "#800000",
};

const transformProduct = (apiProduct) => {
  const variants = apiProduct.variants || [];
  const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
  const colorArray = colors.map(c => colorHexMap[c.toLowerCase()] || stringToHexColor(c));
  const firstImage = variants.find(v => v.imageUrl)?.imageUrl || "/placeholder.jpg";
  const colorImagesMap = {};
  colorArray.forEach((hex, idx) => {
    const colorVariants = variants.filter(v => v.color === colors[idx]);
    const imgs = colorVariants.map(v => v.imageUrl).filter(Boolean);
    colorImagesMap[hex] = imgs.length > 0 ? imgs : [firstImage];
  });
  const totalQty = variants.reduce((s, v) => s + (v.quantity || 0), 0);
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    description: apiProduct.description,
    img: firstImage,
    basePrice: parseFloat(apiProduct.price),
    sizes,
    colors: colorArray,
    colorNames: Object.fromEntries(colorArray.map((hex, i) => [hex, colors[i]])),
    colorImages: colorImagesMap,
    inStock: totalQty > 0,
    variants,
  };
};

function NavBar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);

  // New state for the two new tabs
  const [activeSearchTab, setActiveSearchTab] = useState(null); // 'current' | 'recent' | null
  const [currentSearchProducts, setCurrentSearchProducts] = useState([]);
  const [currentSearchLoading, setCurrentSearchLoading] = useState(false);
  const [currentSearchCategory, setCurrentSearchCategory] = useState(null); // { id, name }
  const [recentSearchDetails, setRecentSearchDetails] = useState([]); // [{query, categoryId, categoryName}]
  const [panelVisible, setPanelVisible] = useState(false);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const blurTimeoutRef = useRef(null);
  const panelRef = useRef(null);

  // Load recent searches from database
  useEffect(() => {
    fetch("http://localhost:3000/api/search-history")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setRecentSearches(data.data);
        }
      })
      .catch(err => console.error("Failed to load recent searches", err));
  }, []);

  // Fetch categories from backend
  useEffect(() => {
    fetch("http://localhost:3000/api/products/categories/all")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      })
      .catch(err => console.error("Failed to load categories:", err));
  }, []);

  //  Build navigation tabs – category menu items go to ProductPage with categoryId
  const navTabs = useMemo(() => [
    { label: "New Arrivals", hash: "new-arrivals" },
    { label: "Best Sellers", hash: "best-sellers" },
    {
      label: "Men",
      menu: categories.map(cat => {
        return {
          label: cat.name,
          page: `category/${cat.id}`,   //  navigates with categoryId: /category/1, /category/2, etc.
          categoryId: cat.id
        };
      })
    },
    { label: "Men Accessories", page: "category/10" },
  ], [categories]);

  const allCategories = useMemo(() => {
    const labels = [];
    navTabs.forEach(tab => {
      labels.push(tab.label);
      if (tab.menu) tab.menu.forEach(item => { labels.push(item.label); });
    });
    return [...new Set(labels)];
  }, [navTabs]);

  // Update suggestions based on search query 
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const lowerQuery = searchQuery.toLowerCase();
      const filteredCats = allCategories.filter(cat => cat.toLowerCase().includes(lowerQuery));
      const categorySuggestions = filteredCats.map(catLabel => {
        const matchedCategory = categories.find(c => c.name === catLabel);
        return { type: 'category', label: catLabel, categoryId: matchedCategory?.id, page: matchedCategory ? `category/${matchedCategory.id}` : null };
      });
      fetch(`${API_BASE_URL}?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            const productSuggestions = data.data.map(product => ({
              type: 'product', label: product.productName, categoryId: product.categoryId,
              categoryName: product.categoryName, productId: product.productId,
              price: product.price, imageUrl: product.variants?.[0]?.imageUrl
            }));
            setSuggestions([...categorySuggestions, ...productSuggestions].slice(0, 8));
            setShowDropdown(true);
          } else {
            setSuggestions(categorySuggestions.slice(0, 8));
            setShowDropdown(true);
          }
        })
        .catch(() => { setSuggestions(categorySuggestions.slice(0, 8)); setShowDropdown(true); });
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, allCategories, categories]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => { if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current); };
  }, []);

  const addToRecentSearches = (query) => {
    if (!query.trim()) return;
    const trimmed = query.trim();
    fetch("http://localhost:3000/api/search-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: trimmed })
    }).catch(err => console.error("Failed to save search history:", err));
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== trimmed);
      return [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    });
  };

  const navigateToTab = (tab) => {
    if (setActiveTab) setActiveTab(tab.label);
    if (tab.hash) {
      if (location.pathname === '/') {
        const element = document.getElementById(tab.hash);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(`/#${tab.hash}`);
      }
    } else if (tab.page) {
      navigate(`/${tab.page}`);
    }
  };

  const handleTabClick = (tab) => { navigateToTab(tab); };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      const matchedTab = navTabs.find(t => t.label.toLowerCase() === query.toLowerCase());
      if (matchedTab && (matchedTab.page || matchedTab.hash)) {
        if (setActiveTab) setActiveTab(matchedTab.label);
        addToRecentSearches(matchedTab.label);
        navigateToTab(matchedTab);
        setSearchQuery(""); setShowDropdown(false); return;
      }
      const matchedCategory = categories.find(c => c.name.toLowerCase() === query.toLowerCase());
      if (matchedCategory) {
        addToRecentSearches(matchedCategory.name);
        navigate(`/category/${matchedCategory.id}`);
        setSearchQuery(""); setShowDropdown(false); return;
      }
      const menuItem = navTabs.find(t => t.menu)?.menu.find(m => m.label.toLowerCase() === query.toLowerCase());
      if (menuItem?.page) {
        addToRecentSearches(menuItem.label);
        navigate(`/${menuItem.page}`);
        setSearchQuery(""); setShowDropdown(false); return;
      }
      addToRecentSearches(query);
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setSearchQuery(""); setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'product') {
      addToRecentSearches(suggestion.label);
      navigate(`/category/${suggestion.categoryId}`);
      setSearchQuery(""); setShowDropdown(false); return;
    }
    if (suggestion.type === 'category' && suggestion.categoryId) {
      addToRecentSearches(suggestion.label);
      navigate(`/category/${suggestion.categoryId}`);
      setSearchQuery(""); setShowDropdown(false); return;
    }
    const matchedTab = navTabs.find(t => t.label === suggestion.label);
    if (matchedTab && (matchedTab.page || matchedTab.hash)) {
      addToRecentSearches(suggestion.label);
      navigateToTab(matchedTab);
      setSearchQuery(""); setShowDropdown(false); return;
    }
    addToRecentSearches(suggestion.label);
    navigate(`/search?q=${encodeURIComponent(suggestion.label)}`);
    setSearchQuery(""); setShowDropdown(false);
  };

  const handleRecentClick = (recentQuery) => {
    const matchedCategory = categories.find(c => c.name.toLowerCase() === recentQuery.toLowerCase());
    if (matchedCategory) {
      addToRecentSearches(matchedCategory.name);
      navigate(`/category/${matchedCategory.id}`);
      setSearchQuery(""); setShowDropdown(false); return;
    }
    const matchedTab = navTabs.find(t => t.label === recentQuery);
    if (matchedTab && (matchedTab.page || matchedTab.hash)) {
      navigateToTab(matchedTab); setSearchQuery(""); setShowDropdown(false); return;
    }
    navigate(`/search?q=${encodeURIComponent(recentQuery)}`);
    setSearchQuery(""); setShowDropdown(false);
  };

  const handleClearRecent = () => {
    fetch("http://localhost:3000/api/search-history", { method: "DELETE" })
      .catch(err => console.error("Failed to clear search history:", err));
    setRecentSearches([]);
    setShowDropdown(false);
  };

  const handleInputFocus = () => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    if (searchQuery.trim() === "" && recentSearches.length > 0) setShowDropdown(true);
    else if (searchQuery.trim() !== "" && suggestions.length > 0) setShowDropdown(true);
  };

  const handleInputBlur = () => {
    blurTimeoutRef.current = setTimeout(() => { setShowDropdown(false); }, 150);
  };

  const handleSearchTabClick = (tab) => {
    setActiveSearchTab(prev => prev === tab ? null : tab);
  };

  const handleRecentItemClick = (item) => {
    if (item.categoryId) {
      navigate(`/category/${item.categoryId}`);
      addToRecentSearches(item.query);
      setActiveSearchTab(null);
    } else {
      navigate(`/search?q=${encodeURIComponent(item.query)}`);
      setActiveSearchTab(null);
    }
  };

  const handleCurrentProductClick = (product) => {
    if (currentSearchCategory) {
      navigate(`/category/${currentSearchCategory.id}`);
      setActiveSearchTab(null);
    }
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
              {tab.label}{tab.menu && " ▾"}
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
                          <div className="navbar-sub-item" key={subItem}>{subItem}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* ── NEW: Current Search Tab ── */}
        <div className="navbar-tab-item search-tab-item">
          <button
            className={`navbar-tab-btn search-tab-btn ${activeSearchTab === 'current' ? "active" : ""}`}
            onClick={() => handleSearchTabClick('current')}
            title="Show current search results"
          >
            🔍 Current Search
          </button>
        </div>

        {/* ── NEW: Recent Searches Tab ── */}
        <div className="navbar-tab-item search-tab-item">
          <button
            className={`navbar-tab-btn search-tab-btn ${activeSearchTab === 'recent' ? "active" : ""}`}
            onClick={() => handleSearchTabClick('recent')}
            title="Show recent searches"
          >
            🕒 Recent Searches
          </button>
        </div>
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
                  <button type="button" className="navbar-clear-recent" onMouseDown={(e) => { e.preventDefault(); handleClearRecent(); }}>
                    Clear
                  </button>
                </div>
                {recentSearches.map((query, idx) => (
                  <div key={idx} className="navbar-suggestion-item" onMouseDown={(e) => { e.preventDefault(); handleRecentClick(query); }}>
                    <span className="recent-icon">🕒</span> {query}
                  </div>
                ))}
              </>
            )}
            {showFilteredSuggestions && (
              <>
                {suggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    className={`navbar-suggestion-item ${sug.type === 'product' ? 'navbar-product-suggestion' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(sug); }}
                  >
                    {sug.type === 'product' ? (
                      <div className="navbar-product-suggestion-content">
                        {sug.imageUrl && <img src={sug.imageUrl} alt={sug.label} className="navbar-product-thumbnail" />}
                        <div className="navbar-product-suggestion-info">
                          <div className="navbar-product-name">{sug.label}</div>
                          <div className="navbar-product-category">{sug.categoryName}</div>
                          <div className="navbar-product-price">Rs. {sug.price}</div>
                        </div>
                      </div>
                    ) : (
                      <span>{sug.label}</span>
                    )}
                  </div>
                ))}
              </>
            )}
            {showNoResults && (
              <div className="navbar-suggestion-item navbar-no-results">No matching categories</div>
            )}
          </div>
        )}
      </div>

      {/* ── SEARCH PANEL (slides down below navbar) ── */}
      {panelVisible && (
        <div className="search-panel-overlay" ref={panelRef}>
          {/* Tab switcher inside panel */}
          <div className="search-panel-tabs">
            <button
              className={`search-panel-tab-btn ${activeSearchTab === 'current' ? 'active' : ''}`}
              onClick={() => setActiveSearchTab('current')}
            >
              🔍 Current Search
            </button>
            <button
              className={`search-panel-tab-btn ${activeSearchTab === 'recent' ? 'active' : ''}`}
              onClick={() => setActiveSearchTab('recent')}
            >
              🕒 Recent Searches
            </button>
            <button className="search-panel-close" onClick={() => setActiveSearchTab(null)}>✕</button>
          </div>

          {/* ── CURRENT SEARCH PANEL ── */}
          {activeSearchTab === 'current' && (
            <div className="search-panel-content">
              {!searchQuery.trim() ? (
                <div className="search-panel-empty">
                  <span>🔍</span>
                  <p>Type something in the search bar to see current results here.</p>
                </div>
              ) : currentSearchLoading ? (
                <div className="search-panel-empty">
                  <p>Loading products...</p>
                </div>
              ) : currentSearchProducts.length === 0 ? (
                <div className="search-panel-empty">
                  <span>😔</span>
                  <p>No products found for "<strong>{searchQuery}</strong>"</p>
                </div>
              ) : (
                <>
                  <div className="search-panel-header">
                    <span>
                      Results for "<strong>{searchQuery}</strong>"
                      {currentSearchCategory && <span className="search-panel-cat-badge"> — {currentSearchCategory.name}</span>}
                    </span>
                    <button
                      className="search-panel-view-all"
                      onClick={() => { navigate(`/category/${currentSearchCategory?.id}`); setActiveSearchTab(null); }}
                    >
                      View All →
                    </button>
                  </div>
                  <div className="search-panel-grid">
                    {currentSearchProducts.slice(0, 8).map(product => {
                      const firstImg = product.img || "/placeholder.jpg";
                      const firstColor = product.colors?.[0];
                      const colorName = product.colorNames?.[firstColor] || "";
                      return (
                        <div
                          key={product.id}
                          className="search-panel-card"
                          onClick={() => handleCurrentProductClick(product)}
                        >
                          <div className="search-panel-card-img">
                            <img src={firstImg} alt={product.name} onError={(e) => (e.target.src = "/placeholder.jpg")} />
                            {!product.inStock && <span className="search-panel-out-badge">Out of Stock</span>}
                          </div>
                          <div className="search-panel-card-body">
                            <p className="search-panel-card-name">{product.name}</p>
                            <p className="search-panel-card-price">Rs. {parseFloat(product.basePrice).toLocaleString()}.00</p>
                            {product.sizes?.length > 0 && (
                              <div className="search-panel-card-sizes">
                                {product.sizes.slice(0, 4).map(s => (
                                  <span key={s} className="search-panel-size-badge">{s}</span>
                                ))}
                                {product.sizes.length > 4 && <span className="search-panel-size-more">+{product.sizes.length - 4}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── RECENT SEARCHES PANEL ── */}
          {activeSearchTab === 'recent' && (
            <div className="search-panel-content">
              {recentSearches.length === 0 ? (
                <div className="search-panel-empty">
                  <span>🕒</span>
                  <p>No recent searches yet. Start searching to see your history here.</p>
                </div>
              ) : (
                <>
                  <div className="search-panel-header">
                    <span>Your Recent Searches</span>
                    <button
                      className="search-panel-clear-btn"
                      onClick={() => {
                        fetch("http://localhost:3000/api/search-history", { method: "DELETE" })
                          .catch(err => console.error(err));
                        setRecentSearches([]);
                        setRecentSearchDetails([]);
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="search-panel-recent-list">
                    {recentSearchDetails.length > 0 ? recentSearchDetails.map((item, idx) => (
                      <div
                        key={idx}
                        className="search-panel-recent-item"
                        onClick={() => handleRecentItemClick(item)}
                      >
                        <div className="search-panel-recent-icon">🕒</div>
                        <div className="search-panel-recent-info">
                          <span className="search-panel-recent-query">{item.query}</span>
                          {item.categoryId && (
                            <span className="search-panel-recent-cat">→ {item.categoryName} category</span>
                          )}
                        </div>
                        <div className="search-panel-recent-arrow">›</div>
                      </div>
                    )) : recentSearches.map((query, idx) => (
                      <div
                        key={idx}
                        className="search-panel-recent-item"
                        onClick={() => handleRecentItemClick({ query, categoryId: null })}
                      >
                        <div className="search-panel-recent-icon">🕒</div>
                        <div className="search-panel-recent-info">
                          <span className="search-panel-recent-query">{query}</span>
                        </div>
                        <div className="search-panel-recent-arrow">›</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NavBar;
