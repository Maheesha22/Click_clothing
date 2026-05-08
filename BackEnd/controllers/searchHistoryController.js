
const fs = require('fs');
const path = require('path');

// File path for storing search history
const historyFilePath = path.join(__dirname, '../searchHistory.json');

// Initialize JSON file if it doesn't exist
const initFile = () => {
    if (!fs.existsSync(historyFilePath)) {
        fs.writeFileSync(historyFilePath, JSON.stringify([]));
    }
};

initFile();

// Helper to read history
const readHistory = () => {
    try {
        const data = fs.readFileSync(historyFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading history file:", error);
        return [];
    }
};

// Helper to write history
const writeHistory = (data) => {
    try {
        fs.writeFileSync(historyFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing history file:", error);
    }
};

exports.addSearchHistory = async (req, res) => {
    const { query } = req.body;
    
    if (!query || !query.trim()) {
        return res.status(400).json({ success: false, message: 'Query is required' });
    }

    try {
        const trimmedQuery = query.trim();
        let history = readHistory();
        
        // Remove existing occurrence to place it at the top
        history = history.filter(item => item !== trimmedQuery);
        
        // Add to the beginning
        history.unshift(trimmedQuery);
        
        // Keep only recent 7
        history = history.slice(0, 7);
        
        // Save back
        writeHistory(history);

        return res.status(200).json({ success: true, message: 'Search history saved' });
    } catch (error) {
        console.error("Error saving search history:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

exports.getRecentSearches = async (req, res) => {
    try {
        const history = readHistory();
        return res.status(200).json({ success: true, data: history });
    } catch (error) {
        console.error("Error getting search history:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

exports.clearRecentSearches = async (req, res) => {
    try {
        writeHistory([]);
        return res.status(200).json({ success: true, message: 'Search history cleared' });
    } catch (error) {
        console.error("Error clearing search history:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
