import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors'; 
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const port = process.env.PORT || 5000;

// ডাটাবেস কানেকশন
connectDB();

const app = express();

// ১. CORS কনফিগারেশন (এটিই সবচেয়ে গুরুত্বপূর্ণ)
app.use(cors({
  origin: true, // সব ডোমেইন (Vercel, Localhost) অ্যালাউ করবে
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// ২. টেস্ট রুট (যাতে ব্রাউজারে চেক করা যায়)
app.get('/', (req, res) => {
  res.send('API is running properly (Render Backend)...');
});

// ৩. এপিআই রুটস
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// ৪. এরর হ্যান্ডলিং (এটি সবার শেষে থাকবে)
app.use(notFound);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);