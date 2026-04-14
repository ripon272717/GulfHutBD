import mongoose from 'mongoose';

// রিভিউ স্কিমা (তোর অরিজিনাল কোড - কোনো পরিবর্তন নেই)
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// ভ্যারিয়েন্ট স্কিমা (তোর নতুন আইডিয়া অনুযায়ী প্রতিটি ইমেজের জন্য স্বতন্ত্র তথ্য)
const variantSchema = mongoose.Schema({
  vCode: { type: String }, // তোর আইডিয়া: মেইন পিসিওড + V1, V2 (যেমন: TSH-101-V1)
  color: { type: String },
  size: { type: String },
  stock: { type: Number, default: 0 },
  image: { type: String }, // ওই ভেরিয়েন্টের নির্দিষ্ট ছবি
  additionalImages: [String], // ওই কালারের অন্যান্য ভিউ (সোয়াইপ করার জন্য)
  isHide: { type: Boolean, default: false },
  
  // ব্ল্যাঙ্ক ফর্মের জন্য স্বতন্ত্র প্রাইস (যদি মেইন প্রোডাক্ট থেকে আলাদা হয়)
  priceQR: { type: Number, default: 0 }, 
  priceBDT: { type: Number, default: 0 },
  
  // তুই যদি চাস এক কালারের আন্ডারে অনেক সাইজ হবে, তবে এই 'sizes' অ্যারেটা কাজে লাগবে
  sizes: [
    {
      size: { type: String },
      stock: { type: Number, default: 0 }
    }
  ]
});

// মেইন প্রোডাক্ট স্কিমা
const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String, // তোর রিকোয়ারমেন্ট: নাম সব ভ্যারিয়েন্টে সেম থাকবে
      required: true,
    },
    pCode: {
      type: String, // মেইন প্রোডাক্ট কোড
      required: true,
      unique: true, 
    },
    image: {
      type: String, // মেইন থাম্বনেইল ইমেজ
      required: true,
    },
    // গ্যালারির জন্য মাল্টিপল ইমেজের অ্যারে
    images: [
      {
        url: { type: String },
        pCode: { type: String }, // প্রতিটি ইমেজের সাথে তুই যে ইউনিক কোড চেয়েছিস
        isMain: { type: Boolean, default: false },
        label: { type: String, default: 'General' } 
      }
    ], 
    videoUrl: {
      type: String,
      default: '',
    },
    isVideoFloating: {
      type: Boolean,
      default: true,
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    offerCategory: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema],
    
    // ভ্যারিয়েন্ট সিস্টেম (কালার, সাইজ, এবং আলাদা কোডের জন্য)
    variants: [variantSchema], 

    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    
    // মেইন প্রাইস সেকশন (যদি ভ্যারিয়েন্ট ডিটেইলস অ্যাড না করিস তবে এটা শো করবে)
    priceLabel: {
      type: String,
      default: 'Price', 
    },
    priceQR: {
      type: Number,
      required: true,
      default: 0,
    },
    priceBDT: {
      type: Number,
      required: true,
      default: 0,
    },

    // অফার ও বাজ
    isOfferOn: {
      type: Boolean,
      default: false,
    },
    offerText: {
      type: String,
      default: '',
    },
    isBazOn: {
      type: Boolean,
      default: false,
    },
    bazText: {
      type: String,
      default: '',
    },

    shippingTime: {
      type: String,
      required: true,
      default: '7-15 Days',
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    showOnHomepage: {
      type: Boolean,
      required: true,
      default: true,
    },
    categoryOnly: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;