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
      image: user.image,
      // রোল এবং ব্যালেন্স অ্যাড করা হলো সিঙ্ক হওয়ার জন্য
      role: user.role,
      walletBalance: user.walletBalance,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
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
    let mobileSuffix = mobile.slice(-digitsToTake);
    customId = `QHBD${mobileSuffix}`;

    const idExists = await User.findOne({ customId });

    if (idExists) {
      digitsToTake++;
      if (digitsToTake > mobile.length) {
        customId = `QHBD${mobile.slice(-6)}${Math.floor(Math.random() * 10)}`;
      }
    } else {
      isUnique = true; 
    }
  }
  // --- ইউনিক কাস্টম আইডি জেনারেশন লজিক শেষ ---

  const cleanName = name.replace(/\s/g, '').toUpperCase();
  const randomSuffix = Math.floor(Math.random() * 90) + 10; 
  const referralCode = `${cleanName.substring(0, 3)}${mobile.slice(-4)}${randomSuffix}`;

  const user = await User.create({
    name,
    mobile,
    password,
    customId,
    referralCode,
    referredBy: referredBy || null,
    email: email && email.trim() !== '' ? email.toLowerCase() : undefined,
    // নতুন ইউজার ডিফল্টভাবে 'user' রোল পাবে (মডেল অনুযায়ী)
  });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      customId: user.customId,
      image: user.image,
      role: user.role,
      walletBalance: user.walletBalance,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
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
      image: user.image,
      role: user.role,
      walletBalance: user.walletBalance,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
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
      image: updatedUser.image,
      role: updatedUser.role, 
      walletBalance: updatedUser.walletBalance,
      isAdmin: updatedUser.isAdmin,
      isSuperAdmin: updatedUser.isSuperAdmin,
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
    if (user.isAdmin || user.isSuperAdmin) {
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
    
    // অ্যাডমিন দ্বারা রোল এবং ব্যালেন্স আপডেট করার অপশন
    user.role = req.body.role || user.role;
    user.walletBalance = req.body.walletBalance || user.walletBalance;
    user.isAdmin = req.body.isAdmin !== undefined ? Boolean(req.body.isAdmin) : user.isAdmin;
    user.isSuperAdmin = req.body.isSuperAdmin !== undefined ? Boolean(req.body.isSuperAdmin) : user.isSuperAdmin;
    
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
      image: updatedUser.image,
      role: updatedUser.role,
      walletBalance: updatedUser.walletBalance,
      isAdmin: updatedUser.isAdmin,
      isSuperAdmin: updatedUser.isSuperAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});