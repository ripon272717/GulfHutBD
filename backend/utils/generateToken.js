import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  const isDev = process.env.NODE_ENV !== 'production';

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: !isDev, // প্রোডাকশনে true, লোকালহোস্টে false
    sameSite: isDev ? 'lax' : 'none', // লোকালহোস্টে lax, প্রোডাকশনে none
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export default generateToken;