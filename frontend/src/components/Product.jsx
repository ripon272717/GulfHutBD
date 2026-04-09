import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { FaHashtag } from 'react-icons/fa';

const Product = ({ product }) => {
  // মেইন ইমেজ সিলেক্ট করার লজিক (images অ্যারে থাকলে সেখান থেকে নেয়)
  const mainImage = product.images && product.images.length > 0 
    ? (product.images.find(img => img.isMain)?.url || product.images[0].url) 
    : product.image;

  return (
    <Card className='my-2 p-0 border-0 shadow-sm overflow-hidden w-100' style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
      
      {/* ইমেজ সেকশন উইথ ব্যাজ */}
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
        
        {/* টপ ব্যাজ: ডাইনামিক অফার ও বাজ টেক্সট (অ্যাডমিন প্যানেল থেকে যা দিবি) */}
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
        
        {/* --- ১. প্রোডাক্ট কোড (সবার উপরে শো করবে কাস্টমার কমপ্লেইনের জন্য) --- */}
        <div className='text-primary fw-bold mb-1' style={{ fontSize: '10px' }}>
          <FaHashtag size={9} /> {product.pCode || 'N/A'}
        </div>

        {/* ২. প্রোডাক্টের নাম */}
        <Link to={`/product/${product._id}`} className='text-decoration-none'>
          <Card.Title as='div' className='mb-1' style={{ 
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

        {/* ৩. স্টক স্ট্যাটাস */}
        <div className='mb-1' style={{ fontSize: '11px', color: '#666' }}>
          Stock: <span className={product.countInStock > 0 ? 'text-success' : 'text-danger'}>
            {product.countInStock > 0 ? 'Available' : 'Out of Stock'}
          </span>
        </div>

        {/* ৪. ডাইনামিক প্রাইস লেবেল (তোর স্ক্রিনশট অনুযায়ী ফিক্সড ফরম্যাট) */}
        <div className="mb-2" style={{ fontSize: '12px', fontWeight: '500', color: '#444' }}>
          Price : <span style={{ color: '#666' }}>({product.priceLabel || '1pcs'})</span>
        </div>

        {/* ৫. প্রাইস এবং বাটন সেকশন */}
        <div className='d-flex justify-content-between align-items-center mt-auto'>
          
          {/* প্রাইস অংশ */}
          <div style={{ lineHeight: '1.2' }}>
            <div className='fw-bold' style={{ fontSize: '15px', color: '#000' }}>
              QR {product.priceQR || product.price}
            </div>
            <div className="fw-bold" style={{ fontSize: '13px', color: '#2e7d32' }}>
              BDT {product.priceBDT}
            </div>
          </div>

          {/* বাটন অংশ */}
          <div className='d-flex flex-column gap-1' style={{ minWidth: '85px' }}>
            <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
              <Button variant="outline-dark" size="sm" 
                className='w-100'
                style={{ 
                  fontSize: '9px', 
                  padding: '2px 5px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  fontWeight: '600'
                }}>
                VIEW
              </Button>
            </Link>
            <Button variant="warning" size="sm" 
              style={{ 
                fontSize: '9px', 
                padding: '4px 5px', 
                borderRadius: '4px', 
                fontWeight: 'bold',
                color: '#000'
              }}>
              ADD TO CART
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Product;