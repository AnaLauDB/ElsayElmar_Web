import { useState, useEffect, useRef } from 'react';
import { spotifyAPI } from '../services/spotifyAPI';

export default function Reproductor({ artistId }) {
    const [tracks, setTracks] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const audioRef = useRef(null);

    useEffect(() => {
        if (!artistId) {
            setError('No se ha proporcionado un ID de artista');
            setLoading(false);
            return;
        }

        // ⏱️ Agregar pausa de 1000ms para evitar spam a Spotify
        const timer = setTimeout(() => {
            spotifyAPI.getTracks(artistId)
                .then(data => {
                    console.log('🎵 Respuesta tracks:', data);
                    if (data && data.success && data.tracks) {
                        // Filtrar solo canciones con preview disponible
                        const tracksWithPreview = data.tracks.filter(t => t.previewUrl);
                        setTracks(tracksWithPreview);
                        if (tracksWithPreview.length === 0) {
                            setError('No hay previsualizaciones disponibles para las canciones');
                        } else {
                            setError(null);
                        }
                    } else {
                        setError(data?.error || 'No se pudieron cargar las canciones');
                    }
                })
                .catch(err => {
                    console.error('❌ Error en getTracks:', err);
                    setError(err.message || 'Error de conexión con la API');
                })
                .finally(() => setLoading(false));
        }, 1500); // ⏰ Espera reducida con cache

        return () => clearTimeout(timer); // Limpiar si se desmonta
    }, [artistId]);

    const handlePlay = (index) => {
        if (currentTrack === index && isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
        } else {
            setCurrentTrack(index);
            setIsPlaying(true);
        }
    };

    const handleNext = () => {
        if (currentTrack < tracks.length - 1) {
            setCurrentTrack(currentTrack + 1);
        }
    };

    const handlePrev = () => {
        if (currentTrack > 0) {
            setCurrentTrack(currentTrack - 1);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || tracks.length === 0) return;

        if (isPlaying && tracks[currentTrack]) {
            audio.src = tracks[currentTrack].previewUrl;
            audio.play().catch(() => { });
        } else {
            audio.pause();
        }
    }, [isPlaying, currentTrack, tracks]);

    if (loading) return <div className="loading">Cargando reproductor...</div>;
    if (error) return <div className="error">❌ {error}</div>;
    if (tracks.length === 0) return <div className="empty">No hay canciones disponibles</div>;

    const track = tracks[currentTrack];

    return (
        <section className="reproductor">
            <h2>🎵 Reproductor de Canciones</h2>

            <div className="player-container">
                <img src={track.albumImage} alt={track.name} className="album-art" />

                <div className="player-info">
                    <h3>{track.name}</h3>
                    <p className="artists">{track.artists}</p>
                    <p className="album-name">📀 {track.album}</p>
                    <p className="duration">⏱️ {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</p>
                </div>

                <audio ref={audioRef} onEnded={handleNext} />

                <div className="player-controls">
                    <button
                        onClick={handlePrev}
                        disabled={currentTrack === 0}
                        className="control-btn"
                        title="Canción anterior"
                    >
                        ⏮️ Anterior
                    </button>
                    <button
                        onClick={() => handlePlay(currentTrack)}
                        className="play-btn"
                        title={isPlaying ? 'Pausar' : 'Reproducir'}
                    >
                        {isPlaying ? '⏸️ Pausar' : '▶️ Reproducir'}
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentTrack === tracks.length - 1}
                        className="control-btn"
                        title="Siguiente canción"
                    >
                        Siguiente ⏭️
                    </button>
                </div>

                <div className="track-counter">
                    {currentTrack + 1} / {tracks.length}
                </div>
            </div>

            <div className="playlist">
                <h3>📋 Playlist ({tracks.length} canciones)</h3>
                <div className="tracks-list">
                    {tracks.map((t, index) => (
                        <div
                            key={t.id}
                            className={`track-item ${currentTrack === index ? 'active' : ''}`}
                            onClick={() => handlePlay(index)}
                            role="button"
                            tabIndex={0}
                        >
                            <span className="track-number">{index + 1}</span>
                            <span className="track-title">{t.name}</span>
                            <span className="track-duration">
                                {Math.floor(t.duration / 60)}:{String(t.duration % 60).padStart(2, '0')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
