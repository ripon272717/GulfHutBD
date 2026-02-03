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

// মিডলওয়্যার
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// এপিআই রুটস
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes); // ইমেজ আপলোড রুট

app.get('/api/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
);

// স্ট্যাটিক ফোল্ডার এবং প্রোডাকশন কনফিগারেশন
const __dirname = path.resolve();

if (process.env.NODE_ENV === 'production') {
  // প্রোডাকশনে আপলোড ফোল্ডার (সার্ভারের পাথ অনুযায়ী)
  app.use('/uploads', express.static('/var/data/uploads'));
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  // লোকাল ডেভেলপমেন্টে আপলোড ফোল্ডার
  app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
  
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