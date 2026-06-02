import XLSX from 'xlsx';
import fs from 'fs';

const filePath = 'C:\\Users\\Lucero\\Downloads\\INDICACION TERAPEUTICA.xlsx';
const workbook = XLSX.readFile(filePath);

console.log('Hojas disponibles:', workbook.SheetNames);
console.log('\n==============================================\n');

// Buscar la hoja de psicología adolescentes
const sheetName = workbook.SheetNames.find(name =>
  name.toLowerCase().includes('psicolog') && name.toLowerCase().includes('adolescent')
) || 'PSICOLOGIA ADOLESCENTES';

console.log('Leyendo hoja:', sheetName);
console.log('==============================================\n');

if (workbook.SheetNames.includes(sheetName)) {
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('Datos de la hoja:');
  console.log(JSON.stringify(data, null, 2));

  // Guardar en archivo JSON
  fs.writeFileSync(
    'indicacion_terapeutica_psicologia_adolescentes.json',
    JSON.stringify(data, null, 2)
  );
  console.log('\nDatos guardados en: indicacion_terapeutica_psicologia_adolescentes.json');
} else {
  console.log('No se encontró la hoja. Hojas disponibles:', workbook.SheetNames);
}
