import elsaImage from '../assets/elsa_1.webp';

const ELSA_BIOGRAPHY = `Nacida en Colombia 
(Bucaramanga), Elsa Carvajal es mejor conocida bajo el 
nombre de su proyecto musical, Elsa y Elmar. Graduada de 
Berklee College of Music, su estilo musical diferente que 
fusiona el Synth Pop, Folk e Indie, la ha llevado a ser un nombre 
respetado en un nicho pop/indie que crece a diario. A lo largo de su
 carrera ha ganado el premio de composición en el concurso John Lennon 
 Songwriting (2014), le ha abierto el concierto a Coldplay en Bogotá (2016)
  y en 2019 fue nominada a los Grammy como "Mejor Nuevo Artista". Además,
   ha colaborado con importantes personalidades de la industria como Francisca 
   Valenzuela, Elliot Moss, Little Jesus y Jesús Navarro, entre muchos otros. Desde el lanzamiento de su EP debut Sentirnos bien en 2013 y su álbum debut Rey en 2015, ha estado girando por todo el continente americano, incluyendo países como Colombia, Estados Unidos y México, teniendo presentaciones en festivales internacionales como Pal Norte, Vive Latino, Estéreo Picnic, entre otros.`;

export default function ArtistHeader() {
    return (
        <div className="artist-header" style={{ backgroundImage: `url(${elsaImage})` }}>
            <div className="artist-overlay">
                <img src={elsaImage} alt="Elsa y Elmar" className="artist-photo" />
                <div className="artist-info">
                    <p className="biography">{ELSA_BIOGRAPHY}</p>
                </div>
            </div>
        </div>
    );
}
