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
    folder: 'user_profiles',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

// ৩. ফাইল ফিল্টার (শুধু ইমেজ অ্যালাউ করবে)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only! (jpg, png, webp)'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // ৫ এমবি লিমিট (সেফ সাইড)
});

const uploadSingleImage = upload.single('image');

// ৪. পোস্ট রুট
router.post('/', (req, res) => {
  uploadSingleImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err.message);
      return res.status(400).send({ message: `Multer Error: ${err.message}` });
    } else if (err) {
      console.error('Upload Error:', err.message);
      return res.status(400).send({ message: err.message });
    }

    if (!req.file) {
      console.error('No file found in request');
      return res.status(400).send({ message: 'No file uploaded!' });
    }

    // সফল হলে ক্লাউডিনারি ইউআরএল পাঠাবে
    console.log('Upload Success:', req.file.path);
    res.status(200).send({
      message: 'Image uploaded successfully',
      image: req.file.path,
    });
  });
});

export default router;