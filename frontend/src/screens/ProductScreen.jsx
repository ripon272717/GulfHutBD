import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; 
import { Row, Col, Card, Button, Form, Badge, ListGroup, Container } from 'react-bootstrap';
import { 
  FaShoppingCart, FaTruck, FaCheckCircle, FaTimesCircle, 
  FaChevronLeft, FaEdit, FaPlayCircle, FaInfoCircle, FaChevronRight 
} from 'react-icons/fa';

import ReactPlayer from 'react-player';
import { useGetProductDetailsQuery } from '../slices/productsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';

const ProductScreen = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  
  // ভিডিওর জন্য রেফারেন্স
  const playerRef = useRef(null);

  // --- States ---
  const [activeImageIdx, setActiveImageIdx] = useState(0); 
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [showFloatingVideo, setShowFloatingVideo] = useState(true);

  // ডাটা ফেচিং
  const { userInfo } = useSelector((state) => state.auth);
  const { data: product, isLoading, error } = useGetProductDetailsQuery(productId);

  // ডিফল্ট ভ্যারিয়েন্ট সেট
  useEffect(() => {
    if (product) {
      if (product.variants?.length > 0) {
        const firstAvailable = product.variants.find(v => v.stock > 0);
        if (firstAvailable) setSelectedVariant(firstAvailable);
      }
    }
  }, [product]);

  // ইমেজ স্লাইডার লজিক (Next/Prev)
  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      setActiveImageIdx((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      setActiveImageIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const addToCartHandler = () => {
    if (!selectedVariant) {
      toast.error('দয়া করে সাইজ ও কালার সিলেক্ট করুন');
      return;
    }
    toast.success('কার্টে যোগ করা হয়েছে!');
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error.data?.message || error.error}</Message>;

  const currentImage = product.images && product.images.length > 0 
    ? product.images[activeImageIdx].url 
    : product.image;

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* ১. স্টিকি হেডার */}
      <div className="p-3 d-flex align-items-center justify-content-between bg-white shadow-sm sticky-top mb-3" style={{ zIndex: 1000 }}>
        <div className="d-flex align-items-center">
          <FaChevronLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} className="me-3 text-dark" />
          <h6 className="mb-0 fw-bold text-truncate" style={{maxWidth: '180px'}}>{product.name}</h6>
        </div>
        
        {userInfo && userInfo.isAdmin && (
          <Button 
            variant="warning" size="sm" 
            className="rounded-pill px-3 fw-bold shadow-sm"
            onClick={() => navigate(`/admin/product/${product._id}/edit`)}
          >
            <FaEdit className="me-1"/> Edit
          </Button>
        )}
      </div>

      <Container>
        <Row className="g-4">
          
          {/* ২. ইমেজ ও স্লাইডার সেকশন */}
          <Col md={6}>
            <div className="position-relative">
              <Card className="border-0 shadow-sm rounded-4 bg-white p-2 overflow-hidden">
                <div className="position-relative rounded-3 mb-3 overflow-hidden bg-white d-flex align-items-center justify-content-center" style={{ width: '100%', height: '400px' }}>
                    <img 
                        src={currentImage} 
                        className="w-100 h-100 object-fit-contain transition-all" 
                        alt="Product Main" 
                    />
                    
                    {/* স্লাইড কন্ট্রোল বাটন (< ও >) */}
                    {product.images && product.images.length > 1 && (
                      <>
                        <button 
                          onClick={prevImage}
                          className="position-absolute top-50 start-0 translate-middle-y btn btn-light rounded-circle shadow-sm ms-2 d-flex align-items-center justify-content-center"
                          style={{ zIndex: 5, width: '42px', height: '42px', opacity: '0.9' }}
                        >
                          <FaChevronLeft size={18} />
                        </button>
                        <button 
                          onClick={nextImage}
                          className="position-absolute top-50 end-0 translate-middle-y btn btn-light rounded-circle shadow-sm me-2 d-flex align-items-center justify-content-center"
                          style={{ zIndex: 5, width: '42px', height: '42px', opacity: '0.9' }}
                        >
                          <FaChevronRight size={18} />
                        </button>
                      </>
                    )}
                </div>

                {/* থাম্বনেইল গ্যালারি */}
                <div className="d-flex gap-2 overflow-auto pb-2 px-1">
                  {product.images?.map((img, i) => (
                    <div 
                      key={i} 
                      onClick={() => setActiveImageIdx(i)}
                      className={`rounded-3 border-2 overflow-hidden cursor-pointer shadow-sm ${activeImageIdx === i ? 'border-primary' : 'border-light'}`}
                      style={{ minWidth: '75px', height: '75px', transition: '0.3s' }}
                    >
                      <img src={img.url} className="w-100 h-100 object-fit-cover" alt={`thumb-${i}`} />
                    </div>
                  ))}
                </div>
              </Card>

              {/* ৩. ফ্লোটিং ভিডিও (মাস্ট অটো-প্লে ফিক্স) */}
              {product.videoUrl && showFloatingVideo && (
                <div 
                  className="position-absolute shadow-lg rounded-3 overflow-hidden bg-black border border-white" 
                  style={{ 
                    width: '135px', 
                    height: '165px', 
                    bottom: '130px', 
                    right: '25px', 
                    zIndex: 20 
                  }}
                >
                  <div 
                    className="position-absolute top-0 end-0 bg-dark text-white px-2 py-1 shadow" 
                    style={{ cursor: 'pointer', fontSize: '12px', zIndex: 25, borderRadius: '0 0 0 8px' }}
                    onClick={() => setShowFloatingVideo(false)}
                  >✕</div>
                  
                  <ReactPlayer 
                    ref={playerRef}
                    url={product.videoUrl} 
                    width="100%" 
                    height="100%" 
                    playing={true} 
                    muted={true}   
                    loop={true} 
                    playsinline={true}
                    controls={false}
                    onReady={(player) => {
                        const video = player.getInternalPlayer();
                        if (video) {
                            video.setAttribute('muted', ''); // ব্রাউজারকে মিউট নিশ্চিত করা
                            video.play();
                        }
                    }}
                    config={{
                      file: {
                        attributes: {
                          style: { objectFit: 'cover', width: '100%', height: '100%' },
                          autoPlay: true,
                          muted: true,
                          playsInline: true,
                          preload: "auto"
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </Col>

          {/* ৪. প্রোডাক্ট ইনফরমেশন */}
          <Col md={6}>
            <div className="ps-md-3">
              <div className="mb-3">
                <Badge bg="danger" className="mb-2 px-3 py-2 rounded-pill shadow-sm">
                  {product.offerCategory || 'Special Price'}
                </Badge>
                <h2 className="fw-bold text-dark mb-1">{product.name}</h2>
                <small className="text-muted">Code: {product.pCode}</small>
              </div>

              {/* প্রাইস সেকশন */}
              <div className="d-flex align-items-center gap-3 my-4 bg-white p-3 rounded-4 shadow-sm border border-light">
                <div>
                  <h3 className="text-primary fw-bold mb-0">{product.priceQR} QR</h3>
                  <div className="text-success fw-bold small">৳ {product.priceBDT} (পেমেন্ট রেট)</div>
                </div>
                <div className="ms-auto text-end">
                   <div className="small text-muted mb-1">ইউনিট</div>
                   <Badge bg="light" text="dark" className="border px-3 py-2">{product.priceLabel || '1 pcs'}</Badge>
                </div>
              </div>

              {/* সাইজ ও কালার ভ্যারিয়েন্ট */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3 small text-muted text-uppercase">সিলেক্ট করুন:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {product.variants?.map((v, idx) => (
                    <div
                      key={idx}
                      onClick={() => v.stock > 0 && setSelectedVariant(v)}
                      className={`p-2 border-2 rounded-3 text-center transition-all ${
                        selectedVariant === v ? 'border-primary bg-primary text-white shadow' : 'bg-white border-light text-dark shadow-sm'
                      } ${v.stock <= 0 ? 'opacity-40 grayscale' : 'cursor-pointer hover-shadow'}`}
                      style={{ minWidth: '100px' }}
                    >
                      <div className="fw-bold">{v.size}</div>
                      <div className="very-small opacity-75">{v.color}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* শিপিং ও স্টক স্ট্যাটাস */}
              <ListGroup variant="flush" className="rounded-4 overflow-hidden shadow-sm mb-4 border border-light">
                <ListGroup.Item className="d-flex justify-content-between p-3 align-items-center">
                  <span className="text-muted small"><FaTruck className="me-2 text-primary"/> ডেলিভারি সময়:</span>
                  <span className="small fw-bold">{product.shippingTime || '৭-১৫ দিন'}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between p-3 align-items-center">
                  <span className="text-muted small"><FaCheckCircle className="me-2 text-success"/> বর্তমান স্টক:</span>
                  <Badge bg={selectedVariant?.stock > 0 ? 'success' : 'danger'}>
                    {selectedVariant ? (selectedVariant.stock > 0 ? `ইন স্টক (${selectedVariant.stock})` : 'আউট অফ স্টক') : 'প্রথমে সাইজ পছন্দ করুন'}
                  </Badge>
                </ListGroup.Item>
              </ListGroup>

              {/* কোয়ান্টিটি ও কার্ট বাটন */}
              <div className="d-flex gap-2">
                <Form.Control 
                  as="select" 
                  value={qty} 
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="rounded-pill text-center fw-bold shadow-sm"
                  style={{ width: '85px', border: '1px solid #ddd' }}
                >
                  {[...Array(selectedVariant?.stock || 0).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                  ))}
                </Form.Control>
                <Button
                  className='flex-grow-1 py-3 fw-bold rounded-pill shadow-lg text-uppercase'
                  variant="dark"
                  disabled={!selectedVariant || selectedVariant.stock === 0}
                  onClick={addToCartHandler}
                >
                  <FaShoppingCart className="me-2"/> কার্টে যোগ করুন
                </Button>
              </div>

              {/* ডেসক্রিপশন */}
              <Card className="mt-4 border-0 shadow-sm rounded-4 bg-white border-start border-primary border-4">
                <Card.Body>
                  <h6 className="fw-bold mb-2"><FaInfoCircle className="me-2 text-primary"/> বিস্তারিত তথ্য:</h6>
                  <p className="text-muted small mb-0" style={{lineHeight: '1.6'}}>{product.description}</p>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>

      {/* ভিডিও পুনরায় চালু বাটন */}
      {!showFloatingVideo && product.videoUrl && (
        <div 
          className="position-fixed bottom-0 end-0 m-4 bg-primary text-white p-3 rounded-circle shadow-lg cursor-pointer"
          onClick={() => setShowFloatingVideo(true)}
          style={{ zIndex: 1000 }}
        >
          <FaPlayCircle size={25} />
        </div>
      )}
    </div>
  );
};

export default ProductScreen;