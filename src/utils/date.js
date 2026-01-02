export function calcularEdad(fecha) {
  if (!fecha) return '';
  const hoy = new Date();
  const nacimiento = new Date(fecha);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

export function calcularEdadDetallada(fecha) {
  if (!fecha) return { años: 0, meses: 0, texto: '' };

  const hoy = new Date();
  const nacimiento = new Date(fecha);

  let años = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();

  // Ajustar años y meses si el día actual es antes del día de nacimiento
  if (hoy.getDate() < nacimiento.getDate()) {
    meses--;
  }

  // Si los meses son negativos, restar un año y ajustar meses
  if (meses < 0) {
    años--;
    meses += 12;
  }

  // Construir el texto
  let texto = '';
  if (años > 0) {
    texto = `${años} año${años !== 1 ? 's' : ''}`;
    if (meses > 0) {
      texto += ` y ${meses} mes${meses !== 1 ? 'es' : ''}`;
    }
  } else {
    texto = `${meses} mes${meses !== 1 ? 'es' : ''}`;
  }

  return { años, meses, texto };
} 