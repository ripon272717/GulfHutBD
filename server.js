import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// রুটস ইমপোর্ট
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// ১. এনভায়রনমেন্ট ভ্যারিয়েবল লোড করা
dotenv.config();

// ২. ডাটাবেস কানেকশন
connectDB();

// ৩. ক্লাউডিনারি কনফিগারেশন
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const port = process.env.PORT || 5000;

// ৪. CORS সেটিংস (এটি সবার উপরে থাকা জরুরি)
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://gulfhutbd.vercel.app'],
    credentials: true, // এটি অবশ্যই true হতে হবে যেন টোকেন/কুকি আদান-প্রদান করতে পারে
  })
);

// ৫. মিডলওয়্যার (অর্ডার অনুযায়ী সাজানো)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser()); // কুকি রিড করার জন্য এটি রুটস এর উপরে থাকতে হবে

// ৬. এপিআই রুটস
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// ৭. স্ট্যাটিক ফোল্ডার এবং প্রোডাকশন সেটআপ
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

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

// ৮. এরর হ্যান্ডলিং মিডলওয়্যার (সবার নিচে)
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
  console.log('Cloudinary Configured:', process.env.CLOUDINARY_CLOUD_NAME);
});