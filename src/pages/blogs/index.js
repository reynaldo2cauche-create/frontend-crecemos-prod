// Este archivo exporta todos los componentes de blogs
// Para agregar un nuevo blog, solo importa y exporta aquí

// Blogs de Nutrición
import CushuroBlog from './nutricion/CushuroBlog';
import QuinuaBlog from './nutricion/QuinuaBlog';
import Omega3Blog from './nutricion/Omega3Blog';
import TumboBlog from './nutricion/TumboBlog';
import ChocloBlog from './nutricion/ChocloBlog';
import EsparragoBlog from './nutricion/EsparragoBlog';
import NuezBlog from './nutricion/NuezBlog';
import PaltaBlog from './nutricion/PaltaBlog';
import PecanaBlog from './nutricion/PecanaBlog';
import AguaCocoBlog from './nutricion/AguaCocoBlog';
import ArandanosBlog from './nutricion/ArandanosBlog';
import CamoteBlog from './nutricion/CamoteBlog';
import CerezasBlog from './nutricion/CerezasBlog';
import GaseosasBlog from './nutricion/GaseosasBlog';
import GolosinasBlog from './nutricion/GolosinasBlog';
import LentejasBebeBlog from './nutricion/LentejasBebeBlog';
import NaranjaJugoBlog from './nutricion/NaranjaJugoBlog';
import PasasBlog from './nutricion/PasasBlog';
import PistachosBlog from './nutricion/PistachosBlog';
// Blogs de Desarrollo Infantil
// import EjemploBlog from './desarrollo-infantil/EjemploBlog';

// Blogs de Psicología
import ViolenciaDomesticaBlog from './psicologia/ViolenciaDomesticaBlog';
import Dia25NoviembreBlog from './psicologia/Dia25NoviembreBlog';
import TCABlog from './psicologia/TCABlog';
import PatronesCrianzaBlog from './psicologia/PatronesCrianzaBlog';
import DiaDepresionBlog from './psicologia/DiaDepresionBlog';
import SemanaTCABlog from './psicologia/SemanaTCABlog';

// Blogs de Efemérides
import DiaDiscapacidadBlog from './efemerides/DiaDiscapacidadBlog';
import DiaDerechosHumanosBlog from './efemerides/DiaDerechosHumanosBlog';
import DiaMujerBlog from './efemerides/DiaMujerBlog';
import DiaSindromeDownBlog from './efemerides/DiaSindromeDownBlog';

// Blogs de Terapias
import TerapiaLenguajeBlog from './terapias/TerapiaLenguajeBlog';
import EstimulacionPrenatalLenguajeBlog from './terapias/EstimulacionPrenatalLenguajeBlog';
import TartamudezInfantilBlog from './terapias/TartamudezInfantilBlog';
import VacacionesTerapiaBlog from './terapias/VacacionesTerapiaBlog';

// Blogs de Familia
// import EjemploBlog from './familia/EjemploBlog';

// Blogs de Educación
// import EjemploBlog from './educacion/EjemploBlog';

// Mapa de slug a componente
export const blogComponents = {
  'cushuro-superalimento-peruano-ninos-neurodivergentes': CushuroBlog,
  'quinua-superalimento-peruano-ninos-neurodivergentes': QuinuaBlog,
  'violencia-domestica-adultos-mayores-historia-muchas-capas': ViolenciaDomesticaBlog,
  'alimentos-omega-3-ninos-neurodivergentes': Omega3Blog,
  '25-noviembre-dia-eliminacion-violencia-mujer': Dia25NoviembreBlog,
  'tumbo-fruta-andina-ninos-neurodivergentes': TumboBlog,
  '30-noviembre-trastornos-conducta-alimentaria': TCABlog,
  '3-diciembre-dia-internacional-personas-discapacidad': DiaDiscapacidadBlog,
  '10-diciembre-dia-derechos-humanos': DiaDerechosHumanosBlog,
  'choclo-alimento-natural-energetico-ninos-neurodivergentes': ChocloBlog,
  'esparrago-alimento-nutritivo-ninos-neurodivergentes': EsparragoBlog,
  'nuez-alimento-nutritivo-ninos-neurodivergentes': NuezBlog,
  'palta-alimento-suave-nutritivo-ninos-neurodivergentes': PaltaBlog,
  'pecana-fruto-seco-nutritivo-ninos-neurodivergentes': PecanaBlog,
  'agua-coco-bebida-natural-hidratante-ninos': AguaCocoBlog,
  'arandanos-fruta-antioxidantes-ninos': ArandanosBlog,
  'camote-alimento-energetico-nutritivo-ninos': CamoteBlog,
  'cerezas-fruta-antioxidantes-ninos': CerezasBlog,
  'gaseosas-por-que-evitar-consumo-ninos': GaseosasBlog,
  'golosinas-por-que-evitar-consumo-ninos': GolosinasBlog,
  'lentejas-bebe-fuente-vegetal-hierro-ninos': LentejasBebeBlog,
  'naranja-jugo-fruta-vitamina-c-ninos': NaranjaJugoBlog,
  'pasas-alimento-energetico-moderacion-ninos': PasasBlog,
  'pistachos-fruto-seco-seguro-ninos': PistachosBlog,
  'patrones-crianza-romper-circulo': PatronesCrianzaBlog,
  '13-enero-dia-mundial-lucha-depresion': DiaDepresionBlog,
  'semana-concienciacion-tca-2026': SemanaTCABlog,
  'mi-hijo-necesita-terapia-lenguaje-senales-tempranas': TerapiaLenguajeBlog,
  'estimulacion-lenguaje-embarazo-desarrollo-infantil': EstimulacionPrenatalLenguajeBlog,
  'tartamudez-infantil-etapa-o-preocupacion': TartamudezInfantilBlog,
  'vacaciones-mejor-momento-evaluar-terapia-lenguaje': VacacionesTerapiaBlog,
  '8-marzo-dia-internacional-mujer-salud-mental': DiaMujerBlog,
  '21-marzo-dia-mundial-sindrome-down': DiaSindromeDownBlog,

  // Agrega más blogs aquí...
  // 'slug-del-blog': ComponenteBlog,
};

// Exportar componentes individuales si los necesitas
export {
  CushuroBlog,
  QuinuaBlog,
  ViolenciaDomesticaBlog,
  Omega3Blog,
  Dia25NoviembreBlog,
  TumboBlog,
  TCABlog,
  DiaDiscapacidadBlog,
  DiaDerechosHumanosBlog,
  DiaMujerBlog,
  DiaSindromeDownBlog,
  PatronesCrianzaBlog,
  DiaDepresionBlog,
  SemanaTCABlog,
  TerapiaLenguajeBlog,
  EstimulacionPrenatalLenguajeBlog,
  TartamudezInfantilBlog,
  VacacionesTerapiaBlog,
};
