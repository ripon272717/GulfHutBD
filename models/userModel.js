import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    // মোবাইল নম্বর প্রধান আইডি
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    // ইমেইল ঐচ্ছিক (sparse: true ইমেইল না দিলেও ইউনিক এরর দিবে না)
    email: {
      type: String,
      unique: true,
      sparse: true, 
      default: undefined, // ইমেইল না দিলে ডাটাবেজে ওটা undefined থাকবে যেন ডুপ্লিকেট না ধরে
    },
    password: {
      type: String,
      required: true,
    },
    // কাস্টম আইডি (উদা: QHBD1001)
    customId: {
      type: String,
      unique: true,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
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
    isSuperAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// পাসওয়ার্ড ম্যাচ করার মেথড
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ডাটা সেভ করার আগে আইডি জেনারেট এবং পাসওয়ার্ড হ্যাশ করার লজিক
userSchema.pre('save', async function (next) {
  // ১. পাসওয়ার্ড হ্যাশ করা (যদি পাসওয়ার্ড পরিবর্তন হয়)
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // ২. শুধুমাত্র নতুন ইউজারের জন্য আইডি ও রেফারেল জেনারেট করা
  if (this.isNew) {
    try {
      // সর্বশেষ ইউজারকে খুঁজে বের করা
      const lastUser = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
      let newIdNumber = 1001;
      
      if (lastUser && lastUser.customId) {
        const lastIdMatch = lastUser.customId.match(/\d+/);
        if (lastIdMatch) {
          newIdNumber = parseInt(lastIdMatch[0]) + 1;
        }
      }
      
      // কাস্টম আইডি সেট করা
      this.customId = `QHBD${newIdNumber}`;

      // রেফারেল কোড জেনারেট করা (নামের প্রথম ৩ অক্ষর + মোবাইলের শেষ ৪ ডিজিট)
      if (!this.referralCode) {
        const cleanName = this.name.replace(/\s/g, '').toUpperCase();
        this.referralCode = `${cleanName.substring(0, 3)}${this.mobile.slice(-4)}`;
      }
    } catch (error) {
      return next(error);
    }
  }

  next();
});

const User = mongoose.model('User', userSchema);

export default User;