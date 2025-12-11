import React from 'react';
import { Dialog, Box, Typography, Button } from '@mui/material';
import { X, MessageCircle } from 'lucide-react';

const DialogNotice = ({ open, onClose, popupData }) => {
  // Si no hay popup data, usar datos por defecto (compatibilidad)
  const titulo = popupData?.titulo || '¡Feliz Día del Niño en Crecemos!';
  const imagenUrl = popupData?.imagenUrl || '/dia-nino-promo.jpg';
  const mensajeWhatsapp = popupData?.mensajeWhatsapp || 'Hola 👋 Estoy interesado en la promoción de agosto. ¿Me puedes brindar más información?';
  const mostrarBoton = !!mensajeWhatsapp; // Solo mostrar botón si hay mensaje

  const handleWhatsAppClick = () => {
    const numeroWhatsApp = '+51957064401';
    const mensajeCodificado = encodeURIComponent(mensajeWhatsapp);
    window.open(`https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${mensajeCodificado}`, '_blank');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      scroll="body"
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '24px',
          overflow: 'visible',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          margin: '20px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: 'calc(100vh - 40px)'
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)' // Mucho más oscuro
        }
      }}
    >
      {/* Botón cerrar moderno - Esquina superior derecha FUERA del modal */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '-12px',
          right: '-12px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(255, 107, 107, 0.4)',
          transition: 'all 0.3s ease',
          zIndex: 10,
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.4)';
        }}
      >
        <X size={20} strokeWidth={3} />
      </button>

      {/* Contenedor principal */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'auto',
          background: 'white',
          maxHeight: 'calc(100vh - 80px)'
        }}
      >
        {/* Imagen del popup - COMPLETA sin nada encima */}
        <Box
          sx={{
            width: '100%',
            height: 'auto',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <img
            src={imagenUrl}
            alt={titulo}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </Box>

        {/* Botón CTA DEBAJO de la imagen */}
        {mostrarBoton && (
          <Box
            sx={{
              padding: '24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Button
              onClick={handleWhatsAppClick}
              sx={{
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                color: 'white',
                borderRadius: '50px',
                padding: '16px 40px',
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.3s ease',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                animation: 'pulse 2s infinite',
                '&:hover': {
                  background: 'linear-gradient(135deg, #128C7E 0%, #075E54 100%)',
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: '0 12px 32px rgba(37, 211, 102, 0.6)'
                },
                '&:active': {
                  transform: 'translateY(-1px) scale(1.02)'
                }
              }}
            >
              <MessageCircle size={24} />
              <span>Contáctanos por WhatsApp</span>
            </Button>
          </Box>
        )}
      </Box>

      {/* Animación de pulso para el botón */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
        `}
      </style>
    </Dialog>
  );
};

export default DialogNotice;
