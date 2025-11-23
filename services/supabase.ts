import { createClient } from '@supabase/supabase-js';

// These should be in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id?: number;
  username: string;
  points: number;
  created_at?: string;
}

export const LeaderboardService = {
  // Get user by username, or create if doesn't exist
  async getOrCreateUser(username: string): Promise<UserProfile | null> {
    if (!supabaseUrl) return null; // Fallback or error handling if not configured

    try {
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (existingUser) {
        return existingUser as UserProfile;
      }

      // If not, create new user
      const { data: newUser, error: createError } = await supabase
        .from('profiles')
        .insert([{ username, points: 0 }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return null;
      }

      return newUser as UserProfile;
    } catch (e) {
      console.error('Error in getOrCreateUser:', e);
      return null;
    }
  },

  // Update user points
  async updatePoints(username: string, points: number): Promise<boolean> {
    if (!supabaseUrl) return false;

    const { error } = await supabase
      .from('profiles')
      .update({ points })
      .eq('username', username);

    if (error) {
      console.error('Error updating points:', error);
      return false;
    }
    return true;
  },

  // Get top 10 leaderboard
  async getLeaderboard(): Promise<UserProfile[]> {
    if (!supabaseUrl) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('points', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data as UserProfile[];
  }
};
