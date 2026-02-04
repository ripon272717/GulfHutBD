export const BASE_URL = 
  process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : ''; // প্রোডাকশনে খালি থাকবে কারণ ফ্রন্টএন্ড-ব্যাকএন্ড এখন একই ডোমেইনে (Render) থাকবে

export const PRODUCTS_URL = '/api/products';
export const USERS_URL = '/api/users';
export const ORDERS_URL = '/api/orders';
export const PAYPAL_URL = '/api/config/paypal';
export const UPLOAD_URL = '/api/upload';