import React, { useState } from 'react';
import { Plus, Minus, Info, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { Dish, Combo } from '../types';

interface MenuCardProps {
  key?: any;
  item: any;
  type: 'dish' | 'combo';
  onAdd: (item: any, type: 'dish' | 'combo', quantity: number) => void;
}

export default function MenuCard({ item, type, onAdd }: MenuCardProps) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const isCombo = type === 'combo';
  const price = (item as any).price || (item as any).basePrice;

  const handleAdd = () => {
    onAdd({ ...item, note }, type, qty);
    setQty(1); 
    setNote('');
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card relative flex flex-col gap-4 p-5 rounded-[32px] group"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isCombo && (
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider">
                Combo
              </span>
            )}
            <h3 className="text-base font-bold text-slate-800 group-hover:text-primary transition-colors">
              {item.name}
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {item.description || "Món ngon mỗi ngày từ Tường Chef."}
          </p>
        </div>
        
        {item.imageUrl ? (
          <div className="w-24 h-24 bg-orange-50 rounded-3xl overflow-hidden flex-shrink-0 flex items-center justify-center">
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="w-24 h-24 bg-orange-50 rounded-3xl flex-shrink-0 flex items-center justify-center text-3xl">
             {isCombo ? '🍱' : '🍛'}
          </div>
        )}
      </div>

      {/* Note Input Area */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Ghi chú yêu cầu</label>
        <input 
          type="text" 
          placeholder="Ví dụ: Không hành, nhiều cơm..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-9 px-4 bg-white/40 border border-white/60 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold text-slate-700 placeholder:text-slate-300 transition-all shadow-inner"
        />
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/40">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest leading-none mb-1">Giá phần</span>
          <span className="text-lg font-bold text-primary">
            {price.toLocaleString('vi-VN')}đ
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/40 border border-white/60 rounded-xl p-0.5 shadow-sm">
            <button 
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary transition-colors hover:bg-white/60 rounded-lg"
            >
              <Minus size={14} />
            </button>
            <span className="w-7 text-center text-xs font-bold text-slate-700">{qty}</span>
            <button 
              onClick={() => setQty(qty + 1)}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary transition-colors hover:bg-white/60 rounded-lg"
            >
              <Plus size={14} />
            </button>
          </div>
          <button 
            onClick={handleAdd}
            className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-orange-100 transition-all hover:scale-105 active:scale-95"
          >
            <ShoppingBag size={20} />
          </button>
        </div>
      </div>


      {isCombo && (
        <div className="absolute top-2 right-2 flex gap-1">
          <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            Tiết kiệm { (isCombo ? 2000 : 0).toLocaleString('vi-VN') }đ
          </div>
        </div>
      )}
    </motion.div>
  );
}
