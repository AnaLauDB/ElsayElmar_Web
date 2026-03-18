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

// Variables globales para token
let access_token = null;
let token_expiry = null;

// ===== FUNCIONES DE AUTENTICACIÓN =====
async function getSpotifyToken() {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!client_id || !client_secret) {
        throw new Error('Falta SPOTIFY_CLIENT_ID o SPOTIFY_CLIENT_SECRET en el archivo .env');
    }

    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            'grant_type=client_credentials',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
                },
            }
        );

        access_token = response.data.access_token;
        token_expiry = Date.now() + response.data.expires_in * 1000;
        console.log('✅ Token de Spotify obtenido correctamente');
        return access_token;
    } catch (error) {
        console.error('❌ Error al obtener token:', error.message);
        throw error;
    }
}

// Verificar si token está expirado
function isTokenExpired() {
    return !access_token || Date.now() >= token_expiry;
}

// ===== FUNCIÓN PRINCIPAL DE REQUESTS =====
async function spotifyRequest(endpoint) {
    try {
        // Si no hay token o está expirado, obtener uno nuevo
        if (isTokenExpired()) {
            await getSpotifyToken();
        }

        const response = await axios.get(`https://api.spotify.com/v1${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
            },
        });

        return response.data;
    } catch (error) {
        // Si recibimos 401, el token expiró, obtener uno nuevo e intentar de nuevo
        if (error.response?.status === 401) {
            console.log('🔄 Token expirado, renovando...');
            await getSpotifyToken();
            return spotifyRequest(endpoint); // Reintentar con nuevo token
        }
        throw error;
    }
}

// ===== RUTAS DE API =====

// 1️⃣ GET /api/artist/:artistId - Información del artista
app.get('/api/artist/:artistId', async (req, res) => {
    try {
        const { artistId } = req.params;
        const data = await spotifyRequest(`/artists/${artistId}`);

        res.json({
            success: true,
            data: {
                id: data.id,
                name: data.name,
                genres: data.genres,
                followers: data.followers.total,
                popularity: data.popularity,
                image: data.images[0]?.url || 'https://via.placeholder.com/300',
                externalUrl: data.external_urls.spotify,
            }
        });
    } catch (error) {
        console.error('Error en /artist:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2️⃣ GET /api/artist/:artistId/albums - Álbumes del artista
app.get('/api/artist/:artistId/albums', async (req, res) => {
    try {
        const { artistId } = req.params;
        const data = await spotifyRequest(`/artists/${artistId}/albums?limit=50`);

        const albums = data.items.map(album => ({
            id: album.id,
            name: album.name,
            releaseDate: album.release_date,
            totalTracks: album.total_tracks,
            image: album.images[0]?.url || 'https://via.placeholder.com/200',
            externalUrl: album.external_urls.spotify,
        }));

        res.json({ success: true, albums });
    } catch (error) {
        console.error('Error en /albums:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3️⃣ GET /api/artist/:artistId/tracks - Canciones del artista
app.get('/api/artist/:artistId/tracks', async (req, res) => {
    try {
        const { artistId } = req.params;
        const data = await spotifyRequest(`/artists/${artistId}/top_tracks?market=US`);

        const tracks = data.tracks.map(track => ({
            id: track.id,
            name: track.name,
            artists: track.artists.map(a => a.name).join(', '),
            album: track.album.name,
            duration: Math.floor(track.duration_ms / 1000),
            popularity: track.popularity,
            previewUrl: track.preview_url,
            albumImage: track.album.images[0]?.url || 'https://via.placeholder.com/200',
            externalUrl: track.external_urls.spotify,
        }));

        res.json({ success: true, tracks });
    } catch (error) {
        console.error('Error en /tracks:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4️⃣ GET /api/album/:albumId/tracks - Canciones de un álbum
app.get('/api/album/:albumId/tracks', async (req, res) => {
    try {
        const { albumId } = req.params;
        const data = await spotifyRequest(`/albums/${albumId}/tracks`);

        const tracks = data.items.map(track => ({
            id: track.id,
            name: track.name,
            artists: track.artists.map(a => a.name).join(', '),
            duration: Math.floor(track.duration_ms / 1000),
            previewUrl: track.preview_url,
            externalUrl: track.external_urls.spotify,
        }));

        res.json({ success: true, tracks });
    } catch (error) {
        console.error('Error en /album/tracks:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5️⃣ GET /api/artist/:artistId/recommendations - Recomendaciones
app.get('/api/artist/:artistId/recommendations', async (req, res) => {
    try {
        const { artistId } = req.params;
        const data = await spotifyRequest(`/recommendations?seed_artists=${artistId}&limit=20`);

        const tracks = data.tracks.map(track => ({
            id: track.id,
            name: track.name,
            artists: track.artists.map(a => a.name).join(', '),
            album: track.album.name,
            image: track.album.images[0]?.url || 'https://via.placeholder.com/200',
            externalUrl: track.external_urls.spotify,
        }));

        res.json({ success: true, tracks });
    } catch (error) {
        console.error('Error en /recommendations:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 6️⃣ GET /api/search - Buscar artista
app.get('/api/search', async (req, res) => {
    try {
        const { q, tipo = 'artist' } = req.query;

        if (!q) {
            return res.status(400).json({ success: false, error: 'Parámetro q requerido' });
        }

        const data = await spotifyRequest(`/search?q=${encodeURIComponent(q)}&type=${tipo}&limit=10`);

        if (tipo === 'artist') {
            const artists = data.artists.items.map(artist => ({
                id: artist.id,
                name: artist.name,
                image: artist.images[0]?.url || 'https://via.placeholder.com/200',
                genres: artist.genres,
            }));
            res.json({ success: true, artists });
        } else {
            res.json({ success: true, data: data[`${tipo}s`].items });
        }
    } catch (error) {
        console.error('Error en /search:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 7️⃣ GET /api/health - Verificar estado del servidor
app.get('/api/health', async (req, res) => {
    try {
        await getSpotifyToken();
        res.json({
            success: true,
            message: 'Servidor funcionando correctamente',
            spotify: 'Conectado',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error de conexión',
            error: error.message,
        });
    }
});

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: '🎵 Servidor Spotify API - Elsa y Elmar',
        version: '1.0',
        endpoints: [
            'GET /api/health',
            'GET /api/artist/:artistId',
            'GET /api/artist/:artistId/albums',
            'GET /api/artist/:artistId/tracks',
            'GET /api/album/:albumId/tracks',
            'GET /api/artist/:artistId/recommendations',
            'GET /api/search?q={query}&tipo={artist|track|album}',
        ]
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor Spotify corriendo en http://localhost:${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health\n`);
});
