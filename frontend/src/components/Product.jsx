import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';

const Product = ({ product }) => {
  return (
    <Card className='my-2 p-1 border-0 shadow-sm' style={{ borderRadius: '10px' }}>
  <Link to={`/product/${product._id}`}>
    <div style={{ 
      height: '180px', // মোবাইলের জন্য ইমেজ হাইট
      background: '#f8f9fa', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <Card.Img 
        src={product.image} 
        variant='top' 
        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
      />
    </div>
  </Link>
      <Card.Body className='p-2 text-center'>
        <Link to={`/product/${product._id}`} className='text-decoration-none'>
          <Card.Title as='div' className='product-title-text mb-1'>
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        {/* রেটিং সেকশন (মোবাইলে ছোট দেখাবে) */}
        <Card.Text as='div' className='mb-1 rating-text'>
          <Rating value={product.rating} text={`${product.numReviews}`} />
        </Card.Text>

        {/* প্রাইস সেকশন */}
        <Card.Text as='h5' className='fw-bold text-primary mb-0'>
          {product.price} QR
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Product;