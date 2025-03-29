import { supportedLanguages } from "@shared/schema";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onChange: (language: string) => void;
}

export function LanguageSelector({ selectedLanguage, onChange }: LanguageSelectorProps) {
  return (
    <div className="relative group">
      <select 
        value={selectedLanguage}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white/10 text-white px-3 py-1.5 pr-8 rounded-full text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        {supportedLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      <span className="material-icons absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 text-sm pointer-events-none">
        translate
      </span>
    </div>
  );
}
