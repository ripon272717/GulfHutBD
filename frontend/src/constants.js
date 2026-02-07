// constants.js

// যদি তুমি লোকালহোস্টে থাকো তবে এটি হবে true
const isDevelopment = process.env.NODE_ENV === 'development';

// লোকালহোস্টে থাকলে প্রক্সি কাজ করবে তাই খালি থাকবে, লাইভে থাকলে রেন্ডারের লিঙ্ক বসবে
export const BASE_URL = isDevelopment 
  ? '' 
  : 'https://gulfhutbd6.onrender.com'; 

export const PRODUCTS_URL = `${BASE_URL}/api/products`;
export const USERS_URL = `${BASE_URL}/api/users`;
export const ORDERS_URL = `${BASE_URL}/api/orders`;
export const PAYPAL_URL = `${BASE_URL}/api/config/paypal`;
export const UPLOAD_URL = `${BASE_URL}/api/upload`;