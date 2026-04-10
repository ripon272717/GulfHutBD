import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col, Container, Card, Badge, Modal, Spinner } from 'react-bootstrap';
import { FaTrash, FaPlus, FaSave, FaChevronLeft, FaLayerGroup, FaCheckCircle, FaTag, FaImage, FaVideo, FaMagic, FaBox, FaFileUpload, FaCloudUploadAlt } from 'react-icons/fa';
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

  // তোর অরিজিনাল সব স্টেট (বিন্দু পরিমাণ কমানো হয়নি)
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

  const handlePriceQRChange = (val) => {
    const qr = Number(val);
    setPriceQR(qr);
    setPriceBDT(qr * 32); 
  };

  const handleFileChange = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      setTempImgUrl(res.image);
      toast.success('Image Uploaded Successfully!');
    } catch (err) {
      toast.error('Server Upload Failed (500 Error)');
    }
  };

  const saveImageHandler = () => {
    if (!tempImgUrl) return toast.error('ইমেজ সোর্স দরকার');
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
      <div className="bg-dark text-white p-3 d-flex align-items-center sticky-top shadow">
        <FaChevronLeft onClick={() => navigate('/admin/productlist')} className="me-3" style={{cursor: 'pointer'}} />
        <h6 className="mb-0">এডিট প্রোডাক্ট: {pCode}</h6>
      </div>

      {isLoading ? <Loader /> : error ? <Message variant='danger'>Database Timeout Error! Check MongoDB Access.</Message> : (
        <Form onSubmit={submitHandler} className="pb-5">
          <Container className="mt-3">
            {/* ইমেজ সেকশন - তোর ডিজাইনের মতো বড় কার্ড */}
            <Card className="mb-3 text-center p-2 shadow-sm border-0">
               <div className="position-relative" style={{ height: '320px' }}>
                {images?.[activeImgIdx] && <img src={images[activeImgIdx]?.url} className="h-100 w-100 object-fit-contain" alt="product" />}
                <div className="position-absolute top-0 start-0 m-2">
                  {isBazOn && <Badge bg="danger" className="p-2 shadow">{bazText}</Badge>}
                  {isOfferOn && <Badge bg="warning" text="dark" className="p-2 shadow ms-1">{offerText}</Badge>}
                </div>
               </div>
               <div className="d-flex gap-2 mt-3 overflow-auto border-top pt-2">
                 {images?.map((img, i) => (
                   <img key={i} src={img.url} className={`rounded border-2 ${i === activeImgIdx ? 'border-primary shadow' : 'border-white'}`} style={{ width: '65px', height: '65px', cursor: 'pointer', objectFit: 'cover' }} onClick={() => setActiveImgIdx(i)} />
                 ))}
                 <Button variant="outline-primary" style={{ minWidth: '65px', height: '65px' }} onClick={() => setShowImgModal(true)}><FaPlus /></Button>
               </div>
            </Card>

            {/* ভ্যারিয়েন্ট সেটিংস */}
            <Card className="mb-3 border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-bold mb-3 text-primary small"><FaImage className="me-1"/> ভ্যারিয়েন্ট তথ্য (Active Image)</h6>
                {images?.[activeImgIdx]?.variants?.map((v, vIdx) => (
                  <Row key={vIdx} className="g-1 mb-2 bg-light p-2 rounded mx-0">
                    <Col xs={4}><Form.Control size="sm" placeholder="Color" value={v.color} onChange={(e) => { const u = [...images]; u[activeImgIdx].variants[vIdx].color = e.target.value; setImages(u); }} /></Col>
                    <Col xs={4}><Form.Control size="sm" placeholder="Size" value={v.size} onChange={(e) => { const u = [...images]; u[activeImgIdx].variants[vIdx].size = e.target.value; setImages(u); }} /></Col>
                    <Col xs={4}><Form.Control size="sm" type="number" placeholder="Stock" value={v.stock} onChange={(e) => { const u = [...images]; u[activeImgIdx].variants[vIdx].stock = e.target.value; setImages(u); }} /></Col>
                  </Row>
                ))}
              </Card.Body>
            </Card>

            {/* বেসিক ইনফরমেশন কার্ড */}
            <Card className="mb-3 border-0 shadow-sm rounded-4">
              <Card.Body>
                <h6 className="fw-bold mb-3 text-dark small"><FaLayerGroup className="me-2"/> বেসিক ইনফরমেশন</h6>
                
                <Form.Label className="small fw-bold text-success">অফার ক্যাটাগরি (Offer Category)</Form.Label>
                <Form.Select size="sm" value={offerCategory} onChange={(e) => setOfferCategory(e.target.value)} className="mb-3">
                  <option value="offer product">Offer Product</option>
                  <option value="regular product">Regular Product</option>
                  <option value="best selling">Best Selling</option>
                  <option value="new arrival">New Arrival</option>
                </Form.Select>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">প্রোডাক্ট নাম</Form.Label>
                  <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
                </Form.Group>

                <Row className="g-2">
                    <Col xs={6}><Form.Label className="small fw-bold">প্রাইস (QR)</Form.Label><Form.Control size="sm" type="number" value={priceQR} onChange={(e) => handlePriceQRChange(e.target.value)} /></Col>
                    <Col xs={6}><Form.Label className="small fw-bold">প্রাইস (BDT)</Form.Label><Form.Control size="sm" value={Math.round(priceBDT)} disabled className="bg-white fw-bold text-success border-0" /></Col>
                </Row>
              </Card.Body>
            </Card>

            <Form.Group className="mb-5">
              <Form.Label className="small fw-bold text-muted">ডেসক্রিপশন</Form.Label>
              <Form.Control as="textarea" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white border-0 shadow-sm" />
            </Form.Group>
          </Container>

          <div className="fixed-bottom bg-white p-3 border-top shadow-lg">
            <Button type="submit" variant="primary" className="w-100 py-3 rounded-pill fw-bold fs-5" disabled={loadingUpdate}>
              {loadingUpdate ? <Spinner size="sm" /> : 'আপডেট সেভ করুন'}
            </Button>
          </div>
        </Form>
      )}

      {/* ইমেজ আপলোড মোডাল */}
      <Modal show={showImgModal} onHide={() => setShowImgModal(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fs-6 fw-bold">ইমেজ আপলোড</Modal.Title></Modal.Header>
        <Modal.Body>
           <div className="border rounded p-4 text-center bg-light shadow-sm">
              {loadingUpload ? <Spinner animation="border" size="sm" /> : (
                <>
                  <FaFileUpload className="fs-2 text-primary mb-2" />
                  <Form.Control type="file" onChange={handleFileChange} />
                </>
              )}
           </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" className="w-100 fw-bold" onClick={saveImageHandler} disabled={!tempImgUrl}>ইমেজ সেভ করুন</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductEditScreen;