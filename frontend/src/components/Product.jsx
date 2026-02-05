import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';

const Product = ({ product }) => {
  return (
    <Card className='my-2 p-0 border-0 shadow-sm rounded-3 overflow-hidden product-card w-100'>
      <Link to={`/product/${product._id}`}>
        {/* ইমেজ কন্টেইনার যা সব ইমেজকে সমান সাইজে রাখবে */}
        <div className='product-image-container'>
          <Card.Img 
            src={product.image} 
            variant='top' 
            className='product-img-main'
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