import React from "react";
import { GraduationCap, Award, BookOpen } from "lucide-react";

interface HeaderProps {
  onBackToDashboard?: () => void;
  showBack?: boolean;
}

export default function Header({ onBackToDashboard, showBack }: HeaderProps) {
  return (
    <header id="app-header" className="bg-slate-900 border-b border-slate-800 text-white py-4 px-4 sm:px-6 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          onClick={onBackToDashboard}
          className="flex items-center space-x-3 cursor-pointer select-none group"
        >
          <div className="bg-amber-500 text-slate-900 rounded-lg p-2 font-black group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-sans font-bold tracking-tight text-white flex items-center gap-1.5">
              English Academy <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs px-2 py-0.5 rounded font-mono font-medium">2.0</span>
            </h1>
            <p className="text-xs text-slate-400 font-sans hidden sm:block">Concept clearing & Premium Practice for Competitive Exams</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {showBack && onBackToDashboard && (
            <button
              id="back-dashboard-btn"
              onClick={onBackToDashboard}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-sans font-medium px-3.5 py-2 rounded-lg transition-colors cursor-pointer select-none flex items-center gap-1"
            >
              Dashboard
            </button>
          )}

          <div className="hidden md:flex items-center space-x-3 text-xs text-slate-400 font-mono bg-slate-800/50 border border-slate-800 rounded-full px-3 py-1">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Target: SSC CGL, Bank, CDS</span>
          </div>
        </div>
      </div>
    </header>
  );
}
