// export const BASE_URL =
//   process.env.NODE_ENV === 'develeopment' ? 'http://localhost:5000' : '';
// এটি অটোমেটিক বুঝে নেবে তুমি কি লোকালহোস্টে আছ নাকি লাইভ সার্ভারে
export const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : ''; // প্রোডাকশনে খালি থাকবে কারণ তখন প্রক্সি বা রিলেটিভ পাথ কাজ করে

export const PRODUCTS_URL = '/api/products';
export const USERS_URL = '/api/users';
export const ORDERS_URL = '/api/orders';
export const PAYPAL_URL = '/api/config/paypal';
export const UPLOAD_URL = '/api/upload';