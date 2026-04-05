import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from '../../slices/productsApiSlice';
import { CATEGORIES } from '../../constants';

const ProductEditScreen = () => {
  const { id: productId } = useParams();

  const [name, setName] = useState('');
  const [priceQR, setPriceQR] = useState(0);
  const [priceBDT, setPriceBDT] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [shippingTime, setShippingTime] = useState('7-15 Days');
  const [showOnHomepage, setShowOnHomepage] = useState(true);
  const [categoryOnly, setCategoryOnly] = useState(false);

  // --- আপডেট করা ক্যাটাগরি লিস্ট ---
  const categories = [
    'Ladies: Bra',
    'Ladies: Panty',
    'Ladies: Lotion',
    'Ladies: Cream',
    'Ladies: Soap',
    'Ladies: Shampoo',
    'Gents Items',
    'Kids Items',
    'Nuts Items',
    'Electronics',
    'Grocery',
    'Mobile',
    'Fashion',
    'Health'
  ];

  const { data: product, isLoading, refetch, error } = useGetProductDetailsQuery(productId);
  const [updateProduct, { isLoading: loadingUpdate }] = useUpdateProductMutation();
  const [uploadProductImage, { isLoading: loadingUpload }] = useUploadProductImageMutation();

  const navigate = useNavigate();

  // --- অটো কনভারশন লজিক (১ রিয়াল = ৩২ টাকা ধরে) ---
  const handlePriceQRChange = (val) => {
    const qrValue = Number(val);
    setPriceQR(qrValue);
    setPriceBDT(qrValue * 32); 
  };

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPriceQR(product.priceQR || 0);
      setPriceBDT(product.priceBDT || 0);
      setImage(product.image);
      setBrand(product.brand);
      setCategory(product.category);
      setCountInStock(product.countInStock);
      setDescription(product.description);
      setShippingTime(product.shippingTime || '7-15 Days');
      setShowOnHomepage(product.showOnHomepage ?? true);
      setCategoryOnly(product.categoryOnly ?? false);
    }
  }, [product]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateProduct({
        productId,
        name,
        priceQR,
        priceBDT,
        image,
        brand,
        category,
        description,
        countInStock,
        shippingTime,
        showOnHomepage,
        categoryOnly,
      }).unwrap();
      toast.success('প্রোডাক্ট আপডেট সফল হয়েছে');
      refetch();
      navigate('/admin/productlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Container fluid className="px-md-5">
      <Link to='/admin/productlist' className='btn btn-light my-3 shadow-sm'>
        <i className='fas fa-arrow-left me-2'></i> পিছনে যান
      </Link>
      {CATEGORIES.map((cat) => (
     <option key={cat} value={cat}>{cat}</option>
      ))}

      <Row className='justify-content-center'>
        {/* লার্জ স্ক্রিনে ১০ কলাম (চওড়া হবে), মোবাইলে ১২ কলাম */}
        <Col xs={12} lg={10} xl={9}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-dark mb-0">প্রোডাক্ট এডিট / এন্ট্রি</h2>
          </div>

          {loadingUpdate && <Loader />}
          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant='danger'>{error?.data?.message || error.error}</Message>
          ) : (
            <Form onSubmit={submitHandler} className="p-4 p-md-5 shadow border-0 rounded-4 bg-white mb-5">
              
              {/* সেকশন ১: সাধারণ তথ্য */}
              <div className="mb-5">
                <h5 className="text-primary fw-bold text-uppercase mb-4 border-bottom pb-2">
                  <i className="fas fa-info-circle me-2"></i> সাধারণ তথ্য
                </h5>
                <Row>
                  <Col md={12}>
                    <Form.Group controlId='name' className='mb-3'>
                      <Form.Label className='fw-bold'>প্রোডাক্টের নাম</Form.Label>
                      <Form.Control
                        type='text'
                        placeholder='যেমন: iPhone 15 Pro'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-light border-0 py-2 shadow-sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId='brand' className='mb-3'>
                      <Form.Label className='fw-bold'>ব্র্যান্ড</Form.Label>
                      <Form.Control
                        type='text'
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="bg-light border-0 py-2 shadow-sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId='category' className='mb-3'>
                      <Form.Label className='fw-bold'>ক্যাটাগরি</Form.Label>
                      <Form.Control
                        as='select'
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="bg-light border-0 py-2 shadow-sm"
                      >
                        <option value=''>সিলেক্ট করুন</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* সেকশন ২: মূল্য ও স্টক */}
              <div className="mb-5">
                <h5 className="text-success fw-bold text-uppercase mb-4 border-bottom pb-2">
                  <i className="fas fa-money-bill-wave me-2"></i> মূল্য ও ইনভেন্টরি
                </h5>
                <Row>
                  <Col md={4}>
                    <Form.Group controlId='priceQR' className='mb-3'>
                      <Form.Label className='fw-bold'>দাম (QR)</Form.Label>
                      <Form.Control
                        type='number'
                        value={priceQR}
                        onChange={(e) => handlePriceQRChange(e.target.value)}
                        className="bg-light border-0 py-2 shadow-sm fw-bold text-primary"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId='priceBDT' className='mb-3'>
                      <Form.Label className='fw-bold'>দাম (BDT)</Form.Label>
                      <Form.Control
                        type='number'
                        value={priceBDT}
                        onChange={(e) => setPriceBDT(e.target.value)}
                        className="bg-light border-0 py-2 shadow-sm fw-bold text-success"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId='countInStock' className='mb-3'>
                      <Form.Label className='fw-bold'>স্টক পরিমাণ</Form.Label>
                      <Form.Control
                        type='number'
                        value={countInStock}
                        onChange={(e) => setCountInStock(e.target.value)}
                        className="bg-light border-0 py-2 shadow-sm"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* সেকশন ৩: শিপিং ও মিডিয়া */}
              <div className="mb-5">
                <h5 className="text-info fw-bold text-uppercase mb-4 border-bottom pb-2">
                  <i className="fas fa-truck me-2"></i> শিপিং ও মিডিয়া
                </h5>
                <Row>
                  <Col md={6}>
                    <Form.Group controlId='shippingTime' className='mb-3'>
                      <Form.Label className='fw-bold'>শিপিং সময়</Form.Label>
                      <Form.Control
                        type='text'
                        placeholder='যেমন: 7-15 Days'
                        value={shippingTime}
                        onChange={(e) => setShippingTime(e.target.value)}
                        className="bg-light border-0 py-2 shadow-sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId='image' className='mb-3'>
                      <Form.Label className='fw-bold'>প্রোডাক্টের ছবি</Form.Label>
                      <Form.Control
                        type='text'
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="bg-light border-0 py-2 shadow-sm mb-2"
                        placeholder="Image URL"
                      />
                      <Form.Control
                        type='file'
                        onChange={uploadFileHandler}
                        className="bg-white border shadow-sm"
                      />
                      {loadingUpload && <Loader />}
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* সেকশন ৪: ডেসক্রিপশন */}
              <div className="mb-5">
                <h5 className="text-secondary fw-bold text-uppercase mb-4 border-bottom pb-2">
                  <i className="fas fa-edit me-2"></i> বিস্তারিত বিবরণ
                </h5>
                <Form.Group controlId='description' className='mb-3'>
                  <Form.Control
                    as='textarea'
                    rows={4}
                    placeholder='প্রোডাক্ট সম্পর্কে বিস্তারিত লিখুন...'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-light border-0 shadow-sm"
                  />
                </Form.Group>
              </div>

              {/* ডিসপ্লে অপশন */}
              <Row className='mb-4 p-3 bg-light rounded-3 mx-1'>
                <Col md={6}>
                  <Form.Check
                    type='checkbox'
                    label='হোমপেজে দেখান (Show on Homepage)'
                    checked={showOnHomepage}
                    onChange={(e) => setShowOnHomepage(e.target.checked)}
                    className="fw-bold"
                  />
                </Col>
                <Col md={6}>
                  <Form.Check
                    type='checkbox'
                    label='শুধুমাত্র ক্যাটাগরিতে (Category Only)'
                    checked={categoryOnly}
                    onChange={(e) => setCategoryOnly(e.target.checked)}
                    className="fw-bold"
                  />
                </Col>
              </Row>

              <Button 
                type='submit' 
                variant='primary' 
                className='w-100 py-3 shadow fw-bold border-0 mt-3' 
                style={{ borderRadius: '12px', fontSize: '1.1rem' }}
              >
                <i className="fas fa-save me-2"></i> প্রোডাক্ট সেভ করুন
              </Button>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductEditScreen;