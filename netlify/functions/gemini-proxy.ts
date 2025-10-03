
import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { Handler } from "@netlify/functions";

// A simplified interface for what the function expects from the frontend.
interface GenerationRequest {
    action: 'generate' | 'regenerate' | 'remove-background';
    originalImage: { base64: string; mimeType: string };
    settings?: any; 
    prompt?: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: { data: base64, mimeType },
  };
};

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  if (!process.env.API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'API key is not configured on the server.' }) };
  }

  try {
    const { action, originalImage, settings, prompt } = JSON.parse(event.body || '{}') as GenerationRequest;
    
    if (!originalImage || !originalImage.base64 || !originalImage.mimeType) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid or missing image data.' }) };
    }
    const imagePart = fileToGenerativePart(originalImage.base64, originalImage.mimeType);

    if (action === 'generate') {
      // --- Image Generation ---
      const imagePrompt = `Create a distinct, professional, stealthy, and marketable product image from this raw photo. The image must be clean and high-quality for social media. Product is the central focus. Settings: Resolution: ${settings.resolution}, Aspect Ratio: ${settings.aspectRatio}. Style guide: ${settings.imagePrompt}.`;

      const imagePromises = Array(settings.numberOfImages).fill(0).map(() => 
          ai.models.generateContent({
              model: 'nano-banana',
              contents: { parts: [imagePart, { text: imagePrompt }] },
              config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
          })
      );
      const imageResponses = await Promise.all(imagePromises);
      
      const generatedImages = imageResponses.map(response => {
        const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return { base64: imagePart.inlineData.data, mimeType: imagePart.inlineData.mimeType };
        }
        return null;
      }).filter(Boolean);

      // --- Ad Copy Generation ---
      const adCopyPrompt = `Based on the uploaded product image, generate 5 irresistible ad copies. Each copy must trigger buyer intent by highlighting pain points and benefits. Make them concise, punchy, and perfect for social media. Follow this style guide: ${settings.adCopyPrompt}`;
      const adCopyResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: adCopyPrompt }] },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT, properties: { ad_copies: { type: Type.ARRAY, description: "An array of 5 unique and compelling ad copies.", items: { type: Type.STRING } } }
          }
        }
      });
      const adCopyData = JSON.parse(adCopyResponse.text);
      const generatedAdCopies: string[] = adCopyData.ad_copies || [];
      
      return { statusCode: 200, body: JSON.stringify({ generatedImages, generatedAdCopies }) };
    
    } else if (action === 'regenerate') {
        const fullPrompt = `Using this original product photo, generate a new version with this style: "${prompt}". Apply these settings: Resolution: ${settings.resolution}, Aspect Ratio: ${settings.aspectRatio}.`;
        const imageResponse = await ai.models.generateContent({
            model: 'nano-banana',
            contents: { parts: [imagePart, { text: fullPrompt }] },
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
        });

        const newImagePart = imageResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (newImagePart?.inlineData) {
            const result = { base64: newImagePart.inlineData.data, mimeType: newImagePart.inlineData.mimeType };
            return { statusCode: 200, body: JSON.stringify(result) };
        }
        throw new Error("AI failed to generate a new image during regeneration.");
    } else if (action === 'remove-background') {
        const removeBgPrompt = "Remove the background from this image entirely, leaving only the main product. The new background must be transparent. The final output must be a PNG file to preserve transparency.";
        
        const imageResponse = await ai.models.generateContent({
            model: 'nano-banana',
            contents: { parts: [imagePart, { text: removeBgPrompt }] },
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] }, 
        });

        const newImagePart = imageResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (newImagePart?.inlineData) {
            // Force PNG for transparency support
            const result = { base64: newImagePart.inlineData.data, mimeType: 'image/png' };
            return { statusCode: 200, body: JSON.stringify(result) };
        }
        throw new Error("AI failed to remove the background.");
    } else {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action specified.' }) };
    }

  } catch (error) {
    console.error("Error in serverless function:", error);
    const message = error instanceof Error ? error.message : "An unknown server error occurred.";
    return {
      statusCode: 500,
      body: JSON.stringify({ error: message }),
    };
  }
};

export { handler };
