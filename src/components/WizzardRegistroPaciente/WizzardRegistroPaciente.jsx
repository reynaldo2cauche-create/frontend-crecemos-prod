import React, { useState } from 'react';
import { Stepper, Step, StepLabel, Dialog, DialogTitle, DialogContent, Snackbar, Alert } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import PersonalDataForm from './PersonalDataForm';
import AdditionalInfo from './AdditionalInfo';
import MedicalInfo from './MedicalInfo';
import ConsentForm from './ConsentForm';
import { createPaciente } from '../../services/pacienteService';
import { formatearFechaParaBackend } from '../../utils/date';
import '../../styles/global.css';
// import PersonalDataForm from './PersonalDataForm';
// import ContactDataForm from './ContactDataForm';
// import MedicalDataForm from './MedicalDataForm';
// import LifestyleForm from './LifestyleForm';
// import PsychologicalHistoryForm from './PsychologicalHistoryForm';

const WizardRegistroPaciente = ({ onClose, isPageView = false, onStepChange }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [formData, setFormData] = useState(null);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  // 🆕 Estado para guardar datos procesados de cada paso
  const [datosProceadosPorPaso, setDatosProcesadosPorPaso] = useState({});

  // Notificar cambio de paso a la página principal
  React.useEffect(() => {
    if (onStepChange) {
      onStepChange(activeStep + 1);
    }
  }, [activeStep, onStepChange]);

  // Inicializamos el formulario con valores por defecto
  const methods = useForm({
    defaultValues: {
      // Datos Personales
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      fechaNacimiento: '',
      tipoDocumento: '',
      numeroDocumento: '',
      sexo: '',
      distrito: '',
      direccion: '',
      celular: '',
      celular2: '',
      correo: '',
      // Información Adicional
      isResponsibleRequired: false,
      motivoConsulta: '',
      serviciosRequeridos: '',
      referidoPor: '',
      responsableNombre: '',
      responsableRelacion: '',
      responsableTelefono: '',
      responsableEmail: '',
      // Información Médica 
      diagnosticoMedico: '',
      medicamentos: '',
      alergias: '',
      // Consentimiento
      aceptaTerminos: false,
      autorizaInformacion: false
    }
  });

  const handleBack = () => {
    console.log('handleBack');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleNext = (data) => {
    // 🆕 Guardar datos procesados del paso actual (ej: responsables con IDs existentes)
    if (data) {
      setDatosProcesadosPorPaso(prev => ({
        ...prev,
        [`step${activeStep}`]: data
      }));
    }
    // Avanzar al siguiente paso
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleSubmit = (data) => {
    console.log('data', data);
    setFormData(data);
    setOpenConfirmDialog(true);
  };

  const handleConfirmSubmit = async (data) => {
    try {
      setLoading(true);
      // Calcular edad para saber si es menor de edad
      const calcularEdad = (fecha) => {
        if (!fecha) return null;
        const hoy = new Date();
        const nacimiento = new Date(fecha);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
          edad--;
        }
        return edad;
      };
      const edad = calcularEdad(data.fechaNacimiento);
      const esMenor = edad !== null && edad < 18;

      // Verificar si es terapia de pareja
      const esTerapiaPareja = data.serviciosRequeridos === 8; // ID de Terapia de Pareja

      // 🆕 Usar responsables procesados del paso 1 (AdditionalInfo)
      // Estos ya vienen con responsable_id si existen, evitando duplicados
      const responsablesProcesados = datosProceadosPorPaso.step1?.responsables || [];

      // Transformar al formato que espera el backend
      let responsables = [];
      if (esMenor && responsablesProcesados.length > 0) {
        responsables = responsablesProcesados.map(r => {
          // Si tiene responsable_id válido, es un responsable existente → NO DUPLICAR
          if (r.responsable_id && r.responsable_id !== null) {
            return {
              responsable_id: r.responsable_id,
              relacion_id: parseInt(r.relacion),
              tiene_proceso_legal: r.proceso_legal === 'SI',
              proceso_legal_infantil_id: r.proceso_legal === 'SI' ? parseInt(r.proceso_legal_tipo) : null
            };
          }
          // Si no, es un responsable nuevo → crear registro
          return {
            nombre: r.nombres,
            apellido_paterno: r.apellido_paterno,
            apellido_materno: r.apellido_materno,
            tipo_documento_id: parseInt(r.tipo_documento),
            numero_documento: r.numero_documento,
            relacion_id: parseInt(r.relacion),
            telefono: r.telefono,
            email: r.email,
            tiene_proceso_legal: r.proceso_legal === 'SI',
            proceso_legal_infantil_id: r.proceso_legal === 'SI' ? parseInt(r.proceso_legal_tipo) : null
          };
        });
      }

      const payload = {
        // 📋 DATOS DEL PACIENTE PRINCIPAL
        paciente: {
          nombres: data.nombre,
          apellido_paterno: data.apellidoPaterno,
          apellido_materno: data.apellidoMaterno,
          fecha_nacimiento: formatearFechaParaBackend(data.fechaNacimiento),
          tipo_documento_id: parseInt(data.tipoDocumento),
          numero_documento: data.numeroDocumento,
          sexo_id: parseInt(data.sexo),
          distrito_id: parseInt(data.distrito),
          direccion: data.direccion,
          celular: data.celular,
          celular2: data.celular2,
          correo: data.correo,
          diagnostico_medico: data.diagnosticoMedico,
          alergias: data.alergias,
          medicamentos_actuales: data.medicamentos
        },

        // 🏥 INFORMACIÓN DEL SERVICIO
        servicio: {
          servicio_id: parseInt(data.serviciosRequeridos),
          motivo_consulta: data.motivoConsulta,
          referido_por: data.referidoPor
        },

        // 🆕 MÚLTIPLES RESPONSABLES (solo si es menor)
        responsables: responsables.length > 0 ? responsables : undefined,

        // 💑 INFORMACIÓN DE LA PAREJA (solo si es terapia de pareja)
        pareja: esTerapiaPareja ? {
          nombres: data.parejaNombres,
          apellido_paterno: data.parejaApellidoPaterno,
          apellido_materno: data.parejaApellidoMaterno,
          tipo_documento_id: data.parejaTipoDocumento,
          numero_documento: data.parejaNumeroDocumento,
          celular: data.parejaCelular,
          direccion: data.parejaDireccion,
          email: data.parejaEmail
        } : null,

        // ✅ CONSENTIMIENTOS
        consentimientos: {
          acepta_terminos: data.aceptaTerminos,
          acepta_info_comercial: data.autorizaInformacion
        },

        // 🔐 METADATOS
        metadata: {
          recaptchaToken: captchaValue,
          user_id: 0
        }
      };

      console.log('Payload enviado:', payload);
      console.log('Responsables con proceso legal:', payload.responsables);
      const response = await createPaciente(payload);
      setOpenSuccessDialog(true); // Mostrar modal de éxito
      // Limpiar el formulario y reiniciar el wizard después de 2 segundos
      setTimeout(() => {
        methods.reset();
        setActiveStep(0);
        if (onClose && typeof onClose === 'function') {
          onClose();
        }
        setOpenSuccessDialog(false);
      }, 2000);
    } catch (error) {
      console.error('Error al guardar el paciente:', error);
      // Aquí podrías mostrar un modal de error si lo deseas
    } finally {
      setLoading(false);
    }
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleSnackbar = ({ open, message, severity }) => {
    setOpenSnackbar(open);
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
  };

  return (
    <FormProvider {...methods}>
      <div className={`wizard-registro-container ${isPageView ? 'page-view' : ''}`}>
        {/* Contenido del formulario - SIN STEPPER DUPLICADO */}
        <div className="wizard-form-content">
          {activeStep === 0 && <PersonalDataForm onNext={handleNext} setSnackbar={handleSnackbar} />}
          {activeStep === 1 && <AdditionalInfo onNext={handleNext} onBack={handleBack} />}
          {activeStep === 2 && <MedicalInfo onNext={handleNext} onBack={handleBack} />}
          {activeStep === 3 && <ConsentForm onSubmit={handleConfirmSubmit} onBack={handleBack} captchaValue={captchaValue} setCaptchaValue={setCaptchaValue} />}
        </div>

               {/* 🎉 MODAL DE ÉXITO MINIMALISTA */}
        <Dialog
          open={openSuccessDialog}
          onClose={() => setOpenSuccessDialog(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            style: {
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(23, 78, 166, 0.15)',
              background: '#ffffff'
            }
          }}
        >
          <DialogContent style={{ 
            padding: '48px 32px', 
            textAlign: 'center'
          }}>
            {/* Icono de check simple */}
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #174ea6 0%, #c263f9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'scaleIn 0.4s ease-out'
            }}>
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none"
              >
                <path 
                  d="M20 6L9 17l-5-5" 
                  stroke="#fff" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Título */}
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '12px'
            }}>
              ¡Registro Exitoso!
            </h2>

            {/* Descripción */}
            <p style={{
              fontSize: '15px',
              color: '#64748b',
              lineHeight: '1.5',
              margin: 0
            }}>
              El paciente fue registrado correctamente.
            </p>
          </DialogContent>
        </Dialog>

        {/* Snackbar para mensajes */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Estilos de animaciones */}
        <style>{`
          @keyframes scaleIn {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </FormProvider>
  );
};

export default WizardRegistroPaciente;

