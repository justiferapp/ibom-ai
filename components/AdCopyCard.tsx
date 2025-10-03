
import React, { useState } from 'react';
import type { GeneratedAdCopy } from '../types.ts';
import { CopyIcon, CheckIcon } from './icons.tsx';

interface AdCopyCardProps {
  adCopy: GeneratedAdCopy;
}

const AdCopyCard: React.FC<AdCopyCardProps> = ({ adCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(adCopy.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-brand-secondary border border-border-color p-4 rounded-lg flex items-start space-x-4">
      <p className="flex-1 text-text-secondary text-sm">{adCopy.text}</p>
      <button
        onClick={handleCopy}
        className={`p-2 rounded-md transition-colors ${copied ? 'bg-green-500/20 text-green-400' : 'bg-brand-primary text-text-secondary hover:bg-brand-accent hover:text-white'}`}
        aria-label="Copy ad text"
      >
        {copied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default AdCopyCard;