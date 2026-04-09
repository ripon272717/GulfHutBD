import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Image, ListGroup, Card, Button, Form, Badge, Modal, Table } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap'; 
import { toast } from 'react-toastify';
import { 
  FaEdit, 
  FaArrowLeft, 
  FaShoppingCart, 
  FaPlayCircle, 
  FaRulerCombined, 
  FaCheckCircle, 
  FaHashtag, 
  FaStar 
} from 'react-icons/fa';
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from '../slices/productsApiSlice';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { addToCart } from '../slices/cartSlice';

const ProductScreen = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  
  // --- ডাইনামিক ভ্যারিয়েন্ট স্টেট ---
  const [activeImgIdx, setActiveImgIdx] = useState(0); 
  const [selectedSize, setSelectedSize] = useState('');

  const { data: product, isLoading, refetch, error } = useGetProductDetailsQuery(productId);
  const { userInfo } = useSelector((state) => state.auth);
  const [createReview, { isLoading: loadingProductReview }] = useCreateReviewMutation();

  // ইমেজ চেঞ্জ করলে সাইজ সিলেকশন রিসেট হবে
  const handleImageSelect = (index) => {
    setActiveImgIdx(index);
    setSelectedSize(''); 
  };

  const addToCartHandler = () => {
    const activeImage = product.images && product.images.length > 0 ? product.images[activeImgIdx] : null;
    const hasVariants = activeImage?.variants && activeImage.variants.length > 0;
    
    if (hasVariants && !selectedSize) {
      toast.error('দয়া করে একটি সাইজ সিলেক্ট করুন');
      return;
    }
    
    const cartItem = {
      ...product,
      qty,
      image: activeImage ? activeImage.url : product.image,
      color: activeImage?.variants[0]?.color || 'Default',
      size: selectedSize || 'N/A'
    };

    dispatch(addToCart(cartItem));
    navigate('/cart');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await createReview({ productId, rating, comment }).unwrap();
      refetch();
      toast.success('রিভিউটি সফলভাবে যোগ করা হয়েছে');
      setRating(0);
      setComment('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  // সাইজ গাইড মোডাল
  const SizeGuideModal = () => (
    <Modal show={showSizeGuide} onHide={() => setShowSizeGuide(false)} centered size="md">
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Size Guide</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <Table responsive striped hover className="mb-0 text-center small">
          <thead className="table-dark">
            <tr>
              <th>Label Size</th>
              <th>Underbust (cm)</th>
              <th>Cup Height (cm)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>S</td><td>27.2</td><td>6.7</td></tr>
            <tr><td>M</td><td>28.8</td><td>7.1</td></tr>
            <tr><td>L</td><td>30.3</td><td>7.5</td></tr>
            <tr><td>XL</td><td>31.9</td><td>7.9</td></tr>
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );

  return (
    <>
      <Link className='btn btn-light my-3 border shadow-sm rounded-pill px-4' to='/'>
        <FaArrowLeft className='me-2' /> শপিং চালিয়ে যান
      </Link>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <>
          <Meta title={product.name} description={product.description} />
          
          <Row className='g-4'>
            {/* বাম পাশ: ইমেজ এবং ভিডিও গ্যালারি */}
            <Col md={6}>
              <div className="position-relative bg-white border rounded-4 overflow-hidden shadow-sm">
                {/* অফার এবং বাজ টেক্সট ডিসপ্লে */}
                {product.isBazOn && (
                  <Badge bg="danger" className="position-absolute top-0 start-0 m-3 px-3 py-2 shadow-sm fs-6" style={{ zIndex: 10 }}>
                    {product.bazText}
                  </Badge>
                )}
                {product.isOfferOn && (
                  <Badge bg="warning" text="dark" className="position-absolute top-0 end-0 m-3 px-3 py-2 shadow-sm fs-6" style={{ zIndex: 10 }}>
                    {product.offerText}
                  </Badge>
                )}
                
                <Image 
                  src={product.images && product.images.length > 0 ? product.images[activeImgIdx].url : product.image} 
                  alt={product.name} 
                  fluid className='w-100 object-fit-contain'
                  style={{ maxHeight: '550px', minHeight: '400px' }}
                />

                {/* ভিডিও গাইড ছোট উইন্ডো */}
                {product.videoUrl && (
                  <div className="position-absolute bottom-0 end-0 m-3 border border-white shadow-lg rounded-3 overflow-hidden bg-black" style={{ width: '110px', height: '110px' }}>
                    <video src={product.videoUrl} autoPlay loop muted playsInline className="w-100 h-100 object-fit-cover" />
                  </div>
                )}
              </div>
              
              {/* থাম্বনেইল লিস্ট */}
              <div className='d-flex gap-2 mt-3 overflow-auto pb-2 custom-scrollbar'>
                {product.images && product.images.map((img, i) => (
                  <div key={i} className="position-relative flex-shrink-0">
                    <Image
                      src={img.url}
                      alt={`thumb-${i}`}
                      thumbnail
                      style={{ width: '80px', height: '80px', cursor: 'pointer', objectFit: 'cover' }}
                      className={activeImgIdx === i ? 'border-primary border-3 shadow' : 'border-light'}
                      onClick={() => handleImageSelect(i)}
                    />
                    {activeImgIdx === i && <FaCheckCircle className="position-absolute top-0 start-0 text-primary bg-white rounded-circle" style={{fontSize: '14px', marginTop: '-5px'}} />}
                  </div>
                ))}
              </div>
            </Col>

            {/* ডান পাশ: প্রোডাক্ট কন্টেন্ট */}
            <Col md={6}>
              <ListGroup variant='flush' className='ps-md-4'>
                
                {/* প্রোডাক্ট কোড - যা কাস্টমার কমপ্লেইনের জন্য ব্যবহার করবে */}
                <ListGroup.Item className='border-0 pb-0'>
                  <div className="d-inline-flex align-items-center bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-pill mb-2 fw-bold small border border-primary border-opacity-25">
                    <FaHashtag className="me-1" /> Product Code: {product.pCode || 'N/A'}
                  </div>
                  <h2 className='fw-bold text-dark display-6'>{product.name}</h2>
                </ListGroup.Item>

                <ListGroup.Item className='border-0'>
                  <Rating value={product.rating} text={`${product.numReviews} রিভিউ`} />
                </ListGroup.Item>

                {/* প্রাইস সেকশন (নতুন ডিজাইন) */}
                <ListGroup.Item className='border-0 mt-2'>
                  <div className='p-4 bg-light rounded-4 border-start border-warning border-5 shadow-sm'>
                    <div className='small text-muted mb-1 fw-bold'>{product.priceLabel || 'Current Price'}:</div>
                    <div className="d-flex align-items-baseline gap-2">
                        <span className='fs-1 fw-bold text-danger'>QR {product.priceQR}</span>
                        <span className='text-success fw-bold fs-5'>≈ BDT {product.priceBDT}</span>
                    </div>
                    {product.isOfferOn && <Badge bg="dark" className="mt-2">Special Offer Applied</Badge>}
                  </div>
                </ListGroup.Item>

                {/* ডাইনামিক সাইজ সিলেকশন */}
                <ListGroup.Item className='border-0 mt-4'>
                  <div className='d-flex justify-content-between align-items-center mb-3'>
                    <strong className='text-uppercase small fw-bold text-secondary'>সাইজ বেছে নিন:</strong>
                    <Button variant='link' size='sm' className='text-decoration-none text-muted p-0 fw-bold' onClick={() => setShowSizeGuide(true)}>
                       <FaRulerCombined className='me-1 text-primary'/> সাইজ চার্ট
                    </Button>
                  </div>
                  <div className='d-flex flex-wrap gap-2'>
                    {product.images && product.images[activeImgIdx]?.variants?.map((v, idx) => (
                      <Button 
                        key={idx} 
                        variant={selectedSize === v.size ? 'dark' : 'outline-dark'} 
                        className={`rounded-4 px-4 py-2 fw-bold ${v.stock <= 0 ? 'disabled' : ''}`}
                        onClick={() => setSelectedSize(v.size)}
                        disabled={v.stock <= 0}
                      >
                        {v.size} {v.stock <= 0 && '(Stock Out)'}
                      </Button>
                    ))}
                    {(!product.images || !product.images[activeImgIdx]?.variants || product.images[activeImgIdx]?.variants.length === 0) && (
                      <span className='text-muted small italic'>এই ভ্যারিয়েন্টের জন্য কোনো নির্দিষ্ট সাইজ নেই</span>
                    )}
                  </div>
                </ListGroup.Item>

                {/* কার্ট সেকশন কার্ড */}
                <ListGroup.Item className='border-0 mt-4'>
                  <Card className='border-0 bg-white p-4 rounded-4 shadow-sm border'>
                    <Row className='align-items-center mb-4'>
                      <Col className='fw-bold'>স্টক স্ট্যাটাস:</Col>
                      <Col className='text-end'>
                        {product.countInStock > 0 ? <Badge bg='success' className="rounded-pill px-3 py-2">In Stock</Badge> : <Badge bg='danger' className="rounded-pill px-3 py-2">Out of Stock</Badge>}
                      </Col>
                    </Row>
                    
                    {product.countInStock > 0 && (
                      <Row className='align-items-center mb-4'>
                        <Col className='fw-bold'>পরিমাণ (Qty):</Col>
                        <Col>
                          <Form.Control as='select' value={qty} onChange={(e) => setQty(Number(e.target.value))} className='rounded-pill border shadow-sm'>
                            {[...Array(product.countInStock).keys()].map((x) => (
                              <option key={x + 1} value={x + 1}>{x + 1}</option>
                            ))}
                          </Form.Control>
                        </Col>
                      </Row>
                    )}

                    <Button
                      onClick={addToCartHandler}
                      className='btn-block py-3 rounded-pill fw-bold shadow border-0 text-uppercase'
                      type='button'
                      variant='warning'
                      disabled={product.countInStock === 0}
                      style={{ letterSpacing: '1px' }}
                    >
                      <FaShoppingCart className='me-2' /> 
                      {selectedSize ? 'ব্যাগে যোগ করুন' : 'সাইজ সিলেক্ট করুন'}
                    </Button>
                  </Card>
                </ListGroup.Item>

                {/* অ্যাডমিন সেকশন */}
                {userInfo && userInfo.isAdmin && (
                  <ListGroup.Item className='border-0 mt-2'>
                    <LinkContainer to={`/admin/product/${product._id}/edit`}>
                      <Button variant='outline-info' className='w-100 rounded-pill py-2 fw-bold shadow-sm'>
                        <FaEdit className='me-2' /> এডিট প্রোডাক্ট (Admin)
                      </Button>
                    </LinkContainer>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Col>
          </Row>

          {/* প্রোডাক্ট ডেসক্রিপশন */}
          <Row className='mt-5'>
            <Col md={12}>
              <Card className='border-0 shadow-sm rounded-4 mb-5'>
                <Card.Body className='p-4'>
                  <h4 className='fw-bold border-bottom pb-3 mb-4 text-dark'>পণ্যের বিবরণ ও ডেসক্রিপশন</h4>
                  <div className='product-description' style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: '#444' }}>
                    {product.description || 'এই প্রোডাক্টটির কোনো বিবরণ নেই।'}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* রিভিউ সেকশন */}
          <Row className='mt-2 pb-5'>
            <Col md={6}>
              <h3 className='fw-bold mb-4'>কাস্টমার রিভিউ ({product.reviews.length})</h3>
              {product.reviews.length === 0 && <Message>এখনও কোনো রিভিউ নেই। আপনিই প্রথম রিভিউ দিন!</Message>}
              <ListGroup variant='flush'>
                {product.reviews.map((review) => (
                  <ListGroup.Item key={review._id} className='bg-white border rounded-4 mb-3 p-4 shadow-sm'>
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <strong className='fs-5 text-dark'>{review.name}</strong>
                      <span className='text-muted small'>{review.createdAt.substring(0, 10)}</span>
                    </div>
                    <Rating value={review.rating} />
                    <p className='mt-3 mb-0 text-muted'>{review.comment}</p>
                  </ListGroup.Item>
                ))}
                
                <ListGroup.Item className='mt-4 border-0 p-0'>
                  <h4 className='fw-bold mb-3'>আপনার মতামত শেয়ার করুন</h4>
                  {loadingProductReview && <Loader />}
                  {userInfo ? (
                    <Form onSubmit={submitHandler} className='bg-light p-4 rounded-4 shadow-sm border border-white'>
                      <Form.Group className='my-2' controlId='rating'>
                        <Form.Label className='fw-bold small text-uppercase text-muted'>আপনার রেটিং</Form.Label>
                        <Form.Control as='select' required value={rating} onChange={(e) => setRating(e.target.value)} className='rounded-pill border-0 shadow-sm'>
                          <option value=''>নির্বাচন করুন...</option>
                          <option value='1'>১ - খুব খারাপ</option>
                          <option value='2'>২ - মোটামুটি</option>
                          <option value='3'>৩ - ভালো</option>
                          <option value='4'>৪ - খুব ভালো</option>
                          <option value='5'>৫ - অসাধারণ</option>
                        </Form.Control>
                      </Form.Group>
                      <Form.Group className='my-3' controlId='comment'>
                        <Form.Label className='fw-bold small text-uppercase text-muted'>আপনার মন্তব্য</Form.Label>
                        <Form.Control as='textarea' rows='3' required value={comment} onChange={(e) => setComment(e.target.value)} className='rounded-4 border-0 shadow-sm' placeholder='প্রোডাক্টটি আপনার কেমন লেগেছে?'></Form.Control>
                      </Form.Group>
                      <Button disabled={loadingProductReview} type='submit' variant='dark' className='w-100 rounded-pill py-2 fw-bold'>রিভিউ সাবমিট করুন</Button>
                    </Form>
                  ) : (
                    <Message>রিভিউ দিতে দয়া করে <Link to='/login' className='fw-bold'>লগইন</Link> করুন।</Message>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>

          <SizeGuideModal />
        </>
      )}
    </>
  );
};

export default ProductScreen;
