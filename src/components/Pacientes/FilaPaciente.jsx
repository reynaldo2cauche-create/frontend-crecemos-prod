import React from 'react';
import { TableRow, TableCell } from '@mui/material';
import { canViewContactInfo, canViewServiceInfo } from '../../constants/roles';

const ABREVIATURA_SERVICIO = {
  1:  'TL',
  2:  'PO',
  3:  'TA',
  4:  'PI',
  5:  'EPC',
  6:  'OV',
  7:  'PTI',
  8:  'TP',
  9:  'TF',
  10: 'TLA',
};

const SKIP_WORDS = new Set(['de', 'del', 'la', 'el', 'y', 'en', 'con', 'para', 'a', 'o']);

const getAbreviatura = (servicioId, nombre) => {
  if (ABREVIATURA_SERVICIO[servicioId]) return ABREVIATURA_SERVICIO[servicioId];
  return (nombre || '')
    .split(' ')
    .filter(w => w && !SKIP_WORDS.has(w.toLowerCase()))
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3) || '?';
};

const ESTADO_COLORS = {
  'Nuevo':      { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Entrevista': { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
  'Evaluacion': { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  'Terapia':    { bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-500'  },
  'Inactivo':   { bg: 'bg-gray-50',    text: 'text-gray-500',    dot: 'bg-gray-400'    },
};

const getEstadoColors = (nombre) =>
  ESTADO_COLORS[nombre] || { bg: 'bg-gray-50', text: 'text-gray-400', dot: 'bg-gray-300' };

const FilaPaciente = ({ paciente, idx, onSelect, seleccionado, user }) => {
  const servicios = paciente.servicios || [];

  return (
    <TableRow
      sx={{
        backgroundColor: seleccionado
          ? '#E1D7F0'
          : idx % 2 === 0
          ? '#fff'
          : (theme) => theme.palette.background.default,
        cursor: 'pointer'
      }}
      hover
      onClick={() => onSelect(paciente)}
    >
      <TableCell>
        {paciente.created_at ? new Date(paciente.created_at).toLocaleDateString('es-PE') : ''}
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-600 text-white">
          {paciente.tipo_documento?.nombre || ''}: {paciente.numero_documento}
        </span>
      </TableCell>
      <TableCell>
        {`${paciente.nombres} ${paciente.apellido_paterno} ${paciente.apellido_materno}`}
      </TableCell>
      <TableCell>
        {(() => {
          if (!paciente.fecha_nacimiento) return '-';
          const hoy = new Date();
          const nac = new Date(paciente.fecha_nacimiento);
          let edad = hoy.getFullYear() - nac.getFullYear();
          const m = hoy.getMonth() - nac.getMonth();
          if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
          return edad;
        })()}
      </TableCell>

      {canViewServiceInfo(user) && (
        <TableCell>
          {servicios.length === 0 ? (
            <span className="text-xs text-gray-400">Sin servicios</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {servicios.map((s) => {
                const abrev = getAbreviatura(s.servicio_id, s.servicio_nombre);
                const colors = getEstadoColors(s.estado_nombre);
                return (
                  <span
                    key={s.id ?? s.servicio_id}
                    title={`${s.servicio_nombre} · ${s.estado_nombre || 'Sin estado'}`}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${colors.bg} ${colors.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} flex-shrink-0`} />
                    {abrev} - {s.estado_nombre || 'Sin estado'}
                  </span>
                );
              })}
            </div>
          )}
        </TableCell>
      )}

      {canViewContactInfo(user) && (
        <>
          <TableCell>{paciente.distrito?.nombre || ''}</TableCell>
          <TableCell>{paciente.celular || ''}</TableCell>
        </>
      )}
    </TableRow>
  );
};

export default FilaPaciente;
