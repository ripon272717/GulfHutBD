import mongoose from 'mongoose';

// রিভিউ স্কিমা (এটি প্রোডাক্ট স্কিমার জন্য সাব-ডকুমেন্ট হিসেবে কাজ করবে)
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

// মেইন প্রোডাক্ট স্কিমা
const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // কোন অ্যাডমিন প্রোডাক্টটি তৈরি করেছেন
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema], // রিভিউর অ্যারে
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
    
    // --- কারেন্সি এবং শিপিং লজিক ---
    priceQR: {
      type: Number,
      required: true,
      default: 0, // কাতারি রিয়াল (QR)
    },
    priceBDT: {
      type: Number,
      required: true,
      default: 0, // বাংলাদেশি টাকা (BDT)
    },
    shippingTime: {
      type: String,
      required: true,
      default: '7-15 Days', // কাতার থেকে পৌঁছানোর সময়
    },
    // ----------------------------

    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    
    // ড্যাশবোর্ড বা হোমে দেখানোর কন্ট্রোল
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