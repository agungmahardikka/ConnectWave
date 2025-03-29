export function Footer() {
  return (
    <footer className="bg-white p-4 text-center shadow-inner">
      <div className="max-w-lg mx-auto">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
              <span className="material-icons text-white text-xs">hearing</span>
            </div>
            <p className="font-bold text-sm text-primary">ConnectWave</p>
          </div>
          <p className="text-slate-500 text-xs">Breaking communication barriers since 2024</p>
          
          <div className="flex items-center justify-center gap-6 mt-3">
            <a href="#" className="text-slate-400 hover:text-primary" aria-label="Help">
              <span className="material-icons text-sm">help_outline</span>
            </a>
            <a href="#" className="text-slate-400 hover:text-primary" aria-label="Feedback">
              <span className="material-icons text-sm">feedback</span>
            </a>
            <a href="#" className="text-slate-400 hover:text-primary" aria-label="Privacy">
              <span className="material-icons text-sm">shield</span>
            </a>
            <a href="#" className="text-slate-400 hover:text-primary" aria-label="About">
              <span className="material-icons text-sm">info</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
