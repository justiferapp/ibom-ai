
import React, { useState } from 'react';
import type { GeneratedImage, GeneratedAdCopy } from '../types.ts';
import ImageCard from './ImageCard.tsx';
import AdCopyCard from './AdCopyCard.tsx';
import Modal from './Modal.tsx';
import { SparklesIcon } from './icons.tsx';

interface ResultsDisplayProps {
  images: GeneratedImage[];
  adCopies: GeneratedAdCopy[];
  isLoading: boolean;
  onNewPrompt: (image: GeneratedImage) => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ images, adCopies, isLoading, onNewPrompt }) => {
  const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-secondary space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-accent"></div>
        <p className="text-lg">Generating your assets...</p>
        <p className="text-sm text-center max-w-md">Our AI is crafting stunning product photos and compelling ad copy. This might take a moment.</p>
      </div>
    );
  }

  if (images.length === 0 && adCopies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-secondary text-center p-8 border-2 border-dashed border-border-color rounded-lg">
        <SparklesIcon className="w-16 h-16 mb-4 text-brand-accent" />
        <h3 className="text-xl font-semibold text-text-primary">Your Masterpieces Await</h3>
        <p className="mt-2 max-w-md">Upload your product image, tweak the settings, and let our AI create professional-grade marketing assets for you.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Generated Images</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map(image => (
            <ImageCard key={image.id} image={image} onView={setModalImageSrc} onNewPrompt={onNewPrompt} />
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Generated Ad Copies</h2>
        <div className="space-y-3">
          {adCopies.map(copy => (
            <AdCopyCard key={copy.id} adCopy={copy} />
          ))}
        </div>
      </div>
      <Modal isOpen={!!modalImageSrc} onClose={() => setModalImageSrc(null)}>
        {modalImageSrc && <img src={modalImageSrc} alt="Enlarged product view" className="max-w-full max-h-[85vh] rounded-md" />}
      </Modal>
    </div>
  );
};

export default ResultsDisplay;