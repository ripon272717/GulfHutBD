import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    // মোবাইল নম্বর এখন প্রধান আইডি হিসেবে কাজ করবে
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    // ইমেইল ঐচ্ছিক করা হয়েছে
    email: {
      type: String,
      unique: true,
      sparse: true, // এটি খালি ইমেইল থাকলেও ডুপ্লিকেট এরর দেবে না
    },
    password: {
      type: String,
      required: true,
    },
    referralCode: {
      type: String,
      unique: true,
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
    image: {
      type: String,
      default: '',
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

// পাসওয়ার্ড ম্যাচ করার মেথড
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ডাটা সেভ করার আগে পাসওয়ার্ড হ্যাশ করার মিডলওয়্যার
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;