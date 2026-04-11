import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col, Container, Card, Badge, Modal, Spinner } from 'react-bootstrap';
// সব প্রয়োজনীয় আইকন ইম্পোর্ট করা হয়েছে যাতে আর এরর না আসে
import { 
  FaTrash, FaPlus, FaSave, FaChevronLeft, FaLayerGroup, 
  FaImage, FaVideo, FaBox, FaFileUpload, FaCloudUploadAlt, 
  FaMagic, FaCheckCircle 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from '../../slices/productsApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const ProductEditScreen = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  // --- তোর অরিজিনাল সব স্টেট (বিন্দুমাত্র কমানো হয়নি) ---
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

  // মোডাল ও আপলোড স্টেট
  const [showImgModal, setShowImgModal] = useState(false);
  const [isVariant, setIsVariant] = useState(false);
  const [uploadType, setUploadType] = useState('file'); 
  const [tempImgUrl, setTempImgUrl] = useState('');
  const [tempVariant, setTempVariant] = useState({ size: '', color: '', stock: 0, vSuffix: '' });

  const { data: product, isLoading, error, refetch } = useGetProductDetailsQuery(productId);
  const [updateProduct, { isLoading: loadingUpdate }] = useUpdateProductMutation();
  const [uploadProductImage, { isLoading: loadingUpload }] = useUploadProductImageMutation();

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setPCode(product.pCode || product._id || productId); 
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
    }
  }, [product, productId]);

  const generateUniqueCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const date = new Date();
    const code = `QH-${date.getDate()}${date.getMonth() + 1}-${randomNum}`;
    setPCode(code);
    toast.success('Unique code generated!');
  };

  const handlePriceQRChange = (val) => {
    const qr = Number(val);
    setPriceQR(qr);
    setPriceBDT(qr * 32); 
  };

  // ১. ইমেজ ডিলিট করার ফাংশন
  const deleteImage = (index) => {
    if (window.confirm('আপনি কি ইমেজটি ডিলিট করতে চান?')) {
      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);
      if (activeImgIdx >= updatedImages.length) {
        setActiveImgIdx(0);
      }
      toast.info('ইমেজ সরানো হয়েছে');
    }
  };

  // ২. ফাইল আপলোড হ্যান্ডলার (Browser থেকে ফাইল আপলোড ফিক্স)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    
    // আপলোড হওয়ার আগে লোকাল প্রিভিউ দেখানোর জন্য (ঐচ্ছিক)
    const objectUrl = URL.createObjectURL(file);
    setTempImgUrl(objectUrl);

    try {
      const res = await uploadProductImage(formData).unwrap();
      setTempImgUrl(res.image); // সার্ভার থেকে পাওয়া ফাইনাল লিঙ্ক
      toast.success('মিডিয়া আপলোড হয়েছে!');
    } catch (err) {
      toast.error('আপলোড ব্যর্থ! ফাইল সাইজ বা পারমিশন চেক কর।');
      setTempImgUrl('');
    }
  };

  // ৩. মোডাল থেকে ডাটা লিস্টে যোগ করা
  const addImageToProduct = () => {
    if (!tempImgUrl) return toast.error('ইমেজ সোর্স প্রয়োজন');
    
    const imageSuffix = tempVariant.vSuffix ? `${pCode}-${tempVariant.vSuffix}` : `${pCode}-${String.fromCharCode(97 + images.length)}`;
    const newImg = { 
      url: tempImgUrl, 
      isMain: images.length === 0, 
      imageCode: imageSuffix,
      variants: isVariant ? [{ 
        size: tempVariant.size, 
        color: tempVariant.color, 
        stock: Number(tempVariant.stock) 
      }] : [{ size: '', color: '', stock: 0 }]
    };
    
    setImages([...images, newImg]);
    setActiveImgIdx(images.length);
    setShowImgModal(false);
    setTempImgUrl('');
    setIsVariant(false);
    setTempVariant({ size: '', color: '', stock: 0, vSuffix: '' });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const mainImageUrl = images?.find(img => img.isMain)?.url || (images?.[0]?.url || '');
      await updateProduct({
        productId, name, pCode, category, offerCategory, description, videoUrl,
        priceLabel, priceQR, priceBDT, offerText, isOfferOn, bazText, isBazOn,
        images, image: mainImageUrl, brand, countInStock, shippingTime
      }).unwrap();
      toast.success('Product Updated!');
      refetch();
      navigate('/admin/productlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Container fluid className="p-0 bg-light min-vh-100">
      {/* টপ বার */}
      <div className="bg-dark text-white p-3 d-flex align-items-center sticky-top shadow" style={{zIndex: 1000}}>
        <FaChevronLeft onClick={() => navigate('/admin/productlist')} className="me-3" style={{cursor: 'pointer'}} />
        <h6 className="mb-0 text-truncate">এডিট: {pCode || 'পণ্য'}</h6>
      </div>

      {isLoading ? <Loader /> : error ? <Message variant='danger'>{error?.data?.message || error.error}</Message> : (
        <Form onSubmit={submitHandler}>
          <div className="pb-5 px-3">
            
            {/* মেইন মিডিয়া ডিসপ্লে কার্ড */}
            <Card className="mb-4 border-0 shadow-sm rounded-4 overflow-hidden mt-3 text-center">
              <div className="position-relative bg-white" style={{ height: '320px' }}>
                {images?.[activeImgIdx] ? (
                  <img src={images[activeImgIdx]?.url} className="w-100 h-100 object-fit-contain p-2" alt="product" />
                ) : <div className="h-100 d-flex align-items-center justify-content-center bg-light text-muted">ইমেজ নেই</div>}
                
                <div className="position-absolute top-0 start-0 m-2">
                  {isBazOn && <Badge bg="danger" className="p-2 shadow">{bazText}</Badge>}
                  {isOfferOn && <Badge bg="warning" text="dark" className="p-2 shadow ms-1">{offerText}</Badge>}
                </div>
                
                <Button variant="danger" size="sm" className="position-absolute bottom-0 start-0 m-2 shadow" onClick={() => deleteImage(activeImgIdx)}><FaTrash/></Button>
              </div>
              
              {/* থাম্বনেইল লিস্ট */}
              <div className="d-flex gap-2 p-3 overflow-auto bg-light border-top">
                {images?.map((img, i) => (
                  <div key={i} className="position-relative">
                    <img src={img.url} className={`rounded border-2 ${i === activeImgIdx ? 'border-primary shadow' : 'border-white'}`} style={{ width: '60px', height: '60px', cursor: 'pointer', objectFit: 'cover' }} onClick={() => setActiveImgIdx(i)} />
                    {img.isMain && <FaCheckCircle className="position-absolute top-0 end-0 text-primary bg-white rounded-circle" style={{marginTop: '-5px', marginRight: '-5px'}} />}
                  </div>
                ))}
                <Button variant="outline-primary" style={{ minWidth: '60px', height: '60px' }} onClick={() => setShowImgModal(true)}><FaPlus /></Button>
              </div>
            </Card>

            {/* ভ্যারিয়েন্ট সেটিংস */}
            <Card className="mb-3 border-0 shadow-sm rounded-4 border-start border-primary border-5">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0 text-primary small"><FaImage className="me-1"/> ভ্যারিয়েন্ট তথ্য (Active Image)</h6>
                  <Button size="sm" variant={images?.[activeImgIdx]?.isMain ? "success" : "outline-secondary"} onClick={() => setImages(images.map((img, idx) => ({ ...img, isMain: idx === activeImgIdx })))} disabled={!images?.[activeImgIdx]}> {images?.[activeImgIdx]?.isMain ? 'Main ✅' : 'Set as Main'} </Button>
                </div>
                {images?.[activeImgIdx]?.variants?.map((v, vIdx) => (
                  <Row key={vIdx} className="g-1 mb-2 align-items-center bg-light p-2 rounded">
                    <Col xs={4}><Form.Control size="sm" placeholder="Color" value={v.color} onChange={(e) => { const u = [...images]; u[activeImgIdx].variants[vIdx].color = e.target.value; setImages(u); }} /></Col>
                    <Col xs={4}><Form.Control size="sm" placeholder="Size" value={v.size} onChange={(e) => { const u = [...images]; u[activeImgIdx].variants[vIdx].size = e.target.value; setImages(u); }} /></Col>
                    <Col xs={3}><Form.Control size="sm" type="number" value={v.stock} onChange={(e) => { const u = [...images]; u[activeImgIdx].variants[vIdx].stock = e.target.value; setImages(u); }} /></Col>
                    <Col xs={1} className="text-center pt-3"><FaTrash className="text-danger" style={{cursor:'pointer'}} onClick={() => { const u = [...images]; u[activeImgIdx].variants.splice(vIdx, 1); setImages(u); }} /></Col>
                  </Row>
                ))}
                <Button variant="dark" size="sm" className="w-100 mt-2 rounded-pill" onClick={() => { const u = [...images]; if(u[activeImgIdx]) { u[activeImgIdx].variants.push({ size: '', color: '', stock: 0 }); setImages(u); } }}>+ ভ্যারিয়েন্ট যোগ করুন</Button>
              </Card.Body>
            </Card>

            {/* বেসিক ইনফরমেশন */}
            <Card className="border-0 shadow-sm rounded-4 mb-4">
              <Card.Body>
                <h6 className="fw-bold mb-3 text-primary"><FaLayerGroup className="me-2"/> বেসিক ইনফরমেশন</h6>
                
                <Form.Label className="small fw-bold text-success">অফার ক্যাটাগরি (Offer Category)</Form.Label>
                <Form.Select size="sm" value={offerCategory} onChange={(e) => setOfferCategory(e.target.value)} className="mb-3">
                    <option value="offer product">Offer Product</option>
                    <option value="regular product">Regular Product</option>
                    <option value="hot deals">Hot Deals</option>
                </Form.Select>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">প্রোডাক্ট নাম</Form.Label>
                  <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
                </Form.Group>

                <Row className="g-3">
                  <Col xs={12}>
                    <Form.Label className="small fw-bold">কোড</Form.Label>
                    <div className="d-flex gap-1">
                      <Form.Control size="sm" value={pCode} onChange={(e) => setPCode(e.target.value)} />
                      <Button variant="dark" size="sm" onClick={generateUniqueCode}><FaMagic /></Button>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <Form.Label className="small fw-bold">ক্যাটাগরি</Form.Label>
                    <Form.Control size="sm" value={category} onChange={(e) => setCategory(e.target.value)} />
                  </Col>
                  <Col xs={6}>
                    <Form.Label className="small fw-bold">ব্র্যান্ড</Form.Label>
                    <Form.Control size="sm" value={brand} onChange={(e) => setBrand(e.target.value)} />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* মূল্য ও স্টক */}
            <Card className="border-0 shadow-sm rounded-4 mb-4">
              <Card.Body>
                <Row className="g-3 mb-3">
                  <Col xs={4}><Form.Label className="very-small fw-bold">ইউনিট (pcs)</Form.Label><Form.Control size="sm" value={priceLabel} onChange={(e) => setPriceLabel(e.target.value)} /></Col>
                  <Col xs={4}><Form.Label className="very-small fw-bold">দাম (QR)</Form.Label><Form.Control size="sm" type="number" value={priceQR} onChange={(e) => handlePriceQRChange(e.target.value)} /></Col>
                  <Col xs={4}><Form.Label className="very-small fw-bold">দাম (BDT)</Form.Label><Form.Control size="sm" value={priceBDT} disabled className="bg-white fw-bold text-success" /></Col>
                </Row>
                <Form.Group className="mb-3">
                    <Form.Check type="switch" label="অফার অন করবেন?" checked={isOfferOn} onChange={(e) => setIsOfferOn(e.target.checked)} />
                    {isOfferOn && <Form.Control size="sm" placeholder="e.g. 20% OFF" value={offerText} onChange={(e) => setOfferText(e.target.value)} className="mt-1" />}
                </Form.Group>
                <Form.Group>
                    <Form.Check type="switch" label=" Baz Text অন করবেন?" checked={isBazOn} onChange={(e) => setIsBazOn(e.target.checked)} />
                    {isBazOn && <Form.Control size="sm" value={bazText} onChange={(e) => setBazText(e.target.value)} className="mt-1" />}
                </Form.Group>
              </Card.Body>
            </Card>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold"><FaVideo className="me-1"/> ভিডিও URL (YouTube/Drive)</Form.Label>
              <Form.Control size="sm" placeholder="ভিডিও লিঙ্ক এখানে দিন" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
            </Form.Group>
            
            <Form.Group className="mb-5">
              <Form.Label className="fw-bold">ডেসক্রিপশন</Form.Label>
              <Form.Control as="textarea" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white border-0 shadow-sm" />
            </Form.Group>
          </div>

          {/* সেভ বাটন (নিচে ফিক্সড) */}
          <div className="fixed-bottom p-3 bg-white border-top shadow-lg" style={{zIndex: 1000}}>
            <Button type="submit" variant="primary" className="w-100 py-3 rounded-pill fw-bold" disabled={loadingUpdate}>
              {loadingUpdate ? <Spinner size="sm" /> : <><FaSave className="me-2" /> প্রোডাক্ট আপডেট করুন</>}
            </Button>
          </div>
        </Form>
      )}

      {/* মিডিয়া আপলোড মোডাল */}
      <Modal show={showImgModal} onHide={() => setShowImgModal(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fs-6 fw-bold text-uppercase">মিডিয়া যোগ করুন</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3 text-center">
            <div className="d-flex gap-3 justify-content-center mb-2">
              <Form.Check type="radio" label="Upload File" checked={uploadType === 'file'} onChange={() => setUploadType('file')} />
              <Form.Check type="radio" label="Image URL" checked={uploadType === 'url'} onChange={() => setUploadType('url')} />
            </div>
            
            {uploadType === 'file' ? (
              <div className="border border-dashed p-4 rounded-4 bg-light text-center shadow-sm">
                {loadingUpload ? <Spinner animation="border" size="sm" /> : (
                  <>
                    <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="d-none" id="fileEditInp" />
                    <label htmlFor="fileEditInp" style={{ cursor: 'pointer' }}>
                      <FaCloudUploadAlt size={45} className="text-primary mb-2" />
                      <p className="small mb-0">গ্যালারি থেকে ছবি বা ভিডিও সিলেক্ট কর</p>
                    </label>
                  </>
                )}
              </div>
            ) : <Form.Control placeholder="অনলাইন ইমেজ লিঙ্ক দিন" value={tempImgUrl} onChange={(e) => setTempImgUrl(e.target.value)} />}
          </Form.Group>

          <Form.Check type="switch" label="ভ্যারিয়েন্ট যোগ করবেন?" className="my-3 fw-bold text-primary" checked={isVariant} onChange={(e) => setIsVariant(e.target.checked)} />
          {isVariant && (
            <Row className="g-2 bg-light p-2 rounded">
              <Col xs={12} className="mb-1"><Form.Control size="sm" placeholder="e.g. 'a'" onChange={(e) => setTempVariant({...tempVariant, vSuffix: e.target.value})} /></Col>
              <Col xs={6}><Form.Control size="sm" placeholder="Color" onChange={(e) => setTempVariant({...tempVariant, color: e.target.value})} /></Col>
              <Col xs={6}><Form.Control size="sm" placeholder="Size" onChange={(e) => setTempVariant({...tempVariant, size: e.target.value})} /></Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" className="w-100 rounded-pill fw-bold" onClick={addImageToProduct} disabled={!tempImgUrl}>ইমেজ সেভ করুন</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductEditScreen;