import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { GeneratedImage, GeneratedAdCopy, Settings, AdminSettings, GenerationHistoryItem, User } from './types';
import ImageUpload from './components/ImageUpload';
import SettingsPanel from './components/SettingsPanel';
import ResultsDisplay from './components/ResultsDisplay';
import Modal from './components/Modal';
import AdminPanel from './components/AdminPanel';
import UserDashboard from './components/UserDashboard';
import AuthModal from './components/AuthModal';
import BuyCreditsModal from './components/BuyCreditsModal';
import { generateProductAssets, regenerateSingleImage, removeBackgroundImage } from './services/geminiService';
import { SparklesIcon, InfoIcon, CogIcon, UserIcon } from './components/icons';

const createThumbnail = (base64Src: string, width = 128, height = 128): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context failed'));

            const sourceX = img.width > img.height ? (img.width - img.height) / 2 : 0;
            const sourceY = img.height > img.width ? (img.height - img.width) / 2 : 0;
            const sourceWidth = Math.min(img.width, img.height);
            const sourceHeight = Math.min(img.width, img.height);
            
            ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = base64Src;
    });
};

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ base64: string; mimeType: string; name: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generatedAdCopies, setGeneratedAdCopies] = useState<GeneratedAdCopy[]>([]);
  
  const [settings, setSettings] = useState<Settings>({
    imagePrompt: 'A professional studio shot on a plain white background.',
    adCopyPrompt: 'Persuasive, benefit-driven, and includes a clear call to action.',
    aspectRatio: '1:1',
    resolution: '2K',
    numberOfImages: 5,
    styleMode: 'studio',
    studioOption: 'Plain White Background',
    lifestyleOption: 'On a Kitchen Counter',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    try {
        const savedSettings = localStorage.getItem('ibom-ai-admin-settings');
        return savedSettings ? JSON.parse(savedSettings) : {
            paystackPublicKey: '',
            paystackSecretKey: '',
            flutterwavePublicKey: '',
            flutterwaveSecretKey: '',
            defaultCredits: 20,
            imageAutoDeleteHours: 0,
        };
    } catch (e) {
        console.error("Failed to parse admin settings from localStorage", e);
        return {
            paystackPublicKey: '',
            paystackSecretKey: '',
            flutterwavePublicKey: '',
            flutterwaveSecretKey: '',
            defaultCredits: 20,
            imageAutoDeleteHours: 0,
        };
    }
  });
  const [credits, setCredits] = useState(adminSettings.defaultCredits);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [footerClicks, setFooterClicks] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);
  const [newImagePrompt, setNewImagePrompt] = useState('');
  
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);

  const autoDeleteTimerRef = useRef<number | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBuyCreditsModalOpen, setIsBuyCreditsModalOpen] = useState(false);

  useEffect(() => {
    let newPrompt = '';
    if (settings.styleMode === 'studio') {
      newPrompt = `A professional studio product shot. Style: ${settings.studioOption}.`;
    } else {
      newPrompt = `A professional lifestyle product shot. Setting: ${settings.lifestyleOption}.`;
    }
    
    if (newPrompt !== settings.imagePrompt) {
        setSettings(prev => ({...prev, imagePrompt: newPrompt}));
    }
  }, [settings.styleMode, settings.studioOption, settings.lifestyleOption, settings.imagePrompt]);

  useEffect(() => {
    if (!user) {
        setCredits(0);
    } else {
        setCredits(adminSettings.defaultCredits);
    }
  }, [user, adminSettings.defaultCredits]);
  
  useEffect(() => {
    return () => {
      if (autoDeleteTimerRef.current) {
        clearTimeout(autoDeleteTimerRef.current);
      }
    };
  }, []);

  const handleAdminSettingsSave = (newSettings: AdminSettings) => {
      setAdminSettings(newSettings);
      localStorage.setItem('ibom-ai-admin-settings', JSON.stringify(newSettings));
      setIsAdminPanelOpen(false);
      alert('Admin settings saved successfully!');
  };

  const handleImageUpload = useCallback((file: { base64: string; mimeType: string; name: string }) => {
    setOriginalImage(file);
    setPreviewUrl(`data:${file.mimeType};base64,${file.base64}`);
    setGeneratedImages([]);
    setGeneratedAdCopies([]);
    setError(null);
  }, []);
  
  const handleRemoveBackground = async () => {
    if (!user) {
        setError("Please log in to remove background.");
        setIsAuthModalOpen(true);
        return;
    }
    if (!originalImage) {
        setError("Please upload an image first.");
        return;
    }
    if (credits < 1) {
        setError("You need at least 1 credit to remove the background.");
        return;
    }

    setIsRemovingBackground(true);
    setError(null);

    try {
        const { base64, mimeType } = await removeBackgroundImage(originalImage);
        const newFileName = originalImage.name.replace(/\.[^/.]+$/, "") + "-no-bg.png";
        
        setOriginalImage({ base64, mimeType, name: newFileName });
        setPreviewUrl(`data:${mimeType};base64,${base64}`);
        setCredits(prev => prev - 1);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred while removing the background.");
        }
    } finally {
        setIsRemovingBackground(false);
    }
  };

  const handleGenerate = async () => {
    if (!user) {
        setError("Please log in to generate assets.");
        setIsAuthModalOpen(true);
        return;
    }
    if (!originalImage) {
      setError("Please upload a product image first.");
      return;
    }
    if (credits < settings.numberOfImages) {
      setError(`You need ${settings.numberOfImages} credits to generate, but you only have ${credits}.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setGeneratedAdCopies([]);

    try {
      const { generatedImages: newImages, generatedAdCopies: newCopies } = await generateProductAssets(originalImage, settings);
      
      const newGeneratedImages = newImages.map((src, i) => ({ id: `${Date.now()}-${i}`, src }));
      const newGeneratedAdCopies = newCopies.map((text, i) => ({ id: `${Date.now()}-${i}`, text }));

      setGeneratedImages(newGeneratedImages);
      setGeneratedAdCopies(newGeneratedAdCopies);
      setCredits(prev => prev - settings.numberOfImages);

      const thumbnails = await Promise.all(newGeneratedImages.map(img => createThumbnail(img.src)));
      const historyItem: GenerationHistoryItem = {
          id: `${Date.now()}`,
          timestamp: Date.now(),
          imagePrompt: settings.imagePrompt,
          thumbnails: thumbnails,
          adCopies: newGeneratedAdCopies,
      };
      setHistory(prev => [historyItem, ...prev]);

      if (autoDeleteTimerRef.current) {
        clearTimeout(autoDeleteTimerRef.current);
      }
      if (adminSettings.imageAutoDeleteHours > 0) {
        autoDeleteTimerRef.current = window.setTimeout(() => {
          setGeneratedImages([]);
          setGeneratedAdCopies([]);
        }, adminSettings.imageAutoDeleteHours * 3600 * 1000);
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditPromptOpen = (image: GeneratedImage) => {
    if (credits < 1) {
        setError("You need at least 1 credit to edit an image.");
        return;
    }
    setEditingImage(image);
    setNewImagePrompt('');
    setIsEditModalOpen(true);
  };

  const handleRegenerateImage = async () => {
    if (!editingImage || !originalImage || !newImagePrompt.trim()) return;
    if (credits < 1) {
        setError("You are out of credits.");
        setIsEditModalOpen(false);
        return;
    }

    setIsRegenerating(true);
    setError(null);

    try {
        const { resolution, aspectRatio } = settings;
        const newImageSrc = await regenerateSingleImage(originalImage, newImagePrompt, { resolution, aspectRatio });
        
        setGeneratedImages(prevImages => prevImages.map(img => 
            img.id === editingImage.id ? { ...img, src: newImageSrc } : img
        ));
        
        setCredits(prev => prev - 1);
        setIsEditModalOpen(false);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during regeneration.";
        setError(errorMessage);
        setIsEditModalOpen(false);
    } finally {
        setIsRegenerating(false);
    }
  };
  
  const handleLogin = (newUser: User) => {
      setUser(newUser);
      setHistory([]);
  };

  const handleSignup = (newUser: User) => {
      setUser(newUser);
      alert(`Welcome, ${newUser.email}! Your account has been created.`);
      setHistory([]);
  };

  const handleLogout = () => {
      setUser(null);
      setGeneratedImages([]);
      setGeneratedAdCopies([]);
      setHistory([]);
  };
  
  const handleUserIconClick = () => {
      if (user) {
          setIsDashboardOpen(true);
      } else {
          setIsAuthModalOpen(true);
      }
  };

  const handleBuyCredits = () => {
      if (!user) {
        setIsAuthModalOpen(true);
        return;
      }
      setIsBuyCreditsModalOpen(true);
  };

  const handleAddCredits = (amount: number) => {
    setCredits(prev => prev + amount);
  };

  const handleFooterClick = () => {
    const newClickCount = footerClicks + 1;
    setFooterClicks(newClickCount);
    if (newClickCount >= 5 && !isAdmin) {
      setIsAdmin(true);
      alert('Admin mode activated!');
    }
  };

  const isGenerateDisabled = !user || !originalImage || isLoading || isRemovingBackground || (user && credits < settings.numberOfImages);
  const isRemoveBgDisabled = !user || !originalImage || isLoading || isRemovingBackground || (user && credits < 1);
  const noGatewaysConfigured = !adminSettings.paystackPublicKey && !adminSettings.flutterwavePublicKey;

  return (
    <div className="min-h-screen bg-brand-primary text-text-primary font-sans">
      <header className="bg-brand-secondary/50 backdrop-blur-sm border-b border-border-color sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                <h1 className="text-2xl font-bold">Ibom AI <span className="text-brand-accent">Product Pro</span></h1>
                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                          <div className="text-sm">
                              <span className="font-semibold text-brand-accent">{credits}</span>
                              <span className="text-text-secondary"> Credits</span>
                          </div>
                          <button 
                              onClick={handleBuyCredits}
                              disabled={noGatewaysConfigured}
                              title={noGatewaysConfigured ? "Admin has not configured payment gateways" : "Buy more credits"}
                              className="px-4 py-2 bg-brand-accent text-white rounded-md text-sm font-semibold hover:bg-brand-accent-hover transition-colors disabled:bg-brand-secondary disabled:text-text-secondary disabled:cursor-not-allowed"
                          >
                              Buy Credits
                          </button>
                           <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-brand-primary border border-border-color text-text-secondary rounded-md text-sm font-semibold hover:bg-border-color transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="text-sm text-text-secondary">
                          Login to start creating
                        </div>
                    )}
                    <button 
                        onClick={handleUserIconClick}
                        className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                        aria-label="User Profile"
                    >
                        <UserIcon className="w-6 h-6" />
                    </button>
                    {isAdmin && (
                        <button 
                            onClick={() => setIsAdminPanelOpen(true)}
                            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                            aria-label="Admin Settings"
                        >
                            <CogIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="bg-brand-secondary p-6 rounded-lg border border-border-color">
                <h2 className="text-lg font-semibold mb-4">1. Upload Image</h2>
                <ImageUpload onImageUpload={handleImageUpload} previewUrl={previewUrl} isLoading={isRemovingBackground} />
                {originalImage && (
                    <div className="mt-4">
                        <button
                            onClick={handleRemoveBackground}
                            disabled={isRemoveBgDisabled}
                            className="w-full flex items-center justify-center py-2 px-4 bg-brand-primary border border-border-color text-text-primary rounded-md font-semibold hover:bg-border-color transition-colors disabled:bg-brand-secondary disabled:text-text-secondary disabled:cursor-not-allowed"
                        >
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            {isRemovingBackground ? 'Removing...' : 'Remove Background (1 Credit)'}
                        </button>
                        {user && credits < 1 && originalImage && !isRemovingBackground && (
                            <p className="text-yellow-400 text-xs mt-2 text-center">Not enough credits.</p>
                        )}
                    </div>
                )}
            </div>
             <div className="bg-brand-secondary p-6 rounded-lg border border-border-color">
                <h2 className="text-lg font-semibold mb-4">2. Configure AI</h2>
                <SettingsPanel settings={settings} onSettingsChange={setSettings} isDisabled={isLoading} />
            </div>
            <div className="bg-brand-secondary p-6 rounded-lg border border-border-color">
                <h2 className="text-lg font-semibold mb-4">3. Generate</h2>
                <button
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className="w-full flex items-center justify-center py-3 px-4 bg-brand-accent text-white rounded-md font-bold text-lg hover:bg-brand-accent-hover transition-colors disabled:bg-brand-secondary disabled:text-text-secondary disabled:cursor-not-allowed"
                >
                <SparklesIcon className="w-6 h-6 mr-2" />
                {isLoading ? 'Generating...' : `Generate Assets (${settings.numberOfImages} Credits)`}
                </button>
                {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
                {!user && (
                    <div className="flex items-start text-sm text-yellow-400 mt-4 p-3 bg-yellow-900/20 rounded-md">
                        <InfoIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Please log in to start generating assets.</span>
                    </div>
                )}
                {!originalImage && !isLoading && user && (
                    <div className="flex items-start text-sm text-text-secondary mt-4 p-3 bg-brand-primary/50 rounded-md">
                        <InfoIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Please upload an image to enable generation.</span>
                    </div>
                )}
                 {user && credits < settings.numberOfImages && originalImage && !isLoading && (
                    <div className="flex items-start text-sm text-yellow-400 mt-4 p-3 bg-yellow-900/20 rounded-md">
                        <InfoIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Not enough credits to generate {settings.numberOfImages} image(s). Please lower the amount or purchase more credits.</span>
                    </div>
                )}
            </div>
          </aside>

          <section className="lg:col-span-8 xl:col-span-9 bg-brand-secondary p-6 rounded-lg border border-border-color min-h-[500px]">
            <ResultsDisplay images={generatedImages} adCopies={generatedAdCopies} isLoading={isLoading} onNewPrompt={handleEditPromptOpen} />
          </section>
        </div>
      </main>
      <footer className="text-center py-6 text-text-secondary/50 text-sm">
        <p onClick={handleFooterClick} className="cursor-pointer select-none">&copy; {new Date().getFullYear()} Ibom AI. A $10M SaaS Product built for you.</p>
      </footer>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <div className="p-4 space-y-4 text-text-primary w-[500px]">
          <h2 className="text-xl font-bold">Edit Image with a New Prompt</h2>
          <p className="text-sm text-text-secondary">Describe the changes you want for this image. This will use 1 credit.</p>
          <img src={editingImage?.src} alt="Image to edit" className="w-48 h-48 mx-auto rounded-md object-contain" />
          <textarea
            rows={3}
            className="w-full bg-brand-primary border border-border-color rounded-md p-2 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition duration-150"
            value={newImagePrompt}
            onChange={(e) => setNewImagePrompt(e.target.value)}
            placeholder="e.g., make it look like it's on a wooden table, add a plant in the background..."
            disabled={isRegenerating}
          />
          <button
            onClick={handleRegenerateImage}
            disabled={isRegenerating || !newImagePrompt.trim()}
            className="w-full flex items-center justify-center py-2 px-4 bg-brand-accent text-white rounded-md font-bold hover:bg-brand-accent-hover transition-colors disabled:bg-brand-secondary disabled:text-text-secondary disabled:cursor-not-allowed"
          >
            {isRegenerating ? 'Regenerating...' : 'Regenerate Image (1 Credit)'}
          </button>
        </div>
      </Modal>

      <AdminPanel 
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        settings={adminSettings}
        onSave={handleAdminSettingsSave}
      />

      <UserDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        credits={credits}
        history={history}
        user={user}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />

      <BuyCreditsModal
        isOpen={isBuyCreditsModalOpen}
        onClose={() => setIsBuyCreditsModalOpen(false)}
        adminSettings={adminSettings}
        user={user}
        onAddCredits={handleAddCredits}
      />
    </div>
  );
};

export default App;