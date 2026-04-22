import React from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import LoginScreen from './components/LoginScreen';
import MainScreen from './components/MainScreen';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 space-y-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="https://img.icons8.com/color/48/chef-hat.png" alt="Chef" className="w-6 h-6" />
          </div>
        </div>
        <p className="text-gray-400 font-display font-bold animate-pulse tracking-wider">TƯỜNG CHEF ĐANG CHUẨN BỊ...</p>
      </div>
    );
  }

  // If not logged in, show login
  if (!user) {
    return <LoginScreen onSuccess={() => {}} />;
  }

  // If logged in but no profile (new user or missing data)
  // In a real app, I'd redirect to a setup profile screen
  return <MainScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
