import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
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

// বডি পার্সার (ইমেজ সাইজ লিমিট বাড়ানো হয়েছে যাতে এরর না আসে)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// এপিআই রুটস
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

// পেপাল কনফিগ
app.get('/api/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// প্রোডাকশন বনাম ডেভেলপমেন্ট সেটআপ
if (process.env.NODE_ENV === 'production') {
  // ফ্রন্টএন্ড বিল্ড ফোল্ডারকে স্ট্যাটিক হিসেবে সেট করা
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  // যেকোনো রুটে হিট করলে index.html পাঠানো (রিঅ্যাক্ট রাউটিং ঠিক রাখার জন্য)
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

// এরর হ্যান্ডলিং মিডলওয়্যার
app.use(notFound);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);