import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// কনফিগারেশন নিশ্চিত করা
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gulfhut_images',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    // এখানে আলাদা করে public_id দেওয়ার দরকার নেই, ক্লাউডিনারি অটোমেটিক একটা আইডি দিয়ে দেবে
  },
});

const upload = multer({ storage });

router.post('/', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'ছবি পাওয়া যায়নি' });
  }
  // ক্লাউডিনারি থেকে আসা ইমেজের লিঙ্ক পাঠিয়ে দেওয়া হচ্ছে
  res.send({
    message: 'Image uploaded',
    image: req.file.path, 
  });
});

export default router;