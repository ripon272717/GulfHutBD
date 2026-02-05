import bcrypt from 'bcryptjs';

const users = [
  {
    name: 'Owner User',
    mobile: '01700000001',
    email: 'owner@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
    isSuperAdmin: true, // ব্যালেন্স কন্ট্রোল করার ক্ষমতা থাকবে
    walletBalance: 5000,
  },
  {
    name: 'Admin User',
    mobile: '01700000002',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
    isSuperAdmin: false, // শুধু অর্ডার ও প্রোডাক্ট ম্যানেজ করবে
    walletBalance: 0,
  },
  {
    name: 'Regular User',
    mobile: '01700000003',
    email: 'user@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: false,
    isSuperAdmin: false,
    walletBalance: 100,
  },
  {
  name: 'Mohshin',
  mobile: '01900000011',
  email: 'myadmin2@example.com',
  password: bcrypt.hashSync('123456', 10),
  isAdmin: true, // এটি তাকে অ্যাডমিন বানাবে
  isSuperAdmin: false,
  walletBalance: 0,
}
];

export default users;