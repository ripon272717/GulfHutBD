import { useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom'; // useLocation যোগ করো
import { Row, Col } from 'react-bootstrap';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import Meta from '../components/Meta';

const HomeScreen = () => {
  const { pageNumber, keyword } = useParams();
  
  // --- রেফারেল লজিক শুরু ---
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const refCode = sp.get('ref');

  useEffect(() => {
    if (refCode) {
      // এটি ব্রাউজারের মেমোরিতে কোডটি জমিয়ে রাখবে
      localStorage.setItem('referrerCode', refCode);
      console.log('Referrer Code Saved:', refCode);
    }
  }, [refCode]);
  // --- রেফারেল লজিক শেষ ---

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
          Go Back
        </Link>
      )}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Meta title='Welcome to ProShop' />
          <h1>Latest Products</h1>
          <Row>
            {data.products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                <Product product={product} />
              </Col>
            ))}
          </Row>
          <Paginate
            pages={data.pages}
            page={data.page}
            keyword={keyword ? keyword : ''}
          />
        </>
      )}
    </>
  );
};

export default HomeScreen;