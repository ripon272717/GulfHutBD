import { Card, Badge, Button, Row, Col, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { FaHashtag, FaHeart, FaShoppingBag } from 'react-icons/fa';

const Product = ({ product }) => {
  // মেইন ইমেজ সিলেক্ট করার লজিক (images অ্যারে থাকলে সেখান থেকে নেয়)
  const mainImage = product.images && product.images.length > 0 
    ? (product.images.find(img => img.isMain)?.url || product.images[0].url) 
    : product.image;

  return (
    <Card className='my-2 p-0 border-0 shadow-sm overflow-hidden w-100' style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
      
      {/* ইমেজ সেকশন উইথ ব্যাজ (তোর অরিজিনাল কোড) */}
      <div className="position-relative">
        <Link to={`/product/${product._id}`}>
          <div style={{ 
            aspectRatio: '1 / 1.1', 
            background: '#fff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <Card.Img 
              src={mainImage} 
              variant='top' 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        </Link>
        
        {/* টপ ব্যাজ: ডাইনামিক অফার ও বাজ টেক্সট */}
        <div className="position-absolute top-0 start-0 w-100 p-2 d-flex justify-content-between align-items-start" style={{ zIndex: 10 }}>
          {product.isBazOn ? (
            <Badge bg="danger" className="border shadow-sm" style={{ fontSize: '10px' }}>
              {product.bazText}
            </Badge>
          ) : (
            <Badge bg="light" text="dark" className="border shadow-sm" style={{ fontSize: '10px', opacity: '0.9' }}>
              Shipping Free
            </Badge>
          )}

          {product.isOfferOn && (
            <Badge bg="warning" text="dark" className="shadow-sm" style={{ fontSize: '11px', fontWeight: 'bold' }}>
              {product.offerText}
            </Badge>
          )}
        </div>
      </div>

      <Card.Body className='p-2 d-flex flex-column'>
        
        {/* ১. প্রথম লাইন: প্রোডাক্ট কোড এবং স্টক (তোর ড্রয়িং অনুযায়ী) */}
        <div className='d-flex justify-content-between align-items-center mb-1'>
          <div className='text-primary fw-bold' style={{ fontSize: '10px' }}>
            <FaHashtag size={9} /> {product.pCode || 'N/A'}
          </div>
          <div style={{ fontSize: '10px', color: '#666', fontWeight: '600' }}>Stock</div>
        </div>

        {/* ২. দ্বিতীয় লাইন: নাম এবং এভেইলেবল স্ট্যাটাস (তোর ড্রয়িং অনুযায়ী) */}
        <div className='d-flex justify-content-between align-items-center mb-1'>
          <Link to={`/product/${product._id}`} className='text-decoration-none' style={{ flex: 1, marginRight: '5px', overflow: 'hidden' }}>
            <Card.Title as='div' className='mb-0' style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#333',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {product.name}
            </Card.Title>
          </Link>
          <div style={{ fontSize: '11px', fontWeight: 'bold' }} className={product.countInStock > 0 ? 'text-success' : 'text-danger'}>
             {product.countInStock > 0 ? 'Available' : 'Out'}
          </div>
        </div>

        {/* ৩. তৃতীয় লাইন: প্রাইস লেবেল */}
        <div className="mb-2" style={{ fontSize: '11px', fontWeight: '500', color: '#666' }}>
          Price : <span>({product.priceLabel || '1pcs'})</span>
        </div>

        {/* ৪. চতুর্থ লাইন: প্রাইস এবং গোল বাটনগুলো (তোর ড্রয়িং অনুযায়ী এক লাইনে) */}
        <div className='d-flex justify-content-between align-items-center mt-auto'>
          
          {/* প্রাইস অংশ */}
          <div style={{ lineHeight: '1.1' }}>
            <div className='fw-bold' style={{ fontSize: '15px', color: '#000' }}>
              QR {product.priceQR || product.price}
            </div>
            <div className="fw-bold" style={{ fontSize: '12px', color: '#2e7d32' }}>
              BDT {product.priceBDT}
            </div>
          </div>

          {/* গোল বাটন অংশ (VIEW এর বদলে গোল SAVE এবং CART) */}
          <Stack direction="horizontal" gap={1}>
            <Link to={`/product/${product._id}`}>
              <Button 
                variant="outline-secondary" 
                className='rounded-circle d-flex align-items-center justify-content-center p-0' 
                style={{ width: '35px', height: '35px', border: '1px solid #ddd' }}
              >
                <FaHeart size={15} color="#666" />
              </Button>
            </Link>
            
            <Button 
              variant="warning" 
              className='rounded-circle d-flex align-items-center justify-content-center p-0' 
              style={{ width: '35px', height: '35px', backgroundColor: '#ffc107', border: 'none' }}
            >
              <FaShoppingBag size={16} color="#000" />
            </Button>
          </Stack>

        </div>
      </Card.Body>
    </Card>
  );
};

export default Product;