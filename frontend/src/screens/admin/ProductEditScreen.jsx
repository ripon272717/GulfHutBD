import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col, Container, Card, Badge, Modal, Spinner } from 'react-bootstrap';
import { 
  FaTrash, FaPlus, FaSave, FaChevronLeft, FaLayerGroup, 
  FaImage, FaVideo, FaCloudUploadAlt, FaMagic, FaCheckCircle, FaBoxOpen, FaTruck 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
} from '../../slices/productsApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import MediaUpload from '../../components/MediaUpload';

const ProductEditScreen = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  // --- States ---
  const [name, setName] = useState('');
  const [pCode, setPCode] = useState('');
  const [category, setCategory] = useState('');
  const [offerCategory, setOfferCategory] = useState('offer product');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [priceLabel, setPriceLabel] = useState('1 pcs'); 
  const [priceQR, setPriceQR] = useState(0);
  const [priceBDT, setPriceBDT] = useState(0);
  const [offerText, setOfferText] = useState('');
  const [isOfferOn, setIsOfferOn] = useState(false);
  const [bazText, setBazText] = useState('');
  const [isBazOn, setIsBazOn] = useState(false);
  const [images, setImages] = useState([]); 
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [brand, setBrand] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [shippingTime, setShippingTime] = useState('');
  const [variants, setVariants] = useState([]); 

  const [showImgModal, setShowImgModal] = useState(false);
  const [tempImgUrl, setTempImgUrl] = useState('');

  // ক্যাটাগরি লিস্ট
  const categoryList = ['Electronics', 'Fashion', 'Gadgets', 'Home Decor', 'Health & Beauty', 'Groceries'];

  const { data: product, isLoading, error, refetch } = useGetProductDetailsQuery(productId);
  const [updateProduct, { isLoading: loadingUpdate }] = useUpdateProductMutation();

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setPCode(product.pCode || product._id);
      setCategory(product.category || '');
      setOfferCategory(product.offerCategory || 'offer product');
      setDescription(product.description || '');
      setVideoUrl(product.videoUrl || '');
      setPriceLabel(product.priceLabel || '1 pcs');
      setPriceQR(product.priceQR || 0);
      setPriceBDT(product.priceBDT || 0);
      setOfferText(product.offerText || '');
      setIsOfferOn(product.isOfferOn || false);
      setBazText(product.bazText || '');
      setIsBazOn(product.isBazOn || false);
      setImages(product.images || []);
      setBrand(product.brand || '');
      setCountInStock(product.countInStock || 0);
      setShippingTime(product.shippingTime || '');
      setVariants(product.variants || []);
    }
  }, [product]);

  const handlePriceQRChange = (val) => {
    const qr = Number(val);
    setPriceQR(qr);
    setPriceBDT(qr * 32); 
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    // ৫ kos এরর ফিক্স করার জন্য মেইন ইমেজ লজিক
    const mainImage = images.length > 0 ? images[0].url : '/images/sample.jpg';

    try {
      await updateProduct({
        productId, 
        name, 
        pCode, 
        category, 
        offerCategory, 
        description, 
        videoUrl,
        priceLabel, 
        priceQR, 
        priceBDT, 
        offerText, 
        isOfferOn, 
        bazText, 
        isBazOn,
        images, 
        image: mainImage, // এই লাইনটি ডাটাবেজ এরর ফিক্স করবে
        brand, 
        countInStock, 
        shippingTime, 
        variants
      }).unwrap();
      
      toast.success('Product Updated Successfully!');
      refetch();
      navigate('/admin/productlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Container fluid className="p-0 bg-light min-vh-100">
      <div className="bg-dark text-white p-3 d-flex align-items-center sticky-top shadow" style={{zIndex: 1000}}>
        <FaChevronLeft onClick={() => navigate('/admin/productlist')} className="me-3" style={{cursor: 'pointer'}} />
        <h6 className="mb-0">Advanced Product Editor</h6>
      </div>

      {isLoading ? <Loader /> : error ? <Message variant='danger'>{error.data?.message}</Message> : (
        <Form onSubmit={submitHandler} className="pb-5 px-3 mt-3">
          
          {/* ইমেজ ডিসপ্লে ও গ্যালারি */}
          <Card className="mb-4 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
            <div className="bg-white" style={{ height: '300px' }}>
              {images[activeImgIdx] ? (
                <img src={images[activeImgIdx].url} className="w-100 h-100 object-fit-contain p-2" alt="main" />
              ) : <div className="h-100 d-flex align-items-center justify-content-center text-muted">No Image</div>}
              
              {videoUrl && (
                <div className="position-absolute bottom-0 end-0 m-3 border border-white shadow-lg rounded-3 overflow-hidden bg-black" 
                     style={{ width: '100px', height: '100px', zIndex: 100 }}>
                    <video src={videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop playsInline />
                </div>
              )}
            </div>
            <div className="d-flex gap-2 p-3 overflow-auto bg-white border-top">
              {images.map((img, i) => (
                <div key={i} className="position-relative">
                  <img 
                    src={img.url} 
                    className={`rounded border-2 ${i === activeImgIdx ? 'border-primary shadow' : 'border-white'}`} 
                    style={{ width: '55px', height: '55px', cursor: 'pointer', objectFit: 'cover' }} 
                    onClick={() => setActiveImgIdx(i)} 
                    alt="gallery"
                  />
                  <FaTrash 
                    className="position-absolute top-0 end-0 text-danger bg-white rounded-circle p-1" 
                    style={{fontSize: '12px', cursor:'pointer'}} 
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))} 
                  />
                </div>
              ))}
              <Button variant="outline-primary" style={{ minWidth: '55px', height: '55px' }} onClick={() => setShowImgModal(true)}>
                <FaPlus />
              </Button>
            </div>
          </Card>

          {/* ক্যাটাগরি সেটিংস */}
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body>
              <h6 className="fw-bold text-dark mb-3 small"><FaLayerGroup className="me-2"/>ক্যাটাগরি সেটিংস</h6>
              <Row className="g-3">
                <Col xs={6}>
                  <Form.Label className="very-small fw-bold">মেইন ক্যাটাগরি</Form.Label>
                  <Form.Select size="sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Select Category</option>
                    {categoryList.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={6}>
                  <Form.Label className="very-small fw-bold">স্পেশাল ক্যাটাগরি</Form.Label>
                  <Form.Select size="sm" value={offerCategory} onChange={(e) => setOfferCategory(e.target.value)}>
                    <option value="regular product">Regular Product</option>
                    <option value="offer product">Offer Product</option>
                    <option value="hot deals">Hot Deals</option>
                    <option value="new arrival">New Arrival</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ভিডিও আপলোড */}
          <Card className="border-0 shadow-sm rounded-4 mb-4 border-start border-danger border-5">
            <Card.Body>
              <h6 className="fw-bold text-danger mb-3 small"><FaVideo className="me-2"/>প্রোডাক্ট ভিডিও</h6>
              <div className="d-flex gap-2">
                <Form.Control size="sm" placeholder="Paste link or upload" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                <Button variant="dark" size="sm" onClick={() => {
                  window.cloudinary.openUploadWidget({ cloudName: 'diao4zmtr', uploadPreset: 'gulfhut_preset', resourceType: 'video' }, 
                  (err, res) => { if (!err && res.event === 'success') setVideoUrl(res.info.secure_url) }).open();
                }}><FaCloudUploadAlt /></Button>
              </div>
            </Card.Body>
          </Card>

          {/* ভ্যারিয়েন্ট সিলেকশন */}
          <Card className="mb-4 border-0 shadow-sm rounded-4 border-start border-primary border-5">
            <Card.Body>
              <h6 className="fw-bold text-primary mb-3 small"><FaBoxOpen className="me-2"/>ভ্যারিয়েন্ট সেটিংস</h6>
              {variants.map((v, index) => (
                <Row key={index} className="g-2 mb-2 bg-light p-2 rounded align-items-center">
                  <Col xs={4}>
                    <Form.Control size="sm" placeholder="Color" value={v.color} onChange={(e) => { const n = [...variants]; n[index].color = e.target.value; setVariants(n); }} />
                  </Col>
                  <Col xs={3}>
                    <Form.Control size="sm" placeholder="Size" value={v.size} onChange={(e) => { const n = [...variants]; n[index].size = e.target.value; setVariants(n); }} />
                  </Col>
                  <Col xs={3}>
                    <Form.Control size="sm" type="number" placeholder="Stock" value={v.stock} onChange={(e) => { const n = [...variants]; n[index].stock = Number(e.target.value); setVariants(n); }} />
                  </Col>
                  <Col xs={2} className="text-center">
                    <FaTrash className="text-danger" onClick={() => setVariants(variants.filter((_, i) => i !== index))} style={{cursor:'pointer'}}/>
                  </Col>
                </Row>
              ))}
              <Button variant="dark" size="sm" className="w-100 mt-2 rounded-pill" onClick={() => setVariants([...variants, {color:'', size:'', stock: 0}])}>
                + Add Variant
              </Button>
            </Card.Body>
          </Card>

          {/* প্রাইসিং ও আদার সেটিংস */}
          <Card className="border-0 shadow-sm rounded-4 mb-5">
            <Card.Body>
              <Row className="g-2 mb-3">
                <Col xs={4}><Form.Label className="very-small fw-bold">ইউনিট</Form.Label><Form.Control size="sm" value={priceLabel} onChange={(e) => setPriceLabel(e.target.value)} /></Col>
                <Col xs={4}><Form.Label className="very-small fw-bold">দাম (QR)</Form.Label><Form.Control size="sm" type="number" value={priceQR} onChange={(e) => handlePriceQRChange(e.target.value)} /></Col>
                <Col xs={4}><Form.Label className="very-small fw-bold">দাম (BDT)</Form.Label><Form.Control size="sm" value={priceBDT} disabled className="bg-white text-success fw-bold" /></Col>
              </Row>
              <Row className="g-2 mb-3">
                <Col xs={6}><Form.Label className="very-small fw-bold">ব্র্যান্ড</Form.Label><Form.Control size="sm" value={brand} onChange={(e) => setBrand(e.target.value)} /></Col>
                <Col xs={6}><Form.Label className="very-small fw-bold">শিপিং টাইম</Form.Label><Form.Control size="sm" value={shippingTime} onChange={(e) => setShippingTime(e.target.value)} /></Col>
              </Row>
              <Row className="g-2 mb-3">
                <Col xs={6}>
                  <Form.Check type="switch" label="Offer On" checked={isOfferOn} onChange={(e) => setIsOfferOn(e.target.checked)} />
                  {isOfferOn && <Form.Control size="sm" className="mt-1" placeholder="Ex: 20% OFF" value={offerText} onChange={(e) => setOfferText(e.target.value)} />}
                </Col>
                <Col xs={6}>
                  <Form.Check type="switch" label="Baz Text On" checked={isBazOn} onChange={(e) => setIsBazOn(e.target.checked)} />
                  {isBazOn && <Form.Control size="sm" className="mt-1" value={bazText} onChange={(e) => setBazText(e.target.value)} />}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ফিক্সড বটম সেভ বাটন */}
          <div className="fixed-bottom p-3 bg-white border-top shadow-lg">
            <Button type="submit" variant="primary" className="w-100 py-3 rounded-pill fw-bold" disabled={loadingUpdate}>
              {loadingUpdate ? <Spinner size="sm"/> : 'সব আপডেট সেভ করুন'}
            </Button>
          </div>
        </Form>
      )}

      {/* ইমেজ আপলোড মোডাল */}
      <Modal show={showImgModal} onHide={() => setShowImgModal(false)} centered>
        <Modal.Body>
          <MediaUpload onUploadSuccess={(url) => setTempImgUrl(url)} />
          <Button className="w-100 mt-3 rounded-pill" onClick={() => { if(tempImgUrl) { setImages([...images, {url: tempImgUrl}]); setShowImgModal(false); setTempImgUrl(''); } }} disabled={!tempImgUrl}>
            Save to Gallery
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductEditScreen;