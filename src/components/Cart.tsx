import { ShoppingBag, X, Trash2, ArrowRight, Plus, Minus, MessageSquare, Upload, CheckCircle2 } from 'lucide-react';
import { OrderItem } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onRemove: (index: number) => void;
  onUpdate: (index: number, updates: Partial<OrderItem>) => void;
  onCheckout: (billFile: File | null) => void;
}

export default function Cart({ isOpen, onClose, items, onRemove, onUpdate, onCheckout }: CartProps) {
  const [billFile, setBillFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Logic phí ship: >= 5 phần miễn phí, < 5 phần tính 15.000đ (ví dụ)
  const shipFee = (totalCount >= 5 || totalCount === 0) ? 0 : 15000;
  const total = subtotal + shipFee;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBillFile(e.target.files[0]);
    }
  };

  const handleProcessCheckout = () => {
    if (!billFile) {
      alert("Vui lòng tải lên ảnh Bill chuyển khoản để xác nhận đơn hàng!");
      return;
    }
    onCheckout(billFile);
  };

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
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white/95 backdrop-blur-2xl z-[70] flex flex-col shadow-2xl border-l border-white/20"
          >
            <div className="p-6 border-b border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-2xl text-white shadow-lg shadow-orange-100">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">Giỏ hàng</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{totalCount} món đã chọn</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 border-2 border-dashed border-slate-200">
                    <ShoppingBag size={40} />
                  </div>
                  <p className="text-slate-500 font-bold">Giỏ hàng đang trống</p>
                  <p className="text-xs text-slate-400 mt-1">Hãy chọn món ngon cho bưa trưa nhé!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {items.map((item, idx) => (
                      <motion.div 
                        layout
                        key={`${item.id}-${idx}`}
                        className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Đơn giá: {item.price.toLocaleString('vi-VN')}đ</p>
                          </div>
                          <span className="text-sm font-bold text-primary">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center bg-slate-50 rounded-xl p-0.5 border border-slate-100">
                            <button 
                              onClick={() => onUpdate(idx, { quantity: Math.max(0, item.quantity - 1) })}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-slate-700">{item.quantity}</span>
                            <button 
                              onClick={() => onUpdate(idx, { quantity: item.quantity + 1 })}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
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

                        <div className="relative">
                          <MessageSquare size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input 
                            type="text"
                            placeholder="Ghi chú (ít hành, nhiều cơm...)"
                            value={item.note || ''}
                            onChange={(e) => onUpdate(idx, { note: e.target.value })}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all text-[11px] font-medium"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Summary Area */}
                  <div className="p-6 bg-orange-50/30 rounded-[32px] border border-orange-100 space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Tạm tính</span>
                      <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Phí giao hàng</span>
                      <span className={shipFee === 0 ? "text-green-600" : "text-primary"}>
                        {shipFee === 0 ? "Miễn phí" : `${shipFee.toLocaleString('vi-VN')}đ`}
                      </span>
                    </div>
                    {shipFee > 0 && <p className="text-[9px] text-primary font-bold italic text-right">* Đặt từ 5 phần để nhận miễn phí ship</p>}
                    <div className="h-px bg-orange-200/50 my-2"></div>
                    <div className="flex justify-between items-center text-lg font-black text-slate-900">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{total.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>

                  {/* QR & Upload */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-1 h-4 bg-primary rounded-full"></div>
                       <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Thanh toán chuyển khoản</h3>
                    </div>
                    
                    <div className="bg-white border-2 border-slate-100 rounded-[32px] p-5 flex flex-col items-center gap-4">
                      {/* QR Placeholder */}
                      <div className="w-36 h-36 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 p-2 text-center group">
                         <img 
                           src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TENPERSON_TUONGCHEFF`} 
                           alt="QR" 
                           className="w-full h-full object-contain mb-2"
                         />
                         <span className="text-[8px] font-bold text-slate-400">QUÉT ĐỂ TỰ ĐỘNG ĐIỀN</span>
                      </div>

                      <div className="text-center space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nội dung chuyển khoản</p>
                        <p className="text-sm font-black text-slate-800 tracking-tight">TUONGCHEF_{new Date().getTime().toString().slice(-6)}</p>
                      </div>

                      <label className="w-full">
                        <div className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 cursor-pointer transition-all border-2 border-dashed ${billFile ? 'bg-green-50 border-green-500 text-green-700' : 'bg-orange-50 border-orange-200 text-primary'}`}>
                          {billFile ? <CheckCircle2 size={18} /> : <Upload size={18} />}
                          <span className="text-xs font-black uppercase tracking-wide">
                            {billFile ? billFile.name.slice(0, 20) + '...' : 'Tải lên hóa đơn'}
                          </span>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 bg-white border-t border-slate-100 shadow-2xl">
                <button 
                  onClick={handleProcessCheckout}
                  disabled={!billFile}
                  className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all ${billFile ? 'bg-primary text-white shadow-orange-200 hover:scale-[1.02] active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                >
                  Xác nhận đặt hàng
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
