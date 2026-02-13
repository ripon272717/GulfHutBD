import path from 'path';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// ক্লাউডিনারি কনফিগারেশন
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user_profiles',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

// ইমেজ আপলোড রাউট (এখানেই তোর ভুল ছিল)
router.post('/', upload.single('image'), (req, res) => {
  if (req.file) {
    res.status(200).send({
      message: 'ইমেজ আপলোড সফল',
      image: req.file.path, // এই লিঙ্কটাই প্রোফাইল পিকচার হিসেবে সেভ হবে
    });
  } else {
    res.status(400);
    throw new Error('ফাইল পাওয়া যায়নি! দয়া করে একটি ছবি সিলেক্ট করুন।');
  }
});

export default router;