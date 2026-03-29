import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';

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
    folder: 'gulfhut_images',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

router.post('/', protect, admin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }
    // সফল হলে ইমেজের পাথ পাঠানো
    res.send({
      message: 'Image uploaded successfully',
      image: req.file.path,
    });
  } catch (error) {
    // এরর হলে কনসোলে দেখাবে কেন হচ্ছে
    console.error(error);
    res.status(500).send({ message: 'Server Error during upload' });
  }
});

export default router;