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

// ২. ক্লাউডিনারি স্টোরেজ সেটআপ (যাতে লিঙ্ক https হয়)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gulfhut_products', // এই নামে ক্লাউডিনারিতে ফোল্ডার হবে
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage });

// ৩. আপলোড রুট
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'ফাইল পাওয়া যায়নি!' });
  }

  // সফল হলে req.file.path আপনাকে সরাসরি Cloudinary-র https লিঙ্ক দিবে
  res.status(200).json({
    message: 'ইমেজ সফলভাবে আপলোড হয়েছে',
    image: req.file.path, 
  });
});

export default router;