import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, ShoppingBag, Utensils, Settings, 
  Plus, Check, X, AlertCircle, TrendingUp,
  ChevronRight, Calendar as CalendarIcon,
  Search, Filter, Trash2, Edit2, Save, Image as ImageIcon
} from 'lucide-react';
import { 
  collection, query, onSnapshot, orderBy, 
  doc, updateDoc, addDoc, getDocs, deleteDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import Navbar from './Navbar';
import { Order, Dish, Company } from '../types';

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [activeView, setActiveView] = useState<'overview' | 'orders' | 'menu' | 'companies'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Dish Form State
  const [showDishForm, setShowDishForm] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishFormData, setDishFormData] = useState({
    name: '',
    basePrice: 0,
    description: '',
    imageUrl: '',
    type: 'main' as 'main' | 'addon'
  });

  useEffect(() => {
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    });
    
    const unsubDishes = onSnapshot(collection(db, 'dishes'), (snap) => {
      setDishes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Dish)));
    });

    const unsubCompanies = onSnapshot(collection(db, 'companies'), (snap) => {
      setCompanies(snap.docs.map(d => ({ id: d.id, ...d.data() } as Company)));
    });

    return () => {
      unsubOrders();
      unsubDishes();
      unsubCompanies();
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (err) {
      console.error(err);
      alert("Lỗi cập nhật trạng thái");
    }
  };

  const saveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDish) {
        await updateDoc(doc(db, 'dishes', editingDish.id), dishFormData);
      } else {
        await addDoc(collection(db, 'dishes'), dishFormData);
      }
      setShowDishForm(false);
      setEditingDish(null);
      setDishFormData({ name: '', basePrice: 0, description: '', imageUrl: '', type: 'main' });
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu món ăn");
    }
  };

  const deleteDish = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa món này?")) return;
    try {
      await deleteDoc(doc(db, 'dishes', id));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa món ăn");
    }
  };

  const openEditDish = (dish: Dish) => {
    setEditingDish(dish);
    setDishFormData({
      name: dish.name,
      basePrice: dish.basePrice,
      description: dish.description || '',
      imageUrl: dish.imageUrl || '',
      type: dish.type
    });
    setShowDishForm(true);
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar title="Quản trị Tường Chef" onBack={onBack} />

      <div className="flex">
        {/* Sidebar Mini */}
        <div className="w-16 md:w-64 bg-white border-r border-gray-100 flex flex-col h-[calc(100vh-64px)] fixed sticky top-16">
          <div className="p-4 space-y-2">
            {[
              { id: 'overview', icon: TrendingUp, label: 'Tổng quan' },
              { id: 'orders', icon: ShoppingBag, label: 'Đơn hàng' },
              { id: 'menu', icon: Utensils, label: 'Thực đơn' },
              { id: 'companies', icon: Users, label: 'Công ty' },
            ].map((item: any) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  activeView === item.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                <span className="hidden md:block font-bold text-sm tracking-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {activeView === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Doanh thu', value: orders.reduce((acc, o) => o.status === 'confirmed' ? acc + o.totalAmount : acc, 0).toLocaleString('vi-VN') + 'đ', sub: 'Tổng đã xác nhận', color: 'bg-primary' },
                  { label: 'Tổng đơn', value: orders.length.toString(), sub: 'Tất cả các ngày', color: 'bg-blue-500' },
                  { label: 'Công ty', value: companies.length.toString(), sub: 'Phòng giao dịch', color: 'bg-secondary' },
                  { label: 'Danh mục món', value: dishes.length.toString(), sub: 'Menu cơ bản', color: 'bg-purple-500' },
                ].map((stat, i) => (
                  <div key={i} className="chef-card overflow-hidden">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">{stat.label}</span>
                      <span className="text-xl font-display font-bold text-gray-900">{stat.value}</span>
                      <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{stat.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Orders Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold">Đơn hàng mới nhất</h2>
                  <button onClick={() => setActiveView('orders')} className="text-primary text-sm font-bold flex items-center gap-1">
                    Xem tất cả <ChevronRight size={16} />
                  </button>
                </div>
                
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Khách hàng</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Sản phẩm & Ghi chú</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Trạng thái</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase text-right">Tổng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.slice(0, 8).map(order => (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-gray-900">{order.userName}</span>
                              <span className="text-[10px] text-gray-400 font-medium uppercase">{order.companyName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                               {order.items.map((item, idx) => (
                                 <div key={idx} className="text-[11px] font-medium text-gray-600">
                                    <span className="font-bold text-primary">{item.quantity}x</span> {item.name}
                                    {item.note && <span className="text-orange-500 italic ml-2">({item.note})</span>}
                                 </div>
                               ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${
                              order.status === 'confirmed' ? 'bg-secondary/10 text-secondary' : 
                              order.status === 'payment_submitted' ? 'bg-blue-50 text-blue-500' :
                              order.status === 'rejected' ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-bold text-primary">
                              {order.totalAmount.toLocaleString('vi-VN')}đ
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeView === 'orders' && (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-bold">Tất cả đơn hàng</h2>
                  <button className="p-2 bg-white rounded-xl border border-gray-100 text-gray-400 shadow-sm">
                    <Filter size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {orders.map(order => (
                    <motion.div layout key={order.id} className="chef-card">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 font-bold">
                              {order.userName[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-900">{order.userName}</h4>
                                <span className="text-[10px] text-gray-400 font-medium">#{order.id.slice(-4)}</span>
                              </div>
                              <p className="text-xs text-gray-400 font-medium">{order.companyName} • {new Date(order.createdAt?.seconds * 1000).toLocaleString('vi-VN')}</p>
                            </div>
                          </div>
                          <div className="flex-1 md:px-8">
                             <div className="space-y-1">
                                {order.items.map((item, i) => (
                                   <div key={i} className="text-xs font-medium text-gray-600">
                                      <span className="font-bold text-primary">{item.quantity}x</span> {item.name}
                                      {item.note && <span className="text-primary italic ml-2 text-[10px]">— "{item.note}"</span>}
                                   </div>
                                ))}
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <span className="text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tổng thu</p>
                                <p className="text-sm font-bold text-primary">{order.totalAmount.toLocaleString('vi-VN')}đ</p>
                             </span>
                             <div className="h-10 w-px bg-gray-100 mx-2"></div>
                             {order.status === 'payment_submitted' && (
                               <div className="flex gap-2">
                                 <button onClick={() => handleUpdateStatus(order.id, 'confirmed')} className="p-2 bg-secondary/10 text-secondary rounded-xl hover:bg-secondary hover:text-white transition-all"><Check size={18}/></button>
                                 <button onClick={() => handleUpdateStatus(order.id, 'rejected')} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X size={18}/></button>
                               </div>
                             )}
                             <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-widest border ${
                                 order.status === 'confirmed' ? 'border-secondary/20 bg-secondary/5 text-secondary' : 
                                 'border-gray-100 bg-gray-50 text-gray-400'
                             }`}>
                               {order.status.replace('_', ' ')}
                             </span>
                          </div>
                       </div>
                    </motion.div>
                  ))}
                </div>
             </div>
          )}

          {activeView === 'menu' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold">Danh mục món ăn</h2>
                <button 
                  onClick={() => { setEditingDish(null); setDishFormData({ name: '', basePrice: 0, description: '', imageUrl: '', type: 'main' }); setShowDishForm(true); }}
                  className="btn-primary py-2 px-4 text-xs flex items-center gap-2"
                >
                  <Plus size={16} /> Thêm món mới
                </button>
              </div>

              {/* Dish Form Overlay */}
              <AnimatePresence>
                {showDishForm && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                      className="bg-white rounded-[40px] w-full max-w-lg p-8 shadow-2xl space-y-6"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900">{editingDish ? 'Sửa món ăn' : 'Thêm món ăn mới'}</h3>
                        <button onClick={() => setShowDishForm(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                      </div>

                      <form onSubmit={saveDish} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tên món</label>
                            <input 
                              type="text" value={dishFormData.name} onChange={e => setDishFormData({...dishFormData, name: e.target.value})}
                              className="w-full h-12 px-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Giá (VNĐ)</label>
                            <input 
                              type="number" value={dishFormData.basePrice} onChange={e => setDishFormData({...dishFormData, basePrice: parseInt(e.target.value)})}
                              className="w-full h-12 px-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loại</label>
                            <select 
                              value={dishFormData.type} onChange={e => setDishFormData({...dishFormData, type: e.target.value as any})}
                              className="w-full h-12 px-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            >
                              <option value="main">Món chính</option>
                              <option value="addon">Món thêm (tùy chọn)</option>
                            </select>
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mô tả ngắn</label>
                            <textarea 
                              value={dishFormData.description} onChange={e => setDishFormData({...dishFormData, description: e.target.value})}
                              className="w-full h-24 p-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs font-medium resize-none"
                            />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Đường dẫn ảnh (URL)</label>
                            <input 
                              type="text" value={dishFormData.imageUrl} onChange={e => setDishFormData({...dishFormData, imageUrl: e.target.value})}
                              className="w-full h-12 px-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs"
                              placeholder="https://..."
                            />
                          </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                          <button type="button" onClick={() => setShowDishForm(false)} className="flex-1 py-3 border border-gray-100 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-all">Hủy</button>
                          <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <Save size={18}/> {editingDish ? 'Cập nhật' : 'Lưu món mới'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dishes.map(dish => (
                  <div key={dish.id} className="chef-card group overflow-hidden p-0 flex flex-col">
                    <div className="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {dish.imageUrl ? (
                        <img src={dish.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={dish.name} />
                      ) : (
                        <ImageIcon size={32} className="text-gray-300" />
                      )}
                      <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold text-primary border border-white">
                        {dish.type === 'main' ? 'Món chính' : 'Linh hoạt'}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{dish.name}</h4>
                        <span className="text-sm font-bold text-primary">{dish.basePrice.toLocaleString('vi-VN')}đ</span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium line-clamp-2 mb-6">
                        {dish.description || 'Chưa có mô tả cho món ăn này.'}
                      </p>
                      <div className="mt-auto pt-4 border-t border-gray-50 flex gap-2">
                        <button onClick={() => openEditDish(dish)} className="flex-1 py-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-50 hover:text-primary transition-all flex items-center justify-center gap-2 text-[10px] font-bold">
                          <Edit2 size={12}/> SỬA
                        </button>
                        <button onClick={() => deleteDish(dish.id)} className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
