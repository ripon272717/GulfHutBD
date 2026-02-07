import path from 'path';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// ১. ক্লাউডিনারি কনফিগারেশন
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ২. ক্লাউডিনারি স্টোরেজ সেটআপ
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gulfhut_products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

// ৩. মুল্টার সেটআপ
const upload = multer({ storage });

// ৪. আপলোড রুট (Error handling সহ)
router.post('/', (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      // এই লগটি রেন্ডার ড্যাশবোর্ডে আসল কারণ দেখাবে
      console.error('--- CLOUDINARY UPLOAD ERROR ---');
      console.error(err);
      return res.status(500).json({ 
        message: err.message || 'সার্ভারে ইমেজ আপলোড করতে সমস্যা হয়েছে' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'কোনো ফাইল সিলেক্ট করা হয়নি!' });
    }

    // সফল আপলোড
    res.status(200).json({
      message: 'ইমেজ সফলভাবে আপলোড হয়েছে',
      image: req.file.path, 
    });
  });
});

export default router;