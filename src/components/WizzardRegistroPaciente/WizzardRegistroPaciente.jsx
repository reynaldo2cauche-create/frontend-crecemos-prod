import React, { useState } from 'react';
import { Stepper, Step, StepLabel, Dialog, DialogTitle, DialogContent, Snackbar, Alert } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import PersonalDataForm from './PersonalDataForm';
import AdditionalInfo from './AdditionalInfo';
import MedicalInfo from './MedicalInfo';
import ConsentForm from './ConsentForm';
import { createPaciente } from '../../services/pacienteService';
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
    // Simplemente avanzar al siguiente paso
    // La validación ya se hizo en el formulario hijo
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

      // 🆕 Construir array de responsables desde los campos dinámicos
      let responsables = [];
      if (esMenor) {
        // Buscar todos los campos de responsables en el formulario
        Object.keys(data).forEach(key => {
          if (key.startsWith('responsableNombre_')) {
            const id = key.split('_')[1];
            const responsable = {
              nombre: data[`responsableNombre_${id}`],
              apellido_paterno: data[`responsableApellidoPaterno_${id}`],
              apellido_materno: data[`responsableApellidoMaterno_${id}`],
              tipo_documento_id: parseInt(data[`responsableTipoDocumento_${id}`]),
              numero_documento: data[`responsableNumeroDocumento_${id}`],
              relacion_id: parseInt(data[`responsableRelacion_${id}`]),
              telefono: data[`responsableTelefono_${id}`],
              email: data[`responsableEmail_${id}`],
              proceso_legal: data[`responsableProcesoLegal_${id}`] || 'NO',
              tiene_proceso_legal: data[`responsableProcesoLegal_${id}`] === 'SI',
              proceso_legal_infantil_id: data[`responsableProcesoLegal_${id}`] === 'SI'
                ? (parseInt(data[`responsableProcesoLegalTipo_${id}`]) || null)
                : null
            };
            // Solo agregar si tiene datos completos
            if (responsable.nombre && responsable.apellido_paterno) {
              responsables.push(responsable);
            }
          }
        });
      }

      const payload = {
        // 📋 DATOS DEL PACIENTE PRINCIPAL
        paciente: {
          nombres: data.nombre,
          apellido_paterno: data.apellidoPaterno,
          apellido_materno: data.apellidoMaterno,
          fecha_nacimiento: data.fechaNacimiento,
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

        {/* Modal de éxito */}
        <Dialog
          open={openSuccessDialog}
          onClose={() => setOpenSuccessDialog(false)}
          aria-labelledby="success-dialog-title"
          aria-describedby="success-dialog-description"
          PaperProps={{
            className: 'success-dialog'
          }}
        >
          <DialogTitle id="success-dialog-title" className="success-dialog-title">
            <div className="success-icon-wrapper">
              <div className="success-icon">
                <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="success-title">¡Registro exitoso!</div>
          </DialogTitle>
          <DialogContent className="success-dialog-content">
            El paciente fue registrado correctamente.
          </DialogContent>
        </Dialog>
      </div>

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
    </FormProvider>
  );
};

export default WizardRegistroPaciente;

