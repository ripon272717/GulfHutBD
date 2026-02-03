import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    // প্রোফাইল পিকচারের জন্য এই ফিল্ডটি যোগ করা হলো
    image: {
      type: String,
      default: '', 
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true, // পুরনো ইউজারদের কোড না থাকলেও যেন এরর না দেয়
    },
    referredBy: {
      type: String,
      default: null,
    },
    walletBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ইউজার পাসওয়ার্ড ম্যাচ করার ফাংশন
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// পাসওয়ার্ড হ্যাশ করার ফাংশন (সেভ করার আগে)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;