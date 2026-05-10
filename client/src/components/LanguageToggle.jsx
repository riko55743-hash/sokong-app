import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import '../styles/LanguageToggle.css';

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();
  const t = (key) => translations[language][key] || key;

  return (
    <button
      className="language-toggle"
      onClick={toggleLanguage}
      title={t('language')}
      aria-label="Toggle language"
    >
      <span className="language-icon">🌐</span>
      <span className="language-text">{language.toUpperCase()}</span>
    </button>
  );
};
