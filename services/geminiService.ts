import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Story, Character, DialogueLine, Universe } from '../types';
import { contentRatingTags } from '../constants';

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

export const fetchFranchiseLore = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
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

export const generateUniverseFromFranchise = async (franchiseName: string): Promise<Partial<Universe>> => {
    const prompt = `
        You are a lore expert and world-builder. Your task is to use Google Search to gather information about the fictional franchise specified by the user and create a starter kit for a story-writing application.

        Franchise: "${franchiseName}"

        Based on your search, provide the following information formatted as a single, valid JSON object inside a markdown code block:
        1.  "description": A 3-4 sentence, engaging summary of the universe's core concept, setting, and tone.
        2.  "rules": An array of 5-7 fundamental string rules or principles that govern this universe (e.g., how magic works, key historical facts, laws of physics).
        3.  "characters": An array of 5 key characters from the franchise. Each character must be an object with "name", "role" (e.g., "Protagonist", "Antagonist", "Mentor"), and "description" (a 1-2 sentence summary of who they are).

        Example JSON structure:
        \`\`\`json
        {
          "description": "...",
          "rules": ["...", "..."],
          "characters": [
            { "name": "...", "role": "...", "description": "..." }
          ]
        }
        \`\`\`
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        const text = response.text;
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        
        if (jsonMatch && jsonMatch[1]) {
            const parsed = JSON.parse(jsonMatch[1]);
            // Validate the structure
            if (parsed.description && Array.isArray(parsed.rules) && Array.isArray(parsed.characters)) {
                return {
                    name: franchiseName,
                    description: parsed.description,
                    rules: parsed.rules,
                    // Ensure characters have all fields to match the Character type
                    characters: parsed.characters.map((c: any) => ({
                        name: c.name || 'Unknown',
                        role: c.role || 'Unknown',
                        description: c.description || 'No description provided.',
                        arc: 'Not specified',
                    })),
                };
            }
        }
        throw new Error("Failed to parse valid universe structure from Gemini response.");

    } catch (error) {
        console.error("Error generating universe from franchise:", error);
        throw new Error("Could not generate universe. The franchise may be too obscure or the response was invalid.");
    }
};

export const analyzeStoryContent = async (storyContent: string): Promise<string[]> => {
  const allTags = Object.values(contentRatingTags).flat();
  const prompt = `
    Analyze the following story content for sensitive themes. Based on the text, identify all applicable content warnings from the provided list.
    Your response must be a valid JSON array of strings, containing only tags from the list. Do not add any explanation.

    LIST OF POSSIBLE TAGS:
    ${allTags.join(', ')}

    STORY CONTENT:
    ---
    ${storyContent.substring(0, 8000)}
    ---

    JSON Response:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    });
    const jsonStr = response.text.trim();
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
        return parsed;
    }
    return ['Analysis Failed'];
  } catch (error) {
    console.error("Error analyzing story content:", error);
    return ['Content analysis could not be performed.'];
  }
};

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

export const generateAlternativeChapter = async (story: Story, currentChapterIndex: number, userPrompt: string): Promise<string> => {
    const chaptersSoFar = story.chapters.slice(0, currentChapterIndex + 1).map((c, i) => `Chapter ${i+1}: ${c.title}\n${c.content}`).join('\n\n---\n\n');
    const nextChapterNumber = currentChapterIndex + 2;

    const fullPrompt = `
      # ALTERNATIVE SCENARIO BRIEF
      You are a creative writer continuing a story with a twist. The user wants to explore a "what-if" scenario.
      Based on the story so far (up to and including Chapter ${currentChapterIndex + 1}), write a *single*, brand new chapter that follows the user's prompt. This new chapter will create an alternative timeline.

      ## STORY CONTEXT
      - **Title**: ${story.title}
      - **Summary**: ${story.summary}
      - **Universe**: ${story.universe}
      - **Plot Outline**: ${story.plot}
      - **Characters**: ${story.characters.map(c => `- **${c.name}**: ${c.description}`).join('\n')}

      ## EXISTING CHAPTERS (UP TO THE DIVERGENCE POINT)
      ${chaptersSoFar}

      ## USER'S "WHAT IF" PROMPT
      "${userPrompt}"

      ## YOUR TASK
      Write one complete, engaging chapter based on this prompt. The chapter should be titled appropriately, starting with "Chapter ${nextChapterNumber}a: [Your Title]". Do NOT include any separators like "---". Just output the single chapter text.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: fullPrompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating alternative chapter:", error);
        return "Error: Could not generate the alternative chapter.";
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

export const generateUniverseDetails = async (stories: Story[]): Promise<{ description: string, timeline: string }> => {
    const storySummaries = stories.map(s => `- ${s.title}: ${s.summary}`).join('\n');
    const prompt = `
        Analyze the following story summaries from the same universe.
        Based on this information, generate a cohesive and engaging universe description and a chronological timeline of major events mentioned or implied in the stories.

        Stories:
        ${storySummaries}

        Your response must be a valid JSON object with two keys: "description" (a 2-3 sentence summary of the universe) and "timeline" (a markdown formatted string listing key events chronologically).
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        timeline: { type: Type.STRING }
                    },
                    required: ["description", "timeline"]
                }
            }
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error generating universe details:", error);
        return { description: "Failed to generate description.", timeline: "Failed to generate timeline." };
    }
};

export const generateCharacterConceptArt = async (character: Character): Promise<string> => {
    const prompt = `Create a high-quality, cinematic character concept art portrait. The character should be the main focus.
    
    Character Details:
    - Name: ${character.name}
    - Role: ${character.role}
    - Appearance: ${character.appearance || character.description}
    - Core Vibe: ${character.motivation || character.flaws}

    Art Style: detailed, digital painting, fantasy art, cinematic lighting, character design sheet. Do not include any text or labels.
    `;
    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
              responseModalities: [Modality.IMAGE],
          },
        });
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
          }
        }
        throw new Error("No image generated");
    } catch (error) {
        console.error("Error generating concept art:", error);
        return `https://picsum.photos/seed/${Math.random()}/600/800`; // Fallback
    }
}

export const generateCrossoverArt = async (character: Character, fanficLore: string): Promise<string> => {
    const prompt = `Create a high-quality piece of concept art featuring the following character, integrated into the world described.
    
    Character Details:
    - Name: ${character.name}
    - Appearance: ${character.appearance || character.description}
    - Role: ${character.role}

    World / Franchise Lore:
    ---
    ${fanficLore}
    ---

    Art Style: cinematic, detailed, digital painting, dramatic lighting.
    `;
    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
              responseModalities: [Modality.IMAGE],
          },
        });
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
          }
        }
        throw new Error("No image generated");
    } catch (error) {
        console.error("Error generating crossover art:", error);
        return `https://picsum.photos/seed/${Math.random()}/800/600`;
    }
}

export const generateCrossoverChapter = async (character: Character, fanficLore: string, userPrompt: string): Promise<string> => {
    const prompt = `You are a master of fanfiction. Your task is to seamlessly integrate a character into an existing franchise's lore.
    
    # CHARACTER TO INSERT
    - Name: ${character.name}
    - Description: ${character.description}
    - Motivation: ${character.motivation}
    - Flaws: ${character.flaws}

    # FRANCHISE LORE
    ---
    ${fanficLore}
    ---

    # USER'S SCENARIO
    ---
    ${userPrompt}
    ---
    
    # YOUR TASK
    Write a single, high-quality chapter based on the user's scenario. The chapter must be consistent with the franchise's tone and the inserted character's personality. Make the integration feel natural. Output only the chapter text. Do not add any introductory text or titles.
    `;
     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating crossover chapter:", error);
        return "Error: Could not generate the crossover chapter.";
    }
};