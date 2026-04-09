import mongoose from 'mongoose';

// রিভিউ স্কিমা
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

// ভ্যারিয়েন্ট স্কিমা (কালার, সাইজ, স্টক এবং ছবির জন্য)
const variantSchema = mongoose.Schema({
  color: { type: String },
  size: { type: String },
  stock: { type: Number, default: 0 },
  image: { type: String }, // এই কালারের নির্দিষ্ট ছবি
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
      unique: true, // প্রতিটি প্রোডাক্টের আলাদা কোড থাকবে
    },
    image: {
      type: String,
      required: true,
    },
    images: [
      {
        url: { type: String },
        isMain: { type: Boolean, default: false }
      }
    ], // গ্যালারির জন্য মাল্টিপল ইমেজের অ্যারে
    videoUrl: {
      type: String,
      default: '',
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
    
    // প্রাইস সেকশন
    priceLabel: {
      type: String,
      default: 'Price', // যেমন: 3pcs / 2pcs
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

    // অফার ও বাজ (নতুন যোগ করা হয়েছে)
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