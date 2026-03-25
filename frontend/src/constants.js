// Render ড্যাশবোর্ড থেকে তোর মেইন URL টা এখানে দিবি (শেষে যেন / না থাকে)
const RENDER_BACKEND_URL = 'https://gulfhutbd.onrender.com'; 

export const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : RENDER_BACKEND_URL; 

export const PRODUCTS_URL = '/api/products';
export const USERS_URL = '/api/users';
export const ORDERS_URL = '/api/orders';
export const PAYPAL_URL = '/api/config/paypal';
export const UPLOAD_URL = '/api/upload';