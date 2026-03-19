import colab1 from '../assets/colab1.webp';
import ojosNoche from '../assets/ojos_noche.webp';
import littleJesus from '../assets/LittleJesus_Sarinana_ElsaElmar.jpg';
import elsaCan from '../assets/elsaCan.jpeg';

// Galería local de imágenes
const LOCAL_GALLERY = [
    {
        id: 'collab_1',
        name: 'Colaboración Especial',
        image: colab1,
        description: '✨ Momentos de colaboración artística con Bruses'
    },
    {
        id: 'eyes_night',
        name: 'Ojos de la Noche',
        image: ojosNoche,
        description: '👁️ Colaboración increible para el sencillo "Ojos de la Noche" ft Carla Morrison'
    },
    {
        id: 'little_jesus',
        name: 'Con Little Jesus',
        image: littleJesus,
        description: '🎤 Invitada especial para el sencillo "TQM" acompañada de Ximena Sariñana y la banda Little Jesus'
    },
    {
        id: 'elsa_live',
        name: 'Elsa en Concierto',
        image: elsaCan,
        description: '🎸 Presentación en vivo'
    }
];

export default function FotoGaleria() {
    return (
        <section className="galeria">
            <h2>📸 Galería de Fotos</h2>

            {/* GALERÍA CON CARDS */}
            <div className="gallery-grid">
                {LOCAL_GALLERY.map((photo, index) => (
                    <div
                        key={photo.id}
                        className="gallery-item"
                        style={{
                            animationDelay: `${index * 0.1}s`
                        }}
                    >
                        <img src={photo.image} alt={photo.name} />
                        <div className="gallery-overlay">
                            <div className="photo-info">
                                <p className="photo-name">{photo.name}</p>
                                <p className="photo-description">{photo.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
