import React, { useState } from 'react';
import { colors, typography } from '../../../../../src/constants/tokens';

interface ExportScreenProps {
  onBack?: () => void;
}

export const ExportScreen: React.FC<ExportScreenProps> = ({ onBack }) => {
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    setExported(true);
    // Simulação de exportação
    setTimeout(() => {
      // Aqui você implementaria a lógica real de exportação
    }, 500);
  };

  return (
    <div style={{
      backgroundColor: colors.lightGray,
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '8px 200px'
    }}>
      <div style={{
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '800px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${colors.lightGray2}`,
          paddingBottom: '16px'
        }}>
          <h2 style={{
            fontFamily: typography.fontUI,
            fontSize: typography.sizes.title,
            fontWeight: typography.weights.semibold,
            color: colors.darkGray,
            margin: 0
          }}>
            Exportar SVG
          </h2>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '32px',
          backgroundColor: colors.white,
          borderRadius: '8px',
          border: `1px solid ${colors.lightGray2}`
        }}>
          {/* Aqui seria renderizado o SVG real */}
          <div style={{
            width: '200px',
            height: '200px',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '4px'
          }}>
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" rx="8" fill="#002d5b" />
              <path d="M30 50H70" stroke="white" strokeWidth="4" strokeLinecap="round" />
              <path d="M50 30L50 70" stroke="white" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {exported && (
          <div style={{
            backgroundColor: '#E6F7E6',
            color: '#07750B',
            padding: '12px 16px',
            borderRadius: '4px',
            fontFamily: typography.fontUI,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM7 11.4L3.6 8L5 6.6L7 8.6L11 4.6L12.4 6L7 11.4Z" fill="#07750B"/>
            </svg>
            SVG exportado com sucesso!
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          marginTop: '16px'
        }}>
          <button 
            onClick={onBack}
            style={{
              backgroundColor: 'transparent',
              color: colors.darkGray,
              border: `1px solid ${colors.lightGray2}`,
              borderRadius: '8px',
              padding: '8px 16px',
              fontFamily: typography.fontUI,
              fontSize: typography.sizes.text,
              cursor: 'pointer'
            }}
          >
            Voltar
          </button>
          <button 
            onClick={handleExport}
            style={{
              backgroundColor: colors.primaryBlue,
              color: colors.white,
              border: 'none',
              borderRadius: '8px',
              height: '44px',
              padding: '0 24px',
              fontFamily: typography.fontUI,
              fontSize: typography.sizes.text,
              fontWeight: typography.weights.semibold,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Exportar SVG
          </button>
        </div>
      </div>
    </div>
  );
};
