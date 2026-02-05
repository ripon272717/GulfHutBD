import { useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { Row, Col, Container } from 'react-bootstrap'; // Container যোগ করা হয়েছে
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
      {/* স্লাইডার কন্টেইনারের বাইরে যাতে এটি ফুল স্ক্রিন স্লাইড হয় */}
      {!keyword ? (
        <ProductCarousel />
      ) : (
        <Container>
          <Link to='/' className='btn btn-light mb-4'>
            Go Back
          </Link>
        </Container>
      )}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Container>
          <Message variant='danger'>
            {error?.data?.message || error.error}
          </Message>
        </Container>
      ) : (
        <Container> {/* প্রোডাক্টগুলোর জন্য কন্টেইনার যাতে দুই পাশে মার্জিন থাকে */}
          <Meta title='Welcome to GulfHut' />
          <h1 className='mt-4'>Latest Products</h1>
          <Row>
            {data.products.map((product) => (
              // xs={6} -> মোবাইলে ২ কলাম
              // md={4} -> ট্যাবে ৩ কলাম
              // lg={3} -> পিসিতে ৪ কলাম (পারফেক্ট লুক)
              <Col key={product._id} xs={6} md={4} lg={3}>
                <Product product={product} />
              </Col>
            ))}
          </Row>
          <Paginate
            pages={data.pages}
            page={data.page}
            keyword={keyword ? keyword : ''}
          />
        </Container>
      )}
    </>
  );
};

export default HomeScreen;