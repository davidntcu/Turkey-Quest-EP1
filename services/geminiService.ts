
import { GoogleGenAI, Type } from "@google/genai";
import { Enemy, Language } from '../types';
import { MONSTER_FALLBACK_URL } from '../constants';

// Use a fallback if API key is not present to prevent app crash
const getClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing. Using fallback mock data.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateDinosaur = async (targetLevel: number, lang: Language): Promise<Enemy> => {
  const ai = getClient();
  const isZh = lang === Language.ZH;

  // Fallback enemy if no API key
  if (!ai) {
    return {
      name: isZh ? "憤怒火雞" : "Angry Turkey",
      level: targetLevel,
      hp: 20 + targetLevel * 10,
      maxHp: 20 + targetLevel * 10,
      mp: 10 + targetLevel * 5,
      maxMp: 10 + targetLevel * 5,
      attack: 5 + targetLevel * 2,
      defense: 2 + targetLevel,
      description: isZh 
        ? "一隻被激怒的巨型火雞，眼神中燃燒著對感恩節的復仇之火。" 
        : "A giant turkey fueled by rage and vengeance against Thanksgiving.",
      imageUrl: MONSTER_FALLBACK_URL 
    };
  }

  // Step 1: Generate Stats and Description
  const langPrompt = isZh ? "Traditional Chinese (Taiwan)" : "English";
  
  // Prompt engineered for "Turkey Quest"
  const prompt = `Generate a 'Mutant Turkey Monster' or 'Poultry Beast' enemy for a satirical retro RPG game. 
  Theme: Turkeys taking over the world, mecha-turkeys, ancient god turkeys, magical chickens.
  Level: ${targetLevel}.
  Language: ${langPrompt}.
  Return JSON with:
  - name (Creative name like 'Mecha-Gobbler', 'Count Turkula'. Do NOT include 'Lv.' in the name string)
  - hp (integer, balanced for Level ${targetLevel})
  - mp (integer, balanced for Level ${targetLevel})
  - attack (integer, balanced for Level ${targetLevel})
  - defense (integer, balanced for Level ${targetLevel})
  - description (Funny but epic RPG flavor text, max 2 sentences)
  - visualPrompt (A short English description strictly for generating a pixel art image of this monster. MUST include the word 'Turkey' or 'Chicken' monster. Example: 'A cyborg turkey with laser eyes', 'A giant turkey wearing knight armor'. Describe color, features, and pose.)`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            hp: { type: Type.INTEGER },
            mp: { type: Type.INTEGER },
            attack: { type: Type.INTEGER },
            defense: { type: Type.INTEGER },
            description: { type: Type.STRING },
            visualPrompt: { type: Type.STRING }
          },
          required: ['name', 'hp', 'mp', 'attack', 'defense', 'description', 'visualPrompt']
        }
      }
    });

    const data = JSON.parse(response.text);
    
    // Step 2: Generate Image based on the visual prompt
    // Removed strict short timeout race condition. We prioritize quality/AI over speed.
    // Set a generous 15s timeout just to prevent infinite hangs.
    let imageUrl = MONSTER_FALLBACK_URL; // default fallback

    try {
      const imagePrompt = `Pixel art sprite of a ${data.visualPrompt}. Retro 16-bit RPG style monster, isolated on white background, full body visible. High quality, crisp lines, fantasy style.`;
      
      const imageGenPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: imagePrompt }]
        }
      });

      // 15-second timeout safety net
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Image generation timed out")), 15000)
      );

      // Race against the generous timeout
      const imageResponse = await Promise.race([imageGenPromise, timeoutPromise]) as any;

      // Extract base64 image from response
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (imgError) {
      console.warn("Image generation skipped or failed:", imgError);
      // Fallback is already set
    }

    return {
      name: data.name,
      level: targetLevel,
      hp: data.hp,
      maxHp: data.hp,
      mp: data.mp,
      maxMp: data.mp,
      attack: data.attack,
      defense: data.defense,
      description: data.description,
      imageUrl: imageUrl
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback on error
    return {
      name: isZh ? "錯誤火雞" : "Glitch-Gobbler",
      level: targetLevel,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      attack: 20,
      defense: 10,
      description: isZh ? "因網路錯誤而誕生的數據家禽。" : "A digital poultry born from a network error.",
      imageUrl: MONSTER_FALLBACK_URL
    };
  }
};
