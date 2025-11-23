import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trophy, Loader2 } from 'lucide-react';
import { LeaderboardService } from '../services/supabase';

interface LeaderboardViewProps {
  onBack: () => void;
  currentUser: string;
  currentPoints: number;
}

interface LeaderboardEntry {
  name: string;
  points: number;
  isCurrentUser?: boolean;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack, currentUser, currentPoints }) => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
        setLoading(true);
        const data = await LeaderboardService.getLeaderboard();
        
        if (data.length > 0) {
            const formattedData = data.map(u => ({
                name: u.username,
                points: u.points,
                isCurrentUser: u.username === currentUser
            }));
            setLeaders(formattedData);
        } else {
            // Fallback to local storage if DB is empty or fails (and we have local data)
            // Or just show current user if nothing else
             const storedData = localStorage.getItem('recyclens_leaderboard');
             let allUsers: LeaderboardEntry[] = storedData ? JSON.parse(storedData) : [];
             
             // Ensure current user is in the list
             const currentUserIndex = allUsers.findIndex(u => u.name === currentUser);
             if (currentUserIndex >= 0) {
                 allUsers[currentUserIndex].points = currentPoints;
             } else {
                 allUsers.push({ name: currentUser, points: currentPoints });
             }
             
             const sorted = allUsers.sort((a, b) => b.points - a.points).slice(0, 10);
             setLeaders(sorted.map(u => ({ ...u, isCurrentUser: u.name === currentUser })));
        }
        setLoading(false);
    };

    fetchLeaderboard();
  }, [currentUser, currentPoints]);

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 pb-2 flex-shrink-0">
        <div className="flex items-center gap-4 mb-4">
            <button onClick={onBack} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" /> Leaderboard
            </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
        ) : (
            <div className="space-y-3 max-w-md mx-auto">
                {leaders.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        No leaders yet. Be the first!
                    </div>
                ) : (
                    leaders.map((user, index) => (
                    <div
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        user.isCurrentUser
                            ? 'bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/10'
                            : 'bg-gray-800 border-gray-700'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold shrink-0 ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-orange-500 text-black' :
                            'bg-gray-700 text-gray-300'
                        }`}>
                            {index + 1}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className={`font-semibold truncate ${user.isCurrentUser ? 'text-green-400' : 'text-white'}`}>
                            {user.name} {user.isCurrentUser && '(You)'}
                            </span>
                        </div>
                        </div>
                        <div className="font-mono font-bold text-lg whitespace-nowrap ml-4">
                        {user.points} <span className="text-xs text-gray-500 font-normal">pts</span>
                        </div>
                    </div>
                    ))
                )}
            </div>
        )}
      </div>
    </div>
  );
};
