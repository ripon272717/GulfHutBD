import path from 'path';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// সরাসরি কনফিগারেশন চেক
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gulfhut_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage });

router.post('/', (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      // এই লগটি আপনাকে Render-এর Logs-এ আসল ঘটনা বলবে
      console.log('--- ACTUAL CLOUDINARY ERROR ---');
      console.log(err); 
      return res.status(500).json({ message: err.message || 'Server Error' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(200).json({
      message: 'Success',
      image: req.file.path,
    });
  });
});

export default router;