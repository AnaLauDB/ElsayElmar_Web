import { useState, useEffect } from 'react';
import { spotifyAPI } from '../services/spotifyAPI';

// Galería local de imágenes personalizadas
const LOCAL_GALLERY = [
    {
        id: 'local_1',
        name: 'El Palacio',
        image: '/src/assets/palacio.jpeg',
        description: '🏛️ Inspiración arquitectónica',
        category: 'Artística'
    },
    {
        id: 'local_2',
        name: 'Diamante',
        image: '/src/assets/diamante.jpeg',
        description: '💎 Brillo y elegancia',
        category: 'Simbólico'
    },
    {
        id: 'local_3',
        name: 'Ojos de la Noche',
        image: '/src/assets/ojos_noche.webp',
        description: '👁️ Mirada penetrante',
        category: 'Poético'
    },
    {
        id: 'local_4',
        name: 'Rey',
        image: '/src/assets/rey.jpeg',
        description: '👑 Poder y soberanía',
        category: 'Realeza'
    },
    {
        id: 'local_5',
        name: 'Sentir nos Bien',
        image: '/src/assets/sentirnos_bien.jpg',
        description: '💫 Emoción pura',
        category: 'Emocional'
    },
    {
        id: 'local_6',
        name: 'Elsa en Vivo',
        image: '/src/assets/elsaCan.jpeg',
        description: '🎤 Momento en vivo',
        category: 'Concierto'
    },
];

export default function FotoGaleria({ artistId }) {
    const [albums, setAlbums] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        if (!artistId) {
            setError('No se ha proporcionado un ID de artista');
            setLoading(false);
            return;
        }

        spotifyAPI.getAlbums(artistId)
            .then(data => {
                if (data.success) {
                    setAlbums(data.albums);
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [artistId]);

    if (loading) return <div className="loading">Cargando galería...</div>;
    if (error) return <div className="error">❌ {error}</div>;

    // Combinar galerías local y de Spotify
    const allPhotos = [
        ...LOCAL_GALLERY,
        ...albums.map((album, index) => ({
            id: `spotify_${album.id}`,
            name: album.name,
            image: album.image,
            description: `📅 ${new Date(album.releaseDate).getFullYear()}`,
            category: 'Álbum',
            externalUrl: album.externalUrl,
        }))
    ];

    // Filtrar por categoría
    const filteredPhotos = activeFilter === 'all'
        ? allPhotos
        : allPhotos.filter(photo => photo.category === activeFilter);

    const categories = ['all', ...new Set(allPhotos.map(p => p.category))];

    return (
        <section className="galeria">
            <h2>📸 Galería de Fotos</h2>

            {/* FILTROS POR CATEGORÍA */}
            <div className="gallery-filters">
                {categories.map(category => (
                    <button
                        key={category}
                        className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
                        onClick={() => setActiveFilter(category)}
                    >
                        {category === 'all' ? '🎨 Todo' : category}
                    </button>
                ))}
            </div>

            {/* GALERÍA CON ANIMACIÓN */}
            <div className="gallery-grid">
                {filteredPhotos.map((photo, index) => (
                    <div
                        key={photo.id}
                        className="gallery-item"
                        onClick={() => setSelectedPhoto(photo)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') setSelectedPhoto(photo);
                        }}
                        style={{
                            animationDelay: `${index * 0.1}s`
                        }}
                    >
                        <img src={photo.image} alt={photo.name} />
                        <div className="gallery-overlay">
                            <div className="photo-info">
                                <p className="photo-name">{photo.name}</p>
                                <p className="photo-category">{photo.category}</p>
                                <p className="photo-description">{photo.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL DE FOTO AMPLIADA */}
            {selectedPhoto && (
                <div className="photo-modal" onClick={() => setSelectedPhoto(null)}>
                    <div className="photo-content" onClick={e => e.stopPropagation()}>
                        <button
                            className="close-btn"
                            onClick={() => setSelectedPhoto(null)}
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>
                        <img src={selectedPhoto.image} alt={selectedPhoto.name} />
                        <div className="photo-details">
                            <h3>{selectedPhoto.name}</h3>
                            <p className="photo-category-badge">{selectedPhoto.category}</p>
                            <p className="photo-description">{selectedPhoto.description}</p>
                            {selectedPhoto.externalUrl && (
                                <a
                                    href={selectedPhoto.externalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="spotify-link"
                                >
                                    Ver en Spotify
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
