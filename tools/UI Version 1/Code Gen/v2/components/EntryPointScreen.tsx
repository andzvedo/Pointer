import React, { useState } from 'react';
import { colors, typography } from '../../../../../src/constants/tokens';

interface EntryPointScreenProps {
  onSubmit: (url: string) => void;
}

export const EntryPointScreen: React.FC<EntryPointScreenProps> = ({ onSubmit }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError('Por favor, insira uma URL do Figma');
      return;
    }
    
    // Aceita qualquer URL que contenha figma.com
    if (!url.toLowerCase().includes('figma.com')) {
      setError('URL inválida. Deve ser uma URL do Figma.');
      return;
    }
    
    setError('');
    
    // Chamar a função onSubmit passada como prop
    onSubmit(url);
  };

  // Não precisamos mais renderizar o LoadingScreen aqui
  // pois o componente pai (page.tsx) agora controla qual tela mostrar

  return (
    <div style={{
      backgroundColor: colors.lightGray,
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '8px'
    }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px' }}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Cole a URL do Figma aqui"
          style={{
            width: '100%',
            backgroundColor: colors.white,
            border: `1px solid ${error ? '#E53E3E' : colors.lightGray2}`,
            borderRadius: '8px',
            padding: '16px',
            fontFamily: typography.fontUI,
            fontSize: typography.sizes.text,
            outline: 'none'
          }}
        />
        {error && (
          <p style={{
            color: '#E53E3E',
            fontFamily: typography.fontUI,
            fontSize: '14px',
            margin: '8px 0 0 0'
          }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          style={{
            marginTop: '16px',
            backgroundColor: colors.primaryBlue,
            color: colors.white,
            borderRadius: '8px',
            height: '40px',
            width: '100%',
            fontFamily: typography.fontUI,
            fontSize: typography.sizes.text,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Extrair
        </button>
      </form>
    </div>
  );
};
