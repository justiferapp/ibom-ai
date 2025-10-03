import type { Settings, Resolution, AspectRatio } from '../types.ts';

const addWatermark = (base64Image: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }

            ctx.drawImage(img, 0, 0);

            // Watermark settings
            const fontSize = Math.max(24, Math.floor(img.width / 40));
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            
            const padding = Math.max(10, Math.floor(img.width / 100));
            ctx.fillText('Ibom AI', canvas.width - padding, padding);

            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (err) => {
            reject(err);
        };
        img.src = base64Image;
    });
};

// Helper to call our serverless function
const callApiProxy = async (body: any) => {
    const response = await fetch('/.netlify/functions/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from server.' }));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }
    return response.json();
};

export const removeBackgroundImage = async (
    originalImage: { base64: string; mimeType: string }
): Promise<{ base64: string; mimeType: string }> => {
    try {
        const body = {
            action: 'remove-background',
            originalImage,
        };
        const result = await callApiProxy(body);

        if (result.base64 && result.mimeType) {
            return result;
        }
        
        throw new Error("API proxy did not return a valid image for background removal.");

    } catch (error) {
        console.error("Error removing background via proxy:", error);
        throw error;
    }
};

export const regenerateSingleImage = async (
    originalImage: { base64: string; mimeType: string },
    prompt: string,
    settings: { resolution: Resolution, aspectRatio: AspectRatio }
): Promise<string> => {
    try {
        const body = {
            action: 'regenerate',
            originalImage,
            prompt,
            settings
        };
        const result = await callApiProxy(body);

        if (result.base64 && result.mimeType) {
            const dataUrl = `data:${result.mimeType};base64,${result.base64}`;
            return addWatermark(dataUrl);
        }
        
        throw new Error("API proxy did not return a valid image.");

    } catch (error) {
        console.error("Error regenerating single image via proxy:", error);
        throw error; // Re-throw the error to be caught by the UI
    }
};

export const generateProductAssets = async (
  originalImage: { base64: string; mimeType: string },
  settings: Settings
) => {
  try {
    const body = {
        action: 'generate',
        originalImage,
        settings,
    };
    const { generatedImages: rawImages, generatedAdCopies } = await callApiProxy(body);
    
    // Watermark images on the client side
    const watermarkedImagesPromises = rawImages.map((img: {base64: string, mimeType: string}) => {
        if (img && img.base64) {
            const dataUrl = `data:${img.mimeType};base64,${img.base64}`;
            return addWatermark(dataUrl);
        }
        return Promise.resolve(null);
    });

    const generatedImages = (await Promise.all(watermarkedImagesPromises)).filter((img): img is string => img !== null);

    return { generatedImages, generatedAdCopies };

  } catch (error) {
    console.error("Error generating product assets via proxy:", error);
    throw error; // Re-throw the error to be caught by the UI
  }
};