
const express = require('express');
const router = express.Router();
const searchHistoryCtrl = require('../controllers/searchHistoryController');

// GET /api/search-history -> Get recent 7 searches
router.get('/', searchHistoryCtrl.getRecentSearches);

// POST /api/search-history -> Add a new search query
router.post('/', searchHistoryCtrl.addSearchHistory);

// DELETE /api/search-history -> Clear search history
router.delete('/', searchHistoryCtrl.clearRecentSearches);

module.exports = router;
