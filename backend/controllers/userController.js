import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';

// ১. ইউনিক রেফারেল কোড তৈরি করার ফাংশন
const generateReferralCode = (name) => {
  const prefix = name.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomNum}`;
};

// @desc     Auth user & get token
// @route    POST /api/users/auth
// @access   Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    // প্রোফাইল ওপেন করার সময় রেফারেল সংখ্যা গুনে নেওয়া
    const referralCount = await User.countDocuments({ referredBy: user.referralCode });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      image: user.image,
      referralCode: user.referralCode,
      walletBalance: user.walletBalance,
      referralCount, // ফ্রন্টএন্ডে এটি দেখাবো
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc     Register a new user
// @route    POST /api/users
// @access   Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, referredBy } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const myReferralCode = generateReferralCode(name);

  // নতুন ইউজার তৈরি
  const user = await User.create({
    name,
    email,
    password,
    referralCode: myReferralCode,
    referredBy: referredBy || null, // কার মাধ্যমে এসেছে তা সেভ করা হলো
    walletBalance: referredBy ? 10 : 0, // নতুন ইউজার পাচ্ছে ১০ টাকা
  });

  if (user) {
    // ২. রেফারারকে বোনাস দেওয়া (Mohsin পাবে ১০ টাকা)
    if (referredBy) {
      const inviter = await User.findOne({ referralCode: referredBy });
      if (inviter) {
        inviter.walletBalance += 10;
        await inviter.save();
      }
    }

    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      image: user.image,
      referralCode: user.referralCode,
      walletBalance: user.walletBalance,
      referralCount: 0,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc     Get user profile
// @route    GET /api/users/profile
// @access   Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // ইউজারের রেফারেল কোড ব্যবহার করে কতজন জয়েন করেছে তা গণনা
    const referralCount = await User.countDocuments({ referredBy: user.referralCode });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      image: user.image,
      referralCode: user.referralCode,
      walletBalance: user.walletBalance,
      referralCount,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc     Update user profile
// @route    PUT /api/users/profile
// @access   Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.image) {
      user.image = req.body.image;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    const referralCount = await User.countDocuments({ referredBy: updatedUser.referralCode });

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      image: updatedUser.image,
      walletBalance: updatedUser.walletBalance,
      referralCode: updatedUser.referralCode,
      referralCount,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc     Logout user / clear cookie
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// --- Admin Routes ---

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Can not delete admin user');
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
};