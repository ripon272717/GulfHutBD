import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; 
import { Row, Col, Card, Button, Form, Badge, ListGroup, Container } from 'react-bootstrap';
import { 
  FaShoppingCart, FaTruck, FaCheckCircle, FaChevronLeft, 
  FaEdit, FaPlayCircle, FaInfoCircle, FaChevronRight 
} from 'react-icons/fa';

import { useGetProductDetailsQuery } from '../slices/productsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';

const ProductScreen = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [activeImageIdx, setActiveImageIdx] = useState(0); 
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [showFloatingVideo, setShowFloatingVideo] = useState(true);

  const { userInfo } = useSelector((state) => state.auth);
  const { data: product, isLoading, error } = useGetProductDetailsQuery(productId);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const firstAvailable = product.variants.find(v => v.stock > 0);
      if (firstAvailable) setSelectedVariant(firstAvailable);
    }
  }, [product]);

  // অটো-প্লে ফিক্সড লজিক
  useEffect(() => {
    if (videoRef.current && showFloatingVideo) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(err => console.log("Auto-play wait:", err));
    }
  }, [product?.videoUrl, showFloatingVideo]);

  const nextImage = () => {
    if (product?.images?.length > 0) {
      setActiveImageIdx((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images?.length > 0) {
      setActiveImageIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const addToCartHandler = () => {
    if (!selectedVariant) {
      toast.error('দয়া করে সাইজ ও কালার সিলেক্ট করুন');
      return;
    }
    toast.success('কার্টে যোগ করা হয়েছে!');
  };

  // ভিডিও কম্পোনেন্ট - পিসি ১৫০পিএক্স, মোবাইল ৯০পিএক্স
  const VideoPlayerComponent = useMemo(() => {
    if (!product?.videoUrl || !showFloatingVideo) return null;

    const isMobile = window.innerWidth < 768;
    const videoSize = isMobile ? '90px' : '150px';

    return (
      <div 
        className="position-absolute shadow-lg rounded-3 overflow-hidden bg-black border border-white" 
        style={{ 
          width: videoSize,
          height: videoSize,
          bottom: '10px', 
          right: '10px', 
          zIndex: 20
        }}
      >
        <div 
          className="position-absolute top-0 end-0 bg-dark text-white px-1 py-0" 
          style={{ cursor: 'pointer', fontSize: '10px', zIndex: 25, borderRadius: '0 0 0 5px', opacity: 0.8 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowFloatingVideo(false);
          }}
        >✕</div>
        
        <video
          ref={videoRef}
          src={product.videoUrl}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>
    );
  }, [product?.videoUrl, showFloatingVideo]);

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error.data?.message || error.error}</Message>;

  const currentImage = product.images?.[activeImageIdx]?.url || product.image;

  return (
    <div className="bg-light min-vh-100 pb-5">
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
          <Col md={6}>
            <div className="position-relative">
              <Card className="border-0 shadow-sm rounded-4 bg-white p-2 overflow-hidden">
                {/* ইমেজ রেসপন্সিভ সাইজ */}
                <div 
                  className="position-relative rounded-3 mb-3 overflow-hidden bg-white d-flex align-items-center justify-content-center" 
                  style={{ 
                    width: '100%', 
                    height: window.innerWidth < 768 ? '280px' : '450px' 
                  }}
                >
                    <img src={currentImage} className="w-100 h-100 object-fit-contain transition-all" alt="Product" />
                    
                    {product.images?.length > 1 && (
                      <>
                        <button onClick={prevImage} className="position-absolute top-50 start-0 translate-middle-y btn btn-light rounded-circle shadow-sm ms-2 d-flex align-items-center justify-content-center" style={{ zIndex: 5, width: '35px', height: '35px' }}><FaChevronLeft size={14} /></button>
                        <button onClick={nextImage} className="position-absolute top-50 end-0 translate-middle-y btn btn-light rounded-circle shadow-sm me-2 d-flex align-items-center justify-content-center" style={{ zIndex: 5, width: '35px', height: '35px' }}><FaChevronRight size={14} /></button>
                      </>
                    )}

                    {/* ভিডিওটি ঠিক ইমেজের নিচে ডান কোণায় বসবে */}
                    {VideoPlayerComponent}
                </div>

                <div className="d-flex gap-2 overflow-auto pb-2 px-1">
                  {product.images?.map((img, i) => (
                    <div key={i} onClick={() => setActiveImageIdx(i)} className={`rounded-3 border-2 overflow-hidden cursor-pointer shadow-sm ${activeImageIdx === i ? 'border-primary' : 'border-light'}`} style={{ minWidth: '70px', height: '70px' }}>
                      <img src={img.url} className="w-100 h-100 object-fit-cover" alt="thumb" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </Col>

          <Col md={6}>
            <div className="ps-md-3">
              <Badge bg="danger" className="mb-2 px-3 py-2 rounded-pill shadow-sm">{product.offerCategory || 'Sale'}</Badge>
              <h2 className="fw-bold text-dark mb-1">{product.name}</h2>
              <p className="text-muted small">পণ্য কোড: {product.pCode}</p>

              <div className="d-flex align-items-center gap-3 my-4 bg-white p-3 rounded-4 shadow-sm border border-light">
                <div>
                  <h3 className="text-primary fw-bold mb-0">{product.priceQR} QR</h3>
                  <div className="text-success fw-bold small">৳ {product.priceBDT} (পেমেন্ট রেট)</div>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold mb-3 small text-muted text-uppercase">সাইজ ও কালার:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {product.variants?.map((v, idx) => (
                    <div key={idx} onClick={() => v.stock > 0 && setSelectedVariant(v)} className={`p-2 border-2 rounded-3 text-center transition-all ${selectedVariant === v ? 'border-primary bg-primary text-white shadow' : 'bg-white border-light text-dark shadow-sm'} ${v.stock <= 0 ? 'opacity-40 grayscale' : 'cursor-pointer'}`} style={{ minWidth: '95px' }}>
                      <div className="fw-bold">{v.size}</div>
                      <div className="very-small opacity-75">{v.color}</div>
                    </div>
                  ))}
                </div>
              </div>

              <ListGroup variant="flush" className="rounded-4 overflow-hidden shadow-sm mb-4 border border-light">
                <ListGroup.Item className="d-flex justify-content-between p-3 align-items-center">
                  <span className="text-muted small"><FaTruck className="me-2 text-primary"/> ডেলিভারি:</span>
                  <span className="small fw-bold">{product.shippingTime || '৭-১৫ দিন'}</span>
                </ListGroup.Item>
              </ListGroup>

              <div className="d-flex gap-2">
                <Form.Control as="select" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="rounded-pill text-center fw-bold shadow-sm" style={{ width: '85px', border: '1px solid #ddd' }}>
                  {[...Array(selectedVariant?.stock || 0).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                  ))}
                </Form.Control>
                <Button className='flex-grow-1 py-3 fw-bold rounded-pill shadow-lg text-uppercase' variant="dark" disabled={!selectedVariant || selectedVariant.stock === 0} onClick={addToCartHandler}>
                  <FaShoppingCart className="me-2"/> কার্টে যোগ করুন
                </Button>
              </div>

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

      {!showFloatingVideo && product.videoUrl && (
        <div className="position-fixed bottom-0 end-0 m-4 bg-primary text-white p-3 rounded-circle shadow-lg cursor-pointer" onClick={() => setShowFloatingVideo(true)} style={{ zIndex: 1000 }}>
          <FaPlayCircle size={25} />
        </div>
      )}
    </div>
  );
};

export default ProductScreen;