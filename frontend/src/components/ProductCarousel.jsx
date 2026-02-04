import { Carousel, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ProductCarousel = () => {
  // আপনার ইমেজের বদলে আমি এখানে অনলাইন স্যাম্পল ইমেজ দিয়েছি যা ১০০% লোড হবে
  const sampleSlides = [
    {
      _id: '1',
      image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=1200&h=500',
      name: 'Welcome to GulfHut',
      description: 'Discover the Best Qatari Market Experience',
    },
    {
      _id: '2',
      image: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=1200&h=500',
      name: 'Authentic Products',
      description: 'Straight from Qatar to Bangladesh',
    },
    {
      _id: '3',
      image: 'https://images.unsplash.com/photo-1523475496153-3d6cc0f0bf19?auto=format&fit=crop&w=1200&h=500',
      name: 'Exclusive Offers',
      description: 'Get the best deals on premium items',
    }
  ];

  return (
    <Carousel 
      pause='hover' 
      className='bg-dark mb-4' 
      interval={3000} // ৩ সেকেন্ড পর পর স্লাইড হবে
      indicators={true} 
      controls={true}
    >
      {sampleSlides.map((slide) => (
        <Carousel.Item key={slide._id}>
          <Link to='/'>
            <Image 
              src={slide.image} 
              alt={slide.name} 
              fluid 
              style={{ 
                height: '500px', 
                width: '100%', 
                objectFit: 'cover' 
              }} 
            />
            <Carousel.Caption className='carousel-caption'>
              <h2 className='text-white text-right'>
                {slide.name}
              </h2>
              <p className='text-white text-right'>{slide.description}</p>
            </Carousel.Caption>
          </Link>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default ProductCarousel;
/*import { Link } from 'react-router-dom';
import { Carousel, Image } from 'react-bootstrap';
import Message from './Message';
import { useGetTopProductsQuery } from '../slices/productsApiSlice';

const ProductCarousel = () => {
  const { data: products, isLoading, error } = useGetTopProductsQuery();

  return isLoading ? null : error ? (
    <Message variant='danger'>{error?.data?.message || error.error}</Message>
  ) : (
    <Carousel pause='hover' className='bg-primary mb-4'>
      {products.map((product) => (
        <Carousel.Item key={product._id}>
          <Link to={`/product/${product._id}`}>
            <Image src={product.image} alt={product.name} fluid />
            <Carousel.Caption className='carousel-caption'>
              <h2 className='text-white text-right'>
                {product.name} (${product.price})
              </h2>
            </Carousel.Caption>
          </Link>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default ProductCarousel;*/
