
import { MusicGenre, MusicMood, MusicTempo, UserProfile } from './types';

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

export const GENERATION_COST = 3;
export const MONTHLY_FREE_CREDITS = 9;

/**
 * STRIPE CONFIGURATION
 * 
 * 1. PUBLISHABLE KEY: Safe for the frontend. Used to identify your account with Stripe.js.
 * 2. SECRET KEY (PRIVATE): NEVER PUT THIS IN THE FRONTEND. 
 *    The secret key (sk_live_...) you provided must be stored in your BACKEND environment variables.
 *    If you put it here, anyone can steal it and control your Stripe account.
 */
export const STRIPE_PUBLISHABLE_KEY = 'pk_live_51Q9RDAH2uq5WyrfGXPP7JwLvgc3dRgh7IPEUybvPv2OMKwEaVog7tVmeN98L5mHHq0jREbOErjPAPl6BVfE5Z7cW00labONVeD';

// This is just a placeholder to remind you where the secret key goes (ON YOUR SERVER)
// export const STRIPE_SECRET_KEY_LOCATION = "Your Server's .env file";

export const STRIPE_SUCCESS_URL = window.location.origin + '/#/profile?payment=success';
export const STRIPE_CANCEL_URL = window.location.origin + '/#/profile?payment=cancel';

export const DEFAULT_PROFILE: UserProfile = {
  id: 'guest',
  name: 'Ren Protagonist',
  bio: 'Digital artist & Anime enthusiast exploring AI frontiers.',
  avatar: 'https://picsum.photos/seed/ren/200/200',
  level: 1,
  creationsCount: 0,
  credits: 9,
  lastCreditReset: Date.now(),
  provider: null
};
