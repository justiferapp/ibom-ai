export interface GeneratedImage {
  id: string;
  src: string;
}

export interface GeneratedAdCopy {
  id: string;
  text: string;
}

export type AspectRatio = "1:1" | "4:3" | "3:4" | "16:9" | "9:16";
export type Resolution = "1024x1024" | "2K" | "4K" | "8K";

export interface Settings {
  imagePrompt: string;
  adCopyPrompt: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  numberOfImages: number;
  styleMode: 'studio' | 'lifestyle';
  studioOption: string;
  lifestyleOption: string;
}

export interface AdminSettings {
  paystackPublicKey: string;
  paystackSecretKey: string;
  flutterwavePublicKey: string;
  flutterwaveSecretKey: string;
  defaultCredits: number;
  imageAutoDeleteHours: number;
}

export interface GenerationHistoryItem {
  id: string;
  timestamp: number;
  imagePrompt: string;
  thumbnails: string[];
  adCopies: GeneratedAdCopy[];
}

export interface User {
  email: string;
}

export interface CreditPackage {
  id: string;
  credits: number;
  price: number; // in USD
  priceDescription: string;
}