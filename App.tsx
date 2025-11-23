import React, { useState, useEffect } from 'react';
import { WelcomeView } from './views/WelcomeView';
import { HomeView } from './views/HomeView';
import { SubmitProofView } from './views/SubmitProofView';
import { LeaderboardView } from './views/LeaderboardView';
import { AskGeminiView } from './views/AskGeminiView';

type ViewState = 'welcome' | 'home' | 'submit' | 'gemini' | 'leaderboard';

interface LeaderboardEntry {
  name: string;
  points: number;
}

const updateLeaderboard = (name: string, points: number) => {
  const stored = localStorage.getItem('recyclens_leaderboard');
  let leaderboard: LeaderboardEntry[] = stored ? JSON.parse(stored) : [];
  
  const existingIndex = leaderboard.findIndex(u => u.name === name);
  if (existingIndex >= 0) {
    leaderboard[existingIndex].points = points;
  } else {
    leaderboard.push({ name, points });
  }
  
  localStorage.setItem('recyclens_leaderboard', JSON.stringify(leaderboard));
};

export default function App() {
  const [view, setView] = useState<ViewState>('welcome');
  const [username, setUsername] = useState<string>('');
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    const storedName = localStorage.getItem('recyclens_username');
    const storedPoints = localStorage.getItem('recyclens_points');

    if (storedName) {
      setUsername(storedName);
      setView('home');
    }

    if (storedPoints) {
      setPoints(parseInt(storedPoints, 10));
    }
  }, []);

  const handleStart = (name: string) => {
    localStorage.setItem('recyclens_username', name);
    let currentPoints = 0;
    
    // Check if user already exists in leaderboard to restore points
    const storedLeaderboard = localStorage.getItem('recyclens_leaderboard');
    if (storedLeaderboard) {
        const leaderboard: LeaderboardEntry[] = JSON.parse(storedLeaderboard);
        const userEntry = leaderboard.find(u => u.name === name);
        if (userEntry) {
            currentPoints = userEntry.points;
        }
    }

    // Fallback to simple storage if not in leaderboard yet (or sync them)
    if (!localStorage.getItem('recyclens_points')) {
        localStorage.setItem('recyclens_points', currentPoints.toString());
    } else {
        // If we have a simple storage point but not in leaderboard, use that
        const simplePoints = parseInt(localStorage.getItem('recyclens_points') || '0', 10);
        if (simplePoints > currentPoints) currentPoints = simplePoints;
    }
    
    setPoints(currentPoints);
    updateLeaderboard(name, currentPoints);
    
    setUsername(name);
    setView('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('recyclens_username');
    setUsername('');
    setView('welcome');
  };

  const handleSubmitComplete = () => {
    const newPoints = points + 1;
    setPoints(newPoints);
    localStorage.setItem('recyclens_points', newPoints.toString());
    updateLeaderboard(username, newPoints);
    setView('home');
  };

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
