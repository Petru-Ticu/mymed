import React, { createContext, useContext, useState } from 'react';
import { recordListUpdates } from './medicationDoseActions';
import { medicationsStore } from './userStore';

const MedicalListContext = createContext();

export const MedicalListProvider = ({ children }) => {
  const [medicalLists, setMedicalListsState] = useState([]);

  const setMedicalLists = (next) => {
    setMedicalListsState((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      medicationsStore.replaceAll(resolved);
      recordListUpdates(prev, resolved);
      return resolved;
    });
  };

  const removeList = (index) => {
    setMedicalLists((currentLists) => currentLists.filter((_, i) => i !== index));
  };

  return (
    <MedicalListContext.Provider value={{ medicalLists, setMedicalLists, removeList }}>
      {children}
    </MedicalListContext.Provider>
  );
};

export const useMedicalList = () => useContext(MedicalListContext);
