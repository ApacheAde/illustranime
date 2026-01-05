
import { GoogleGenAI, Type } from "@google/genai";
import { MusicGenre, MusicMood, MusicTempo } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateAnimeImage = async (prompt: string, characterDetail: string, environment: string) => {
  const ai = getAI();
  const fullPrompt = `High quality anime style illustration. ${characterDetail}. Setting: ${environment}. Additional details: ${prompt}. Vivid colors, clean lines, professional digital art.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: fullPrompt }
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data returned from AI");
};

export const generateMusicAtmosphere = async (genre: MusicGenre, mood: MusicMood, tempo: MusicTempo) => {
  const ai = getAI();
  const prompt = `Describe in 2-3 poetic sentences a musical piece with the following attributes: Genre: ${genre}, Mood: ${mood}, Tempo: ${tempo}. Focus on the soundscapes, instruments used, and the feeling it evokes. No titles, just the description.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  return response.text || "A beautiful composition playing in the background of your mind.";
};

export const generateMusicTTS = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Listen to this theme: ${text}` }] }],
    config: {
      responseModalities: ['AUDIO' as any],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
};
