import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set JWT as an HTTP-Only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    // প্রোডাকশনে (Render/Vercel) অবশ্যই true হতে হবে
    secure: true, 
    // আলাদা ডোমেইন (Vercel থেকে Render) এ কুকি পাঠানোর জন্য 'None' প্রয়োজন
    sameSite: 'None', 
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;