import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';



const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true, default: undefined },
    password: { type: String, required: true },
    customId: { type: String, unique: true }, // এটি কন্ট্রোলার থেকে আসবে
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: null },
    walletBalance: { type: Number, required: true, default: 0 },
    image: { type: String, default: '' },
    isAdmin: { type: Boolean, required: true, default: false },
    isSuperAdmin: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

// পাসওয়ার্ড ম্যাচ করার মেথড
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// পাসওয়ার্ড হ্যাশ করার প্রাক-সেভ লজিক
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;