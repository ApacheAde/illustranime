
export interface UserProfile {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  level: number;
  creationsCount: number;
  credits: number;
  lastCreditReset: number; // Timestamp of last monthly reset
  provider?: 'google' | 'facebook' | 'x' | null;
}

export interface Creation {
  id: string;
  title: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
  musicDescription?: string;
  musicConfig?: {
    genre: string;
    mood: string;
    tempo: string;
  };
}

export interface MusicTheme {
  id: string;
  description: string;
  genre: string;
  mood: string;
  tempo: string;
  timestamp: number;
}

export type MusicGenre = 
  | 'J-Pop' | 'Lo-Fi' | 'Synthwave' | 'Orchestral' | 'Rock' 
  | 'Jazz' | 'Hip Hop' | 'Electronic' | 'Ambient' | 'Folk' 
  | 'Metal' | 'Techno' | 'Blues' | 'Country' | 'Classical';

export type MusicMood = 
  | 'Happy' | 'Sad' | 'Energetic' | 'Calm' | 'Angry' | 'Mysterious' 
  | 'Romantic' | 'Epic' | 'Dark' | 'Chill' | 'Uplifting' | 'Nostalgic' 
  | 'Intense' | 'Ethereal' | 'Quirky' | 'Melancholic' | 'Hopeful' | 'Suspenseful';

export type MusicTempo = 
  | 'Very Slow' | 'Slow' | 'Moderate' | 'Fast' | 'Very Fast' | 'Extreme';
