// 📚 SERVICIO API - Spotify
// Centraliza todas las llamadas a tu servidor backend

const API_URL = 'http://localhost:5000/api';

export const spotifyAPI = {
    // Obtener información del artista
    getArtist: async (artistId) => {
        const response = await fetch(`${API_URL}/artist/${artistId}`);
        return response.json();
    },

    // Obtener álbumes
    getAlbums: async (artistId) => {
        const response = await fetch(`${API_URL}/artist/${artistId}/albums`);
        return response.json();
    },

    // Obtener canciones del artista
    getTracks: async (artistId) => {
        const response = await fetch(`${API_URL}/artist/${artistId}/tracks`);
        return response.json();
    },

    // Obtener canciones de un álbum específico
    getAlbumTracks: async (albumId) => {
        const response = await fetch(`${API_URL}/album/${albumId}/tracks`);
        return response.json();
    },

    // Obtener recomendaciones
    getRecommendations: async (artistId) => {
        const response = await fetch(`${API_URL}/artist/${artistId}/recommendations`);
        return response.json();
    },

    // Buscar artista
    searchArtist: async (query) => {
        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}&tipo=artist`);
        return response.json();
    },

    // Health check
    healthCheck: async () => {
        const response = await fetch(`${API_URL}/health`);
        return response.json();
    },
};
