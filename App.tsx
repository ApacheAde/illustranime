
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import MusicStudio from './components/MusicStudio';
import { Creation, UserProfile } from './types';
import { DEFAULT_PROFILE } from './constants.tsx';
import { generateAnimeImage } from './services/geminiService';

// --- Sub-components (Studio) ---
const Studio = ({ onSave }: { onSave: (c: Creation) => void }) => {
  const [charDetail, setCharDetail] = useState('');
  const [envDetail, setEnvDetail] = useState('');
  const [extraPrompt, setExtraPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!charDetail || !envDetail) return;
    setIsGenerating(true);
    setResultImage(null);
    try {
      const img = await generateAnimeImage(extraPrompt, charDetail, envDetail);
      setResultImage(img);
    } catch (e) {
      console.error(e);
      alert("Something went wrong with image generation.");
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
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Character Description</label>
              <textarea 
                value={charDetail}
                onChange={(e) => setCharDetail(e.target.value)}
                placeholder="e.g. A cybernetic samurai with glowing blue hair and a mechanical arm"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 outline-none h-24"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Environment / Setting</label>
              <input 
                value={envDetail}
                onChange={(e) => setEnvDetail(e.target.value)}
                type="text"
                placeholder="e.g. A neon-lit Tokyo rooftop in 2099, rainy night"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Style Modifiers (Optional)</label>
              <input 
                value={extraPrompt}
                onChange={(e) => setExtraPrompt(e.target.value)}
                type="text"
                placeholder="e.g. Makoto Shinkai style, cinematic lighting"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !charDetail || !envDetail}
              className="w-full py-5 anime-gradient rounded-2xl font-black uppercase tracking-widest text-white shadow-xl shadow-purple-500/20 disabled:opacity-50 transition-transform active:scale-95"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Drawing...</span>
                </div>
              ) : 'Summon Creation'}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px]">
          {isGenerating ? (
            <div className="flex flex-col items-center text-center p-12">
              <div className="w-24 h-24 border-8 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-8"></div>
              <p className="text-slate-400 font-medium">Mixing colors and defining lines...</p>
            </div>
          ) : resultImage ? (
            <div className="glass-panel p-4 rounded-[40px] shadow-2xl relative group w-full">
              <img src={resultImage} alt="Creation" className="w-full aspect-square object-cover rounded-[32px] shadow-inner" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[32px] gap-4">
                <button 
                  onClick={() => onSave({
                    id: Date.now().toString(),
                    title: charDetail.slice(0, 20) + '...',
                    imageUrl: resultImage,
                    prompt: charDetail + ' in ' + envDetail,
                    timestamp: Date.now()
                  })}
                  className="bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                >
                  Save to Vault
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-12 opacity-30">
              <div className="text-8xl mb-4">🖼️</div>
              <p className="font-bold uppercase tracking-widest">Awaiting Creation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Sub-components (Vault/Gallery) ---
const Vault = ({ creations, onDelete }: { creations: Creation[], onDelete: (id: string) => void }) => {
  const share = (creation: Creation) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out my AniGen creation!',
        text: creation.prompt,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("Sharing not supported on this browser. Image copied to clipboard!");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">The <span className="text-blue-500">Vault</span></h1>
        <p className="text-slate-400">Your collection of AI-generated anime masterpieces.</p>
      </header>

      {creations.length === 0 ? (
        <div className="glass-panel p-20 rounded-[40px] text-center">
          <p className="text-slate-500 font-bold uppercase tracking-widest mb-6">Vault is currently empty</p>
          <a href="#/" className="inline-block px-8 py-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors font-bold">Start Creating</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creations.map(c => (
            <div key={c.id} className="glass-panel p-3 rounded-3xl group overflow-hidden">
              <div className="relative aspect-square overflow-hidden rounded-2xl mb-4">
                <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                  <div className="flex gap-2">
                    <button onClick={() => share(c)} className="flex-1 bg-white text-black py-2 rounded-xl text-sm font-bold">Share</button>
                    <button onClick={() => onDelete(c.id)} className="w-10 h-10 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">🗑️</button>
                  </div>
                </div>
              </div>
              <div className="px-2 pb-2">
                <h3 className="font-bold text-slate-100 mb-1 truncate">{c.title}</h3>
                <p className="text-xs text-slate-500">{new Date(c.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Sub-components (Profile) ---
const Profile = ({ profile, onUpdate }: { profile: UserProfile, onUpdate: (p: UserProfile) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [editedBio, setEditedBio] = useState(profile.bio);

  const save = () => {
    onUpdate({ ...profile, name: editedName, bio: editedBio });
    setIsEditing(false);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="glass-panel p-10 rounded-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 anime-gradient blur-[100px] opacity-20 -z-10"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <img src={profile.avatar} className="w-40 h-40 rounded-[50px] object-cover ring-4 ring-purple-500/20" alt="Avatar" />
            <div className="absolute -bottom-2 -right-2 bg-purple-600 px-3 py-1 rounded-full text-xs font-black italic shadow-lg">LVL {profile.level}</div>
          </div>

          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <div className="space-y-4">
                <input 
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-2xl font-bold w-full"
                />
                <textarea 
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-slate-400 w-full h-24"
                />
                <button onClick={save} className="bg-purple-600 px-6 py-2 rounded-xl font-bold">Save Changes</button>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-black mb-2">{profile.name}</h1>
                <p className="text-slate-400 max-w-lg mb-6 leading-relaxed">{profile.bio}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-800">
                    <span className="block text-xs font-bold text-slate-500 uppercase">Creations</span>
                    <span className="text-2xl font-black">{profile.creationsCount}</span>
                  </div>
                  <div className="bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-800">
                    <span className="block text-xs font-bold text-slate-500 uppercase">Global Rank</span>
                    <span className="text-2xl font-black">#124</span>
                  </div>
                  <button onClick={() => setIsEditing(true)} className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-2xl text-sm font-bold transition-colors">Edit Profile</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-8 rounded-3xl">
          <h3 className="font-bold text-xl mb-4">Achievement Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>SUMMONER I</span>
                <span>8/10 Creations</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[80%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>COMPOSER II</span>
                <span>2/5 Tracks</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[40%]"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="glass-panel p-8 rounded-3xl bg-slate-900/20 border-dashed border-2 border-slate-800 flex items-center justify-center text-center">
          <div>
            <div className="text-3xl mb-2">🏆</div>
            <p className="text-sm font-bold text-slate-500">More stats coming in next update</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [creations, setCreations] = useState<Creation[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    const saved = localStorage.getItem('anigen_vault');
    if (saved) setCreations(JSON.parse(saved));
    const savedProfile = localStorage.getItem('anigen_profile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  const saveToVault = (c: Creation) => {
    const updated = [c, ...creations];
    setCreations(updated);
    localStorage.setItem('anigen_vault', JSON.stringify(updated));
    
    // Update profile count
    const updatedProfile = { ...profile, creationsCount: updated.length };
    setProfile(updatedProfile);
    localStorage.setItem('anigen_profile', JSON.stringify(updatedProfile));
    
    alert("Saved to vault!");
  };

  const deleteFromVault = (id: string) => {
    const updated = creations.filter(c => c.id !== id);
    setCreations(updated);
    localStorage.setItem('anigen_vault', JSON.stringify(updated));
  };

  const updateProfile = (p: UserProfile) => {
    setProfile(p);
    localStorage.setItem('anigen_profile', JSON.stringify(p));
  };

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Studio onSave={saveToVault} />} />
          <Route path="/gallery" element={<Vault creations={creations} onDelete={deleteFromVault} />} />
          <Route path="/music" element={<MusicStudio />} />
          <Route path="/profile" element={<Profile profile={profile} onUpdate={updateProfile} />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
