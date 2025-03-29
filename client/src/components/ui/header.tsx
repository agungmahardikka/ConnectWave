import { useState } from 'react';
import { LanguageSelector } from './language-selector';

interface HeaderProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

export function Header({ selectedLanguage, onLanguageChange }: HeaderProps) {
  return (
    <header className="bg-primary text-white p-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="material-icons">hearing</span>
        <h1 className="text-xl font-bold">EchoLink</h1>
      </div>
      <div className="flex items-center space-x-4">
        <LanguageSelector 
          selectedLanguage={selectedLanguage} 
          onChange={onLanguageChange} 
        />
        <button 
          aria-label="Settings" 
          className="rounded-full p-1 hover:bg-primary-dark"
        >
          <span className="material-icons">settings</span>
        </button>
      </div>
    </header>
  );
}
