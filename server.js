import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import cors from 'cors';

const port = process.env.PORT || 5000;

// MongoDB কানেক্ট করা
connectDB();

const app = express();

// --- CORS কনফিগারেশন (এই অংশটিই তোর লগআউট সমস্যার সমাধান) ---
app.use(cors({
  origin: [
    'https://gulfhutbd.vercel.app',  // তোর ভেরসেল ডোমেইন
    'https://gulfhutbd6.onrender.com', // তোর রেন্ডার ডোমেইন
    'http://localhost:3000'          // লোকাল হোস্ট
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // এটি কুকি/টোকেন আদান-প্রদানের জন্য মাস্ট
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// বডি পার্সার মিডলওয়্যার
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// রুটস (Routes)
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// ইমেজ ফোল্ডার স্ট্যাটিক করা
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// প্রোডাকশন মোড চেক
if (process.env.NODE_ENV === 'production') {
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
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