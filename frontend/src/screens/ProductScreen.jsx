import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; 
import { Row, Col, Card, Button, Form, Badge, ListGroup, Container, Modal } from 'react-bootstrap';
import { 
  FaShoppingCart, FaTruck, FaChevronLeft, 
  FaEdit, FaPlayCircle, FaInfoCircle, FaChevronRight, FaRulerHorizontal, FaBolt 
} from 'react-icons/fa';

import { useGetProductDetailsQuery } from '../slices/productsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';

const ProductScreen = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // --- States ---
  const [activeImageIdx, setActiveImageIdx] = useState(0); 
  const [selectedColor, setSelectedColor] = useState(''); 
  const [selectedSizeObj, setSelectedSizeObj] = useState(null); 
  const [qty, setQty] = useState(1);
  const [showFloatingVideo, setShowFloatingVideo] = useState(true);
  const [showSizeGuide, setShowSizeGuide] = useState(false); 

  const { userInfo } = useSelector((state) => state.auth);
  const { data: product, isLoading, error } = useGetProductDetailsQuery(productId);

// --- 💸 তোর স্ক্রিনশট এবং রুলস অনুযায়ী অফার ও প্রাইস ক্যালকুলেশন ফিক্স ---
const basePriceBDT = Number(product?.priceBDT || 0);
const basePriceQR = Number(product?.priceQR || 0); 

// 🎯 আসল ফিক্স: যেহেতু ডাটাবেস থেকে 'offerStatus' এর ভেতর পার্সেন্টেজ আসছে, তাই এটাকে রিড করা হলো
const rawOffer = product?.offerStatus ?? product?.offerPercentage ?? product?.offer ?? 0;
const discountPercent = typeof rawOffer === 'string' 
  ? parseInt(rawOffer.replace('%', ''), 10) || 0 
  : Number(rawOffer);

const hasDiscount = discountPercent > 0;

// ব্যাকএন্ড থেকে আসা offerStatus/Percentage মেইন প্রাইস থেকে মাইনাস করে নিউ প্রাইস বের করা
const finalPriceBDT = hasDiscount 
  ? Math.round(basePriceBDT - (basePriceBDT * discountPercent / 100))
  : basePriceBDT;

// কাতারি রিয়ালের নতুন অফার প্রাইস ক্যালকুলেশন 
const finalPriceQR = hasDiscount 
  ? Math.round(basePriceQR - (basePriceQR * discountPercent / 100))
  : basePriceQR;

// কনসোল লগ চেক করার জন্য
console.log("চেক করো এবার অফার আসছে কি না:", discountPercent);
  // ইনিশিয়াল ডাটা লোড লজিক
  useEffect(() => {
    if (product?.variants?.length > 0) {
      setSelectedColor(product.variants[0].color);
      if (product.variants[0].sizes?.length > 0) {
        const firstSize = product.variants[0].sizes.find(s => s.stock > 0);
        if (firstSize) setSelectedSizeObj(firstSize);
      }
    }
  }, [product]);

  // ভিডিও অটো-প্লে হ্যান্ডলার
  useEffect(() => {
    if (videoRef.current && showFloatingVideo) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(err => console.log("Video autoplay wait:", err));
    }
  }, [product?.videoUrl, showFloatingVideo]);

  // থাম্বনেইল গ্যালারি এবং ভ্যারিয়েন্ট ইমেজ ট্র্যাকিং
  const handleImageChange = (idx) => {
    setActiveImageIdx(idx);
    const clickedImgUrl = product?.images?.[idx]?.url;
    
    if (clickedImgUrl && product?.variants) {
      const matchingVariant = product.variants.find(v => v.image === clickedImgUrl);
      if (matchingVariant) {
        setSelectedColor(matchingVariant.color);
        if (matchingVariant.sizes?.length > 0) {
          const availableSize = matchingVariant.sizes.find(s => s.stock > 0);
          setSelectedSizeObj(availableSize || null);
        } else {
          setSelectedSizeObj(null);
        }
      }
    }
  };

  const nextImage = () => {
    if (product?.images?.length > 0) {
      const nextIdx = (activeImageIdx + 1) % product.images.length;
      handleImageChange(nextIdx);
    }
  };

  const prevImage = () => {
    if (product?.images?.length > 0) {
      const prevIdx = (activeImageIdx - 1 + product.images.length) % product.images.length;
      handleImageChange(prevIdx);
    }
  };

  const addToCartHandler = () => {
    if (!selectedColor || !selectedSizeObj) {
      toast.error('দয়া করে কালার এবং সাইজ সিলেক্ট করুন');
      return;
    }
    toast.success(`${selectedColor} কালারের ${selectedSizeObj.size} সাইজ কার্টে যোগ করা হয়েছে!`);
  };

  const orderNowHandler = () => {
    if (!selectedColor || !selectedSizeObj) {
      toast.error('দয়া করে কালার এবং সাইজ সিলেক্ট করুন');
      return;
    }
    // মাইনাস হওয়া ডিসকাউন্টেড ফাইনাল প্রাইস অর্ডার স্ক্রিনে পাঠানো হচ্ছে
    navigate(`/shipping?id=${productId}&qty=${qty}&vCode=${selectedSizeObj.vCode || product.pCode}&price=${finalPriceBDT}`);
  };

  // ফ্লোটিং ভিডিও প্লেয়ার
  const VideoPlayerComponent = useMemo(() => {
    if (!product?.videoUrl || !showFloatingVideo) return null;
    const isMobile = window.innerWidth < 768;
    const videoSize = isMobile ? '90px' : '150px';

    return (
      <div 
        className="position-absolute shadow-lg rounded-3 overflow-hidden bg-black border border-white" 
        style={{ width: videoSize, height: videoSize, bottom: '10px', right: '10px', zIndex: 20 }}
      >
        <div 
          className="position-absolute top-0 end-0 bg-dark text-white px-1 py-0" 
          style={{ cursor: 'pointer', fontSize: '10px', zIndex: 25, borderRadius: '0 0 0 5px', opacity: 0.8 }}
          onClick={(e) => { e.stopPropagation(); setShowFloatingVideo(false); }}
        >✕</div>
        <video ref={videoRef} src={product.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop playsInline preload="auto" />
      </div>
    );
  }, [product?.videoUrl, showFloatingVideo]);

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error.data?.message || error.error}</Message>;

  const currentImage = product.images?.[activeImageIdx]?.url || product.image;

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* হেডার */}
      <div className="p-3 d-flex align-items-center justify-content-between bg-white shadow-sm sticky-top mb-3" style={{ zIndex: 1000 }}>
        <div className="d-flex align-items-center">
          <FaChevronLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} className="me-3 text-dark" />
          <h6 className="mb-0 fw-bold text-truncate" style={{maxWidth: '180px'}}>{product.name}</h6>
        </div>
        {userInfo?.isAdmin && (
          <Button variant="warning" size="sm" className="rounded-pill px-3 fw-bold shadow-sm" onClick={() => navigate(`/admin/product/${product._id}/edit`)}>
            <FaEdit className="me-1"/> Edit
          </Button>
        )}
      </div>

      <Container>
        <Row className="g-4">
          {/* ইমেজ গ্যালারি সেকশন */}
          <Col md={6}>
            <div className="position-relative">
              <Card className="border-0 shadow-sm rounded-4 bg-white p-2 overflow-hidden">
                <div className="position-relative rounded-3 mb-3 overflow-hidden bg-white d-flex align-items-center justify-content-center" style={{ width: '100%', height: window.innerWidth < 768 ? '280px' : '450px' }}>
                    <img src={currentImage} className="w-100 h-100 object-fit-contain" alt="Product" />
                    {product.images?.length > 1 && (
                      <>
                        <button onClick={prevImage} className="position-absolute top-50 start-0 translate-middle-y btn btn-light rounded-circle shadow-sm ms-2 d-flex align-items-center justify-content-center" style={{ zIndex: 5, width: '35px', height: '35px' }}><FaChevronLeft size={14} /></button>
                        <button onClick={nextImage} className="position-absolute top-50 end-0 translate-middle-y btn btn-light rounded-circle shadow-sm me-2 d-flex align-items-center justify-content-center" style={{ zIndex: 5, width: '35px', height: '35px' }}><FaChevronRight size={14} /></button>
                      </>
                    )}
                    {VideoPlayerComponent}
                </div>

                {/* গ্যালারি থাম্বনেইল স্ট্রিপ */}
                <div className="d-flex gap-2 overflow-auto pb-2 px-1">
                  {product.images?.map((img, i) => (
                    <div key={i} onClick={() => handleImageChange(i)} className={`rounded-3 border-2 overflow-hidden cursor-pointer shadow-sm ${activeImageIdx === i ? 'border-primary' : 'border-light'}`} style={{ minWidth: '70px', height: '70px' }}>
                      <img src={img.url} className="w-100 h-100 object-fit-cover" alt="thumb" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </Col>

          {/* ডিটেইলস সেকশন */}
          <Col md={6}>
            <div className="ps-md-3">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <div className="flex-grow-1">
                  <h2 className="fw-bold text-dark mb-1">{product.name}</h2>
                  <p className="text-muted small mb-0">পণ্য কোড: <span className="text-primary fw-bold">{selectedSizeObj?.vCode || product.pCode}</span></p>
                </div>
                <div className="text-end ms-2">
                   <Badge bg="dark" className="d-block mb-1 small px-3">STOCK</Badge>
                   <Badge bg="white" className="text-dark border px-3 py-1 shadow-sm fw-bold">
                     {selectedSizeObj ? selectedSizeObj.stock : product.countInStock} PCS
                   </Badge>
                </div>
              </div>

             {/* 💸 [তোর স্কেচ ইমেজের মতো ইউজার স্ক্রিন অফার প্রাইস বক্স] 💸 */}
             {/* 💸 [তোর রুলস অনুযায়ী সম্পূর্ণ রেসপন্সিভ এবং অফার-অ্যাওয়ার প্রাইস বক্স] 💸 */}
<Card className="my-4 border-0 shadow-sm rounded-3 overflow-hidden bg-white border border-light">
  <Card.Body className="p-3 p-md-4">
    <Row className="align-items-center g-3">
      
      {/* ১. বাম পাশ: অরিজিনাল প্রাইস (অফার থাকলে লাল কাটা দাগ পড়বে, না থাকলে নরমাল থাকবে) */}
      <Col xs={12} md={hasDiscount ? 4 : 12} className="text-start">
        <div className="d-inline-block">
          {/* মেইন টাকা প্রাইস */}
          <h2 
            className="text-danger fw-bold mb-0" 
            style={{ 
              fontSize: hasDiscount ? '2.2rem' : '2.8rem', 
              textDecoration: hasDiscount ? 'line-through' : 'none', 
              textDecorationColor: '#ff4d4d', 
              textDecorationThickness: '3px',
              opacity: hasDiscount ? 0.7 : 1 
            }}
          >
            ৳ {basePriceBDT}
          </h2>
          {/* রিয়াল কিউআর প্রাইস */}
          {basePriceQR > 0 && (
            <div 
              className="text-muted small fw-bold mt-1" 
              style={{ 
                textDecoration: hasDiscount ? 'line-through' : 'none', 
                textDecorationColor: '#ff4d4d', 
                textDecorationThickness: '2px' 
              }}
            >
              (রিয়েল প্রাইস: {basePriceQR} QR)
            </div>
          )}
        </div>
      </Col>

      {/* অফার থাকলে তবেই মাঝের এবং ডানপাশের বক্সগুলো স্ক্রিনে আসবে */}
      {hasDiscount && (
        <>
          {/* ২. মাঝখান: অফার পার্সেন্টেজ বক্স (মোবাইলে সুন্দর দেখানোর জন্য সাইজ ফিক্সড) */}
          <Col xs={5} md={3} className="text-start text-md-center">
            <div className="d-inline-block border border-danger px-3 py-2 rounded bg-light shadow-sm">
              <h3 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.6rem' }}>
                {discountPercent}% Off
              </h3>
            </div>
          </Col>

          {/* ৩. ডান পাশ: নতুন ডিসকাউন্টেড লাইভ প্রাইস বক্স (tk & qr) */}
          <Col xs={7} md={5} className="text-end">
            <div className="d-flex flex-column gap-2 align-items-end">
              {/* নতুন অফার মূল্য (টাকা) */}
              <div className="border border-danger px-3 py-2 bg-white text-center rounded shadow-sm" style={{ width: '100%', maxWidth: '160px' }}>
                <h4 className="mb-0 fw-bold text-danger" style={{ fontSize: '1.6rem', fontFamily: 'sans-serif' }}>
                  {finalPriceBDT}tk
                </h4>
              </div>
              {/* নতুন অফার মূল্য (রিয়াল) */}
              {basePriceQR > 0 && (
                <div className="border border-danger px-3 py-1 bg-white text-center rounded shadow-sm" style={{ width: '100%', maxWidth: '160px' }}>
                  <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.2rem', fontFamily: 'sans-serif' }}>
                    {finalPriceQR}qr
                  </h5>
                </div>
              )}
            </div>
          </Col>
        </>
      )}

    </Row>
  </Card.Body>
</Card>
              {/* কালার সিলেক্টর */}
              <div className="mb-3">
                <h6 className="fw-bold mb-2 small text-muted text-uppercase">কালার সিলেক্ট করুন:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {product.variants?.map((v, idx) => (
                    <Button 
                      key={idx}
                      variant={selectedColor === v.color ? 'primary' : 'outline-primary'}
                      size="sm"
                      className="rounded-pill px-3 text-capitalize"
                      onClick={() => {
                        setSelectedColor(v.color);
                        setSelectedSizeObj(null); 
                        const matchImgIdx = product.images?.findIndex(img => img.url === v.image);
                        if (matchImgIdx !== -1 && matchImgIdx !== undefined) {
                          setActiveImageIdx(matchImgIdx);
                        }
                      }}
                    >
                      {v.color}
                    </Button>
                  ))}
                </div>
              </div>

              {/* সাইজ সিলেক্টর */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold small text-muted text-uppercase mb-0">উপলব্ধ সাইজ:</h6>
                  <Button variant="link" className="text-decoration-none text-primary p-0 small fw-bold" onClick={() => setShowSizeGuide(true)}>
                    <FaRulerHorizontal className="me-1"/> Size Guide
                  </Button>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {product.variants
                    ?.find(v => v.color === selectedColor) 
                    ?.sizes?.map((s, idx) => {
                      const sizeName = typeof s === 'object' ? s.size : s;
                      const sizeStock = typeof s === 'object' ? Number(s.stock) : 0;
                      const isOutOfStock = sizeStock <= 0;

                      return (
                        <div 
                          key={idx} 
                          onClick={() => !isOutOfStock && setSelectedSizeObj(s)} 
                          className={`p-2 border-2 rounded-3 text-center transition-all ${selectedSizeObj?.size === sizeName ? 'border-primary bg-primary text-white shadow' : 'bg-white border-light text-dark shadow-sm'} ${isOutOfStock ? 'opacity-40 grayscale pointer-events-none' : 'cursor-pointer'}`} 
                          style={{ minWidth: '85px' }}
                        >
                          <div className="fw-bold">{sizeName}</div>
                          <div className="very-small opacity-75">{!isOutOfStock ? `${sizeStock} In Stock` : 'Out of Stock'}</div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>

              <ListGroup variant="flush" className="rounded-4 overflow-hidden shadow-sm mb-4 border border-light">
                <ListGroup.Item className="d-flex justify-content-between p-3 align-items-center">
                  <span className="text-muted small"><FaTruck className="me-2 text-primary"/> ডেলিভারি:</span>
                  <span className="small fw-bold">{product.shippingTime || '৭-১৫ দিন'}</span>
                </ListGroup.Item>
              </ListGroup>

              {/* অ্যাকশন বাটনসমূহ */}
              <div className="d-flex flex-column gap-2 mb-4">
                <div className="d-flex gap-2">
                  <Form.Control 
                    as="select" 
                    value={qty} 
                    onChange={(e) => setQty(Number(e.target.value))} 
                    className="rounded-pill text-center fw-bold shadow-sm" 
                    style={{ width: '85px', border: '1px solid #ddd' }}
                  >
                    {[...Array(selectedSizeObj?.stock ? Number(selectedSizeObj.stock) : 0).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>{x + 1}</option>
                    ))}
                  </Form.Control>
                  <Button className='flex-grow-1 py-3 fw-bold rounded-pill shadow-lg text-uppercase' variant="dark" disabled={!selectedSizeObj || Number(selectedSizeObj.stock) === 0} onClick={addToCartHandler}>
                    <FaShoppingCart className="me-2"/> কার্টে যোগ করুন
                  </Button>
                </div>
                <Button className='py-3 fw-bold rounded-pill shadow-lg text-uppercase' variant="primary" disabled={!selectedSizeObj || Number(selectedSizeObj.stock) === 0} onClick={orderNowHandler}>
                  <FaBolt className="me-2"/> Order Now (এখনই কিনুন)
                </Button>
              </div>

              {/* ডিসক্রিপশন কার্ড */}
              <Card className="border-0 shadow-sm rounded-4 bg-white border-start border-primary border-4">
                <Card.Body>
                  <h6 className="fw-bold mb-2"><FaInfoCircle className="me-2 text-primary"/> বিস্তারিত তথ্য:</h6>
                  <p className="text-muted small mb-0" style={{lineHeight: '1.6', whiteSpace: 'pre-line'}}>{product.description}</p>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Size Guide Modal */}
      <Modal show={showSizeGuide} onHide={() => setShowSizeGuide(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold">Size Guide</Modal.Title></Modal.Header>
        <Modal.Body className="text-center">
          <img src="/images/size-chart.jpg" alt="Size Guide" className="img-fluid rounded shadow-sm" />
        </Modal.Body>
      </Modal>

      {/* ভিডিও রি-প্লে বাটন */}
      {!showFloatingVideo && product.videoUrl && (
        <div className="position-fixed bottom-0 end-0 m-4 bg-primary text-white p-3 rounded-circle shadow-lg cursor-pointer" onClick={() => setShowFloatingVideo(true)} style={{ zIndex: 1000 }}>
          <FaPlayCircle size={25} />
        </div>
      )}
    </div>
  );
};

export default ProductScreen;