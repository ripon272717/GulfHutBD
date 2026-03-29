import path from 'path';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ক্লাউডিনারি কনফিগারেশন (এটি নিশ্চিত করবে যে সঠিক ক্রেডেনশিয়াল ব্যবহার হচ্ছে)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// স্টোরেজ সেটআপ (এখানে params কে ফাংশন হিসেবে দিলে সিগনেচার এরর হয় না)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'gulfhut_images',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`, // ইউনিক আইডি তৈরি করবে
    };
  },
});

const upload = multer({ storage });

// আপলোড রুট
router.post('/', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No image file provided' });
  }
  
  res.send({
    message: 'Image uploaded successfully',
    image: req.file.path, // এটাই ক্লাউডিনারির ফাইনাল ইমেজ ইউআরএল
  });
});

export default router;