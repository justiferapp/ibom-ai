import React, { useState } from 'react';
import Modal from './Modal';
import type { AdminSettings, User, CreditPackage } from '../types';

// To satisfy TypeScript, as these are loaded from external scripts
declare const PaystackPop: any;
declare const FlutterwaveCheckout: any;

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminSettings: AdminSettings;
  user: User | null;
  onAddCredits: (amount: number) => void;
}

const creditPackages: CreditPackage[] = [
  { id: 'starter', credits: 50, price: 5, priceDescription: '$5' },
  { id: 'basic', credits: 120, price: 10, priceDescription: '$10' },
  { id: 'pro', credits: 300, price: 20, priceDescription: '$20 (Best Value)' },
  { id: 'business', credits: 1000, price: 50, priceDescription: '$50' },
];

type PaymentProvider = 'paystack' | 'flutterwave';

const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({ isOpen, onClose, adminSettings, user, onAddCredits }) => {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage>(creditPackages[0]);
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePurchase = () => {
    if (!user) {
      setError('You must be logged in to purchase credits.');
      return;
    }
    setError('');
    setIsProcessing(true);

    const transactionRef = `ibom-ai-${user.email.split('@')[0]}-${Date.now()}`;

    if (paymentProvider === 'paystack' && adminSettings.paystackPublicKey) {
      const handler = PaystackPop.setup({
        key: adminSettings.paystackPublicKey,
        email: user.email,
        amount: selectedPackage.price * 100, // Paystack amount is in kobo
        currency: 'USD',
        ref: transactionRef,
        onClose: () => {
          setIsProcessing(false);
        },
        callback: (response: any) => {
          console.log('Paystack response:', response);
          // In a real app, you would verify this transaction on your backend
          alert(`Payment successful! ${selectedPackage.credits} credits have been added.`);
          onAddCredits(selectedPackage.credits);
          setIsProcessing(false);
          onClose();
        },
      });
      handler.openIframe();
    } else if (paymentProvider === 'flutterwave' && adminSettings.flutterwavePublicKey) {
      FlutterwaveCheckout({
        public_key: adminSettings.flutterwavePublicKey,
        tx_ref: transactionRef,
        amount: selectedPackage.price,
        currency: 'USD',
        payment_options: 'card, mobilemoneyghana, ussd',
        customer: {
          email: user.email,
        },
        customizations: {
          title: 'Ibom AI - Buy Credits',
          description: `Purchase ${selectedPackage.credits} credits`,
        },
        onclose: () => {
          setIsProcessing(false);
        },
        callback: (response: any) => {
          console.log('Flutterwave response:', response);
          // In a real app, you would verify this transaction on your backend
          alert(`Payment successful! ${selectedPackage.credits} credits have been added.`);
          onAddCredits(selectedPackage.credits);
          setIsProcessing(false);
          onClose();
        }
      });
    } else {
        setError('Selected payment provider is not configured by the admin.');
        setIsProcessing(false);
    }
  };

  const hasPaystack = !!adminSettings.paystackPublicKey;
  const hasFlutterwave = !!adminSettings.flutterwavePublicKey;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 space-y-6 text-text-primary w-[700px] max-w-[90vw]">
        <h2 className="text-2xl font-bold text-center">Buy More Credits</h2>
        <p className="text-center text-text-secondary">Choose a package that fits your needs. More credits, more creativity!</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {creditPackages.map(pkg => (
                <button 
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-4 rounded-lg text-center border-2 transition-all duration-200 ${selectedPackage.id === pkg.id ? 'border-brand-accent bg-brand-accent/10 scale-105' : 'border-border-color bg-brand-primary hover:border-brand-accent/50'}`}
                >
                    <p className="text-3xl font-bold">{pkg.credits}</p>
                    <p className="text-sm text-text-secondary">Credits</p>
                    <p className="mt-2 font-semibold text-brand-accent">{pkg.priceDescription}</p>
                </button>
            ))}
        </div>

        <div>
            <h3 className="text-lg font-semibold mb-3 text-center">Select Payment Method</h3>
            <div className="flex justify-center space-x-4">
                {hasPaystack && (
                    <button 
                        onClick={() => setPaymentProvider('paystack')}
                        className={`py-2 px-6 rounded-md border-2 font-semibold ${paymentProvider === 'paystack' ? 'border-brand-accent text-brand-accent' : 'border-border-color text-text-secondary'}`}
                    >
                        Paystack
                    </button>
                )}
                {hasFlutterwave && (
                     <button 
                        onClick={() => setPaymentProvider('flutterwave')}
                        className={`py-2 px-6 rounded-md border-2 font-semibold ${paymentProvider === 'flutterwave' ? 'border-brand-accent text-brand-accent' : 'border-border-color text-text-secondary'}`}
                    >
                        Flutterwave
                    </button>
                )}
            </div>
             {!hasPaystack && !hasFlutterwave && (
                 <p className="text-center text-yellow-400 mt-4 text-sm">No payment methods have been configured by the administrator.</p>
             )}
        </div>

        <div className="pt-4 border-t border-border-color">
            <button
                onClick={handlePurchase}
                disabled={isProcessing || (!hasPaystack && !hasFlutterwave)}
                className="w-full py-3 px-4 bg-brand-accent text-white rounded-md font-bold text-lg hover:bg-brand-accent-hover transition-colors disabled:bg-brand-secondary disabled:text-text-secondary disabled:cursor-not-allowed"
            >
                {isProcessing ? 'Processing...' : `Purchase ${selectedPackage.credits} Credits for ${selectedPackage.priceDescription}`}
            </button>
            {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
        </div>

      </div>
    </Modal>
  );
};

export default BuyCreditsModal;
