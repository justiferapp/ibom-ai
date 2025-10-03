
import React, { useState, useEffect } from 'react';
import type { AdminSettings } from '../types';
import Modal from './Modal';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdminSettings;
  onSave: (newSettings: AdminSettings) => void;
}

type Tab = 'general' | 'payments';

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [currentSettings, setCurrentSettings] = useState<AdminSettings>(settings);
  const [activeTab, setActiveTab] = useState<Tab>('general');

  useEffect(() => {
    // Reset local state if the modal is reopened with new props
    if (isOpen) {
      setCurrentSettings(settings);
    }
  }, [isOpen, settings]);

  const handleInputChange = (key: keyof AdminSettings, value: string | number) => {
    setCurrentSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(currentSettings);
  };
  
  const renderTabContent = () => {
      switch(activeTab) {
          case 'general':
              return (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="default-credits" className="block text-sm font-medium text-text-primary mb-1">
                            Default Free Credits
                        </label>
                        <input
                            type="number"
                            id="default-credits"
                            className="w-full bg-brand-primary border border-border-color rounded-md p-2 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition duration-150"
                            value={currentSettings.defaultCredits}
                            onChange={(e) => handleInputChange('defaultCredits', parseInt(e.target.value, 10) || 0)}
                            placeholder="e.g., 20"
                        />
                         <p className="text-xs text-text-secondary mt-1">The number of credits a new user starts with.</p>
                    </div>
                    <div>
                        <label htmlFor="auto-delete-hours" className="block text-sm font-medium text-text-primary mb-1">
                            Image Auto-Delete (hours)
                        </label>
                        <input
                            type="number"
                            id="auto-delete-hours"
                            className="w-full bg-brand-primary border border-border-color rounded-md p-2 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition duration-150"
                            value={currentSettings.imageAutoDeleteHours}
                            onChange={(e) => handleInputChange('imageAutoDeleteHours', parseInt(e.target.value, 10) || 0)}
                            placeholder="e.g., 24"
                        />
                        <p className="text-xs text-text-secondary mt-1">Automatically clear generated assets after this many hours. Set to 0 to disable.</p>
                    </div>
                </div>
              );
          case 'payments':
              return (
                 <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-text-primary mb-2">Paystack</h4>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="paystack-pk" className="block text-sm font-medium text-text-primary mb-1">Public Key</label>
                                <input type="text" id="paystack-pk" className="w-full bg-brand-primary border border-border-color rounded-md p-2" value={currentSettings.paystackPublicKey} onChange={(e) => handleInputChange('paystackPublicKey', e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="paystack-sk" className="block text-sm font-medium text-text-primary mb-1">Secret Key</label>
                                <input type="password" id="paystack-sk" className="w-full bg-brand-primary border border-border-color rounded-md p-2" value={currentSettings.paystackSecretKey} onChange={(e) => handleInputChange('paystackSecretKey', e.target.value)} />
                            </div>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-text-primary mb-2">Flutterwave</h4>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="flutterwave-pk" className="block text-sm font-medium text-text-primary mb-1">Public Key</label>
                                <input type="text" id="flutterwave-pk" className="w-full bg-brand-primary border border-border-color rounded-md p-2" value={currentSettings.flutterwavePublicKey} onChange={(e) => handleInputChange('flutterwavePublicKey', e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="flutterwave-sk" className="block text-sm font-medium text-text-primary mb-1">Secret Key</label>
                                <input type="password" id="flutterwave-sk" className="w-full bg-brand-primary border border-border-color rounded-md p-2" value={currentSettings.flutterwaveSecretKey} onChange={(e) => handleInputChange('flutterwaveSecretKey', e.target.value)} />
                            </div>
                        </div>
                    </div>
                 </div>
              );
      }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-2 space-y-4 text-text-primary w-[600px]">
        <h2 className="text-2xl font-bold">Admin Settings</h2>
        
        <div className="border-b border-border-color">
            <nav className="-mb-px flex space-x-6">
                <button 
                    onClick={() => setActiveTab('general')}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'general' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'}`}
                >
                    General
                </button>
                 <button 
                    onClick={() => setActiveTab('payments')}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'payments' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'}`}
                >
                    Payment Gateways
                </button>
            </nav>
        </div>

        <div className="py-4">
            {renderTabContent()}
        </div>

        <div className="flex justify-end pt-4 border-t border-border-color space-x-3">
             <button
                onClick={onClose}
                className="py-2 px-4 bg-brand-primary border border-border-color text-text-primary rounded-md font-semibold hover:bg-border-color transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={handleSave}
                className="py-2 px-4 bg-brand-accent text-white rounded-md font-semibold hover:bg-brand-accent-hover transition-colors"
            >
                Save Settings
            </button>
        </div>

      </div>
    </Modal>
  );
};

export default AdminPanel;