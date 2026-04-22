import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, MapPin, Search, Filter, History, 
  MessageSquare, Plus, LayoutDashboard, 
  ShoppingBag, LogOut, Users, Lock, ChevronRight, X
} from 'lucide-react';
import { 
  collection, query, where, onSnapshot, 
  getDocs, doc, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from './AuthProvider';
import Navbar from './Navbar';
import MenuCard from './MenuCard';
import Cart from './Cart';
import AdminDashboard from './AdminDashboard';
import { Dish, Combo, DailyMenu, OrderItem, Company } from '../types';

export default function MainScreen() {
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPass, setNewPass] = useState('');
  const { profile, isAdmin, updatePass, logout } = useAuth();
  
  const handleUpdatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePass(newPass);
      alert("Đổi mật khẩu thành công!");
      setShowPassModal(false);
      setNewPass('');
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  if (isAdmin && view === 'admin') {
    return <AdminDashboard onBack={() => setView('customer')} />;
  }
  const [view, setView] = useState<'customer' | 'admin'>('customer');
  const [activeTab, setActiveTab] = useState<'menu' | 'history'>('menu');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [timeLeft, setTimeLeft] = useState('');

  // Countdown timer for 10:30 AM
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const deadline = new Date();
      deadline.setHours(10, 30, 0, 0);
      
      if (now > deadline) {
        setTimeLeft('Đã hết hạn đặt trực tiếp');
      } else {
        const diff = deadline.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Menu for today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const fetchMenu = async () => {
      const q = query(collection(db, 'dailyMenus'), where('date', '==', today), where('status', '==', 'published'));
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          setMenu({ id: snap.docs[0].id, ...snap.docs[0].data() } as DailyMenu);
        } else {
          setMenu(null);
        }
      });
      return unsub;
    };
    fetchMenu();
  }, []);

  // Fetch all Dishes and Combos for the menu
  useEffect(() => {
    if (!menu) return;
    
    const fetchItems = async () => {
      const dSnap = await getDocs(collection(db, 'dishes'));
      const cSnap = await getDocs(collection(db, 'combos'));
      
      const allDishes = dSnap.docs.map(d => ({ id: d.id, ...d.data() } as Dish));
      const allCombos = cSnap.docs.map(c => ({ id: c.id, ...c.data() } as Combo));
      
      setDishes(allDishes.filter(d => menu.dishIds.includes(d.id)));
      setCombos(allCombos.filter(c => menu.comboIds.includes(c.id)));
    };
    fetchItems();
  }, [menu]);

  // Fetch company info
  useEffect(() => {
    if (profile?.companyId) {
      onSnapshot(doc(db, 'companies', profile.companyId), (snap) => {
        if (snap.exists()) setCompany({ id: snap.id, ...snap.data() } as Company);
      });
    }
  }, [profile]);

  const addToCart = (item: any, type: 'dish' | 'combo', quantity: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      const orderItem: OrderItem = {
        id: item.id,
        name: item.name,
        type,
        price: item.price || item.basePrice || 36000,
        quantity: quantity,
        note: ''
      };
      return [...prev, orderItem];
    });
    setIsCartOpen(true);
  };

  const updateCartItem = (index: number, updates: Partial<OrderItem>) => {
    setCartItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], ...updates };
      return newItems.filter(i => i.quantity > 0);
    });
  };

  const removeFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = async () => {
    if (!profile || cartItems.length === 0) return;
    
    try {
      const orderData = {
        userId: profile.id,
        userName: profile.realName,
        companyId: profile.companyId || 'personal',
        companyName: company?.name || 'Cá nhân',
        date: new Date().toISOString().split('T')[0],
        status: 'pending_payment',
        items: cartItems,
        totalAmount: cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0),
        shipFee: 0, // Simplified for now
        createdAt: serverTimestamp(),
      };
      
      const ordersCol = collection(db, 'orders');
      await addDoc(ordersCol, orderData);
      
      alert("Đặt đơn thành công! Vui lòng kiểm tra lịch sử và thanh toán.");
      setIsCartOpen(false);
      setCartItems([]);
    } catch (err: any) {
      console.error(err);
      alert("Lỗi khi đặt đơn: " + err.message);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="fixed top-[10%] left-[5%] w-64 h-64 bg-orange-400/20 rounded-full blur-3xl -z-0"></div>
      <div className="fixed bottom-[10%] right-[5%] w-96 h-96 bg-green-300/10 rounded-full blur-3xl -z-0"></div>

      <div className="w-full max-w-5xl h-[85vh] glass-panel rounded-[40px] flex overflow-hidden relative z-10">
        
        {/* Sidebar Nav */}
        <div className="w-20 glass-sidebar flex flex-col items-center py-8 gap-8">
          <div 
            onClick={() => setView('customer')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all ${activeTab === 'menu' ? 'bg-orange-100 text-primary' : 'text-slate-400 hover:bg-white/40'}`}
          >
            <div onClick={() => setActiveTab('menu')}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div 
            onClick={() => setActiveTab('history')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all ${activeTab === 'history' ? 'bg-orange-100 text-primary' : 'text-slate-400 hover:bg-white/40'}`}
          >
            <History size={20} />
          </div>
          <div 
            onClick={() => setShowPassModal(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer text-slate-400 hover:bg-white/40 hover:text-primary transition-all"
          >
            <Lock size={20} />
          </div>
          {isAdmin && (
            <div 
              onClick={() => setView('admin')}
              className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer text-slate-400 hover:bg-white/40 hover:text-primary transition-all"
            >
              <LayoutDashboard size={20} />
            </div>
          )}
          <div className="mt-auto">
            <button 
              onClick={() => auth.signOut()}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white/20">
          <Navbar 
            title="Tường Chef" 
            showCartToggle={() => setIsCartOpen(true)}
            cartCount={cartItems.length}
          />

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Header Info */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cơm Trưa Văn Phòng</h2>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <MapPin size={14} className="text-primary" />
                    <span className="px-2 py-0.5 bg-white/50 border border-white/80 rounded-full">{company?.name || "Chọn công ty..."}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Thời gian còn lại</span>
                  <span className="text-xl font-mono font-bold text-primary tabular-nums">{timeLeft}</span>
                </div>
              </div>

              {/* Menu Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Thực đơn hôm nay</h3>
                  <div className="flex gap-2">
                    <button className="btn-glass !py-1.5 !px-4 text-xs !bg-orange-100 !text-primary border-primary/20">Món Chính</button>
                    <button className="btn-glass !py-1.5 !px-4 text-xs">Combo</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {combos.map(combo => (
                    <MenuCard key={combo.id} item={combo} type="combo" onAdd={addToCart} />
                  ))}
                  {dishes.map(dish => (
                    <MenuCard key={dish.id} item={dish} type="dish" onAdd={addToCart} />
                  ))}
                  
                  {dishes.length === 0 && !menu && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center glass-card rounded-[32px] border-dashed border-slate-300">
                      <div className="text-4xl mb-4">🍱</div>
                      <p className="text-slate-400 font-bold">Thực đơn đang được chuẩn bị...</p>
                      <button className="mt-4 text-primary font-bold text-sm hover:underline">
                        Xem thực đơn cũ
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Upsell suggestion */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="bg-green-50/50 border border-green-100 p-6 rounded-[32px] flex items-center justify-between"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">🥚</div>
                  <div>
                    <h4 className="text-sm font-bold text-green-800">Thêm Trứng Ốp La?</h4>
                    <p className="text-xs text-green-600 font-medium mt-0.5">Tiết kiệm 2.000đ khi đi kèm món chính hôm nay.</p>
                  </div>
                </div>
                <button className="px-5 py-2 bg-green-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-green-200 hover:scale-105 transition-transform">
                  Thêm Ngay
                </button>
              </motion.div>

              {/* Company Stats Bar */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Đã đặt", value: "12 Phần", icon: ShoppingBag },
                  { label: "Phí ship dự kiến", value: "0đ", icon: MapPin },
                  { label: "Trạng thái nhóm", value: "Chờ gom đơn", icon: Users }
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-white/30 rounded-2xl border border-white/40 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onUpdate={updateCartItem}
        onCheckout={handleCheckout}
      />

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPassModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Đổi mật khẩu</h3>
                <button onClick={() => setShowPassModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
              </div>

              <form onSubmit={handleUpdatePass} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mật khẩu mới</label>
                  <input 
                    type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
                    className="w-full h-12 px-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                    required
                    minLength={6}
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  CẬP NHẬT MẬT KHẨU
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


