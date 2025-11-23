import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface WelcomeViewProps {
  onStart: (name: string) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onStart }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">
          Recyc<span className="text-green-400">Lens</span>
        </h1>
        <p className="text-gray-400">Your AI Recycling Assistant</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
            Enter your name to start
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-white placeholder-gray-500"
            placeholder="Your Name"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Start Recycling <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
