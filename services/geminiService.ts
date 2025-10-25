
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Story, Character, DialogueLine } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. Using a placeholder. Please set your API key in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateStoryChapters = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating story chapters:", error);
    return "Error: Could not generate story. Please try again.";
  }
};

export const generateStoryCover = async (prompt: string, aspectRatio: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `Create a captivating, high-quality book cover for a story with this summary: ${prompt}. Style: digital painting, dramatic lighting, fantasy art.`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
    });
    
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Error generating story cover:", error);
    return `https://picsum.photos/seed/${Math.random()}/600/800`; // Fallback image
  }
};

export const groundedSearch = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: `Provide a concise summary of key elements, characters, and lore for the following fictional universe: ${prompt}`,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        return response.text;
    } catch(error) {
        console.error("Error with grounded search:", error);
        return "Could not fetch information for this universe.";
    }
}

export const generateAudiobookContent = async (chapterContent: string): Promise<string | null> => {
    try {
        const rewriteResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: `Rewrite the following chapter to be more engaging for an audiobook. Describe actions vividly, clarify who is speaking if it's ambiguous, and ensure a smooth narrative flow. Do not add narrator intros like 'The narrator said'. Output only the optimized text.\n\n---\n\n${chapterContent}`
        });
        const optimizedText = rewriteResponse.text;

        const ttsResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Read the following story chapter in a clear, engaging narrator's voice. ${optimizedText}` }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' }, 
                  },
              },
            },
          });
        const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating audiobook content:", error);
        return null;
    }
};

export const generateDialogueAudio = async (text: string, voice: string = 'Kore'): Promise<string | null> => {
    try {
        const ttsResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice as any },
                  },
              },
            },
          });
        const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch(error) {
        console.error("Error generating dialogue audio:", error);
        return null;
    }
}

export const extractDialogues = async (chapterText: string, characters: Character[]): Promise<DialogueLine[]> => {
    const characterNames = characters.map(c => c.name).join(', ');
    const prompt = `From the following chapter text, extract all lines of dialogue. Identify which character is speaking. The characters in this story are: ${characterNames}. Return the result as a JSON array of objects, where each object has a "character" key and a "line" key. If you cannot determine the speaker, use "Narrator".

Text:
---
${chapterText}
---
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            character: { type: Type.STRING, description: "The name of the character speaking." },
                            line: { type: Type.STRING, description: "The line of dialogue spoken." }
                        },
                        required: ["character", "line"]
                    }
                }
            }
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error extracting dialogues:", error);
        return [{ character: "Error", line: "Could not parse dialogue from this chapter." }];
    }
};

export const autocompleteStory = async (story: Story): Promise<string> => {
    const existingChapters = story.chapters.map((c, i) => `Chapter ${i+1}: ${c.title}\n${c.content}`).join('\n\n---\n\n');
    const prompt = `
        # STORY AUTOCOMPLETION BRIEF
        You are an expert storyteller tasked with finishing a story. Based on the provided story details and existing chapters, write the remaining chapters to bring the story to a satisfying conclusion. Ensure the new chapters are consistent with the established tone, plot, and character arcs. The story should have a clear and resolved ending, avoiding plot holes. Write at least 3 new chapters. Each chapter must have a clear title prefixed with "Chapter X:". Use "---" as a separator between chapters.
        ## CORE CONCEPT
        - **Title**: ${story.title}
        - **Summary**: ${story.summary}
        ## UNIVERSE & PLOT
        - **Universe**: ${story.universe}
        - **Plot Outline**: ${story.plot}
        ## CHARACTERS
        ${story.characters.map(c => `- **${c.name}**: ${c.description}`).join('\n')}
        ## EXISTING CHAPTERS
        ${existingChapters}
        ## YOUR TASK
        Continue and finish the story from here.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error autocompleting story:", error);
        return "Error: Could not autocomplete the story.";
    }
};

export const generateChatResponse = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating chat response:", error);
        return "I'm sorry, I encountered an error and can't respond right now.";
    }
};
