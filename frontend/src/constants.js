// এই URL টি একদম তোর Render ড্যাশবোর্ড থেকে নেওয়া
const RENDER_BACKEND_URL = 'https://gulfhutbd.onrender.com';

export const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : RENDER_BACKEND_URL; 

export const PRODUCTS_URL = '/api/products';
export const USERS_URL = '/api/users';
export const ORDERS_URL = '/api/orders';
export const PAYPAL_URL = '/api/config/paypal';
export const UPLOAD_URL = '/api/upload';

// --- গ্লোবাল ক্যাটাগরি লিস্ট (এক জায়গায় পরিবর্তন করলে সব জায়গায় হবে) ---
// --- গ্লোবাল ক্যাটাগরি লিস্ট ---
export const CATEGORIES = [
  {
    name: 'Ladies Items',
    sub: ['Bra', 'Panty', 'Lotion', 'Cream', 'Soap', 'Shampoo']
  },
  { name: 'Gents Items', sub: [] },
  { name: 'Kids Items', sub: [] },
  { name: 'Nuts Items', sub: [] },
  { name: 'Electronics', sub: [] },
  { name: 'Grocery', sub: [] },
  { name: 'Mobile', sub: [] },
  { name: 'Fashion', sub: [] },
  { name: 'Health', sub: [] }
];