// Basic Express server for Spotify clone backend
// This file provides the basic structure and can be used once Node.js/npm are available

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Spotify Clone Backend Server is running!',
        status: 'active',
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Spotify API proxy endpoints (to avoid CORS issues)
app.post('/api/spotify/token', async (req, res) => {
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', req.body, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': req.headers.authorization
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Token exchange error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data || { error: 'internal_server_error' }
        });
    }
});

// Proxy for Spotify Web API calls
app.all('/api/spotify/*', async (req, res) => {
    try {
        const spotifyUrl = req.url.replace('/api/spotify', 'https://api.spotify.com/v1');
        
        const response = await axios({
            method: req.method,
            url: spotifyUrl,
            headers: {
                'Authorization': req.headers.authorization,
                'Content-Type': req.headers['content-type'] || 'application/json'
            },
            data: req.body,
            params: req.query
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data || { error: 'api_error' }
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        path: req.originalUrl 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Spotify Clone Backend Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
