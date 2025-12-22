import api from './api';

export const getTiposDocumento = async () => {
  const response = await api.get('/catalogos/tipo-documento');
  return response.data;
};

export const getGeneros = async () => {
  const response = await api.get('/catalogos/sexo');
  return response.data;
};

export const getDistritos = async () => {
  const response = await api.get('/catalogos/distrito');
  return response.data;
};

export const getServicios = async () => {
  const response = await api.get('/catalogos/servicios');
  return response.data;
};

export const getRelacionesResponsable = async () => {
  const response = await api.get('/catalogos/relacion-responsable');
  return response.data;
};

export const getGradosEscolares = async () => {
  const response = await api.get('/catalogos/grado-escolar');
  return response.data;
};

export const getAtenciones = async () => {
  const response = await api.get('/catalogos/atenciones');
  return response.data;
};

export const getRelacionPadres = async () => {
  const response = await api.get('/catalogos/relacion-padres');
  return response.data;
};

export const getOcupaciones = async () => {
  const response = await api.get('/catalogos/ocupaciones');
  return response.data;
}; 