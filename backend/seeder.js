import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import users from './data/users.js';
import products from './data/products.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Order from './models/orderModel.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // আগের সব ডাটা ক্লিয়ার করা
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // ইউজারদের ইমপোর্ট করা
    const createdUsers = await User.insertMany(users);

    // প্রথম ইউজারকে (Owner/Super Admin) অ্যাডমিন হিসেবে ধরা হচ্ছে প্রোডাক্টগুলোর জন্য
    const adminUser = createdUsers[0]._id;

    // প্রোডাক্টগুলোর সাথে অ্যাডমিন আইডি যোগ করা
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser };
    });

    await Product.insertMany(sampleProducts);

    console.log('Data Imported Successfully!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed Successfully!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}