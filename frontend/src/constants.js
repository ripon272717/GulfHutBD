export const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : 'https://gulfhutbd.onrender.com'; // Render ড্যাশবোর্ড থেকে পাওয়া তোর লাইভ লিংক

export const PRODUCTS_URL = '/api/products';
export const USERS_URL = '/api/users';
export const ORDERS_URL = '/api/orders';
export const PAYPAL_URL = '/api/config/paypal';
export const UPLOAD_URL = '/api/upload';