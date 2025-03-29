import { supportedLanguages } from "@shared/schema";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onChange: (language: string) => void;
}

export function LanguageSelector({ selectedLanguage, onChange }: LanguageSelectorProps) {
  return (
    <select 
      value={selectedLanguage}
      onChange={(e) => onChange(e.target.value)}
      className="bg-primary-dark text-white p-1 rounded text-sm border border-white/30"
    >
      {supportedLanguages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
