import { useState, useEffect } from 'react';
import './App.css';
import ArtistHeader from './components/ArtistHeader';
import Discografia from './components/Discografia';
import Reproductor from './components/Reproductor';
import FotoGaleria from './components/FotoGaleria';
import CarreraTimeline from './components/CarreraTimeline';

/**
 * 🎤 ELSA Y ELMAR - Web Oficial
 * 
 * TODO: Reemplaza 'TU_ID_AQUI' con el ID real de Spotify de Elsa y Elmar
 * 
 * ¿Cómo obtener el ID?
 * 1. Ve a Spotify.com
 * 2. Busca "Elsa y Elmar"
 * 3. Haz clic en su perfil
 * 4. Copia el ID de la URL: https://open.spotify.com/artist/[ID_AQUI]
 * 
 * Más detalles en: COMO_OBTENER_ID.md
 */

// 🎵 CONFIGURE ESTO CON EL ID DE ELSA Y ELMAR
const ARTIST_ID = '5nKGeITSNCVP76muyOlszy';

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [showIDBanner, setShowIDBanner] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (ARTIST_ID === 'TU_ID_AQUI') {
      setShowIDBanner(true);
      setInitialized(false);
    } else {
      setShowIDBanner(false);
      setInitialized(true);
    }
  }, []);

  // Manejar modo oscuro/claro
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
    // Guardar preferencia en localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (!initialized) {
    return (
      <div className="app">
        {showIDBanner && (
          <div className="id-banner">
            <div className="banner-content">
              <h2>🎤 Configuración Requerida</h2>
              <p>
                Para que la aplicación funcione, necesitas agregar el ID de Spotify de Elsa y Elmar.
              </p>
              <ol>
                <li>Abre el archivo <code>src/App.jsx</code></li>
                <li>Busca la línea: <code>const ARTIST_ID = 'TU_ID_AQUI';</code></li>
                <li>Reemplaza <code>TU_ID_AQUI</code> con el ID real de Spotify</li>
                <li>Guarda el archivo (la página se recargará automáticamente)</li>
              </ol>
              <p className="help-text">
                📖 Ver instrucciones completas en <code>COMO_OBTENER_ID.md</code>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <header className="app-header">
        <h1>🎤 ELSA Y ELMAR</h1>
        <p>Descubre la música, historia y carrera de Elsa y Elmar</p>
      </header>

      <main className="app-main">
        <ArtistHeader />
        <div className="container">
          <Discografia artistId={ARTIST_ID} />
          <Reproductor artistId={ARTIST_ID} />
          <FotoGaleria />
          <CarreraTimeline artistId={ARTIST_ID} />
        </div>
      </main>

      <footer className="app-footer">
        <p>
          🎵 Powered by Spotify API •
          © 2026 ElsayElmar •
          <a href="http://localhost:5000/api/health" target="_blank" rel="noopener noreferrer">
            Server Status
          </a>
        </p>
      </footer>
    </div>
  );
}

