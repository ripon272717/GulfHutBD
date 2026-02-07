import path from 'path';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// ১. ক্লাউডিনারি কনফিগারেশন
// নিশ্চিত করো তোমার .env ফাইলে বা Render ড্যাশবোর্ডে এই ৩টি নাম হুবহু আছে
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ২. ক্লাউডিনারি স্টোরেজ সেটআপ
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gulfhut_uploads', // ক্লাউডিনারিতে এই ফোল্ডারে ছবি জমা হবে
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // অটো রিসাইজ (অপশনাল)
  },
});

// ৩. মুল্টার (Multer) সেটআপ
const upload = multer({ 
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // ৩ এমবি লিমিট
});

// ৪. আপলোড রুট (POST /api/upload)
router.post('/', (req, res) => {
  // 'image' হলো ফ্রন্টএন্ড থেকে পাঠানো FormData-র কী (Key)
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // এটি মুল্টার সংক্রান্ত এরর (যেমন: ফাইল সাইজ বড় হলে)
      console.error('Multer Error Details:', err);
      return res.status(500).json({ message: `Multer Error: ${err.message}` });
    } else if (err) {
      // এটি ক্লাউডিনারি বা অন্য কোনো এরর
      console.error('Cloudinary/General Error Details:', err);
      return res.status(500).json({ message: err.message || 'Internal Server Error' });
    }

    // যদি ফাইল না থাকে
    if (!req.file) {
      console.error('Upload Attempted but no file found in request');
      return res.status(400).json({ message: 'No file uploaded! Check your field name.' });
    }

    // সফল হলে ক্লাউডিনারি থেকে আসা লিঙ্ক পাঠানো হবে
    console.log('Successfully Uploaded to Cloudinary:', req.file.path);
    res.status(200).json({
      message: 'Image uploaded successfully',
      image: req.file.path,
    });
  });
});

export default router;