import React, { createContext, useContext, ReactNode } from 'react';

interface FontContextType {
  fontFamily: string;
  fonts: {
    denis: string;
    primary: string;
    secondary: string;
  };
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export const useFonts = () => {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error('useFonts must be used within a FontProvider');
  }
  return context;
};

interface FontProviderProps {
  children: ReactNode;
}

export const FontProvider: React.FC<FontProviderProps> = ({ children }) => {
  const fontContext: FontContextType = {
    fontFamily: 'DenisMacharov',
    fonts: {
      denis: 'DenisMacharov',
      primary: 'DenisMacharov',
      secondary: 'DenisMacharov',
    },
  };

  return (
    <FontContext.Provider value={fontContext}>
      {children}
    </FontContext.Provider>
  );
};
