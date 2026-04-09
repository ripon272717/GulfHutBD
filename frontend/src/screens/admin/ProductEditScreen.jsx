import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col, Container, Card, Badge, Modal, Spinner } from 'react-bootstrap';
import { FaTrash, FaPlus, FaSave, FaChevronLeft, FaLayerGroup, FaCheckCircle, FaTag, FaImage, FaVideo, FaMagic, FaBox, FaPlayCircle, FaLink, FaFileUpload, FaCloudUploadAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from '../../slices/productsApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { CATEGORIES } from '../../constants';

const ProductEditScreen = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  // --- তোর অরিজিনাল সব স্টেট (বিন্দু পরিমাণ কমেনি) ---
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

  // --- নতুন লজিক স্টেট (Modal & Upload) ---
  const [showImgModal, setShowImgModal] = useState(false);
  const [isVariant, setIsVariant] = useState(false);
  const [uploadType, setUploadType] = useState('file'); 
  const [tempImgUrl, setTempImgUrl] = useState('');
  const [tempVariant, setTempVariant] = useState({ size: '', color: '', stock: 0, vSuffix: '' });
  const [isVideoUploading, setIsVideoUploading] = useState(false);

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
    toast.success('ইউনিক কোড তৈরি হয়েছে!');
  };

  const handlePriceQRChange = (val) => {
    const qr = Number(val);
    setPriceQR(qr);
    setPriceBDT(qr * 32); 
  };

  // --- ফাইল আপলোড লজিক (ইমেজ) ---
  const handleFileChange = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      setTempImgUrl(res.image);
      toast.success('ফাইল আপলোড সফল!');
    } catch (err) {
      toast.error('আপলোড ব্যর্থ');
    }
  };

  // --- ভিডিও আপলোড লজিক ---
  const uploadVideoHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file); 
    setIsVideoUploading(true);
    try {
      const res = await uploadProductImage(formData).unwrap();
      setVideoUrl(res.image);
      toast.success('ভিডিও ফাইল আপলোড সফল!');
    } catch (err) {
      toast.error('ভিডিও আপলোড ব্যর্থ!');
    } finally {
      setIsVideoUploading(false);
    }
  };

  const saveImageHandler = () => {
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
    resetTempState();
  };

  const resetTempState = () => {
    setTempImgUrl('');
    setUploadType('file');
    setIsVariant(false);
    setTempVariant({ size: '', color: '', stock: 0, vSuffix: '' });
  };

  const deleteImage = (idx) => {
    if (images.length <= 1) return toast.error('কমপক্ষে একটি ছবি থাকতে হবে');
    const updatedImages = images.filter((_, i) => i !== idx);
    if (images[idx].isMain && updatedImages.length > 0) updatedImages[0].isMain = true;
    setImages(updatedImages);
    setActiveImgIdx(0);
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
      toast.success('সফলভাবে আপডেট হয়েছে!');
      refetch();
      navigate('/admin/productlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Container fluid className="p-0 bg-light min-vh-100" style={{ overflowX: 'hidden' }}>
      <div className="bg-dark text-white p-3 d-flex align-items-center sticky-top shadow" style={{ zIndex: 1100 }}>
        <FaChevronLeft onClick={() => navigate('/admin/productlist')} className="me-3" style={{cursor: 'pointer'}} />
        <h6 className="mb-0 text-truncate">এডিট: {pCode || 'পণ্য লোড হচ্ছে...'}</h6>
      </div>

      {isLoading ? <Loader /> : error ? <Message variant='danger'>{error?.data?.message || error.error}</Message> : (
        <Form onSubmit={submitHandler}>
          <div style={{ height: 'calc(100vh - 140px)', overflowY: 'auto', paddingBottom: '100px' }} className="custom-scrollbar">
            
            {/* ১. ইমেজ সেকশন */}
            <div className="bg-white border-bottom mb-3 text-center">
              <div className="position-relative bg-white" style={{ height: '320px' }}>
                {images?.[activeImgIdx] && (
                  <img src={images[activeImgIdx]?.url} className="w-100 h-100 object-fit-contain p-2" alt="product" />
                )}
                <div className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-2" style={{zIndex: 10}}>
                  {isBazOn && <Badge bg="danger" className="shadow p-2">{bazText}</Badge>}
                  {isOfferOn && <Badge bg="warning" text="dark" className="shadow p-2">{offerText}</Badge>}
                </div>
                <Button variant="danger" size="sm" className="position-absolute bottom-0 start-0 m-2 shadow" onClick={() => deleteImage(activeImgIdx)}>
                  <FaTrash />
                </Button>
              </div>

              {/* থাম্বনেইল লিস্ট */}
              <div className="d-flex gap-2 p-3 overflow-auto bg-light border-top border-bottom">
                {images?.map((img, i) => (
                  <div key={i} className="position-relative flex-shrink-0">
                    <img 
                      src={img?.url} 
                      className={`rounded border-2 ${i === activeImgIdx ? 'border-primary shadow' : 'border-white'}`} 
                      style={{ width: '65px', height: '65px', objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => setActiveImgIdx(i)}
                    />
                    {img.isMain && <FaCheckCircle className="position-absolute top-0 start-0 text-primary bg-white rounded-circle" style={{fontSize: '14px', marginTop: '-4px'}} />}
                  </div>
                ))}
                <div 
                    className="border-dashed rounded d-flex align-items-center justify-content-center bg-white" 
                    style={{ width: '65px', height: '65px', cursor: 'pointer', border: '2px dashed #0d6efd' }}
                    onClick={() => setShowImgModal(true)}
                >
                  <FaPlus className="text-primary" />
                </div>
              </div>

              {/* ইমেজ ভ্যারিয়েন্ট এডিটর */}
              <div className="p-3 text-start">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="fw-bold small text-muted"><FaImage className="me-1"/> ভ্যারিয়েন্ট সেটিংস ({activeImgIdx + 1})</label>
                  <Button size="sm" variant={images?.[activeImgIdx]?.isMain ? "success" : "outline-primary"} onClick={() => setImages(images.map((img, idx) => ({ ...img, isMain: idx === activeImgIdx })))}> {images?.[activeImgIdx]?.isMain ? 'Main ✅' : 'Set Main'} </Button>
                </div>
                <Card className="bg-light border-0 rounded-3 shadow-sm mb-3">
                  <Card.Body className="p-2">
                    {images?.[activeImgIdx]?.variants?.map((v, vIdx) => (
                      <Row key={vIdx} className="g-1 mb-2 align-items-center border-bottom pb-2 mx-0">
                        <Col xs={4}><Form.Label className="very-small fw-bold mb-0">কালার</Form.Label><Form.Control size="sm" value={v.color} onChange={(e) => { const u = [...images]; u[activeImgIdx].variants[vIdx].color = e.target.value; setImages(u); }} /></Col>
                        <Col xs={4}><Form.Label className="very-small fw-bold mb-0">সাইজ</Form.Label><Form.Control size="sm" value={v.size} onChange={(e) => { const u = [...images]; u[activeImgIdx].variants[vIdx].size = e.target.value; setImages(u); }} /></Col>
                        <Col xs={3}><Form.Label className="very-small fw-bold mb-0">স্টক</Form.Label><Form.Control size="sm" type="number" value={v.stock} onChange={(e) => { const u = [...images]; u[activeImgIdx].variants[vIdx].stock = e.target.value; setImages(u); }} /></Col>
                        <Col xs={1} className="text-center pt-3"><FaTrash className="text-danger" onClick={() => { const u = [...images]; u[activeImgIdx].variants.splice(vIdx, 1); setImages(u); }} /></Col>
                      </Row>
                    ))}
                    <Button variant="dark" size="sm" className="w-100 mt-1 rounded-pill" onClick={() => { const u = [...images]; if(u[activeImgIdx]) { u[activeImgIdx].variants.push({ size: '', color: '', stock: 0 }); setImages(u); } }}>+ ভ্যারিয়েন্ট যোগ</Button>
                  </Card.Body>
                </Card>

                <div className="bg-white p-3 rounded border shadow-sm border-start border-danger border-5">
                  <Form.Label className="small fw-bold text-danger mb-1"><FaVideo className="me-1"/> প্রোডাক্ট ভিডিও লিঙ্ক</Form.Label>
                  <Form.Control size="sm" placeholder="URL দিন" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="mb-2" />
                  <label className="btn btn-outline-danger btn-sm w-100 rounded-pill d-flex align-items-center justify-content-center">
                    {isVideoUploading ? <Spinner size="sm" className="me-2" /> : <FaCloudUploadAlt className="me-2" />}
                    {isVideoUploading ? 'ভিডিও আপলোড হচ্ছে...' : 'সরাসরি ভিডিও ফাইল আপলোড'}
                    <input type="file" accept="video/*" hidden onChange={uploadVideoHandler} />
                  </label>
                </div>
              </div>
            </div>

            <Container>
              {/* ২. ব্যাকএন্ড রিকোয়ার্ড ফিল্ডস */}
              <Card className="border-0 shadow-sm mb-3 rounded-4 border-start border-info border-5">
                <Card.Body>
                  <h6 className="fw-bold mb-3 text-info small text-uppercase"><FaBox className="me-2"/> স্টক ও শিপিং</h6>
                  <Row className="g-2">
                    <Col xs={6}>
                      <Form.Label className="small fw-bold">ব্র্যান্ড</Form.Label>
                      <Form.Control size="sm" value={brand} onChange={(e) => setBrand(e.target.value)} required />
                    </Col>
                    <Col xs={6}>
                      <Form.Label className="small fw-bold">শিপিং সময়</Form.Label>
                      <Form.Control size="sm" placeholder="৩-৫ দিন" value={shippingTime} onChange={(e) => setShippingTime(e.target.value)} required />
                    </Col>
                    <Col xs={12} className="mt-2">
                      <Form.Label className="small fw-bold">মোট স্টক</Form.Label>
                      <Form.Control size="sm" type="number" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* ৩. বেসিক ইনফরমেশন (এখানেই তোর Offer Category ফিরিয়ে দেওয়া হয়েছে) */}
              <Card className="border-0 shadow-sm mb-3 rounded-4">
                <Card.Body>
                  <h6 className="fw-bold mb-3 text-primary small"><FaLayerGroup className="me-2"/> বেসিক ইনফরমেশন</h6>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">প্রোডাক্ট নাম</Form.Label>
                    <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
                  </Form.Group>
                  <Row className="g-2 mb-3">
                    <Col xs={12} className="mb-2">
                      <Form.Label className="small fw-bold text-success">অফার ক্যাটাগরি</Form.Label>
                      <Form.Select size="sm" value={offerCategory} onChange={(e) => setOfferCategory(e.target.value)}>
                        <option value="offer product">Offer Product</option>
                        <option value="regular product">Regular Product</option>
                        <option value="best selling">Best Selling</option>
                        <option value="new arrival">New Arrival</option>
                      </Form.Select>
                    </Col>
                    <Col xs={7}>
                      <Form.Label className="small fw-bold">কোড</Form.Label>
                      <div className="d-flex gap-1">
                        <Form.Control size="sm" value={pCode} onChange={(e) => setPCode(e.target.value)} />
                        <Button variant="dark" size="sm" onClick={generateUniqueCode}><FaMagic /></Button>
                      </div>
                    </Col>
                    <Col xs={5}>
                      <Form.Label className="small fw-bold">ক্যাটাগরি</Form.Label>
                      <Form.Select size="sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                        {CATEGORIES?.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </Form.Select>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* ৪. প্রাইসিং সেকশন */}
              <Card className="border-0 shadow-sm mb-3 rounded-4">
                <Card.Body>
                  <h6 className="fw-bold mb-3 text-success small"><FaTag className="me-2"/> প্রাইসিং সেটিংস</h6>
                  <div className="text-center py-2 bg-light rounded border mb-3 shadow-sm border-success">
                    <strong className="fs-6 text-dark">Price : ({priceLabel})</strong>
                  </div>
                  <Row className="g-2">
                    <Col xs={4}>
                      <Form.Label className="small fw-bold">ইউনিট</Form.Label>
                      <Form.Control size="sm" value={priceLabel} onChange={(e) => setPriceLabel(e.target.value)} />
                    </Col>
                    <Col xs={4}>
                      <Form.Label className="small fw-bold">দাম (QR)</Form.Label>
                      <Form.Control size="sm" type="number" value={priceQR} onChange={(e) => handlePriceQRChange(e.target.value)} />
                    </Col>
                    <Col xs={4}>
                      <Form.Label className="small fw-bold">দাম (BDT)</Form.Label>
                      <Form.Control size="sm" value={Math.round(priceBDT)} disabled className="bg-white fw-bold text-success border-0" />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* ৫. অফার ও ব্যাজ */}
              <Card className="border-0 shadow-sm mb-3 rounded-4 border-start border-warning border-5">
                <Card.Body>
                  <div className="mb-3 d-flex justify-content-between align-items-center">
                    <Form.Label className="small fw-bold mb-0">অফার টেক্সট</Form.Label>
                    <Button size="sm" variant={isOfferOn ? "success" : "outline-secondary"} onClick={() => setIsOfferOn(!isOfferOn)}>{isOfferOn ? "ON" : "OFF"}</Button>
                  </div>
                  <Form.Control size="sm" value={offerText} onChange={(e) => setOfferText(e.target.value)} disabled={!isOfferOn} className="mb-3" />
                  <div className="d-flex justify-content-between align-items-center">
                    <Form.Label className="small fw-bold mb-0">ব্যাজ টেক্সট</Form.Label>
                    <Button size="sm" variant={isBazOn ? "danger" : "outline-secondary"} onClick={() => setIsBazOn(!isBazOn)}>{isBazOn ? "ON" : "OFF"}</Button>
                  </div>
                  <Form.Control size="sm" value={bazText} onChange={(e) => setBazText(e.target.value)} disabled={!isBazOn} />
                </Card.Body>
              </Card>

              {/* ৬. ডেসক্রিপশন */}
              <Card className="border-0 shadow-sm mb-5 rounded-4">
                <Card.Body>
                  <Form.Label className="small fw-bold text-muted text-uppercase">প্রোডাক্ট ডেসক্রিপশন</Form.Label>
                  <Form.Control as="textarea" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} className="bg-light" />
                </Card.Body>
              </Card>
            </Container>
          </div>

          <div className="fixed-bottom bg-white p-3 border-top shadow-lg" style={{zIndex: 1000}}>
            <Button type="submit" variant="primary" className="w-100 py-3 rounded-pill fw-bold fs-5 shadow" disabled={loadingUpdate}>
              {loadingUpdate ? <Loader size="sm" /> : <><FaSave className="me-2" /> আপডেট সেভ করুন</>}
            </Button>
          </div>
        </Form>
      )}

      {/* ইমেজ আপলোড মোডাল */}
      <Modal show={showImgModal} onHide={() => setShowImgModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">নতুন ইমেজ/ভ্যারিয়েন্ট যোগ করুন</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Image Source</Form.Label>
            <div className="d-flex gap-3">
              <Form.Check type="radio" label="File" name="src" checked={uploadType === 'file'} onChange={() => setUploadType('file')} />
              <Form.Check type="radio" label="URL" name="src" checked={uploadType === 'url'} onChange={() => setUploadType('url')} />
            </div>
          </Form.Group>

          {uploadType === 'file' ? (
            <Form.Group className="mb-3">
               <div className="border rounded p-3 text-center bg-light">
                  {loadingUpload ? <Spinner animation="border" size="sm" /> : (
                    <>
                      <FaFileUpload className="fs-3 text-primary mb-2" />
                      <Form.Control type="file" onChange={handleFileChange} />
                    </>
                  )}
               </div>
            </Form.Group>
          ) : (
            <Form.Group className="mb-3">
              <Form.Control placeholder="Paste image URL here" value={tempImgUrl} onChange={(e) => setTempImgUrl(e.target.value)} />
            </Form.Group>
          )}

          <Form.Check type="switch" label="Is it a Variant?" checked={isVariant} onChange={(e) => setIsVariant(e.target.checked)} className="mb-3 fw-bold text-primary" />

          {isVariant && (
            <div className="bg-light p-3 rounded border">
              <Row className="g-2">
                <Col xs={12} className="mb-2">
                  <Form.Label className="very-small fw-bold">Variant Suffix (e.g. 'a', 'b')</Form.Label>
                  <Form.Control size="sm" placeholder="a" onChange={(e) => setTempVariant({...tempVariant, vSuffix: e.target.value})} />
                </Col>
                <Col xs={6}><Form.Control size="sm" placeholder="Color" onChange={(e) => setTempVariant({...tempVariant, color: e.target.value})} /></Col>
                <Col xs={6}><Form.Control size="sm" placeholder="Size" onChange={(e) => setTempVariant({...tempVariant, size: e.target.value})} /></Col>
                <Col xs={12} className="mt-2"><Form.Control size="sm" type="number" placeholder="Stock" onChange={(e) => setTempVariant({...tempVariant, stock: e.target.value})} /></Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImgModal(false)}>বাতিল</Button>
          <Button variant="primary" onClick={saveImageHandler} disabled={!tempImgUrl}>ইমেজ সেভ করুন</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductEditScreen;