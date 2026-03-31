import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js'; 
import generateToken from '../utils/generateToken.js'; 

// @desc    Auth user & get token (Login with multiple options)
// @route   POST /api/users/login
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body; 

  const user = await User.findOne({
    $or: [
      { mobile: email },                                
      { customId: email },                              
      { name: email },                                  
      { email: email ? email.toLowerCase() : '____' }   
    ],
  });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      customId: user.customId,
      isAdmin: user.isAdmin,
      image: user.image,
    });
  } else {
    res.status(401);
    throw new Error('ভুল তথ্য অথবা পাসওয়ার্ড দেওয়া হয়েছে');
  }
});

// @desc    Register a new user (৬ ডিজিট ইউনিক আইডি লজিকসহ)
// @route   POST /api/users
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, mobile, password, referredBy } = req.body;

  const userExists = await User.findOne({ mobile });

  if (userExists) {
    res.status(400);
    throw new Error('এই মোবাইল নম্বর দিয়ে অলরেডি অ্যাকাউন্ট আছে');
  }

  // --- ইউনিক কাস্টম আইডি জেনারেশন লজিক শুরু ---
  let isUnique = false;
  let digitsToTake = 6; 
  let customId = "";

  while (!isUnique) {
    // মোবাইলের শেষ অংশ নেওয়া (শুরুতে ৬ ডিজিট)
    let mobileSuffix = mobile.slice(-digitsToTake);
    customId = `QHBD${mobileSuffix}`;

    // ডাটাবেসে চেক করা এই আইডি আগে কেউ নিয়েছে কি না
    const idExists = await User.findOne({ customId });

    if (idExists) {
      // যদি মিলে যায়, তবে ডিজিট বাড়িয়ে ৭ করবে, তারপর ৮...
      digitsToTake++;
      
      // সেফটি: যদি মোবাইল নম্বরের সব ডিজিট শেষ হয়ে যায় তবে র‍্যান্ডম সংখ্যা যোগ করবে
      if (digitsToTake > mobile.length) {
        customId = `QHBD${mobile.slice(-6)}${Math.floor(Math.random() * 10)}`;
        // র‍্যান্ডম দেওয়ার পর সে সরাসরি ইউনিক ধরে নেবে অথবা লুপ আবার চেক করবে
      }
    } else {
      // যদি এই আইডি ডাটাবেসে না থাকে, তবে এটি ইউনিক
      isUnique = true; 
    }
  }
  // --- ইউনিক কাস্টম আইডি জেনারেশন লজিক শেষ ---

  // রেফারেল কোড জেনারেশন (নামের প্রথম ৩ অক্ষর + মোবাইলের শেষ ৪ ডিজিট)
  // ... (রেজিস্ট্রেশন ফাংশনের ভেতর যেখানে রেফারেল কোড জেনারেট হচ্ছে)

// নামের প্রথম ৩ অক্ষর + মোবাইলের শেষ ৪ ডিজিট + ২ ডিজিটের র‍্যান্ডম নম্বর
const cleanName = name.replace(/\s/g, '').toUpperCase();
const randomSuffix = Math.floor(Math.random() * 90) + 10; // এটি ডুপ্লিকেট হওয়া আটকাবে
const referralCode = `${cleanName.substring(0, 3)}${mobile.slice(-4)}${randomSuffix}`;

const user = await User.create({
  name,
  mobile,
  password,
  customId, // আমাদের জেনারেট করা ইউনিক আইডি
  referralCode, // এখন এটি ইউনিক হবেই
  referredBy: referredBy || null,
  email: email && email.trim() !== '' ? email.toLowerCase() : undefined,
});
  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      customId: user.customId,
      isAdmin: user.isAdmin,
      image: user.image,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV !== 'development',
    sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'lax',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      customId: user.customId,
      isAdmin: user.isAdmin,
      image: user.image,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update profile
// @route   PUT /api/users/profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.mobile = req.body.mobile || user.mobile;
    
    if (req.body.email) {
      user.email = req.body.email.toLowerCase();
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    if (req.body.image) {
      user.image = req.body.image;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      customId: updatedUser.customId,
      isAdmin: updatedUser.isAdmin,
      image: updatedUser.image,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// --- ADMIN FUNCTIONS ---

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error('অ্যাডমিন ইউজার ডিলিট করা সম্ভব নয়');
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'ইউজার সফলভাবে রিমুভ করা হয়েছে' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.mobile = req.body.mobile || user.mobile;
    user.isAdmin = Boolean(req.body.isAdmin);
    
    if (req.body.image) {
        user.image = req.body.image;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      isAdmin: updatedUser.isAdmin,
      image: updatedUser.image,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});