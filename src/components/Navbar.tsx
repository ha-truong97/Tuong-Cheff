import { motion } from 'motion/react';
import { ShoppingCart, User, LogOut, ChevronLeft } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { auth } from '../lib/firebase';

interface NavbarProps {
  title: string;
  onBack?: () => void;
  showCartToggle?: () => void;
  cartCount?: number;
}

export default function Navbar({ title, onBack, showCartToggle, cartCount = 0 }: NavbarProps) {
  const { profile } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/30 backdrop-blur-md border-b border-white/20 h-20 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {onBack ? (
          <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:text-primary transition-colors">
            <ChevronLeft size={24} />
          </button>
        ) : (
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-200">
            TC
          </div>
        )}
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        {showCartToggle && (
          <button 
            onClick={showCartToggle}
            className="relative p-2 text-slate-600 hover:text-primary transition-colors"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
        )}
        
        {profile ? (
          <div className="flex items-center gap-3 pl-6 border-l border-white/20">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-bold text-slate-900">{profile.nickname || profile.realName}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{profile.role}</span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary p-0.5">
              <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center overflow-hidden font-bold text-xs uppercase">
                {profile.nickname?.[0] || profile.realName[0]}
              </div>
            </div>
            <button 
              onClick={() => auth.signOut()}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <User size={22} className="text-slate-400" />
        )}
      </div>
    </nav>
  );
}
