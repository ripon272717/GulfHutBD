import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gulfhut_images',
    // এখানে 'webp' যোগ করে দে
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], 
    public_id: (req, file) => `file-${Date.now()}`,
    resource_type: 'auto',
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } 
}).single('image'); // এখানে মিডলওয়্যার আলাদা করে নিলাম

router.post('/', protect, (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Multer এর কোনো এরর হলে (যেমন ফাইল সাইজ বড় হলে)
      console.error('Multer Error:', err);
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    } else if (err) {
      // ক্লাউডিনারি বা অন্য কোনো এরর হলে
      console.error('Cloudinary/Server Error:', err);
      return res.status(500).json({ message: `Upload error: ${err.message}` });
    }

    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }

    // সফল হলে
    res.send({
      message: 'Image uploaded successfully',
      image: req.file.path,
    });
  });
});

export default router;