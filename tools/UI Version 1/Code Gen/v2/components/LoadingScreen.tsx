import React from 'react';
import { colors, typography } from '../../../../../src/constants/tokens';

export const LoadingScreen: React.FC = () => (
  <div style={{
    backgroundColor: colors.lightGray,
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <p style={{
      color: colors.mediumGray,
      fontFamily: typography.fontUI,
      fontSize: typography.sizes.text
    }}>
      Loading...
    </p>
  </div>
);
