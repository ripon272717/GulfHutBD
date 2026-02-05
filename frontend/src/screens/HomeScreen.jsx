import { Row, Col, Container } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import Meta from '../components/Meta';

const HomeScreen = () => {
  const { pageNumber, keyword } = useParams();

  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    pageNumber,
  });

  return (
    <>
      {!keyword ? (
        <ProductCarousel />
      ) : (
        <Link to='/' className='btn btn-light mb-4'>
          ফিরে যান
        </Link>
      )}
      
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        /* fluid ব্যবহার করে ডানে-বামে জায়গা কমানো হয়েছে */
        <Container fluid className='px-1 px-md-4'> 
          <Meta title='GulfHut | সেরা পণ্য সেরা দামে' />
          
          <h2 className='text-white my-3 ps-2'>Latest Products</h2>
          
          <Row className='g-2 g-md-4'> 
            {/* g-2 মোবাইলে গ্যাপ কমাবে, g-md-4 পিসিতে গ্যাপ বাড়াবে */}
            {data.products.map((product) => (
              <Col 
                key={product._id} 
                xs={6}    // মোবাইলে ২ কলাম (১২/৬ = ২)
                md={4}    // ট্যাবে ৩ কলাম (১২/৪ = ৩)
                lg={3}    // পিসিতে ৪ কলাম (১২/৩ = ৪)
                className='d-flex align-items-stretch' // সব কার্ড সমান লম্বা হবে
              >
                <Product product={product} />
              </Col>
            ))}
          </Row>
          
          <div className='d-flex justify-content-center mt-4'>
            <Paginate
              pages={data.pages}
              page={data.page}
              keyword={keyword ? keyword : ''}
            />
          </div>
        </Container>
      )}
    </>
  );
};

export default HomeScreen;