import { useState, useEffect } from 'react';
import { DEFAULT_CV } from '../utils/cvData';

const STORAGE_KEY = 'cv_tailor_cv_data';

export function useCV() {
  const [cv, setCV] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_CV;
    } catch {
      return DEFAULT_CV;
    }
  });

  const saveCV = (updatedCV) => {
    setCV(updatedCV);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCV));
  };

  const resetCV = () => saveCV(DEFAULT_CV);

  return { cv, saveCV, resetCV };
}
