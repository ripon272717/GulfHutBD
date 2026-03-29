import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User from '../models/userModel.js';

// User must be authenticated
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // ব্রাউজারের কুকি থেকে 'jwt' টোকেনটি রিড করা
  token = req.cookies.jwt;

  // চেক করার জন্য কনসোলে প্রিন্ট (ডেভেলপমেন্ট মোডে কাজে দেবে)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Token checking in middleware:', token ? 'Found' : 'Not Found');
  }

  if (token) {
    try {
      // টোকেন ভেরিফাই করা
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ইউজারের ডাটা ডাটাবেস থেকে নিয়ে আসা (পাসওয়ার্ড ছাড়া)
      req.user = await User.findById(decoded.userId).select('-password');

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      res.status(401);
      throw new Error('অনুমোদিত নয়, টোকেন কাজ করছে না');
    }
  } else {
    res.status(401);
    throw new Error('অনুমোদিত নয়, কোনো টোকেন পাওয়া যায়নি');
  }
});

// User must be an admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('অ্যাডমিন হিসেবে আপনার অনুমতি নেই');
  }
};

export { protect, admin };