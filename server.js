import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary'; // ক্লাউডিনারি ইমপোর্ট
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// রুটস ইমপোর্ট
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// এনভায়রনমেন্ট ভ্যারিয়েবল লোড করা (সবার আগে)
dotenv.config();

// ডাটাবেস কানেকশন
connectDB();

// ক্লাউডিনারি কনফিগারেশন
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const port = process.env.PORT || 5000;

// CORS সেটিংস
app.use(cors({
  origin: ['http://localhost:3000', 'https://gulfhutbd.vercel.app'],
  credentials: true,
}));

// মিডলওয়্যার
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// এপিআই রুটস
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// স্ট্যাটিক ফোল্ডার সেটআপ
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// প্রোডাকশন মোড হ্যান্ডেলিং
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')));
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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    // চেক করার জন্য ক্লাউড নেম কনসোলে দেখানো হলো
    console.log('Cloudinary Configured:', process.env.CLOUDINARY_CLOUD_NAME);
});