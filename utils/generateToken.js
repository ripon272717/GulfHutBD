import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  const isDev = process.env.NODE_ENV !== 'production';

  res.cookie('jwt', token, {
  httpOnly: true,
  secure: !isDev, 
  sameSite: 'lax', // 'strict' এর বদলে 'lax' দিলে সব ব্রাউজারে ভালো কাজ করবে
  maxAge: 30 * 24 * 60 * 60 * 1000,
});
};

export default generateToken;