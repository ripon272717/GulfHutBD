import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col, Container, Card, Badge, Modal, Spinner } from 'react-bootstrap';
import { 
  FaTrash, FaPlus, FaSave, FaChevronLeft, FaVideo, FaCloudUploadAlt, 
  FaPalette, FaRulerCombined, FaTimes 
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

  // --- অপশনস ---
  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size', '28', '30', '32', '34', '36', '38', '40', '42'];
  const colorOptions = ['Red', 'Blue', 'Green', 'Black', 'White', 'Pink', 'Purple', 'Yellow', 'Orange', 'Brown', 'Gray', 'Maroon', 'Navy Blue', 'Golden', 'Silver', 'Nude', 'Skin'];
  const categoryList = ['Ladies Item', 'Bra', 'Panty', 'Electronics', 'Fashion', 'Gadgets', 'Home Decor', 'Health & Beauty', 'Groceries'];

  // --- Core States ---
  const [name, setName] = useState('');
  const [pCode, setPCode] = useState('');
  const [category, setCategory] = useState('');
  const [offerCategory, setOfferCategory] = useState('regular product');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isVideoFloating, setIsVideoFloating] = useState(true);
  const [priceQR, setPriceQR] = useState(0);
  const [priceBDT, setPriceBDT] = useState(0);
  const [offerPercentage, setOfferPercentage] = useState(0); // অফার পার্সেন্টেজ
  const [offerText, setOfferText] = useState('');
  const [isOfferOn, setIsOfferOn] = useState(false);
  const [bazText, setBazText] = useState('');
  const [isBazOn, setIsBazOn] = useState(false);
  const [shippingTime, setShippingTime] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [brand, setBrand] = useState('');
  
  // --- Media & Dynamic Variants State ---
  const [images, setImages] = useState([]); 
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [variants, setVariants] = useState([]); // অবজেক্ট ট্র্যাকিং এর জন্য

  const [showImgModal, setShowImgModal] = useState(false);
  const [tempImgUrl, setTempImgUrl] = useState('');

  const { data: product, isLoading, error, refetch } = useGetProductDetailsQuery(productId);
  const [updateProduct, { isLoading: loadingUpdate }] = useUpdateProductMutation();

  // ডাটাবেস থেকে প্রোডাক্টের তথ্য স্টেটে লোড করা
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setPCode(product.pCode || '');
      setCategory(product.category || '');
      setOfferCategory(product.offerCategory || 'regular product');
      setDescription(product.description || '');
      setVideoUrl(product.videoUrl || '');
      setIsVideoFloating(product.isVideoFloating ?? true);
      setPriceQR(product.priceQR || 0);
      setPriceBDT(product.priceBDT || 0);
      setOfferPercentage(product.offerPercentage || 0);
      setOfferText(product.offerText || '');
      setIsOfferOn(product.isOfferOn || false);
      setBazText(product.bazText || '');
      setIsBazOn(product.isBazOn || false);
      setImages(product.images || []);
      setShippingTime(product.shippingTime || '');
      setCountInStock(product.countInStock || 0);
      setBrand(product.brand || '');
      
      // ডাটাবেস থেকে আসা ভ্যারিয়েন্টগুলোর সাইজ ফর্ম্যাট স্ট্রিং অ্যারেতে রূপান্তর এডিট প্যানেলের সুবিধার জন্য
      if (product.variants && product.variants.length > 0) {
        const loadedVariants = product.variants.map((v) => ({
          vCode: v.vCode || `${product.pCode}-V`,
          color: v.color || '',
          image: v.image || '',
          countInStock: v.countInStock || 0,
          isSelfFeature: v.isSelfFeature ?? true,
          // sizes যদি অবজেক্ট অ্যারে হয়, তবে শুধু সাইজের নাম ফিল্টার করে নেওয়া
          sizes: Array.isArray(v.sizes) 
            ? v.sizes.map(s => typeof s === 'object' ? s.size : s) 
            : []
        }));
        setVariants(loadedVariants);
      } else {
        setVariants([]);
      }
    }
  }, [product]);

  // QR প্রাইস চেঞ্জ হলে অটো BDT ক্যালকুলেশন
  const handlePriceQRChange = (val) => {
    const qr = Number(val);
    setPriceQR(qr);
    setPriceBDT(qr * 32); 
  };

  // 💸 এডমিন প্যানেলে লাইভ অফার প্রাইস ক্যালকুলেশন (তুই যে ইমেজ দিয়েছিস সে অনুযায়ী)
  const calculatedDiscountedPrice = offerPercentage > 0 
    ? Math.round(priceBDT - (priceBDT * Number(offerPercentage) / 100))
    : priceBDT;

  // ইমেজে ক্লিক করলে সেই ইমেজের ভ্যারিয়েন্ট লোড বা নতুন ভ্যারিয়েন্ট তৈরি করার লজিক
  const handleImageClick = (idx) => {
    setActiveImgIdx(idx);
    const clickedUrl = images[idx]?.url;
    
    if (clickedUrl) {
      // চেক করা হচ্ছে এই ইমেজের কোনো ভ্যারিয়েন্ট অলরেডি ভ্যারিয়েন্ট লিস্টে আছে কিনা
      const exists = variants.find(v => v.image === clickedUrl);
      if (!exists) {
        // যদি না থাকে, তবে এই ইমেজের জন্য একটি ফ্রেশ অবজেক্ট স্ট্রাকচার তৈরি করা হচ্ছে
        setVariants(prev => [
          ...prev, 
          {
            vCode: `${pCode || 'PROD'}-V${prev.length + 1}`,
            color: '', 
            image: clickedUrl, 
            sizes: [], 
            countInStock: 0, 
            isSelfFeature: true
          }
        ]);
      }
    }
  };

  // ক্লিক করা নির্দিষ্ট ইমেজের কালার বা স্টক আপডেট করার হ্যান্ডলার
  const updateVariantDetails = (imgUrl, field, value) => {
    setVariants(prev => prev.map(v => 
      v.image === imgUrl ? { ...v, [field]: field === 'countInStock' ? Number(value) : value } : v
    ));
  };

  // ক্লিক করা নির্দিষ্ট ইমেজের সাইজ অন বা অফ (টগল) করার হ্যান্ডলার
  const toggleSize = (imgUrl, sizeName) => {
    setVariants(prev => prev.map(v => {
      if (v.image === imgUrl) {
        const currentSizes = v.sizes || [];
        const updatedSizes = currentSizes.includes(sizeName)
          ? currentSizes.filter(s => s !== sizeName) // অলরেডি থাকলে রিমুভ হবে
          : [...currentSizes, sizeName]; // না থাকলে অ্যাড হবে
        return { ...v, sizes: updatedSizes };
      }
      return v;
    }));
  };

  // ডাটাবেসে সাবমিট করার ফাইনাল হ্যান্ডলার
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      // 🛠️ মঙ্গুস ডাটাবেস এরর ফিক্সিং পার্ট: sizes-কে ব্যাকএন্ডের রিকোয়ার্ড অবজেক্ট অ্যারে স্ট্রাকচারে কনভার্ট করা
      const formattedVariants = variants.map(v => ({
        vCode: v.vCode || `${pCode}-V`,
        color: v.color,
        image: v.image,
        countInStock: Number(v.countInStock || 0),
        isSelfFeature: v.isSelfFeature,
        sizes: (v.sizes || []).map(sName => ({
          size: sName,
          stock: Number(v.countInStock || 0) // এই কালারের স্টকই সাইজের স্টক হিসেবে সেট হবে
        }))
      }));

      // টোটাল স্টক ক্যালকুলেশন (সব ভ্যারিয়েন্টের স্টকের যোগফল)
      const totalStock = formattedVariants.reduce((acc, curr) => acc + curr.countInStock, 0);

      const payload = {
        productId,
        name,
        pCode,
        category,
        offerCategory,
        description,
        videoUrl,
        isVideoFloating,
        priceQR: Number(priceQR),
        priceBDT: Number(priceBDT),
        offerPercentage: Number(offerPercentage), // অফার পার্সেন্টেজ সাবমিট
        offerText,
        isOfferOn,
        bazText,
        isBazOn,
        images,
        shippingTime,
        countInStock: totalStock > 0 ? totalStock : Number(countInStock), // অটো ম্যানেজড স্টক
        brand,
        variants: formattedVariants // সম্পূর্ণ ভ্যালিড ডাটা স্ট্রাকচার
      };

      await updateProduct(payload).unwrap();
      toast.success('সব ভ্যারিয়েন্ট ও অফার প্রাইস সফলভাবে আপডেট হয়েছে!');
      refetch();
      navigate('/admin/productlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'আপডেট করতে সমস্যা হয়েছে');
    }
  };

  // বর্তমান একটিভ ইমেজের ভ্যারিয়েন্ট অবজেক্ট বের করা (যাতে স্ক্রিনে লাইভ ইনপুট ভ্যালু দেখায়)
  const activeVariant = variants.find(v => v.image === images[activeImgIdx]?.url);

  return (
    <Container fluid className="p-0 bg-light min-vh-100" style={{paddingBottom: '100px'}}>
      {/* হেডার পার্ট */}
      <div className="bg-dark text-white p-3 d-flex align-items-center sticky-top shadow" style={{zIndex: 1000}}>
        <FaChevronLeft onClick={() => navigate('/admin/productlist')} className="me-3" style={{cursor: 'pointer'}} />
        <h6 className="mb-0">Edit Product: {pCode || name}</h6>
      </div>

      {isLoading ? <Loader /> : error ? <Message variant='danger'>{error.data?.message || 'Error loading product'}</Message> : (
        <Form onSubmit={submitHandler} className="px-3 mt-3">
          
          {/* === ১. ইমেজ গ্যালারি ও ভ্যারিয়েন্ট সিলেকশন সেকশন === */}
          <Card className="mb-3 border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="bg-white position-relative" style={{ height: '300px' }}>
              {images[activeImgIdx] && (
                <img src={images[activeImgIdx].url} className="w-100 h-100 object-fit-contain p-2" alt="Active Product" />
              )}
              {videoUrl && (
                <div className="position-absolute bottom-0 end-0 m-2 border border-white shadow rounded-3 overflow-hidden bg-black" style={{ width: '80px', height: '80px', zIndex: 10 }}>
                    <video src={videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop playsInline />
                </div>
              )}
            </div>

            {/* থাম্বনেইল স্ট্রিপ */}
            <div className="d-flex gap-2 p-2 overflow-auto bg-white border-top">
              {images.map((img, i) => (
                <div key={i} className="position-relative" style={{minWidth: '60px'}}>
                  <img 
                    src={img.url} 
                    className={`rounded border-2 ${i === activeImgIdx ? 'border-primary shadow-sm' : 'border-light'}`} 
                    style={{ width: '60px', height: '60px', objectFit: 'cover', cursor: 'pointer' }} 
                    onClick={() => handleImageClick(i)} 
                    alt="Thumb"
                  />
                  <FaTimes className="position-absolute top-0 end-0 bg-danger text-white rounded-circle p-1" style={{width:'18px', height:'18px', fontSize:'10px', cursor:'pointer'}} onClick={() => setImages(images.filter((_, idx) => idx !== i))} />
                </div>
              ))}
              <Button variant="outline-primary" style={{ minWidth: '60px', height: '60px' }} onClick={() => setShowImgModal(true)}><FaPlus /></Button>
            </div>

            {/* 🎯 [🎯 স্পেসিফিক ইমেজ ভিত্তিক ডিটেইলস ও সাইজ-স্টক ম্যানেজমেন্ট] */}
            {images[activeImgIdx] && (
              <Card.Body className="bg-light border-top p-3">
                <h6 className="fw-bold small text-primary mb-3">
                  <FaPalette className="me-1"/> উপরে ক্লিক করা ইমেজের সাইজ ও কালার সেটিংস:
                </h6>
                <Row className="g-2">
                  <Col xs={6}>
                    <Form.Label className="very-small fw-bold text-secondary">কালার নাম (Color)</Form.Label>
                    <Form.Select 
                      size="sm" 
                      value={activeVariant?.color || ''} 
                      onChange={(e) => updateVariantDetails(images[activeImgIdx].url, 'color', e.target.value)}
                    >
                      <option value="">সিলেক্ট কালার</option>
                      {colorOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </Form.Select>
                  </Col>
                  <Col xs={6}>
                    <Form.Label className="very-small fw-bold text-secondary">এই কালারের মোট স্টক</Form.Label>
                    <Form.Control 
                      size="sm" 
                      type="number" 
                      placeholder="যেমন: 15"
                      value={activeVariant?.countInStock ?? 0} 
                      onChange={(e) => updateVariantDetails(images[activeImgIdx].url, 'countInStock', e.target.value)} 
                    />
                  </Col>
                </Row>

                <div className="mt-3">
                  <Form.Label className="very-small fw-bold text-secondary">
                    <FaRulerCombined className="me-1"/> এভেলেবেল সাইজ সিলেক্ট করুন (ক্লিক করে অন/অফ করুন):
                  </Form.Label>
                  <div className="d-flex flex-wrap gap-1">
                    {sizeOptions.map(s => {
                      const isSelected = activeVariant?.sizes?.includes(s);
                      return (
                        <Badge 
                          key={s} 
                          pill 
                          bg={isSelected ? "primary" : "white"} 
                          text={isSelected ? "white" : "dark"} 
                          className="border shadow-sm py-2 px-3" 
                          style={{cursor: 'pointer', fontSize: '12px', transition: '0.2s'}} 
                          onClick={() => toggleSize(images[activeImgIdx].url, s)}
                        >
                          {s}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </Card.Body>
            )}
          </Card>

          {/* === ২. প্রোডাক্ট ক্যাটাগরি ও সাধারণ সেটিংস === */}
          <Card className="mb-3 border-0 shadow-sm rounded-4 p-3">
            <h6 className="fw-bold mb-3 small text-muted">প্রোডাক্ট বেসিক সেটিংস</h6>
            <Row className="g-2">
              <Col xs={12}>
                <Form.Label className="very-small fw-bold text-secondary">প্রোডাক্টের নাম</Form.Label>
                <Form.Control placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
              </Col>
              <Col xs={6}>
                <Form.Label className="very-small fw-bold text-secondary">প্রোডাক্ট কোড</Form.Label>
                <Form.Control placeholder="Product Code" value={pCode} onChange={(e) => setPCode(e.target.value)} />
              </Col>
              <Col xs={6}>
                <Form.Label className="very-small fw-bold text-secondary">ব্র্যান্ড</Form.Label>
                <Form.Control placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
              </Col>
              <Col xs={6}>
                <Form.Label className="very-small fw-bold text-secondary">ক্যাটাগরি</Form.Label>
                <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Category</option>
                  {categoryList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Form.Select>
              </Col>
              <Col xs={6}>
                <Form.Label className="very-small fw-bold text-secondary">অফার ক্যাটাগরি</Form.Label>
                <Form.Select value={offerCategory} onChange={(e) => setOfferCategory(e.target.value)}>
                  <option value="regular product">Regular Product</option>
                  <option value="offer product">Offer Product</option>
                  <option value="hot deals">Hot Deals</option>
                  <option value="new arrival">New Arrival</option>
                </Form.Select>
              </Col>
              <Col xs={12}>
                <Form.Label className="very-small fw-bold text-secondary">শিপিং সময়</Form.Label>
                <Form.Control placeholder="Shipping Time (e.g. 7-10 Days)" value={shippingTime} onChange={(e) => setShippingTime(e.target.value)} />
              </Col>
            </Row>
          </Card>

          {/* === ৩. প্রাইস, অফার পার্সেন্টেজ ও লাইভ আপডেট প্রাইস বক্স (তোর ইমেজ সিস্টেম) === */}
          <Card className="mb-3 border-0 shadow-sm rounded-4 p-3">
            <h6 className="fw-bold mb-3 small text-muted">মূল্য, স্টক ও অফার কনফিগারেশন</h6>
            <Row className="g-2 mb-3">
              <Col xs={6}>
                <Form.Label className="very-small fw-bold text-secondary">QR মূল্য (ሪያল)</Form.Label>
                <Form.Control type="number" value={priceQR} onChange={(e) => handlePriceQRChange(e.target.value)} />
              </Col>
              <Col xs={6}>
                <Form.Label className="very-small fw-bold text-secondary">BDT বেস মূল্য (৳)</Form.Label>
                <Form.Control value={priceBDT} disabled className="bg-white text-muted fw-bold" />
              </Col>
            </Row>

            {/* 💸 ইমেজ অনুযায়ী অফার লাইভ প্রাইস সেকশন */}
            <Row className="g-2 mb-3 bg-light p-2 rounded-3 border">
              <Col xs={6}>
                <Form.Label className="very-small fw-bold text-danger">অফার পার্সেন্টেজ (%)</Form.Label>
                <Form.Control 
                  type="number" 
                  placeholder="যেমন: 20" 
                  value={offerPercentage} 
                  onChange={(e) => setOfferPercentage(e.target.value)} 
                />
              </Col>
              <Col xs={6}>
                <Form.Label className="very-small fw-bold text-success">ইউজার স্ক্রিনে যে দাম দেখাবে (৳)</Form.Label>
                <div className="form-control bg-white text-success fw-bold border-0 fs-5 pt-1">
                  ৳ {calculatedDiscountedPrice}
                </div>
              </Col>
            </Row>

            <Row className="g-2">
              <Col xs={6}>
                <Form.Check type="switch" label="Offer Status" id="offer-switch" checked={isOfferOn} onChange={(e) => setIsOfferOn(e.target.checked)} />
                {isOfferOn && <Form.Control size="sm" className="mt-1" placeholder="Offer Text (e.g. 20% OFF)" value={offerText} onChange={(e) => setOfferText(e.target.value)} />}
              </Col>
              <Col xs={6}>
                <Form.Check type="switch" label="Baz Status" id="baz-switch" checked={isBazOn} onChange={(e) => setIsBazOn(e.target.checked)} />
                {isBazOn && <Form.Control size="sm" className="mt-1" placeholder="Baz Text" value={bazText} onChange={(e) => setBazText(e.target.value)} />}
              </Col>
            </Row>
          </Card>

          {/* === ৪. ভিডিও সেকশন === */}
          <Card className="mb-3 border-0 shadow-sm rounded-4 p-3">
            <Form.Label className="very-small fw-bold text-secondary"><FaVideo className="me-1"/> ভিডিও লিংক (Cloudinary/URL)</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control size="sm" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Paste video URL" />
              <Button variant="dark" size="sm" onClick={() => {
                window.cloudinary.openUploadWidget({ cloudName: 'diao4zmtr', uploadPreset: 'gulfhut_preset', resourceType: 'video' }, 
                (err, res) => { if (!err && res.event === 'success') setVideoUrl(res.info.secure_url) }).open();
              }}><FaCloudUploadAlt /></Button>
            </div>
          </Card>

          {/* বর্ণনা */}
          <Form.Control as="textarea" rows={4} className="mb-5 rounded-4 shadow-sm p-3" placeholder="প্রোডাক্টের বিস্তারিত বর্ণনা লিখুন..." value={description} onChange={(e) => setDescription(e.target.value)} />

          {/* ফিক্সড বটম সেভ বাটন */}
          <div className="fixed-bottom p-3 bg-white border-top shadow-lg" style={{zIndex: 1100}}>
            <Button type="submit" variant="primary" className="w-100 py-3 rounded-pill fw-bold fs-6 shadow-sm" disabled={loadingUpdate}>
              {loadingUpdate ? <Spinner size="sm"/> : <><FaSave className="me-2"/> সম্পূর্ণ প্রোডাক্ট ও ভ্যারিয়েন্ট ডাটা সেভ করুন</>}
            </Button>
          </div>
        </Form>
      )}

      {/* মিডিয়া আপলোড মোডাল */}
      <Modal show={showImgModal} onHide={() => setShowImgModal(false)} centered>
        <Modal.Body className="p-4 text-center border-0">
          <MediaUpload onUploadSuccess={(url) => setTempImgUrl(url)} />
          {tempImgUrl && (
            <Button className="mt-3 w-100 rounded-pill fw-bold" onClick={() => { setImages([...images, {url: tempImgUrl, isMain: false}]); setShowImgModal(false); setTempImgUrl(''); }}>
              গ্যালারিতে যুক্ত করুন
            </Button>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductEditScreen;