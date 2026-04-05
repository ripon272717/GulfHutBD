import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User from '../models/userModel.js';

// ১. ইউজার অবশ্যই লগইন করা থাকতে হবে (Protect)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // ব্রাউজারের কুকি থেকে 'jwt' টোকেনটি রিড করা
  token = req.cookies.jwt;

  if (process.env.NODE_ENV !== 'production') {
    console.log('Token checking in middleware:', token ? 'Found' : 'Not Found');
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      res.status(401);
      throw new Error('অনুমোদিত নয়, টোকেন কাজ করছে না');
    }
  } else {
    res.status(401);
    throw new Error('অনুমোদিত নয়, কোনো টোকেন পাওয়া যায়নি');
  }
});

// ২. অ্যাডমিন মিডলওয়্যার (এখানে সুপার-অ্যাডমিনকেও অনুমতি দেওয়া হয়েছে)
const admin = (req, res, next) => {
  // যদি ইউজার isAdmin হয় অথবা তার রোল 'admin' বা 'superadmin' হয়
  if (req.user && (req.user.isAdmin || req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(401);
    throw new Error('অ্যাডমিন হিসেবে আপনার অনুমতি নেই');
  }
};

// ৩. শুধুমাত্র সুপার-অ্যাডমিন মিডলওয়্যার (বিশেষ কাজের জন্য)
const superAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'superadmin' || req.user.isSuperAdmin)) {
    next();
  } else {
    res.status(401);
    throw new Error('শুধুমাত্র সুপার-অ্যাডমিন এই কাজ করতে পারবেন');
  }
};

export { protect, admin, superAdmin };