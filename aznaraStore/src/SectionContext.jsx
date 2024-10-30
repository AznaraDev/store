import React, { createContext, useContext, useState, useEffect } from 'react';

const SectionContext = createContext();

export const SectionProvider = ({ children }) => {
  // Al cargar, intenta recuperar el estado de 'section' desde localStorage
  const initialSection = localStorage.getItem('section') || 'Caballero';
  const [section, setSection] = useState(initialSection);

  const changeSection = (newSection) => {
    setSection(newSection);
    localStorage.setItem('section', newSection); // Guarda en localStorage
  };

  // Efecto para guardar el estado al cambiar la sección
  useEffect(() => {
    localStorage.setItem('section', section);
  }, [section]);

  return (
    <SectionContext.Provider value={{ section, changeSection }}>
      {children}
    </SectionContext.Provider>
  );
};

export const useSection = () => useContext(SectionContext);

