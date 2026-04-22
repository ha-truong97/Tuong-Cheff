import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, Trash2, ArrowRight, Plus, Minus, MessageSquare } from 'lucide-react';
import { OrderItem } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onRemove: (index: number) => void;
  onUpdate: (index: number, updates: Partial<OrderItem>) => void;
  onCheckout: () => void;
}

export default function Cart({ isOpen, onClose, items, onRemove, onUpdate, onCheckout }: CartProps) {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white/90 backdrop-blur-2xl z-[70] flex flex-col shadow-2xl border-l border-white/20"
          >
            <div className="p-6 border-b border-white/20 flex items-center justify-between bg-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-2xl text-white shadow-lg shadow-orange-100">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">Giỏ hàng của bạn</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{totalCount} món đã chọn</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-white/40 text-slate-500 rounded-full hover:bg-white/60 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-dashed border-slate-300">
                    <ShoppingBag size={40} />
                  </div>
                  <p className="text-slate-500 font-bold">Giỏ hàng đang trống</p>
                  <p className="text-xs text-slate-400 mt-1">Hãy chọn món ngon cho bưa trưa nhé!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {items.map((item, idx) => (
                      <motion.div 
                        layout
                        key={`${item.id}-${idx}`}
                        className="glass-card rounded-[24px] p-4 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Đơn giá: {item.price.toLocaleString('vi-VN')}đ</p>
                          </div>
                          <span className="text-sm font-bold text-primary">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center bg-white/50 rounded-xl p-1 border border-white/60">
                            <button 
                              onClick={() => onUpdate(idx, { quantity: Math.max(0, item.quantity - 1) })}
                              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-primary transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-slate-700">{item.quantity}</span>
                            <button 
                              onClick={() => onUpdate(idx, { quantity: item.quantity + 1 })}
                              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-primary transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button 
                            onClick={() => onRemove(idx)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Note Input */}
                        <div className="relative group">
                          <MessageSquare size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                          <input 
                            type="text"
                            placeholder="Ghi chú (không hành, ít cơm...)"
                            value={item.note || ''}
                            onChange={(e) => onUpdate(idx, { note: e.target.value })}
                            className="w-full pl-9 pr-4 py-2 bg-white/40 border border-white/60 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all text-xs font-medium placeholder:text-slate-300"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="h-px bg-white/20"></div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-500 font-medium tracking-tight">
                      <span>Tạm tính</span>
                      <span>{total.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500 font-medium tracking-tight">
                      <span>Phí vận chuyển</span>
                      <span className="text-green-600 font-bold">Miễn phí</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold pt-2 text-slate-900">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{total.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>

                  {/* Payment UI */}
                  <div className="mt-6 bg-white/80 rounded-[28px] p-4 border border-white flex flex-col items-center gap-3">
                    <div className="w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center border-4 border-white shadow-inner relative overflow-hidden">
                      <div className="absolute inset-0 bg-slate-800 opacity-90 flex items-center justify-center">
                        <div className="grid grid-cols-4 gap-1 transform rotate-45 opacity-20">
                           {Array(16).fill(0).map((_,i) => <div key={i} className="w-4 h-4 bg-white rounded-sm"></div>)}
                        </div>
                      </div>
                      <span className="relative z-10 text-[10px] font-bold text-white uppercase tracking-tighter text-center px-2">Quét mã QR</span>
                    </div>
                    <p className="text-[10px] text-center text-slate-400 px-4 leading-relaxed">
                      Quét mã QR để thanh toán trực tiếp cho <b>Tường Chef</b>
                    </p>
                    <label className="w-full">
                      <div className="w-full py-3 bg-white border-2 border-dashed border-orange-100 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-orange-50/50 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6321" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <span className="text-xs font-bold text-primary">Tải lên ảnh Bill</span>
                      </div>
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                </>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 bg-white/20 border-t border-white/20 pb-10">
                <button 
                  onClick={onCheckout}
                  className="w-full btn-primary h-14"
                >
                  XÁC NHẬN ĐẶT CƠM
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
