
import { MusicGenre, MusicMood, MusicTempo } from './types';

export const GENRES: MusicGenre[] = [
  'J-Pop', 'Lo-Fi', 'Synthwave', 'Orchestral', 'Rock', 
  'Jazz', 'Hip Hop', 'Electronic', 'Ambient', 'Folk', 
  'Metal', 'Techno', 'Blues', 'Country', 'Classical'
];

export const MOODS: MusicMood[] = [
  'Happy', 'Sad', 'Energetic', 'Calm', 'Angry', 'Mysterious', 
  'Romantic', 'Epic', 'Dark', 'Chill', 'Uplifting', 'Nostalgic', 
  'Intense', 'Ethereal', 'Quirky', 'Melancholic', 'Hopeful', 'Suspenseful'
];

export const TEMPOS: MusicTempo[] = [
  'Very Slow', 'Slow', 'Moderate', 'Fast', 'Very Fast', 'Extreme'
];

export const DEFAULT_PROFILE = {
  name: 'Ren Protagonist',
  bio: 'Digital artist & Anime enthusiast exploring AI frontiers.',
  avatar: 'https://picsum.photos/seed/ren/200/200',
  level: 5,
  creationsCount: 12
};
