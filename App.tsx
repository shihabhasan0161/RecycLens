import React, { useState, useEffect } from 'react';
import { WelcomeView } from './views/WelcomeView';
import { HomeView } from './views/HomeView';
import { SubmitProofView } from './views/SubmitProofView';
import { LeaderboardView } from './views/LeaderboardView';
import { AskGeminiView } from './views/AskGeminiView';
import { LeaderboardService } from './services/supabase';

type ViewState = 'welcome' | 'home' | 'submit' | 'gemini' | 'leaderboard';

export default function App() {
  const [view, setView] = useState<ViewState>('welcome');
  const [username, setUsername] = useState<string>('');
  const [points, setPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initUser = async () => {
        const storedName = localStorage.getItem('recyclens_username');
        if (storedName) {
            setIsLoading(true);
            const user = await LeaderboardService.getOrCreateUser(storedName);
            if (user) {
                setUsername(user.username);
                setPoints(user.points);
                setView('home');
            } else {
                // Fallback if offline or error, try local storage
                setUsername(storedName);
                const storedPoints = localStorage.getItem('recyclens_points');
                if (storedPoints) setPoints(parseInt(storedPoints, 10));
                setView('home');
            }
            setIsLoading(false);
        }
    };
    initUser();
  }, []);

  const handleStart = async (name: string) => {
    setIsLoading(true);
    const user = await LeaderboardService.getOrCreateUser(name);
    
    if (user) {
        setUsername(user.username);
        setPoints(user.points);
        localStorage.setItem('recyclens_username', user.username);
        localStorage.setItem('recyclens_points', user.points.toString());
    } else {
        // Fallback
        setUsername(name);
        setPoints(0);
        localStorage.setItem('recyclens_username', name);
        localStorage.setItem('recyclens_points', '0');
    }
    
    setIsLoading(false);
    setView('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('recyclens_username');
    localStorage.removeItem('recyclens_points');
    setUsername('');
    setPoints(0);
    setView('welcome');
  };

  const handleSubmitComplete = async () => {
    const newPoints = points + 1;
    setPoints(newPoints);
    
    // Optimistic update
    localStorage.setItem('recyclens_points', newPoints.toString());
    
    // Update DB
    await LeaderboardService.updatePoints(username, newPoints);
    
    setView('home');
  };

  if (isLoading) {
      return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  switch (view) {
    case 'welcome':
      return <WelcomeView onStart={handleStart} />;
    case 'home':
      return (
        <HomeView
          username={username}
          onNavigate={setView}
          onLogout={handleLogout}
        />
      );
    case 'submit':
      return (
        <SubmitProofView
          onBack={() => setView('home')}
          onComplete={handleSubmitComplete}
        />
      );
    case 'gemini':
      return <AskGeminiView onBack={() => setView('home')} />;
    case 'leaderboard':
      return (
        <LeaderboardView
          onBack={() => setView('home')}
          currentUser={username}
          currentPoints={points}
        />
      );
    default:
      return <WelcomeView onStart={handleStart} />;
  }
}
