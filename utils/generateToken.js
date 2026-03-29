// backend/utils/generateToken.js
import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  const isDev = process.env.NODE_ENV !== 'production';

  res.cookie('jwt', token, {
  httpOnly: true,
  secure: true, // প্রোডাকশনে এটি true হতে হবে
  sameSite: 'None', // ক্রস-সাইট কুকি শেয়ার করার জন্য এটি মাস্ট
  maxAge: 30 * 24 * 60 * 60 * 1000,
});
};

export default generateToken;