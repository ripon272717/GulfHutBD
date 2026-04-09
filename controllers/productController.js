import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';

// @desc    সব প্রোডাক্ট ফেচ করা (সার্চ ও পেজিনেশন সহ)
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(process.env.PAGINATION_LIMIT) || 8;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    সিঙ্গেল প্রোডাক্ট ফেচ করা আইডি দিয়ে
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    return res.json(product);
  } else {
    res.status(404);
    throw new Error('প্রোডাক্টটি খুঁজে পাওয়া যায়নি');
  }
});

// @desc    নতুন প্রোডাক্ট ক্রিয়েট করা (স্যাম্পল ডাটা দিয়ে)
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample name',
    pCode: 'TEMP-' + Math.floor(Math.random() * 1000), // অটো কোড জেনারেট
    priceQR: 0,
    priceBDT: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    images: [],
    videoUrl: '',
    brand: 'Sample brand',
    category: 'Sample category',
    countInStock: 0,
    numReviews: 0,
    description: 'Sample description',
    shippingTime: '7-15 Days',
    priceLabel: 'Price',
    isOfferOn: false,
    isBazOn: false,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    প্রোডাক্ট আপডেট করা (সব নতুন ফিল্ড সহ)
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    pCode,
    category,
    offerCategory,
    description,
    videoUrl,
    priceLabel,
    priceQR,
    priceBDT,
    offerText,
    isOfferOn,
    bazText,
    isBazOn,
    images,
    image,
    brand,
    countInStock,
    shippingTime
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // ডাটা অ্যাসাইন করা হচ্ছে
    product.name = name;
    product.pCode = pCode || product.pCode;
    product.category = category;
    product.offerCategory = offerCategory;
    product.description = description;
    product.videoUrl = videoUrl;
    product.priceLabel = priceLabel;
    product.priceQR = priceQR;
    product.priceBDT = priceBDT;
    product.offerText = offerText;
    product.isOfferOn = isOfferOn;
    product.bazText = bazText;
    product.isBazOn = isBazOn;
    product.images = images; 
    product.image = image;
    product.brand = brand;
    product.countInStock = countInStock; 
    product.shippingTime = shippingTime;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('প্রোডাক্ট পাওয়া যায়নি');
  }
});

// @desc    প্রোডাক্ট ডিলিট করা
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'প্রোডাক্ট মুছে ফেলা হয়েছে' });
  } else {
    res.status(404);
    throw new Error('প্রোডাক্ট পাওয়া যায়নি');
  }
});

// @desc    রিভিউ যোগ করা
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('আপনি অলরেডি রিভিউ দিয়েছেন');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'রিভিউ যোগ করা হয়েছে' });
  } else {
    res.status(404);
    throw new Error('প্রোডাক্ট পাওয়া যায়নি');
  }
});

// @desc    টপ রেটেড প্রোডাক্ট পাওয়া
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  res.json(products);
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
};