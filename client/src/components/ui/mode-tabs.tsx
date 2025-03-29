import { useState } from 'react';

type Mode = 'call' | 'stt' | 'tts' | 'sign';

type ModeTabsProps = {
  activeMode: Mode;
  onModeChange: (mode: Mode) => void;
};

export function ModeTabs({ activeMode, onModeChange }: ModeTabsProps) {
  return (
    <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
      <div className="flex text-center">
        <TabButton 
          mode="call" 
          label="Phone Call" 
          icon="call" 
          isActive={activeMode === 'call'} 
          onClick={() => onModeChange('call')} 
        />
        <TabButton 
          mode="stt" 
          label="Speech to Text" 
          icon="hearing" 
          isActive={activeMode === 'stt'} 
          onClick={() => onModeChange('stt')} 
        />
        <TabButton 
          mode="tts" 
          label="Text to Speech" 
          icon="record_voice_over" 
          isActive={activeMode === 'tts'} 
          onClick={() => onModeChange('tts')} 
        />
        <TabButton 
          mode="sign" 
          label="Sign Language" 
          icon="sign_language" 
          isActive={activeMode === 'sign'} 
          onClick={() => onModeChange('sign')} 
        />
      </div>
    </div>
  );
}

type TabButtonProps = {
  mode: Mode;
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
};

function TabButton({ mode, label, icon, isActive, onClick }: TabButtonProps) {
  return (
    <button 
      onClick={onClick} 
      className={`flex-1 py-3 px-2 font-medium flex flex-col items-center text-sm ${
        isActive 
        ? 'bg-primary text-white' 
        : 'bg-neutral-200 text-neutral-600'
      }`}
    >
      <span className="material-icons mb-1">{icon}</span>
      {label}
    </button>
  );
}
