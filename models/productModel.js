import mongoose from 'mongoose';

// রিভিউ স্কিমা (তোর অরিজিনাল কোড)
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

// ভ্যারিয়েন্ট স্কিমা (কালার, সাইজ, স্টক এবং স্বতন্ত্র তথ্যের জন্য)
const variantSchema = mongoose.Schema({
  vCode: { type: String }, // তোর আইডিয়া অনুযায়ী: মেইন পিসিওড + a, b, c (যেমন: 123-a)
  color: { type: String },
  size: { type: String },
  stock: { type: Number, default: 0 },
  image: { type: String }, // ভেরিয়েন্টের জন্য মেইন ছবি
  additionalImages: [String], // ওই নির্দিষ্ট কালারের অন্যান্য অ্যাঙ্গেলের ছবি (swipe করার জন্য)
  isHide: { type: Boolean, default: false }, // স্টক শেষ বা প্রয়োজনে হাইড করার জন্য
  priceQR: { type: Number }, // ভেরিয়েন্টের দাম আলাদা হতে পারে তাই রাখা হলো
  priceBDT: { type: Number },
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
      type: String,
      required: true,
    },
    pCode: {
      type: String,
      required: true,
      unique: true, 
    },
    image: {
      type: String,
      required: true,
    },
    // গ্যালারির জন্য মাল্টিপল ইমেজের অ্যারে (Front, Back, Side views)
    images: [
      {
        url: { type: String },
        isMain: { type: Boolean, default: false },
        label: { type: String, default: 'General' } // Front, Back, Side ইত্যাদি চিহ্নিত করতে
      }
    ], 
    videoUrl: {
      type: String,
      default: '',
    },
    // তোর চাহিদা অনুযায়ী ফ্লোটিং ভিডিও কন্ট্রোল
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
    variants: [variantSchema], // তোর সেই কালার/সাইজ ভেরিয়েন্ট সিস্টেম

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
    
    // প্রাইস সেকশন
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