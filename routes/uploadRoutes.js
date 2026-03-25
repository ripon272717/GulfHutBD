import path from 'path';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { protect, admin } from '../middleware/authMiddleware.js'; // মিডলওয়্যার ইমপোর্ট

const router = express.Router();

// ক্লাউডিনারি কনফিগ (তোর .env থেকে ডাটা নেবে)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// স্টোরেজ সেটআপ
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gulfhut_images', // ক্লাউডিনারিতে এই নামে ফোল্ডার হবে
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

// মেইন আপলোড রুট (protect যোগ করলাম যেন টোকেন ছাড়া কেউ না পারে)
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No image file provided' });
  }
  res.send({
    message: 'Image uploaded successfully',
    image: req.file.path, // এটাই ক্লাউডিনারির আসল লিঙ্ক
  });
});

export default router;