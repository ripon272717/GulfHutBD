import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors'; 
dotenv.config();
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const port = process.env.PORT || 5000;

// ডাটাবেস কানেকশন
connectDB();

const app = express();

// CORS কনফিগারেশন (লোকালহোস্টের জন্য)
app.use(cors({
  origin: 'https://gulf-hut-bd.vercel.app', // তোমার ভার্সেল ডোমেইন
  credentials: true, // কুকি বা অথেন্টিকেশন পাঠানোর জন্য এটি জরুরি
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// এপিআই রুটস
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// প্রোডাকশন সেটআপ (Render-এর জন্য)
if (process.env.NODE_ENV === 'production') {
  // ফ্রন্টএন্ড বিল্ড ফোল্ডারকে স্ট্যাটিক হিসেবে সেট করা
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  // যেকোনো রুটে হিট করলে index.html পাঠানো
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);