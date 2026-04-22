import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from './AuthProvider';

export default function LoginScreen() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError('Lỗi đăng nhập Google. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="fixed top-[10%] left-[5%] w-64 h-64 bg-orange-400/20 rounded-full blur-3xl -z-0"></div>
      <div className="fixed bottom-[10%] right-[5%] w-96 h-96 bg-green-300/10 rounded-full blur-3xl -z-0"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel rounded-[40px] p-10 relative z-10 space-y-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-orange-200 mb-6">
            TC
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Tường Chef</h1>
          <p className="text-slate-500 font-medium tracking-tight italic">
            "Cơm bưng nước rót, đậm chất văn phòng"
          </p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50 group font-bold text-slate-700"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z"/>
                  </svg>
                  ĐĂNG NHẬP VỚI GOOGLE
                </>
              )}
            </button>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-white/20">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Tường Chef – Cơm Văn Phòng Ngon Như Nhà Làm
          </p>
        </div>
      </motion.div>
    </div>
  );
}
