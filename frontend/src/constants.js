// এই কোডটি লোকালহোস্ট এবং লাইভ সার্ভার দুইটাই অটোমেটিক হ্যান্ডেল করবে
export const BASE_URL = 
  process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : ''; // লাইভ সার্ভারে এটা খালি থাকবে কারণ ফ্রন্টএন্ড-ব্যাকএন্ড একই ডোমেইনে থাকে

export const PRODUCTS_URL = '/api/products';
export const USERS_URL = '/api/users';
export const ORDERS_URL = '/api/orders';
export const PAYPAL_URL = '/api/config/paypal';
export const UPLOAD_URL = '/api/upload';