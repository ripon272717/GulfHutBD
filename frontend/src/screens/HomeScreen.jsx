import React, { useState, useEffect } from 'react'; 
import { Row, Col, Container, Badge } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import { FaShippingFast, FaPercentage, FaBoxOpen, FaCoins, FaFire, FaList, FaStar } from 'react-icons/fa';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ProductCarousel from '../components/ProductCarousel';
import Meta from '../components/Meta';

const HomeScreen = () => {
  const { keyword } = useParams();
  const [selectedOfferCategory, setSelectedOfferCategory] = useState('all');
  const [selectedMainCategory, setSelectedMainCategory] = useState('all');

  // ১. ইউজার ইন্টারেস্ট ট্র্যাকিং (অটোমেশনের জন্য)
  const [userInterests, setUserInterests] = useState(
    JSON.parse(localStorage.getItem('userInterests')) || []
  );

  useEffect(() => {
    // হোমপেজে আসলে বা কিউয়ার্ড চেঞ্জ হলে ফিল্টার রিসেট এবং স্ক্রল আপ
    setSelectedOfferCategory('all');
    setSelectedMainCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [keyword]); 

  // ২. ডাটা ফেচিং (প্যাগিনেশন নম্বর পাঠানো বন্ধ করা হয়েছে)
  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    pageNumber: '', 
  });

  const offerCategories = [
    { name: 'Shipping Free', icon: <FaShippingFast className="me-1" />, value: 'shipping free' },
    { name: 'Maximum Offer', icon: <FaPercentage className="me-1" />, value: 'offer product' },
    { name: 'Courier Free', icon: <FaBoxOpen className="me-1" />, value: 'courier free' },
    { name: 'Cashback 10%', icon: <FaCoins className="me-1" />, value: 'cashback free' },
    { name: 'Hot Deals', icon: <FaFire className="me-1" />, value: 'hot deals' },
  ];

  const uniqueCategories = data ? [...new Set(data.products.map(p => p.category))] : [];

  // ৩. সর্টিং অটোমেশন ফাংশন
  const handleCategoryClick = (cat) => {
    setSelectedMainCategory(cat);
    if (cat !== 'all') {
      const updatedInterests = [cat, ...userInterests.filter(i => i !== cat)].slice(0, 5);
      setUserInterests(updatedInterests);
      localStorage.setItem('userInterests', JSON.stringify(updatedInterests));
    }
  };

  // ৪. প্রোডাক্ট প্রসেসিং (ফিল্টার + অটোমেটিক সর্ট)
  const getProcessedProducts = () => {
    if (!data?.products) return [];

    let filtered = data.products.filter((product) => {
      const matchesOffer = selectedOfferCategory === 'all' || product.offerCategory === selectedOfferCategory;
      const matchesMain = selectedMainCategory === 'all' || product.category === selectedMainCategory;
      return matchesOffer && matchesMain;
    });

    // সর্টিং: পছন্দের ক্যাটাগরি সবার উপরে থাকবে
    return [...filtered].sort((a, b) => {
      const aIndex = userInterests.indexOf(a.category);
      const bIndex = userInterests.indexOf(b.category);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    });
  };

  const finalProducts = getProcessedProducts();

  return (
    <>
      {!keyword ? (
        <>
          <ProductCarousel />
          <style>
            {`
              @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
              .category-row { display: flex; align-items: center; overflow: hidden; background: #111; border-bottom: 1px solid #333; }
              .fixed-label { position: relative; z-index: 10; background: #ffc107; color: #000; font-weight: bold; padding: 12px 20px; display: flex; align-items: center; white-space: nowrap; cursor: pointer; box-shadow: 10px 0 15px rgba(0,0,0,0.5); transition: 0.3s; }
              .marquee-container { display: flex; overflow-x: auto; width: 100%; scrollbar-width: none; -ms-overflow-style: none; }
              .marquee-container::-webkit-scrollbar { display: none; }
              .marquee-inner { display: flex; width: max-content; animation: marquee 35s linear infinite; padding: 10px 0; }
              .marquee-container:hover .marquee-inner { animation-play-state: paused; }
              .cat-item { cursor: pointer; margin: 0 10px; padding: 6px 18px; border-radius: 50px; border: 1px solid rgba(255,255,255,0.2) !important; color: #fff; white-space: nowrap; transition: 0.3s; }
              .cat-item:hover, .cat-item.active { background: #ffc107 !important; color: #000 !important; border-color: #ffc107 !important; }
            `}
          </style>

          <div id="main-category-section">
            {/* লাইন ১: অফার ক্যাটাগরি */}
            <div className="category-row">
              <div 
                className="fixed-label" 
                onClick={() => { 
                  setSelectedOfferCategory('all'); 
                  setSelectedMainCategory('all');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{ background: selectedOfferCategory === 'all' && selectedMainCategory === 'all' ? '#ffc107' : '#333', color: selectedOfferCategory === 'all' && selectedMainCategory === 'all' ? '#000' : '#fff' }}
              >
                <FaList className="me-2"/> সব পণ্য
              </div>
              <div className="marquee-container">
                <div className="marquee-inner">
                  {offerCategories.map((cat, i) => (
                    <div key={i} className={`cat-item ${selectedOfferCategory === cat.value ? 'active' : ''}`} onClick={() => setSelectedOfferCategory(cat.value)}>
                      {cat.icon} {cat.name}
                    </div>
                  ))}
                  {/* ডুপ্লিকেট লুপ (স্মুথ মারকিউ এর জন্য) */}
                  {offerCategories.map((cat, i) => (
                    <div key={`d1-${i}`} className={`cat-item ${selectedOfferCategory === cat.value ? 'active' : ''}`} onClick={() => setSelectedOfferCategory(cat.value)}>
                      {cat.icon} {cat.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* লাইন ২: মেইন ক্যাটাগরি */}
            <div className="category-row" style={{ background: '#000' }}>
              <div 
                className="fixed-label" 
                onClick={() => handleCategoryClick('all')}
                style={{ background: selectedMainCategory === 'all' ? '#ffc107' : '#222', color: selectedMainCategory === 'all' ? '#000' : '#fff' }}
              >
                <FaStar className="me-2"/> All
              </div>
              <div className="marquee-container">
                <div className="marquee-inner" style={{ animationDuration: '45s' }}>
                  {uniqueCategories.map((cat, i) => (
                    <div key={i} className={`cat-item ${selectedMainCategory === cat ? 'active' : ''}`} onClick={() => handleCategoryClick(cat)}>
                      {cat}
                    </div>
                  ))}
                  {uniqueCategories.map((cat, i) => (
                    <div key={`d2-${i}`} className={`cat-item ${selectedMainCategory === cat ? 'active' : ''}`} onClick={() => handleCategoryClick(cat)}>
                      {cat}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <Link to='/' className='btn btn-light mb-4 mt-2 ms-2'>ফিরে যান</Link>
      )}
      
      {isLoading ? <Loader /> : error ? <Message variant='danger'>{error?.data?.message || error.error}</Message> : (
        <Container fluid className='px-1 px-md-4 mt-3'> 
          <Meta title='GulfHut | সেরা পণ্য সেরা দামে' />
          
          <div className="d-flex align-items-center mb-4">
             <div style={{ width: '5px', height: '25px', background: '#ffc107', marginRight: '12px', borderRadius: '10px' }}></div>
             <h4 className='text-white mb-0' style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
               {selectedMainCategory === 'all' ? 'Featured Products' : selectedMainCategory}
               {selectedOfferCategory !== 'all' && <Badge bg="warning" text="dark" className="ms-2 small">{selectedOfferCategory}</Badge>}
             </h4>
          </div>
          
          <Row className='g-2 g-md-4'> 
            {finalProducts.length > 0 ? (
              finalProducts.map((product) => (
                <Col key={product._id} xs={6} md={4} lg={3} className='d-flex align-items-stretch'>
                  <Product product={product} />
                </Col>
              ))
            ) : (
              <Col xs={12}>
                <Message variant='info'>দুঃখিত! এই ক্যাটাগরিতে কোনো পণ্য নেই।</Message>
              </Col>
            )}
          </Row>
        </Container>
      )}
    </>
  );
};

export default HomeScreen;