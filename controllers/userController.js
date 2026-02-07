import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';

// ১. ইউনিক রেফারেল কোড তৈরি করার ফাংশন
const generateReferralCode = (name) => {
  const prefix = name.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomNum}`;
};

// @desc     Auth user & get token (Login)
// @route    POST /api/users/auth
// @access   Public
const authUser = asyncHandler(async (req, res) => {
  const { identity, password } = req.body; // identity হতে পারে name, mobile অথবা email

  // ডাটাবেসে চেক করা (যেকোনো একটি মিললেই হবে)
  const user = await User.findOne({
    $or: [
      { email: identity },
      { mobile: identity },
      { name: identity }
    ]
  });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    const referralCount = await User.countDocuments({ referredBy: user.referralCode });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      isAdmin: user.isAdmin,
      image: user.image,
      referralCode: user.referralCode,
      walletBalance: user.walletBalance,
      referredBy: user.referredBy,
      referralCount,
    });
  } else {
    res.status(401);
    throw new Error('ভুল ইউজার আইডি বা পাসওয়ার্ড');
  }
});

// @desc     Register a new user
// @route    POST /api/users
// @access   Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, mobile, email, password, referredBy } = req.body;

  // মোবাইল নম্বর দিয়ে ইউজার চেক করা
  const userExists = await User.findOne({ mobile });

  if (userExists) {
    res.status(400);
    throw new Error('এই মোবাইল নম্বর দিয়ে অলরেডি অ্যাকাউন্ট খোলা আছে');
  }

  const myReferralCode = generateReferralCode(name);

  // নতুন ইউজার তৈরি
  const user = await User.create({
    name,
    mobile,
    email: email || undefined, // ইমেইল না থাকলে ডাটাবেসে জমা হবে না
    password,
    referralCode: myReferralCode,
    referredBy: referredBy || null,
    walletBalance: 0, 
  });

  if (user) {
    // রেফারারকে বোনাস দেওয়া
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
      mobile: user.mobile,
      isAdmin: user.isAdmin,
      referralCode: user.referralCode,
      walletBalance: user.walletBalance,
      referralCount: 0,
    });
  } else {
    res.status(400);
    throw new Error('ভুল ইউজার ডাটা');
  }
});

// @desc     Get user profile
// @route    GET /api/users/profile
// @access   Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const referralCount = await User.countDocuments({ referredBy: user.referralCode });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      isAdmin: user.isAdmin,
      image: user.image,
      referralCode: user.referralCode,
      walletBalance: user.walletBalance,
      referredBy: user.referredBy,
      referralCount,
    });
  } else {
    res.status(404);
    throw new Error('ইউজার পাওয়া যায়নি');
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
    user.mobile = req.body.mobile || user.mobile;
    user.image = req.body.image || user.image;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    const referralCount = await User.countDocuments({ referredBy: updatedUser.referralCode });

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      isAdmin: updatedUser.isAdmin,
      image: updatedUser.image,
      walletBalance: updatedUser.walletBalance,
      referralCode: updatedUser.referralCode,
      referralCount,
    });
  } else {
    res.status(404);
    throw new Error('ইউজার পাওয়া যায়নি');
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
      throw new Error('অ্যাডমিন ইউজার ডিলিট করা সম্ভব নয়');
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'ইউজার রিমুভ করা হয়েছে' });
  } else {
    res.status(404);
    throw new Error('ইউজার পাওয়া যায়নি');
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('ইউজার পাওয়া যায়নি');
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.mobile = req.body.mobile || user.mobile;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('ইউজার পাওয়া যায়নি');
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