
import React from 'react';
import Modal from './Modal.tsx';
import type { GenerationHistoryItem, User } from '../types.ts';
import { SparklesIcon } from './icons.tsx';

interface UserDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  history: GenerationHistoryItem[];
  user: User | null;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ isOpen, onClose, credits, history, user }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 space-y-6 text-text-primary w-[800px] max-w-[90vw]">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">User Dashboard</h2>
            {user && <p className="text-sm text-text-secondary">{user.email}</p>}
        </div>
        
        <div className="bg-brand-primary p-4 rounded-lg border border-border-color">
            <h3 className="text-sm font-medium text-text-secondary mb-1">CURRENT BALANCE</h3>
            <p className="text-3xl font-bold text-brand-accent">{credits} Credits</p>
        </div>

        <div>
            <h3 className="text-xl font-semibold mb-3">Generation History</h3>
            {history.length === 0 ? (
                <div className="text-center py-10 px-6 bg-brand-primary rounded-lg border-2 border-dashed border-border-color">
                    <SparklesIcon className="w-12 h-12 mx-auto text-text-secondary mb-3" />
                    <p className="text-text-secondary">Your generation history is empty.</p>
                    <p className="text-sm text-text-secondary/70">Generated assets will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                    {history.map(item => (
                        <div key={item.id} className="bg-brand-primary p-4 rounded-lg border border-border-color">
                           <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-mono text-text-secondary truncate" title={item.imagePrompt}>Prompt: "{item.imagePrompt}"</p>
                                    <p className="text-xs text-text-secondary/60">{new Date(item.timestamp).toLocaleString()}</p>
                                </div>
                                <div className="text-right ml-4 flex-shrink-0">
                                    <span className="text-sm font-semibold">{item.thumbnails.length} images</span>
                                    <span className="text-sm mx-1 text-text-secondary/50">|</span>
                                    <span className="text-sm font-semibold">{item.adCopies.length} ad copies</span>
                                </div>
                           </div>
                           <div className="flex flex-wrap gap-2">
                                {item.thumbnails.map((thumbSrc, index) => (
                                    <img key={index} src={thumbSrc} alt={`thumbnail ${index+1}`} className="w-16 h-16 rounded-md object-cover bg-brand-secondary" />
                                ))}
                           </div>
                           {item.adCopies.length > 0 && (
                               <div className="mt-3 pt-3 border-t border-border-color space-y-2">
                                   {item.adCopies.slice(0, 2).map(copy => (
                                        <p key={copy.id} className="text-xs text-text-secondary bg-brand-secondary/50 p-2 rounded truncate">
                                            {copy.text}
                                        </p>
                                   ))}
                               </div>
                           )}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </Modal>
  );
};

export default UserDashboard;