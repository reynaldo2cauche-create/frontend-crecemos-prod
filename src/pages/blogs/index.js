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
// Blogs de Desarrollo Infantil
// import EjemploBlog from './desarrollo-infantil/EjemploBlog';

// Blogs de Psicología
import ViolenciaDomesticaBlog from './psicologia/ViolenciaDomesticaBlog';
import Dia25NoviembreBlog from './psicologia/Dia25NoviembreBlog';
import TCABlog from './psicologia/TCABlog';

// Blogs de Efemérides
import DiaDiscapacidadBlog from './efemerides/DiaDiscapacidadBlog';
import DiaDerechosHumanosBlog from './efemerides/DiaDerechosHumanosBlog';

// Blogs de Terapias
// import EjemploBlog from './terapias/EjemploBlog';

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
};
