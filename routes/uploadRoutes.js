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
    folder: 'gulfhut_media',
    // এখানে 'video' সাপোর্ট করার জন্য resource_type 'auto' রাখা জরুরি
    resource_type: 'auto', 
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mkv', 'mov'],
    public_id: (req, file) => `media-${Date.now()}`,
  },
});

// ভিডিও ফাইল সাধারণত বড় হয়, তাই লিমিট বাড়িয়ে ২০ এমবি বা তার বেশি করে দে
const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } 
}).single('media'); // 'image' এর বদলে 'media' নাম দিতে পারিস যেন ভিডিও-ছবি দুইটাই বোঝায়


router.post('/', protect, (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // ফাইল সাইজ বেশি বড় হলে (লিমিট ক্রস করলে) এই এরর আসবে
      console.error('Multer Error:', err);
      return res.status(400).json({ 
        message: err.code === 'LIMIT_FILE_SIZE' 
          ? 'ফাইল সাইজ অনেক বড়! সর্বোচ্চ ১০ এমবি পর্যন্ত এলাউড।' 
          : `Multer error: ${err.message}` 
      });
    } else if (err) {
      // ক্লাউডিনারি বা ফরমেট জনিত এরর
      console.error('Cloudinary/Server Error:', err);
      return res.status(500).json({ message: `Upload error: ${err.message}` });
    }

    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }

    // সফল হলে ক্লাউডিনারি থেকে আসা ইমেজের পাথ এবং মিডিয়া টাইপ (image/video) রেসপন্স দিবে
    res.send({
      message: 'Uploaded successfully!',
      url: req.file.path,
      mimetype: req.file.mimetype // এটি দিয়ে বুঝবি ভিডিও না কি ছবি
    });
  });
});
export default router;