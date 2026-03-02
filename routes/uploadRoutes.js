import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gulfhut_profile_pics',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    // Unsigned preset আগেই বানানো আছে বলে এখানে আর লাগবে না
  },
});

const upload = multer({ storage });

router.post('/', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Cloudinary Upload Error: ' + err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file selected' });
    }
    res.status(200).json({
      message: 'Image uploaded successfully',
      image: req.file.path, 
    });
  });
});

export default router;