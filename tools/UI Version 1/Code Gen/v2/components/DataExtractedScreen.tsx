import React from 'react';
import { colors, typography } from '../../../../../src/constants/tokens';

interface DataExtractedScreenProps {
  onBack?: () => void;
}

export const DataExtractedScreen: React.FC<DataExtractedScreenProps> = ({ onBack }) => {
  // Dados extraídos simulados
  const extractedData = {
    node: {
      id: "40000337:16761",
      name: "Home",
      type: "FRAME",
      scrollBehavior: "SCROLLS",
      children: [
        {
          id: "40000337:16763",
          name: "Hero",
          type: "FRAME",
          scrollBehavior: "SCROLLS",
          children: [
            {
              id: "40000337:16764",
              name: "Hero",
              type: "FRAME",
              scrollBehavior: "SCROLLS",
              children: [
                {
                  id: "40000337:16765",
                  name: "Top bar",
                  type: "FRAME",
                  scrollBehavior: "STICKY_SCROLLS",
                  children: [],
                  blendMode: "PASS_THROUGH",
                  clipsContent: true,
                  background: [
                    {
                      opacity: 0.6000000238418579,
                      blendMode: "NORMAL"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
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
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
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
            Dados Extraídos
          </h2>
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button style={{
              backgroundColor: colors.primaryBlue,
              color: colors.white,
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontFamily: typography.fontUI,
              fontSize: typography.sizes.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>Copiar tudo</span>
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            backgroundColor: colors.lightGray,
            borderRadius: '4px',
            padding: '16px',
            fontFamily: typography.fontMono,
            fontSize: typography.sizes.code,
            lineHeight: typography.lineHeights.code,
            color: colors.darkGray,
            overflowX: 'auto',
            whiteSpace: 'pre',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {JSON.stringify(extractedData, null, 2)}
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
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
          <button style={{
            backgroundColor: colors.primaryBlue,
            color: colors.white,
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontFamily: typography.fontUI,
            fontSize: typography.sizes.text,
            cursor: 'pointer'
          }}>
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
};
