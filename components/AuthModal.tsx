
import React, { useState } from 'react';
import Modal from './Modal';
import type { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  onSignup: (user: User) => void;
}

type AuthMode = 'login' | 'signup';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onSignup }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!email || !password) {
        setError("Email and password are required.");
        return;
    }
    
    // Simulate auth
    const user = { email };
    if (mode === 'login') {
      onLogin(user);
    } else {
      onSignup(user);
    }
    // Reset form and close
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    onClose();
  };
  
  const handleClose = () => {
      // Reset state on close
      setError('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setMode('login');
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-4 space-y-4 text-text-primary w-[400px]">
        <div className="flex border-b border-border-color">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-center font-semibold transition-colors ${mode === 'login' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Login
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-center font-semibold transition-colors ${mode === 'signup' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Sign Up
          </button>
        </div>
        
        <h2 className="text-xl font-bold text-center pt-2">
          {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-brand-primary border border-border-color rounded-md p-2 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-brand-primary border border-border-color rounded-md p-2 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
            />
          </div>
          {mode === 'signup' && (
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-text-secondary mb-1">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-brand-primary border border-border-color rounded-md p-2 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
              />
            </div>
          )}
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-brand-accent text-white rounded-md font-bold hover:bg-brand-accent-hover transition-colors"
          >
            {mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
        
        <p className="text-xs text-center text-text-secondary">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </Modal>
  );
};

export default AuthModal;
