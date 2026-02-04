import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // কুকি সেটিংস যা Vercel এবং Render দুই জায়গাতেই কাজ করবে
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true, // ক্রস-সাইট কুকির জন্য এটি অবশ্যই true হতে হবে
    sameSite: 'none', // এটি 'none' না দিলে Vercel-এ লগইন থাকবে না
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export default generateToken;