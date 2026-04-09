import React, { useState, useEffect } from 'react'; // অবশ্যই useEffect লেখাটি যোগ করবি 
import { Row, Col, Container, Badge } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import { FaShippingFast, FaPercentage, FaBoxOpen, FaCoins, FaFire, FaList, FaStar } from 'react-icons/fa';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import Meta from '../components/Meta';

const HomeScreen = () => {
  const { pageNumber, keyword } = useParams();
  const [selectedOfferCategory, setSelectedOfferCategory] = useState('all');
  const [selectedMainCategory, setSelectedMainCategory] = useState('all');

  useEffect(() => {
    // যখনই ইউজার হোমপেজে আসবে বা রিফ্রেশ হবে বা কিউয়ার্ড চেঞ্জ হবে, ফিল্টার রিসেট হবে
    setSelectedOfferCategory('all');
    setSelectedMainCategory('all');
  }, [keyword]); 


  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    pageNumber,
  });

  // ১. অফার ক্যাটাগরি (প্রথম লাইনের স্ক্রলিং পার্ট)
  const offerCategories = [
    { name: 'Shipping Free', icon: <FaShippingFast className="me-1" />, value: 'shipping free' },
    { name: 'Maximum Offer', icon: <FaPercentage className="me-1" />, value: 'offer product' },
    { name: 'Courier Free', icon: <FaBoxOpen className="me-1" />, value: 'courier free' },
    { name: 'Cashback 10%', icon: <FaCoins className="me-1" />, value: 'cashback free' },
    { name: 'Hot Deals', icon: <FaFire className="me-1" />, value: 'hot deals' },
  ];

  // ২. মেইন ক্যাটাগরি (দ্বিতীয় লাইনের স্ক্রলিং পার্ট)
  const uniqueCategories = data ? [...new Set(data.products.map(p => p.category))] : [];

  const filteredProducts = data?.products?.filter((product) => {
    const matchesOffer = selectedOfferCategory === 'all' || product.offerCategory === selectedOfferCategory;
    const matchesMain = selectedMainCategory === 'all' || product.category === selectedMainCategory;
    return matchesOffer && matchesMain;
  });

  return (
    <>
      {!keyword ? (
        <>
          <ProductCarousel />
          
          <style>
            {`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .category-row {
                display: flex;
                align-items: center;
                overflow: hidden;
                background: #111;
                border-bottom: 1px solid #333;
              }
              .fixed-label {
                position: relative;
                z-index: 10;
                background: #ffc107;
                color: #000;
                font-weight: bold;
                padding: 12px 20px;
                display: flex;
                align-items: center;
                white-space: nowrap;
                cursor: pointer;
                box-shadow: 10px 0 15px rgba(0,0,0,0.5);
              }
              .marquee-container {
                display: flex;
                overflow-x: auto; /* টাচ করে ম্যানুয়ালি সরানোর জন্য */
                width: 100%;
                scrollbar-width: none; /* স্ক্রলবার হাইড করার জন্য */
                -ms-overflow-style: none;
                cursor: grab;
              }
              .marquee-container::-webkit-scrollbar {
                display: none; /* ক্রোম/সাফারির স্ক্রলবার হাইড */
              }
              .marquee-inner {
                display: flex;
                width: max-content;
                animation: marquee 30s linear infinite;
                padding: 10px 0;
              }
              /* টাচ করলে বা মাউস ধরলে অটো-অ্যানিমেশন থেমে যাবে */
              .marquee-container:active .marquee-inner,
              .marquee-container:hover .marquee-inner {
                animation-play-state: paused;
              }
              .cat-item {
                cursor: pointer;
                margin: 0 10px;
                padding: 6px 15px;
                border-radius: 50px;
                border: 1px solid rgba(255,255,255,0.2) !important;
                color: #fff;
                white-space: nowrap;
                transition: 0.3s;
              }
              .cat-item:hover, .cat-item.active {
                background: #ffc107 !important;
                color: #000 !important;
                border-color: #ffc107 !important;
              }
            `}
          </style>

          {/* এই আইডি-টি বটম মেনু থেকে স্ক্রল করার জন্য যোগ করা হয়েছে */}
          <div id="main-category-section">
            {/* লাইন ১: অফার ক্যাটাগরি */}
            <div className="category-row">
              <div 
                className="fixed-label" 
                onClick={() => {setSelectedOfferCategory('all'); setSelectedMainCategory('all');}}
                style={{ background: selectedOfferCategory === 'all' ? '#ffc107' : '#333', color: selectedOfferCategory === 'all' ? '#000' : '#fff' }}
              >
                <FaList className="me-2"/> সব পণ্য
              </div>
              <div className="marquee-container">
                <div className="marquee-inner">
                  {offerCategories.map((cat, i) => (
                    <div 
                      key={i} 
                      className={`cat-item ${selectedOfferCategory === cat.value ? 'active' : ''}`}
                      onClick={() => setSelectedOfferCategory(cat.value)}
                    >
                      {cat.icon} {cat.name}
                    </div>
                  ))}
                  {/* ডুপ্লিকেট লুপ লিনিয়ার অ্যানিমেশনের জন্য */}
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
                onClick={() => setSelectedMainCategory('all')}
                style={{ background: selectedMainCategory === 'all' ? '#ffc107' : '#222', color: selectedMainCategory === 'all' ? '#000' : '#fff' }}
              >
                <FaStar className="me-2"/> All
              </div>
              <div className="marquee-container">
                <div className="marquee-inner" style={{ animationDuration: '40s' }}>
                  {uniqueCategories.map((cat, i) => (
                    <div 
                      key={i} 
                      className={`cat-item ${selectedMainCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedMainCategory(cat)}
                    >
                      {cat}
                    </div>
                  ))}
                  {uniqueCategories.map((cat, i) => (
                    <div key={`d2-${i}`} className={`cat-item ${selectedMainCategory === cat ? 'active' : ''}`} onClick={() => setSelectedMainCategory(cat)}>
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
      
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <Container fluid className='px-1 px-md-4'> 
          <Meta title='GulfHut | সেরা পণ্য সেরা দামে' />
          
          <div className="d-flex align-items-center my-3">
             <div style={{ width: '4px', height: '24px', background: '#ffc107', marginRight: '10px' }}></div>
             <h4 className='text-white mb-0' style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
               {selectedMainCategory === 'all' ? 'Latest Products' : selectedMainCategory}
               {selectedOfferCategory !== 'all' && <small className="ms-2 text-warning">({selectedOfferCategory})</small>}
             </h4>
          </div>
          
          <Row className='g-2 g-md-4'> 
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Col key={product._id} xs={6} md={4} lg={3} className='d-flex align-items-stretch'>
                  <Product product={product} />
                </Col>
              ))
            ) : (
              <Col xs={12}>
                <Message variant='info'>এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।</Message>
              </Col>
            )}
          </Row>
          
          <div className='d-flex justify-content-center mt-4'>
            {data && <Paginate pages={data.pages} page={data.page} keyword={keyword ? keyword : ''} />}
          </div>
        </Container>
      )}
    </>
  );
};

export default HomeScreen;