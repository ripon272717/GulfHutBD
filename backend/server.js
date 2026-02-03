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
app.set('trust proxy', 1); // এটি যোগ করো

// CORS কনফিগারেশন - এটি Vercel থেকে রিকোয়েস্ট আসার অনুমতি দিবে
app.use(cors({
  origin: 'https://gulf-hut-bd.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // এটি কুকি পাঠানোর জন্য মাস্ট
}));

// এটি কুকি সেটিংসের জন্য রেন্ডারকে বিশ্বাস করতে সাহায্য করবে
app.set('trust proxy', 1);

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

// প্রোডাকশন এবং স্ট্যাটিক ফাইল সেটিংস
if (process.env.NODE_ENV === 'production') {
  // রেন্ডারে আপলোড করা ফাইলগুলো দেখানোর জন্য
  app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
  
  app.get('/', (req, res) => {
    res.send('GulfHutBD API is running in production mode...');
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