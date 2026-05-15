import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./navsidebar.css";

const MAX_RECENT_SEARCHES = 7;
const STORAGE_KEY = "navbar_recent_searches";
const API_BASE_URL = 'http://localhost:3000/api/search';

function NavBar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const blurTimeoutRef = useRef(null);

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
        } else {
          console.error("Invalid categories response", data);
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
    //{ label: "Recently Viewed", page: "recently-viewed" },
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

      // Filter categories and include their IDs
      const filteredCats = allCategories.filter(cat =>
        cat.toLowerCase().includes(lowerQuery)
      );

      // Build category suggestions with their category IDs
      const categorySuggestions = filteredCats.map(catLabel => {
        // Find the matching category from the categories list to get the ID
        const matchedCategory = categories.find(c => c.name === catLabel);
        return {
          type: 'category',
          label: catLabel,
          categoryId: matchedCategory?.id,
          page: matchedCategory ? `category/${matchedCategory.id}` : null
        };
      });

      // Then fetch products from backend API
      fetch(`${API_BASE_URL}?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            // Transform API results to include product info
            const productSuggestions = data.data.map(product => ({
              type: 'product',
              label: product.productName,
              categoryId: product.categoryId,
              categoryName: product.categoryName,
              productId: product.productId,
              price: product.price,
              imageUrl: product.variants?.[0]?.imageUrl
            }));

            const combined = [...categorySuggestions, ...productSuggestions].slice(0, 8);
            setSuggestions(combined);
            setShowDropdown(true);
          } else {
            setSuggestions(categorySuggestions.slice(0, 8));
            setShowDropdown(true);
          }
        })
        .catch(err => {
          console.error('Error fetching search suggestions:', err);
          setSuggestions(categorySuggestions.slice(0, 8));
          setShowDropdown(true);
        });
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, allCategories, categories]);

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

    // Save to database
    fetch("http://localhost:3000/api/search-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: trimmed })
    }).catch(err => console.error("Failed to save search history:", err));

    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== trimmed);
      const updated = [trimmed, ...filtered];
      return updated.slice(0, MAX_RECENT_SEARCHES);
    });
  };

  const navigateToTab = (tab) => {
    if (setActiveTab) setActiveTab(tab.label);
    if (tab.hash) {
      if (location.pathname === '/') {
        const element = document.getElementById(tab.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(`/#${tab.hash}`);
      }
    } else if (tab.page) {
      navigate(`/${tab.page}`);
    }
  };

  const handleTabClick = (tab) => {
    navigateToTab(tab);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim();

      // Check if search query matches a category
      const matchedTab = navTabs.find(t => t.label.toLowerCase() === query.toLowerCase());
      if (matchedTab && (matchedTab.page || matchedTab.hash)) {
        if (setActiveTab) setActiveTab(matchedTab.label);
        addToRecentSearches(matchedTab.label);
        navigateToTab(matchedTab);
        setSearchQuery("");
        setShowDropdown(false);
        return;
      }

      // Check if it matches a category directly from the database
      const matchedCategory = categories.find(c => c.name.toLowerCase() === query.toLowerCase());
      if (matchedCategory) {
        addToRecentSearches(matchedCategory.name);
        navigate(`/category/${matchedCategory.id}`);
        setSearchQuery("");
        setShowDropdown(false);
        return;
      }

      // Check if it's a category in a menu
      const menuItem = navTabs.find(t => t.menu)?.menu.find(m => m.label.toLowerCase() === query.toLowerCase());
      if (menuItem && menuItem.page) {
        addToRecentSearches(menuItem.label);
        navigate(`/${menuItem.page}`);
        setSearchQuery("");
        setShowDropdown(false);
        return;
      }

      // Otherwise, do a product search
      addToRecentSearches(query);
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setSearchQuery("");
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // Handle product type - navigate to category page
    if (suggestion.type === 'product') {
      addToRecentSearches(suggestion.label);
      navigate(`/category/${suggestion.categoryId}`);
      setSearchQuery("");
      setShowDropdown(false);
      return;
    }

    // Check if it matched a category from database (which populates suggestion.categoryId for category types)
    if (suggestion.type === 'category' && suggestion.categoryId) {
      addToRecentSearches(suggestion.label);
      navigate(`/category/${suggestion.categoryId}`);
      setSearchQuery("");
      setShowDropdown(false);
      return;
    }

    // Handle category type - find the matching category in navTabs
    const matchedTab = navTabs.find(t => t.label === suggestion.label);
    if (matchedTab && (matchedTab.page || matchedTab.hash)) {
      addToRecentSearches(suggestion.label);
      navigateToTab(matchedTab);
      setSearchQuery("");
      setShowDropdown(false);
      return;
    }

    // Check if it's a category in a menu (like categories under "Men")
    const menuItem = navTabs.find(t => t.menu)?.menu.find(m => m.label === suggestion.label);
    if (menuItem && menuItem.page) {
      addToRecentSearches(suggestion.label);
      navigate(`/${menuItem.page}`);
      setSearchQuery("");
      setShowDropdown(false);
      return;
    }

    // If not a category, treat as general search
    addToRecentSearches(suggestion.label);
    navigate(`/search?q=${encodeURIComponent(suggestion.label)}`);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleRecentClick = (recentQuery) => {
    // Check if recent search is a category from database
    const matchedCategory = categories.find(c => c.name.toLowerCase() === recentQuery.toLowerCase());
    if (matchedCategory) {
      addToRecentSearches(matchedCategory.name);
      navigate(`/category/${matchedCategory.id}`);
      setSearchQuery("");
      setShowDropdown(false);
      return;
    }

    // Check if recent search is a category in navTabs
    const matchedTab = navTabs.find(t => t.label === recentQuery);
    if (matchedTab && (matchedTab.page || matchedTab.hash)) {
      navigateToTab(matchedTab);
      setSearchQuery("");
      setShowDropdown(false);
      return;
    }

    // Check if it's a category in a menu
    const menuItem = navTabs.find(t => t.menu)?.menu.find(m => m.label === recentQuery);
    if (menuItem && menuItem.page) {
      navigate(`/${menuItem.page}`);
      setSearchQuery("");
      setShowDropdown(false);
      return;
    }

    // If not a category, do a product search
    navigate(`/search?q=${encodeURIComponent(recentQuery)}`);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleClearRecent = () => {
    fetch("http://localhost:3000/api/search-history", {
      method: "DELETE"
    }).catch(err => console.error("Failed to clear search history:", err));

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
                        {sug.imageUrl && (
                          <img src={sug.imageUrl} alt={sug.label} className="navbar-product-thumbnail" />
                        )}
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
