export const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : 'https://gulf-hut-bd.onrender.com'; // তোমার Render লিংকে কোনো বানান ভুল থাকলে সেটি ঠিক করে নিও

export const PRODUCTS_URL = '/api/products';
export const USERS_URL = '/api/users';
export const ORDERS_URL = '/api/orders';
export const PAYPAL_URL = '/api/config/paypal';
export const UPLOAD_URL = '/api/upload';