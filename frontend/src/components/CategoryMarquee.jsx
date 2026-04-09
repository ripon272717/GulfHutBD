import React from 'react';
import { Badge } from 'react-bootstrap';
import { FaShippingFast, FaPercentage, FaBoxOpen, FaCoins, FaBolt, FaList } from 'react-icons/fa';
import './CategoryMarquee.css'; // স্টাইল ফাইলে অ্যানিমেশন থাকবে

const CategoryMarquee = ({ setSelectedCategory }) => {
  const categories = [
    { name: 'All', icon: <FaList className="me-1" />, value: 'all' },
    { name: 'Shipping Free', icon: <FaShippingFast className="me-1" />, value: 'shipping free' },
    { name: 'Maximum Offer', icon: <FaPercentage className="me-1" />, value: 'offer product' },
    { name: 'Courier Free', icon: <FaBoxOpen className="me-1" />, value: 'courier free' },
    { name: 'Cashback 10%', icon: <FaCoins className="me-1" />, value: 'cashback free' },
    { name: 'Flash Sale', icon: <FaBolt className="me-1" />, value: 'flash sale' },
  ];

  return (
    <div className="category-marquee-container my-3 shadow-sm border-top border-bottom bg-white py-2">
      <div className="marquee-content">
        {categories.map((cat, index) => (
          <Badge
            key={index}
            bg="light"
            text="dark"
            className="mx-3 py-2 px-3 rounded-pill border category-item shadow-sm"
            style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.icon} {cat.name}
          </Badge>
        ))}
        {/* ডাবল করা হয়েছে যেন লুপটা স্মুথ হয় */}
        {categories.map((cat, index) => (
          <Badge
            key={`dup-${index}`}
            bg="light"
            text="dark"
            className="mx-3 py-2 px-3 rounded-pill border category-item shadow-sm"
            style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.icon} {cat.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default CategoryMarquee;