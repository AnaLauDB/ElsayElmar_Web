import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Cache simple
const cache = new Map();
const CACHE_DURATION = 3600000;

function getFromCache(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
}

function saveToCache(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
}

// Variables globales
let access_token = null;
let token_expiry = null;

// Get Spotify token
async function getSpotifyToken() {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!client_id || !client_secret) {
        throw new Error('Faltan credenciales');
    }

    try {
        const auth = Buffer.from(client_id + ':' + client_secret).toString('base64');
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            'grant_type=client_credentials',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + auth,
                },
            }
        );

        access_token = response.data.access_token;
        token_expiry = Date.now() + (response.data.expires_in * 1000);
        console.log('✅ Token obtenido');
        return access_token;
    } catch (error) {
        console.error('Error token:', error.message);
        throw error;
    }
}

// Check if token is expired
function isTokenExpired() {
    return !access_token || Date.now() >= token_expiry;
}

// Request helper
async function spotifyRequest(endpoint) {
    if (isTokenExpired()) {
        await getSpotifyToken();
    }

    const response = await axios.get('https://api.spotify.com/v1' + endpoint, {
        headers: {
            'Authorization': 'Bearer ' + access_token,
        },
    });

    return response.data;
}

// Routes
app.get('/api/health', async (req, res) => {
    try {
        if (isTokenExpired()) {
            await getSpotifyToken();
        }
        res.json({ success: true, message: 'OK', spotify: 'Conectado' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/artist/:artistId', async (req, res) => {
    try {
        const artistId = req.params.artistId;
        const data = await spotifyRequest('/artists/' + artistId);
        res.json({
            success: true,
            data: {
                id: data.id,
                name: data.name,
                genres: data.genres || [],
                followers: data.followers ? data.followers.total : 0,
                image: (data.images && data.images[0]) ? data.images[0].url : '',
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/artist/:artistId/albums', async (req, res) => {
    try {
        const artistId = req.params.artistId;
        const cacheKey = 'albums_' + artistId;
        
        const cached = getFromCache(cacheKey);
        if (cached) {
            return res.json({ success: true, albums: cached });
        }

        const data = await spotifyRequest('/artists/' + artistId + '/albums?limit=50');

        const albums = data.items.map(function(album) {
            return {
                id: album.id,
                name: album.name,
                releaseDate: album.release_date,
                totalTracks: album.total_tracks,
                image: (album.images && album.images[0]) ? album.images[0].url : '',
                externalUrl: (album.external_urls) ? album.external_urls.spotify : '',
            };
        });

        saveToCache(cacheKey, albums);
        res.json({ success: true, albums: albums });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/artist/:artistId/tracks', async (req, res) => {
    try {
        const artistId = req.params.artistId;
        const cacheKey = 'tracks_' + artistId;
        
        const cached = getFromCache(cacheKey);
        if (cached) {
            return res.json({ success: true, tracks: cached });
        }

        const data = await spotifyRequest('/artists/' + artistId + '/top_tracks?market=US');

        const tracks = data.tracks.map(function(track) {
            return {
                id: track.id,
                name: track.name,
                artists: track.artists.map(function(a) { return a.name; }).join(', '),
                album: track.album.name,
                duration: Math.floor(track.duration_ms / 1000),
                previewUrl: track.preview_url,
                albumImage: (track.album.images && track.album.images[0]) ? track.album.images[0].url : '',
            };
        });

        saveToCache(cacheKey, tracks);
        res.json({ success: true, tracks: tracks });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.json({ message: 'Spotify API Server', version: '2.0' });
});

// Start
app.listen(PORT, function() {
    console.log('\n🚀 Servidor en http://localhost:' + PORT);
    console.log('📍 Health: http://localhost:' + PORT + '/api/health\n');
});
