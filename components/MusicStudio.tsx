
import React, { useState, useRef, useEffect } from 'react';
import { GENRES, MOODS, TEMPOS, GENERATION_COST } from '../constants';
import { MusicGenre, MusicMood, MusicTempo, MusicTheme, UserProfile } from '../types';
import { 
  generateMusicAtmosphere, 
  generateMusicTTS, 
  decodeBase64, 
  decodeAudioData, 
  createWavBlob 
} from '../services/geminiService';

interface MusicStudioProps {
  user: UserProfile;
  onSave?: (theme: MusicTheme) => void;
  onConsumeCredits: (amount: number) => boolean;
}

const MusicStudio: React.FC<MusicStudioProps> = ({ user, onSave, onConsumeCredits }) => {
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre>('Lo-Fi');
  const [selectedMood, setSelectedMood] = useState<MusicMood>('Chill');
  const [selectedTempo, setSelectedTempo] = useState<MusicTempo>('Moderate');
  const [duration, setDuration] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [lastAudioData, setLastAudioData] = useState<Uint8Array | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
    };
  }, []);

  const handleGenerate = async () => {
    if (user.credits < GENERATION_COST) {
      alert("Insufficient credits! Please top up in your profile.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setIsSaved(false);
    setLastAudioData(null);
    stopPlayback();

    try {
      const success = onConsumeCredits(GENERATION_COST);
      if (!success) throw new Error("Credit consumption failed");

      const desc = await generateMusicAtmosphere(selectedGenre, selectedMood, selectedTempo, duration);
      setResult(desc);
      
      const audioBase64 = await generateMusicTTS(desc);
      if (audioBase64) {
        setLastAudioData(decodeBase64(audioBase64));
      } else {
        throw new Error("TTS generation returned empty data");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to compose music theme. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Source might already be stopped
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const playAudio = async () => {
    if (!lastAudioData) return;
    
    if (isPlaying) {
      stopPlayback();
      return;
    }

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      // Crucial for mobile and modern browsers: resume context on user gesture
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const buffer = await decodeAudioData(lastAudioData, audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        sourceNodeRef.current = null;
      };
      
      source.start(0);
      sourceNodeRef.current = source;
      setIsPlaying(true);
    } catch (err) {
      console.error("Playback error:", err);
      alert("Error playing audio. Try generating again.");
      setIsPlaying(false);
    }
  };

  const handleDownload = () => {
    if (!lastAudioData) return;
    const blob = createWavBlob(lastAudioData);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AniGen_Synth_${selectedGenre.replace(/\s+/g, '_')}_${Date.now()}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!result || !onSave) return;
    const newTheme: MusicTheme = {
      id: Date.now().toString(),
      description: result,
      genre: selectedGenre,
      mood: selectedMood,
      tempo: selectedTempo,
      timestamp: Date.now()
    };
    onSave(newTheme);
    setIsSaved(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Sonic <span className="text-purple-500">Synth</span></h1>
          <p className="text-slate-400">Compose unique musical atmospheres for your anime scenes.</p>
        </div>
        <div className="bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800 flex items-center gap-2 shadow-inner">
           <span className="text-yellow-500">⚡</span>
           <span className="font-bold">{user.credits} Credits</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Duration Selector */}
          <section className="glass-panel p-6 rounded-3xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex justify-between items-center">
              <span>Theme Duration</span>
              <span className="text-xs text-slate-600">Affects narration depth</span>
            </h3>
            <div className="flex items-center gap-4">
               <input 
                type="range" 
                min="1" 
                max="8" 
                step="0.5"
                value={duration} 
                onChange={(e) => setDuration(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
               />
               <div className="bg-slate-900 border border-slate-800 px-4 py-1 rounded-full min-w-[100px] text-center">
                <span className="font-bold text-purple-400">{duration}m</span>
               </div>
            </div>
          </section>

          {/* Genre Selection */}
          <section className="glass-panel p-6 rounded-3xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Genre</h3>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => { setSelectedGenre(genre); setIsSaved(false); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedGenre === genre ? 'anime-gradient text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </section>

          {/* Mood Selection */}
          <section className="glass-panel p-6 rounded-3xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Atmosphere</h3>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(mood => (
                <button
                  key={mood}
                  onClick={() => { setSelectedMood(mood); setIsSaved(false); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedMood === mood ? 'bg-pink-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </section>

          {/* Tempo Selection */}
          <section className="glass-panel p-6 rounded-3xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Rhythm</h3>
            <div className="flex flex-wrap gap-2">
              {TEMPOS.map(tempo => (
                <button
                  key={tempo}
                  onClick={() => { setSelectedTempo(tempo); setIsSaved(false); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTempo === tempo ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  {tempo}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl flex flex-col items-center text-center shadow-xl">
            <div className="w-20 h-20 bg-slate-800/50 rounded-[30px] flex items-center justify-center text-4xl mb-6 relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <span className="animate-pulse">🎹</span>
              )}
            </div>
            <h2 className="text-xl font-bold mb-2">Synth Engine</h2>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">Generated audio uses <span className="text-white font-bold">{GENERATION_COST} Credits</span> from your monthly allotment.</p>
            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-4 anime-gradient rounded-2xl font-bold uppercase tracking-widest text-white shadow-xl shadow-purple-500/20 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {isLoading ? 'Synthesizing...' : 'Generate Theme'}
            </button>
          </div>

          {result && (
            <div className="glass-panel p-6 rounded-[32px] animate-in slide-in-from-bottom-4 duration-500 border-t-2 border-purple-500/20">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full">Output Module</span>
                <div className="flex gap-2">
                   <button 
                    onClick={playAudio}
                    disabled={!lastAudioData}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isPlaying ? 'bg-pink-500 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    title={isPlaying ? "Stop" : "Play Preview"}
                  >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                   <button 
                    onClick={handleDownload}
                    disabled={!lastAudioData}
                    className="w-12 h-12 bg-slate-800 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all shadow-lg"
                    title="Export as WAV"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-2xl mb-6">
                <p className="text-slate-300 text-xs italic leading-relaxed h-28 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                  "{result}"
                </p>
              </div>
              
              <button 
                onClick={handleSave}
                disabled={isSaved}
                className={`w-full py-3 rounded-2xl font-bold uppercase tracking-widest transition-all shadow-lg ${isSaved ? 'bg-green-600/20 text-green-400 cursor-default' : 'bg-slate-800 text-white hover:bg-slate-700 hover:scale-[1.02]'}`}
              >
                {isSaved ? 'Vaulted ✓' : 'Save Description'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicStudio;
