import { useState } from 'react';
import { LanguageSelector } from './language-selector';

interface HeaderProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

export function Header({ selectedLanguage, onLanguageChange }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-primary to-primary/80 text-white p-4 flex items-center justify-between rounded-b-lg shadow-md">
      <div className="flex items-center space-x-3">
        <div className="bg-white text-primary p-1.5 rounded-full shadow-sm">
          <span className="material-icons">hearing</span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">ConnectWave</h1>
          <p className="text-xs text-white/80">Breaking communication barriers</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <LanguageSelector 
          selectedLanguage={selectedLanguage} 
          onChange={onLanguageChange} 
        />
        <button 
          aria-label="Settings" 
          className="rounded-full p-2 bg-white/10 hover:bg-white/20 transition-colors duration-200"
        >
          <span className="material-icons text-sm">settings</span>
        </button>
      </div>
    </header>
  );
}
