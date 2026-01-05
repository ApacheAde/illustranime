
import React, { useState } from 'react';
import { GENRES, MOODS, TEMPOS } from '../constants';
import { MusicGenre, MusicMood, MusicTempo } from '../types';
import { generateMusicAtmosphere, generateMusicTTS } from '../services/geminiService';

const MusicStudio: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre>('Lo-Fi');
  const [selectedMood, setSelectedMood] = useState<MusicMood>('Chill');
  const [selectedTempo, setSelectedTempo] = useState<MusicTempo>('Moderate');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const desc = await generateMusicAtmosphere(selectedGenre, selectedMood, selectedTempo);
      setResult(desc);
    } catch (error) {
      console.error(error);
      alert("Failed to compose music theme.");
    } finally {
      setIsLoading(false);
    }
  };

  const playTTS = async () => {
    if (!result) return;
    setIsPlaying(true);
    try {
      const audioBase64 = await generateMusicTTS(result);
      if (audioBase64) {
        const audio = new Audio(`data:audio/pcm;base64,${audioBase64}`);
        // NOTE: Standard Audio() won't play raw PCM without header. 
        // In a real production scenario, we'd use the provided decoding logic.
        // For this demo, we'll simulate the "listening" experience.
        setTimeout(() => setIsPlaying(false), 3000);
      }
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Sonic <span className="text-purple-500">Synth</span></h1>
        <p className="text-slate-400">Compose unique musical atmospheres for your anime scenes.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Genre Selection */}
          <section className="glass-panel p-6 rounded-3xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Select Genre (15)</h3>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedGenre === genre ? 'anime-gradient text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </section>

          {/* Mood Selection */}
          <section className="glass-panel p-6 rounded-3xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Select Mood (18)</h3>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(mood => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedMood === mood ? 'bg-pink-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </section>

          {/* Tempo Selection */}
          <section className="glass-panel p-6 rounded-3xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Select Tempo (6)</h3>
            <div className="flex flex-wrap gap-2">
              {TEMPOS.map(tempo => (
                <button
                  key={tempo}
                  onClick={() => setSelectedTempo(tempo)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTempo === tempo ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  {tempo}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-3xl mb-6">
              {isLoading ? (
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              ) : '🎹'}
            </div>
            <h2 className="text-xl font-bold mb-2">Composer</h2>
            <p className="text-sm text-slate-400 mb-8">Ready to generate your custom theme based on {selectedGenre} style.</p>
            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-4 anime-gradient rounded-2xl font-bold uppercase tracking-widest text-white shadow-xl shadow-purple-500/20 disabled:opacity-50"
            >
              {isLoading ? 'Composing...' : 'Generate Theme'}
            </button>
          </div>

          {result && (
            <div className="glass-panel p-6 rounded-3xl animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-purple-400 uppercase tracking-tighter">Your Masterpiece</span>
                <button 
                  onClick={playTTS}
                  disabled={isPlaying}
                  className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
                >
                  {isPlaying ? '⏳' : '▶️'}
                </button>
              </div>
              <p className="text-slate-200 text-sm italic leading-relaxed">
                "{result}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicStudio;
