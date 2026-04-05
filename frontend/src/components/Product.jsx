import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';

const Product = ({ product }) => {
  return (
    <Card className='my-2 p-0 border-0 shadow-sm overflow-hidden w-100' style={{ borderRadius: '15px', transition: '0.3s' }}>
      <Link to={`/product/${product._id}`}>
        <div style={{ 
          aspectRatio: '1 / 1', // ইমেজ সব সময় বর্গাকার (Square) থাকবে
          background: '#f9f9f9', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <Card.Img 
            src={product.image} 
            variant='top' 
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} 
          />
        </div>
      </Link>

      <Card.Body className='p-2 d-flex flex-column justify-content-between text-center'>
        <div>
          <Link to={`/product/${product._id}`} className='text-decoration-none'>
            <Card.Title as='div' className='mb-1' style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              height: '40px', 
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', // কোটেশন মার্ক ঠিক আছে এখন
              color: '#333'
            }}>
              {product.name}
            </Card.Title>
          </Link>

          <div className='mb-2' style={{ fontSize: '12px' }}>
            <Rating value={product.rating} text={`${product.numReviews}`} />
          </div>
        </div>

        <div className='mt-auto'>
          <div className='fw-bold text-primary' style={{ fontSize: '16px' }}>{product.priceQR} QR</div>
          <div className='text-success fw-bold' style={{ fontSize: '13px' }}>৳ {product.priceBDT}</div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Product;