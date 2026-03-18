import { useState, useEffect } from 'react';
import { spotifyAPI } from '../services/spotifyAPI';

export default function CarreraTimeline({ artistId }) {
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!artistId) {
            setError('No se ha proporcionado un ID de artista');
            setLoading(false);
            return;
        }

        spotifyAPI.getAlbums(artistId)
            .then(data => {
                if (data.success) {
                    // Agrupar por años
                    const byYear = {};
                    data.albums.forEach(album => {
                        const year = new Date(album.releaseDate).getFullYear();
                        if (!byYear[year]) byYear[year] = [];
                        byYear[year].push(album);
                    });

                    // Convertir a array ordenado
                    const sorted = Object.entries(byYear)
                        .sort(([yearA], [yearB]) => parseInt(yearA) - parseInt(yearB))
                        .map(([year, albums]) => ({
                            year,
                            albums: albums.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))
                        }));

                    setTimeline(sorted);
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [artistId]);

    if (loading) return <div className="loading">Cargando timeline...</div>;
    if (error) return <div className="error">❌ {error}</div>;
    if (timeline.length === 0) return <div className="empty">No hay información de timeline</div>;

    return (
        <section className="timeline">
            <h2>📅 Timeline de Carrera</h2>

            <div className="timeline-container">
                {timeline.map((item, index) => (
                    <div key={item.year} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
                        <div className="timeline-dot"></div>

                        <div className="timeline-content">
                            <h3 className="timeline-year">{item.year}</h3>
                            <div className="albums-in-year">
                                {item.albums.map(album => (
                                    <div key={album.id} className="album-in-timeline">
                                        <strong className="album-name">{album.name}</strong>
                                        <p className="album-info">
                                            📀 {album.totalTracks} canción{album.totalTracks !== 1 ? 'es' : ''}
                                            • {new Date(album.releaseDate).toLocaleDateString('es-ES', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="timeline-summary">
                <p>🎤 {timeline.length} años de trayectoria musical</p>
                <p>💿 {timeline.reduce((sum, item) => sum + item.albums.length, 0)} álbumes / trabajos</p>
            </div>
        </section>
    );
}
