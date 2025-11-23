import React from 'react';
import { Camera, Trophy, MessageSquare, LogOut } from 'lucide-react';

interface HomeViewProps {
  username: string;
  onNavigate: (view: 'submit' | 'gemini' | 'leaderboard') => void;
  onLogout: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ username, onNavigate, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white flex flex-col">
      <header className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-2xl font-bold">
            Recyc<span className="text-green-400">Lens</span>
          </h1>
          <p className="text-gray-400 text-sm">Welcome, {username}</p>
        </div>
        <button onClick={onLogout} className="p-2 text-gray-400 hover:text-white" title="Logout">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 flex flex-col gap-4 justify-center max-w-md mx-auto w-full">
        <button
          onClick={() => onNavigate('submit')}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-6 rounded-2xl flex flex-col items-center gap-3 transition-all group"
        >
          <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
            <Camera className="w-6 h-6 text-green-400" />
          </div>
          <span className="text-lg font-semibold">Submit Proof</span>
          <span className="text-sm text-gray-400">Take a photo & earn points</span>
        </button>

        <button
          onClick={() => onNavigate('gemini')}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-6 rounded-2xl flex flex-col items-center gap-3 transition-all group"
        >
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
            <MessageSquare className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-lg font-semibold">Ask Gemini</span>
          <span className="text-sm text-gray-400">Real-time AI assistance</span>
        </button>

        <button
          onClick={() => onNavigate('leaderboard')}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-6 rounded-2xl flex flex-col items-center gap-3 transition-all group"
        >
          <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <span className="text-lg font-semibold">Leaderboard</span>
          <span className="text-sm text-gray-400">Check top recyclers</span>
        </button>
      </div>
    </div>
  );
};
