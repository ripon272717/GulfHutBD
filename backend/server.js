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

// --- CORS সমস্যার স্থায়ী সমাধান ---
app.use(cors({
  origin: function (origin, callback) {
    // যদি রিকোয়েস্ট লোকালহোস্ট বা তোমার নির্দিষ্ট সাইট থেকে আসে তবে অনুমতি দাও
    const allowedOrigins = [
      'https://gulf-hut-bd.vercel.app',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
// --------------------------------

// বডি পার্সার (ইমেজ আপলোডের সুবিধার্থে লিমিট বাড়িয়ে দেওয়া হয়েছে)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// এপিআই রুটসমূহ
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
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

// এরর হ্যান্ডলিং
app.use(notFound);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);