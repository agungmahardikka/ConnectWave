import { useState } from 'react';

type Mode = 'call' | 'stt' | 'tts' | 'sign';

type ModeTabsProps = {
  activeMode: Mode;
  onModeChange: (mode: Mode) => void;
};

export function ModeTabs({ activeMode, onModeChange }: ModeTabsProps) {
  return (
    <div className="bg-white sticky top-0 z-10 px-3 pt-3 shadow-sm">
      <div className="flex overflow-x-auto no-scrollbar rounded-xl bg-slate-100 p-1">
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
      className={`flex-1 py-2.5 px-3 min-w-24 font-medium flex items-center justify-center gap-2 text-sm rounded-lg transition-all duration-200 ${
        isActive 
        ? 'bg-white text-primary shadow-sm' 
        : 'bg-transparent text-slate-600 hover:bg-white/50'
      }`}
    >
      <span className={`material-icons text-lg ${isActive ? 'text-primary' : 'text-slate-500'}`}>{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
