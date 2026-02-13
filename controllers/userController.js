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

// @desc    Register a new user
// @route   POST /api/users
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, mobile, password } = req.body;

  const userExists = await User.findOne({ mobile });

  if (userExists) {
    res.status(400);
    throw new Error('এই মোবাইল নম্বর দিয়ে অলরেডি অ্যাকাউন্ট আছে');
  }

  const user = await User.create({
    name,
    mobile,
    password,
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

// @desc    Update profile (ইমেজ ফিক্সসহ)
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

    // ইমেজ আপলোড হলে ক্লাউডিনারি ইউআরএল এখানে সেভ হবে
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
    
    // অ্যাডমিন প্যানেল থেকেও ইমেজ আপডেট করার অপশন থাকলে:
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