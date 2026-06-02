import React from 'react';
import { Dialog, Box } from '@mui/material';
import { X, MessageCircle, ArrowRight } from 'lucide-react';

const DialogNotice = ({ open, onClose, popupData }) => {
  const titulo = popupData?.titulo || '¡Feliz Día del Niño en Crecemos!';
  const imagenUrl = popupData?.imagenUrl || '/dia-nino-promo.jpg';
  const mensajeWhatsapp = popupData?.mensajeWhatsapp?.trim() || null;
  const mostrarBoton = !!mensajeWhatsapp;

  const handleWhatsAppClick = () => {
    const numeroWhatsApp = '+51957064401';
    const mensajeCodificado = encodeURIComponent(mensajeWhatsapp);
    window.open(
      `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${mensajeCodificado}`,
      '_blank'
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      scroll="body"
      PaperProps={{
        sx: {
          background: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
          margin: '20px',
          maxWidth: '520px',
          width: '92%',
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-14px',
            right: '-14px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255,107,107,0.45)',
            transition: 'transform 0.25s ease',
            zIndex: 20,
            outline: 'none',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1)'}
        >
          <X size={16} strokeWidth={3} />
        </button>

        {/* Card imagen + overlay */}
        <Box
          sx={{
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 28px 64px rgba(0,0,0,0.45)',
            position: 'relative',
            lineHeight: 0,
          }}
        >
          {/* Imagen */}
          <img
            src={imagenUrl}
            alt={titulo}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
            onError={e => { e.target.style.display = 'none'; }}
          />

          {/* Overlay gradiente + botón encima de la imagen, parte inferior */}
          {mostrarBoton && (
            <Box
              onClick={handleWhatsAppClick}
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '90px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '18px',
                cursor: 'pointer',
                '&:hover .wsp-row': {
                  letterSpacing: '0.06em',
                  opacity: 0.85,
                },
              }}
            >
              <Box
                className="wsp-row"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Ícono WhatsApp */}
                <Box
                  sx={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#25D366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(37,211,102,0.5)',
                  }}
                >
                  <MessageCircle size={14} color="white" strokeWidth={2.5} />
                </Box>

                {/* Texto */}
                <span style={{
                  color: 'rgba(255,255,255,0.92)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  fontFamily: 'inherit',
                  transition: 'letter-spacing 0.2s ease',
                }}>
                  Escríbenos por WhatsApp
                </span>

                <ArrowRight size={13} color="rgba(255,255,255,0.55)" strokeWidth={2.5} />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

export default DialogNotice;