import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Parser } from 'json2csv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

// Sử dụng Firebase Admin SDK để thao tác với DB từ Server
import admin from 'firebase-admin';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = admin.firestore();
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tuong-chef-secret-888-29384';

app.use(express.json());

// API: Login with Username & Password (Hashed)
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const userSnap = await db.collection('users').doc(username).get();
    
    if (!userSnap.exists) {
      return res.status(401).json({ error: "Người dùng không tồn tại" });
    }
    
    const user = userSnap.data();
    const isMatch = await bcrypt.compare(password, user?.password || '');
    
    if (!isMatch) {
      return res.status(401).json({ error: "Mật khẩu không chính xác" });
    }
    
    const token = jwt.sign(
      { uid: username, role: user?.role, name: user?.realName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      success: true, 
      token, 
      profile: { id: username, ...user, password: '' } 
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
});

// API: Register Admin (Dùng 1 lần để tạo tài khoản đầu tiên hoặc seeding)
app.post('/api/admin/seed', async (req, res) => {
  const { secret, username, password, realName } = req.body;
  if (secret !== 'TUONGCHEF_INIT_2024') return res.status(403).send();
  
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.collection('users').doc(username).set({
    username,
    password: hashedPassword,
    realName,
    role: 'admin',
    mustChangePassword: true,
    createdAt: new Date().toISOString()
  });
  res.json({ success: true });
});

app.get('/api/admin/export-orders', async (req, res) => {
  try {
    const fields = ['date', 'userName', 'companyName', 'totalAmount', 'paymentStatus'];
    const opts = { fields };
    const parser = new Parser(opts);
    // Mock data for initial build, will replace with real firestore query
    const data = [
      { date: '2024-04-22', userName: 'Nguyen Van A', companyName: 'DYM Vietnam', totalAmount: 36000, paymentStatus: 'confirmed' }
    ];
    const csv = parser.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment('orders.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ error: "Export failed" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
