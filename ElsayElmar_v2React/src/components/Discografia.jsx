import { useState, useEffect } from 'react';
import { spotifyAPI } from '../services/spotifyAPI';

export default function Discografia({ artistId }) {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    useEffect(() => {
        if (!artistId) {
            setError('No se ha proporcionado un ID de artista');
            setLoading(false);
            return;
        }

        spotifyAPI.getAlbums(artistId)
            .then(data => {
                console.log('📀 Respuesta albums:', data);
                if (data && data.success && data.albums && data.albums.length > 0) {
                    setAlbums(data.albums);
                    setError(null);
                } else if (data && data.success && Array.isArray(data.albums)) {
                    setAlbums(data.albums);
                    setError(null);
                } else {
                    setError(data?.error || 'No se pudieron obtener los álbumes');
                }
            })
            .catch(err => {
                console.error('❌ Error en getAlbums:', err);
                setError(err.message || 'Error de conexión con la API');
            })
            .finally(() => setLoading(false));
    }, [artistId]);

    if (loading) return <div className="loading">Cargando discografía...</div>;
    if (error) return <div className="error">❌ {error}</div>;
    if (albums.length === 0) return <div className="empty">No hay álbumes disponibles</div>;

    return (
        <section className="discografia">
            <h2>📀 Discografía ({albums.length} álbumes)</h2>

            <div className="albums-grid">
                {albums.map(album => (
                    <div
                        key={album.id}
                        className="album-card"
                        onClick={() => setSelectedAlbum(album)}
                        style={{ cursor: 'pointer' }}
                    >
                        <img src={album.image} alt={album.name} />
                        <div className="album-overlay">
                            <h3>{album.name}</h3>
                            <p className="year">{new Date(album.releaseDate).getFullYear()}</p>
                            <p className="tracks">📀 {album.totalTracks} canciones</p>
                        </div>
                    </div>
                ))}
            </div>

            {selectedAlbum && (
                <div className="modal" onClick={() => setSelectedAlbum(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedAlbum(null)}>✕</button>
                        <img src={selectedAlbum.image} alt={selectedAlbum.name} />
                        <h3>{selectedAlbum.name}</h3>
                        <p className="modal-date">{new Date(selectedAlbum.releaseDate).toLocaleDateString('es-ES')}</p>
                        <p className="modal-tracks">{selectedAlbum.totalTracks} canciones</p>
                        {selectedAlbum.externalUrl && (
                            <a href={selectedAlbum.externalUrl} target="_blank" rel="noopener noreferrer" className="spotify-link">
                                Ver en Spotify
                            </a>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
