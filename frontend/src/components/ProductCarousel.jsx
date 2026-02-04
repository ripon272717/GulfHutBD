import { Carousel, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ProductCarousel = () => {
  const mySlides = [
    {
      _id: '1',
      image: '/images/maya1.jpg',
      name: 'Welcome to GulfHut',
      description: 'Discover the Best Qatari Market Experience',
    },
    {
      _id: '2',
      image: '/images/maya2.jpg',
      name: 'Authentic Products',
      description: 'Straight from Qatar to Bangladesh',
    },
    {
      _id: '3',
      image: '/images/maya3.jpg',
      name: 'Exclusive Offers',
      description: 'Get the best deals on premium items',
    },
    {
      _id: '4',
      image: '/images/maya4.jpg',
      name: 'Premium Quality',
      description: 'Handpicked items for you',
    },
    {
      _id: '5',
      image: '/images/maya5.jpg',
      name: 'Fast Delivery',
      description: 'Reliable shipping across the country',
    },
     {
      _id: '6',
      image: '/images/maya6.jpg',
      name: 'Fast Delivery',
      description: 'Comfortable Price across the country',
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
      {mySlides.map((slide) => (
        <Carousel.Item key={slide._id}>
          <Link to='/'>
            <Image 
              src={slide.image} 
              alt={slide.name} 
              fluid 
              style={{ 
                height: '500px', 
                width: '100%', 
                objectFit: 'contain' 
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