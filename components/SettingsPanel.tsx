import React from 'react';
import type { Settings, AspectRatio, Resolution } from '../types';

interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: React.Dispatch<React.SetStateAction<Settings>>;
  isDisabled: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, isDisabled }) => {
  const handleInputChange = <K extends keyof Settings,>(key: K, value: Settings[K]) => {
    onSettingsChange(prev => ({ ...prev, [key]: value }));
  };

  const aspectRatios: AspectRatio[] = ["1:1", "4:3", "3:4", "16:9", "9:16"];
  const resolutions: Resolution[] = ["1024x1024", "2K", "4K", "8K"];
  const imageCounts = [1, 2, 3, 4, 5];

  const studioOptions = [
    "Plain White Background",
    "Gradient Background",
    "On a Reflective Surface",
    "With Geometric Props",
    "Floating Effect",
  ];
  
  const lifestyleOptions = [
    "On a Kitchen Counter",
    "In a Natural Setting (e.g., forest, beach)",
    "With a Human Model (face not visible)",
    "On a Modern Desk Setup",
    "On a Marble Tabletop",
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Image Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleInputChange('styleMode', 'studio')}
            disabled={isDisabled}
            className={`py-2 px-4 rounded-md font-semibold text-sm transition-colors w-full ${settings.styleMode === 'studio' ? 'bg-brand-accent text-white' : 'bg-brand-primary border border-border-color hover:bg-border-color'}`}
          >
            Studio
          </button>
          <button
            onClick={() => handleInputChange('styleMode', 'lifestyle')}
            disabled={isDisabled}
            className={`py-2 px-4 rounded-md font-semibold text-sm transition-colors w-full ${settings.styleMode === 'lifestyle' ? 'bg-brand-accent text-white' : 'bg-brand-primary border border-border-color hover:bg-border-color'}`}
          >
            Lifestyle
          </button>
        </div>
      </div>

      <div>
          <label htmlFor="style-option" className="block text-sm font-medium text-text-primary mb-2">
            Advanced Options
          </label>
          {settings.styleMode === 'studio' ? (
             <select
                id="style-option"
                disabled={isDisabled}
                className="w-full bg-brand-secondary border border-border-color rounded-md p-2 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition duration-150 disabled:opacity-50"
                value={settings.studioOption}
                onChange={(e) => handleInputChange('studioOption', e.target.value)}
            >
                {studioOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <select
                id="style-option"
                disabled={isDisabled}
                className="w-full bg-brand-secondary border border-border-color rounded-md p-2 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition duration-150 disabled:opacity-50"
                value={settings.lifestyleOption}
                onChange={(e) => handleInputChange('lifestyleOption', e.target.value)}
            >
                {lifestyleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="aspect-ratio" className="block text-sm font-medium text-text-primary mb-2">
            Aspect Ratio
          </label>
          <select
            id="aspect-ratio"
            disabled={isDisabled}
            className="w-full bg-brand-secondary border border-border-color rounded-md p-2 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition duration-150 disabled:opacity-50"
            value={settings.aspectRatio}
            onChange={(e) => handleInputChange('aspectRatio', e.target.value as AspectRatio)}
          >
            {aspectRatios.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="resolution" className="block text-sm font-medium text-text-primary mb-2">
            Resolution
          </label>
          <select
            id="resolution"
            disabled={isDisabled}
            className="w-full bg-brand-secondary border border-border-color rounded-md p-2 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition duration-150 disabled:opacity-50"
            value={settings.resolution}
            onChange={(e) => handleInputChange('resolution', e.target.value as Resolution)}
          >
            {resolutions.map(res => <option key={res} value={res}>{res}</option>)}
          </select>
        </div>
      </div>
       <div>
        <label htmlFor="number-of-images" className="block text-sm font-medium text-text-primary mb-2">
          Number of Images (1 credit per image)
        </label>
        <select
          id="number-of-images"
          disabled={isDisabled}
          className="w-full bg-brand-secondary border border-border-color rounded-md p-2 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition duration-150 disabled:opacity-50"
          value={settings.numberOfImages}
          onChange={(e) => handleInputChange('numberOfImages', parseInt(e.target.value, 10))}
        >
          {imageCounts.map(count => <option key={count} value={count}>{count}</option>)}
        </select>
      </div>
    </div>
  );
};

export default SettingsPanel;