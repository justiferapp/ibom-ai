
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons.tsx';

interface ImageUploadProps {
  onImageUpload: (file: { base64: string; mimeType: string; name: string }) => void;
  previewUrl: string | null;
  isLoading?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, previewUrl, isLoading = false }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        onImageUpload({ base64, mimeType: file.type, name: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, [onImageUpload]);

  return (
    <div className="w-full relative">
      <label
        htmlFor="file-upload"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex justify-center items-center w-full h-64 px-6 transition bg-brand-secondary border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-brand-accent ${isDragging ? 'border-brand-accent' : 'border-border-color'}`}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Product preview" className="object-contain h-full max-w-full rounded-md" />
        ) : (
          <span className="flex flex-col items-center space-y-2">
            <UploadIcon className="w-10 h-10 text-text-secondary" />
            <span className="font-medium text-text-secondary text-center">
              Drop your product image here, or{' '}
              <span className="text-brand-accent">browse</span>
            </span>
            <span className="text-xs text-text-secondary/50">PNG, JPG, WEBP up to 10MB</span>
          </span>
        )}
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={(e) => handleFileChange(e.target.files)}
        />
      </label>
      {isLoading && (
        <div className="absolute inset-0 bg-brand-secondary/80 flex flex-col items-center justify-center rounded-md backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
          <p className="mt-4 text-text-primary">Processing...</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;