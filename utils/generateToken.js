import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  const isDev = process.env.NODE_ENV !== 'production';

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: !isDev, // প্রোডাকশনে (Render) এটা true হবে, যা বাধ্যতামূলক
    sameSite: isDev ? 'lax' : 'none', // প্রোডাকশনে 'none' না দিলে আলাদা ডোমেইনে কুকি যাবে না
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export default generateToken;