
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import Layout from './components/Layout';
import MusicStudio from './components/MusicStudio';
import { Creation, UserProfile, MusicTheme } from './types';
import { 
  DEFAULT_PROFILE, 
  GENERATION_COST, 
  MONTHLY_FREE_CREDITS, 
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_SUCCESS_URL,
  STRIPE_CANCEL_URL
} from './constants.tsx';
import { generateAnimeImage } from './services/geminiService';

// --- Auth Component ---
const Login = ({ onInitiateAuth }: { onInitiateAuth: (provider: string) => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 anime-gradient">
      <div className="glass-panel p-10 rounded-[40px] max-w-md w-full text-center space-y-8 shadow-2xl animate-in zoom-in duration-500">
        <div>
          <div className="w-16 h-16 bg-white text-purple-600 rounded-3xl mx-auto flex items-center justify-center text-3xl font-black mb-4 shadow-xl">A</div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Join <span className="text-pink-500">AniGen</span></h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Step into your creative anime universe.</p>
        </div>

        <div className="space-y-3">
          <button onClick={() => onInitiateAuth('google')} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-lg">
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>
          <button onClick={() => onInitiateAuth('facebook')} className="w-full py-4 bg-[#1877F2] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-lg">
            <span className="text-xl">fb</span>
            Continue with Facebook
          </button>
          <button onClick={() => onInitiateAuth('x')} className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-lg">
            <span className="text-xl font-black">𝕏</span>
            Continue with X.com
          </button>
        </div>

        <div className="pt-4">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest bg-slate-900/50 py-2 rounded-full border border-slate-800">New users get 9 free credits monthly</p>
        </div>
      </div>
    </div>
  );
};

// --- Onboarding Component ---
const ProfileSetup = ({ provider, onComplete }: { provider: string, onComplete: (profile: Partial<UserProfile>) => void }) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('Passionate about anime art and music.');
  const [avatar, setAvatar] = useState(`https://picsum.photos/seed/${Math.random()}/200/200`);

  const avatarOptions = [
    `https://picsum.photos/seed/anime1/200/200`,
    `https://picsum.photos/seed/anime2/200/200`,
    `https://picsum.photos/seed/anime3/200/200`,
    `https://picsum.photos/seed/anime4/200/200`,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <div className="glass-panel p-10 rounded-[40px] max-w-xl w-full space-y-8 animate-in slide-in-from-bottom-10 duration-500">
        <header className="text-center">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Initialize <span className="text-purple-500">Pilot</span></h2>
          <p className="text-slate-400 text-sm">Customize your digital identity for the vault.</p>
        </header>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <img src={avatar} className="w-24 h-24 rounded-3xl object-cover ring-4 ring-purple-500/20 shadow-2xl" alt="Selected" />
            <div className="flex gap-2">
              {avatarOptions.map(opt => (
                <button 
                  key={opt} 
                  onClick={() => setAvatar(opt)} 
                  className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${avatar === opt ? 'border-purple-500 scale-110' : 'border-transparent opacity-50'}`}
                >
                  <img src={opt} className="w-full h-full object-cover" alt="Option" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Public Nickname</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. NeonPixel"
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Bio / Persona</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about your style..."
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 outline-none h-24"
              />
            </div>
          </div>

          <button 
            onClick={() => onComplete({ name, bio, avatar })}
            disabled={!name.trim()}
            className="w-full py-5 anime-gradient rounded-2xl font-black uppercase tracking-widest text-white shadow-xl shadow-purple-500/20 disabled:opacity-50 transition-all active:scale-95"
          >
            Enter The Studio
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components (Studio) ---
const Studio = ({ user, onSave, onConsumeCredits }: { user: UserProfile, onSave: (c: Creation) => void, onConsumeCredits: (a: number) => boolean }) => {
  const [charDetail, setCharDetail] = useState('');
  const [envDetail, setEnvDetail] = useState('');
  const [extraPrompt, setExtraPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!charDetail || !envDetail) return;
    if (user.credits < GENERATION_COST) {
      alert("Insufficient credits! Top up in your profile.");
      return;
    }

    setIsGenerating(true);
    setResultImage(null);
    try {
      const success = onConsumeCredits(GENERATION_COST);
      if (!success) return;

      const img = await generateAnimeImage(extraPrompt, charDetail, envDetail);
      setResultImage(img);
    } catch (e) {
      console.error(e);
      alert("Image generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Creator <span className="text-pink-500">Hub</span></h1>
          <p className="text-slate-400">Bring your anime imagination to life with Gemini.</p>
        </div>
        <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-xl">
           <span className="text-yellow-500 text-xl animate-pulse">⚡</span>
           <div>
             <span className="block text-[10px] font-bold text-slate-500 uppercase leading-none">Your Balance</span>
             <span className="text-xl font-black">{user.credits} Credits</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl space-y-6 shadow-2xl">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Character Description</label>
              <textarea 
                value={charDetail}
                onChange={(e) => setCharDetail(e.target.value)}
                placeholder="e.g. A cybernetic samurai with glowing blue hair..."
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 outline-none h-24 transition-all focus:bg-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Environment / Setting</label>
              <input 
                value={envDetail}
                onChange={(e) => setEnvDetail(e.target.value)}
                type="text"
                placeholder="e.g. A neon-lit Tokyo rooftop..."
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all focus:bg-slate-900"
              />
            </div>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !charDetail || !envDetail}
              className="w-full py-5 anime-gradient rounded-2xl font-black uppercase tracking-widest text-white shadow-xl shadow-purple-500/20 disabled:opacity-50 transition-transform active:scale-95"
            >
              {isGenerating ? 'Drawing...' : `Summon (${GENERATION_COST} Credits)`}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px]">
          {isGenerating ? (
            <div className="flex flex-col items-center text-center p-12">
              <div className="w-24 h-24 border-8 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-8 shadow-xl"></div>
              <p className="text-slate-400 font-medium">Mixing colors...</p>
            </div>
          ) : resultImage ? (
            <div className="glass-panel p-4 rounded-[40px] shadow-2xl relative group w-full max-w-md">
              <img src={resultImage} alt="Creation" className="w-full aspect-square object-cover rounded-[32px] shadow-inner" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[32px] backdrop-blur-sm">
                <button 
                  onClick={() => onSave({
                    id: Date.now().toString(),
                    title: charDetail.slice(0, 20) + '...',
                    imageUrl: resultImage,
                    prompt: charDetail + ' in ' + envDetail,
                    timestamp: Date.now()
                  })}
                  className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-2xl"
                >
                  Save to Vault
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-12 opacity-30">
              <div className="text-8xl mb-4 animate-bounce">🖼️</div>
              <p className="font-bold uppercase tracking-widest">Awaiting Creation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Sub-components (Vault) ---
const Vault = ({ creations, musicThemes, onDeleteCreation, onDeleteTheme }: { creations: Creation[], musicThemes: MusicTheme[], onDeleteCreation: (id: string) => void, onDeleteTheme: (id: string) => void }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">The <span className="text-blue-500">Vault</span></h1>
        <p className="text-slate-400">Your archive of anime masterpieces and sonic explorations.</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-pink-500 pl-4 uppercase tracking-tighter">Art Collections</h2>
        {creations.length === 0 ? (
          <div className="glass-panel p-16 rounded-[40px] text-center opacity-50">
            <p className="text-slate-500 font-bold uppercase tracking-widest">Art vault is currently empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creations.map(c => (
              <div key={c.id} className="glass-panel p-3 rounded-3xl group overflow-hidden shadow-lg transition-all hover:shadow-2xl">
                <div className="relative aspect-square overflow-hidden rounded-2xl mb-4">
                  <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-2 right-2">
                     <button onClick={() => onDeleteCreation(c.id)} className="w-8 h-8 bg-black/50 text-white rounded-lg hover:bg-red-500 transition-colors">🗑️</button>
                  </div>
                </div>
                <div className="px-2 pb-2">
                  <h3 className="font-bold truncate">{c.title}</h3>
                  <p className="text-xs text-slate-500">{new Date(c.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold border-l-4 border-purple-500 pl-4 uppercase tracking-tighter">Sonic Themes</h2>
        {musicThemes.length === 0 ? (
          <div className="glass-panel p-16 rounded-[40px] text-center opacity-50">
            <p className="text-slate-500 font-bold uppercase tracking-widest">No music themes saved yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {musicThemes.map(t => (
              <div key={t.id} className="glass-panel p-6 rounded-3xl flex items-center justify-between group hover:border-purple-500/50 transition-all">
                <div className="space-y-1">
                  <div className="flex gap-2 mb-1">
                    <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded font-black uppercase">{t.genre}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-black uppercase">{t.mood}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-300 line-clamp-1 italic">"{t.description}"</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">{new Date(t.timestamp).toLocaleDateString()}</p>
                </div>
                <button onClick={() => onDeleteTheme(t.id)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

// --- Sub-components (Profile) ---
const Profile = ({ user, onUpdate, onBuyCredits, onLogout }: { user: UserProfile, onUpdate: (p: UserProfile) => void, onBuyCredits: (amount: number) => void, onLogout: () => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedBio, setEditedBio] = useState(user.bio);
  const [isBuying, setIsBuying] = useState(false);

  const handleUpdate = () => {
    onUpdate({ ...user, name: editedName, bio: editedBio });
    setIsEditing(false);
  };

  const handleStripeCheckout = async () => {
    setIsBuying(true);
    try {
      const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
      if (!stripe) {
        alert("Stripe failed to load. Please check your STRIPE_PUBLISHABLE_KEY.");
        return;
      }

      /**
       * REAL PRODUCTION FLOW:
       * 1. You call your backend server to create a Stripe Checkout Session.
       * 2. Your backend uses your SECRET KEY to talk to Stripe.
       * 3. It returns a Session ID.
       * 4. You call stripe.redirectToCheckout({ sessionId }).
       */
      
      // MOCK BACKEND CALL:
      // const response = await fetch('/api/create-checkout-session', { method: 'POST', body: JSON.stringify({ items: [{ id: 'credits_150' }] }) });
      // const session = await response.json();
      // await stripe.redirectToCheckout({ sessionId: session.id });

      // SIMULATION FOR FRONTEND DEMO:
      setTimeout(() => {
        onBuyCredits(150);
        setIsBuying(false);
        alert("Success! 150 Credits added via Stripe (Simulated Checkout). To go live, connect this to your backend server using your Private Key.");
      }, 1500);

    } catch (err) {
      console.error(err);
      alert("Checkout error.");
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-10">
      <div className="glass-panel p-10 rounded-[40px] relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-64 h-64 anime-gradient rounded-full blur-[100px] opacity-20"></div>
        <div className="flex flex-col md:flex-row items-center gap-10">
          <img src={user.avatar} className="w-40 h-40 rounded-[50px] object-cover ring-4 ring-purple-500/20 shadow-2xl" alt="Avatar" />
          <div className="flex-1 text-center md:text-left space-y-4">
             {isEditing ? (
               <div className="space-y-4">
                  <input value={editedName} onChange={(e) => setEditedName(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-2xl font-black w-full" />
                  <textarea value={editedBio} onChange={(e) => setEditedBio(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-slate-400 w-full h-20" />
                  <button onClick={handleUpdate} className="bg-green-600 px-6 py-2 rounded-xl font-black uppercase text-xs">Save Updates</button>
               </div>
             ) : (
               <>
                 <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                    <h1 className="text-4xl font-black tracking-tighter">{user.name}</h1>
                    <span className="bg-purple-600 px-3 py-1 rounded-full text-xs font-black italic shadow-lg">LVL {user.level}</span>
                 </div>
                 <p className="text-slate-400 max-w-lg italic font-medium">"{user.bio}"</p>
                 <div className="flex flex-wrap justify-center md:justify-start gap-3">
                   <button onClick={() => setIsEditing(true)} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl text-xs font-black uppercase transition-all">Edit Persona</button>
                   <button onClick={onLogout} className="bg-slate-900/50 hover:bg-red-900/50 text-red-500 border border-red-500/20 px-6 py-2 rounded-xl text-xs font-black uppercase transition-all">Logout</button>
                 </div>
               </>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-3xl bg-slate-900/30 shadow-xl border border-purple-500/10">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Credit Hub
          </h3>
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-6xl font-black block tracking-tighter">{user.credits}</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available Energy Units</span>
            </div>
            <div className="text-right glass-panel p-3 rounded-2xl bg-slate-900/50">
              <span className="block text-yellow-500 font-black text-[10px] uppercase mb-1">Monthly Recharge</span>
              <span className="text-xs text-slate-500 font-bold">{new Date(user.lastCreditReset + 30*24*60*60*1000).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="p-6 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-between group hover:bg-purple-600/20 transition-all cursor-pointer shadow-lg" onClick={handleStripeCheckout}>
            <div>
              <h4 className="font-black text-xl tracking-tighter">150 Credits Pack</h4>
              <p className="text-xs text-purple-400 font-bold">Unleash pure creativity</p>
            </div>
            <button 
              disabled={isBuying}
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-black hover:scale-105 transition-transform shadow-xl text-sm"
            >
              {isBuying ? '...' : '£3.99'}
            </button>
          </div>
          <p className="text-[9px] text-slate-600 mt-4 uppercase text-center font-black tracking-widest">Secured via Stripe Encryption</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-center shadow-xl">
           <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Statistical Analysis</h3>
           <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                   <span className="block text-[10px] font-black text-slate-600 uppercase">Gallery Items</span>
                   <span className="text-2xl font-black tracking-tighter">{user.creationsCount}</span>
                </div>
                <div className="text-right">
                   <span className="block text-[10px] font-black text-slate-600 uppercase">Identity Provider</span>
                   <span className="text-sm font-black capitalize text-purple-400">{user.provider || 'Local Pilot'}</span>
                </div>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${Math.min((user.creationsCount / 20) * 100, 100)}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase text-center">Mastery: {user.level < 10 ? 'Novice Artist' : 'Grand Summoner'}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [musicThemes, setMusicThemes] = useState<MusicTheme[]>([]);
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('anigen_user');
    const savedVault = localStorage.getItem('anigen_vault');
    const savedMusic = localStorage.getItem('anigen_music_themes');
    
    if (savedUser) {
      const parsed = JSON.parse(savedUser) as UserProfile;
      const now = Date.now();
      if (now - parsed.lastCreditReset > 30 * 24 * 60 * 60 * 1000) {
        parsed.credits = Math.max(parsed.credits, MONTHLY_FREE_CREDITS);
        parsed.lastCreditReset = now;
        localStorage.setItem('anigen_user', JSON.stringify(parsed));
      }
      setUser(parsed);
    }
    if (savedVault) setCreations(JSON.parse(savedVault));
    if (savedMusic) setMusicThemes(JSON.parse(savedMusic));
    setIsReady(true);
  }, []);

  const initiateAuth = (provider: string) => {
    setPendingProvider(provider);
  };

  const completeSignUp = (details: Partial<UserProfile>) => {
    const newUser: UserProfile = {
      ...DEFAULT_PROFILE,
      id: Math.random().toString(36).substr(2, 9),
      name: details.name || 'Unknown Pilot',
      bio: details.bio || 'Digital explorer.',
      avatar: details.avatar || DEFAULT_PROFILE.avatar,
      provider: pendingProvider as any,
      lastCreditReset: Date.now()
    };
    setUser(newUser);
    setPendingProvider(null);
    localStorage.setItem('anigen_user', JSON.stringify(newUser));
  };

  const consumeCredits = (amount: number) => {
    if (!user || user.credits < amount) return false;
    const updated = { ...user, credits: user.credits - amount };
    setUser(updated);
    localStorage.setItem('anigen_user', JSON.stringify(updated));
    return true;
  };

  const addCredits = (amount: number) => {
    if (!user) return;
    const updated = { ...user, credits: user.credits + amount };
    setUser(updated);
    localStorage.setItem('anigen_user', JSON.stringify(updated));
  };

  const saveToVault = (c: Creation) => {
    if (!user) return;
    const updatedVault = [c, ...creations];
    setCreations(updatedVault);
    localStorage.setItem('anigen_vault', JSON.stringify(updatedVault));
    
    const updatedUser = { ...user, creationsCount: user.creationsCount + 1, level: Math.floor((user.creationsCount + 1) / 5) + 1 };
    setUser(updatedUser);
    localStorage.setItem('anigen_user', JSON.stringify(updatedUser));
  };

  const saveMusicTheme = (theme: MusicTheme) => {
    if (!user) return;
    const updated = [theme, ...musicThemes];
    setMusicThemes(updated);
    localStorage.setItem('anigen_music_themes', JSON.stringify(updated));
    
    // Also count as a creation for user stats/leveling
    const updatedUser = { ...user, creationsCount: user.creationsCount + 1, level: Math.floor((user.creationsCount + 1) / 5) + 1 };
    setUser(updatedUser);
    localStorage.setItem('anigen_user', JSON.stringify(updatedUser));
  };

  const deleteCreation = (id: string) => {
    const updated = creations.filter(c => c.id !== id);
    setCreations(updated);
    localStorage.setItem('anigen_vault', JSON.stringify(updated));
  };

  const deleteTheme = (id: string) => {
    const updated = musicThemes.filter(t => t.id !== id);
    setMusicThemes(updated);
    localStorage.setItem('anigen_music_themes', JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    setPendingProvider(null);
    localStorage.removeItem('anigen_user');
  };

  if (!isReady) return null;

  if (!user) {
    if (pendingProvider) {
      return <ProfileSetup provider={pendingProvider} onComplete={completeSignUp} />;
    }
    return <Login onInitiateAuth={initiateAuth} />;
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Studio user={user} onSave={saveToVault} onConsumeCredits={consumeCredits} />} />
          <Route path="/gallery" element={<Vault creations={creations} musicThemes={musicThemes} onDeleteCreation={deleteCreation} onDeleteTheme={deleteTheme} />} />
          <Route path="/music" element={<MusicStudio user={user} onConsumeCredits={consumeCredits} onSave={saveMusicTheme} />} />
          <Route path="/profile" element={<Profile user={user} onUpdate={setUser} onBuyCredits={addCredits} onLogout={logout} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;