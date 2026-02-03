import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors'; // ১. CORS ইম্পোর্ট করো
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

// ২. CORS কনফিগারেশন (এটি 'Failed to fetch' এরর দূর করবে)
app.use(cors({
  origin: 'https://gulf-hut-bd.vercel.app', // তোমার ভার্সেল ডোমেইন
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// মিডলওয়্যার
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// ৩. প্রোডাকশন সেটিংস আপডেট
if (process.env.NODE_ENV === 'production') {
  app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
  
  app.get('/', (req, res) => {
    res.send('API is running in production...');
  });
} else {
  app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
  
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

// এরর হ্যান্ডলিং মিডলওয়্যার
app.use(notFound);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);