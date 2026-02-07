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

// ২. স্টোরেজ সেটআপ
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gulfhut_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

// ৩. মুল্টার সেটআপ (২ এমবি সাইজ লিমিট)
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 } 
});

// ৪. ইমেজ আপলোড রুট
router.post('/', (req, res) => {
  // ফ্রন্টএন্ড থেকে 'image' নামে ফাইলটি আসতে হবে
  upload.single('image')(req, res, function (err) {
    if (err) {
      // এই লগটি রেন্ডার ড্যাশবোর্ডের Logs ট্যাবে দেখা যাবে
      console.error('--- SERVER UPLOAD ERROR START ---');
      console.error(err);
      console.error('--- SERVER UPLOAD ERROR END ---');

      // ক্লাউডিনারি বা মুল্টার এরর মেসেজ পাঠানো
      return res.status(500).json({ 
        message: err.message || 'Server encountered an error during upload' 
      });
    }

    // যদি কোনো ফাইল না পাওয়া যায়
    if (!req.file) {
      console.warn('Upload attempt failed: No file found in request');
      return res.status(400).json({ message: 'No file uploaded. Please select an image.' });
    }

    // সফল আপলোড
    console.log('File successfully uploaded to Cloudinary:', req.file.path);
    res.status(200).json({
      message: 'Image uploaded successfully',
      image: req.file.path,
    });
  });
});

export default router;