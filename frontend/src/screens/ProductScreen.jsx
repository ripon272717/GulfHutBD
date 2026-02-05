import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Image, ListGroup, Card, Button, Form, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap'; // এডিট বাটনের জন্য লাগবে
import { toast } from 'react-toastify';
import { FaEdit, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from '../slices/productsApiSlice';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { addToCart } from '../slices/cartSlice';

const ProductScreen = () => {
  const { id: productId } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] = useCreateReviewMutation();

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate('/cart');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await createReview({ productId, rating, comment }).unwrap();
      refetch();
      toast.success('রিভিউটি সফলভাবে যোগ করা হয়েছে');
      setRating(0);
      setComment('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Link className='btn btn-light my-3' to='/'>
        <FaArrowLeft className='me-1' /> ফিরে যান
      </Link>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <>
          <Meta title={product.name} description={product.description} />
          
          {/* অ্যাডমিন যদি লগইন থাকে তবে আলাদা নোটিশ বা স্ট্যাটাস বার */}
          {userInfo && userInfo.isAdmin && (
            <Message variant='info'>
              আপনি অ্যাডমিন হিসেবে লগইন আছেন। চাইলে এই প্রোডাক্টটি এডিট করতে পারেন। 
              স্ট্যাটাস: <strong>{product.countInStock > 0 ? 'Active' : 'Hidden/Out of Stock'}</strong>
            </Message>
          )}

          <Row>
            <Col md={6}>
              <Image src={product.image} alt={product.name} fluid rounded className='shadow-sm' />
            </Col>

            <Col md={3}>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <h3 className='fw-bold'>{product.name}</h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Rating value={product.rating} text={`${product.numReviews} রিভিউ`} />
                </ListGroup.Item>
                
                {/* অফার প্রাইস লজিক (যদি তোমার ডাটাবেসে discountPrice থাকে) */}
                <ListGroup.Item>
                  মূল্য: {product.discountPrice ? (
                    <>
                      <span className='text-danger text-decoration-line-through me-2'>QR {product.price}</span>
                      <span className='text-success fw-bold fs-4'>QR {product.discountPrice}</span>
                    </>
                  ) : (
                    <span className='fw-bold fs-4'>QR {product.price}</span>
                  )}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>বর্ণনা:</strong> <br />
                  {product.description}
                </ListGroup.Item>
              </ListGroup>
            </Col>

            <Col md={3}>
              <Card className='shadow-sm'>
                <ListGroup variant='flush'>
                  <ListGroup.Item>
                    <Row>
                      <Col>মূল্য:</Col>
                      <Col><strong>QR {product.discountPrice || product.price}</strong></Col>
                    </Row>
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <Row>
                      <Col>অবস্থা:</Col>
                      <Col>
                        {product.countInStock > 0 ? (
                          <Badge bg='success'>স্টকে আছে</Badge>
                        ) : (
                          <Badge bg='danger'>স্টক শেষ</Badge>
                        )}
                      </Col>
                    </Row>
                  </ListGroup.Item>

                  {/* Quantity Select */}
                  {product.countInStock > 0 && (
                    <ListGroup.Item>
                      <Row className='align-items-center'>
                        <Col>পরিমাণ</Col>
                        <Col>
                          <Form.Control
                            as='select'
                            value={qty}
                            onChange={(e) => setQty(Number(e.target.value))}
                          >
                            {[...Array(product.countInStock).keys()].map((x) => (
                              <option key={x + 1} value={x + 1}>{x + 1}</option>
                            ))}
                          </Form.Control>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  )}

                  <ListGroup.Item>
                    <Button
                      className='btn-block w-100 py-2'
                      type='button'
                      variant='dark'
                      disabled={product.countInStock === 0}
                      onClick={addToCartHandler}
                    >
                      <FaShoppingCart className='me-2' /> ব্যাগে যোগ করুন
                    </Button>
                  </ListGroup.Item>

                  {/* অ্যাডমিন এডিট বাটন */}
                  {userInfo && userInfo.isAdmin && (
                    <ListGroup.Item>
                      <LinkContainer to={`/admin/product/${product._id}/edit`}>
                        <Button variant='warning' className='btn-block w-100 fw-bold'>
                          <FaEdit className='me-2' /> এডিট প্রোডাক্ট
                        </Button>
                      </LinkContainer>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card>
            </Col>
          </Row>

          {/* রিভিউ সেকশন */}
          <Row className='mt-5'>
            <Col md={6}>
              <h2 className='fw-bold'>রিভিউ এবং রেটিং</h2>
              {product.reviews.length === 0 && <Message>এখনও কোনো রিভিউ দেওয়া হয়নি</Message>}
              <ListGroup variant='flush'>
                {product.reviews.map((review) => (
                  <ListGroup.Item key={review._id} className='bg-light my-2 rounded shadow-sm'>
                    <div className='d-flex justify-content-between align-items-center'>
                       <strong>{review.name}</strong>
                       <span className='text-muted' style={{fontSize: '12px'}}>{review.createdAt.substring(0, 10)}</span>
                    </div>
                    <Rating value={review.rating} />
                    <p className='mt-2'>{review.comment}</p>
                  </ListGroup.Item>
                ))}
                
                <ListGroup.Item className='mt-4'>
                  <h4 className='fw-bold'>একটি রিভিউ লিখুন</h4>
                  {loadingProductReview && <Loader />}
                  {userInfo ? (
                    <Form onSubmit={submitHandler}>
                      <Form.Group className='my-2' controlId='rating'>
                        <Form.Label>আপনার রেটিং</Form.Label>
                        <Form.Control
                          as='select'
                          required
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                        >
                          <option value=''>নির্বাচন করুন...</option>
                          <option value='1'>১ - খুব খারাপ</option>
                          <option value='2'>২ - সাধারণ</option>
                          <option value='3'>৩ - ভালো</option>
                          <option value='4'>৪ - খুব ভালো</option>
                          <option value='5'>৫ - অসাধারণ</option>
                        </Form.Control>
                      </Form.Group>
                      <Form.Group className='my-2' controlId='comment'>
                        <Form.Label>আপনার মন্তব্য</Form.Label>
                        <Form.Control
                          as='textarea'
                          rows='3'
                          required
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder='প্রোডাক্টটি আপনার কেমন লেগেছে?'
                        ></Form.Control>
                      </Form.Group>
                      <Button disabled={loadingProductReview} type='submit' variant='warning' className='text-dark fw-bold'>
                        সাবমিট করুন
                      </Button>
                    </Form>
                  ) : (
                    <Message>রিভিউ দিতে দয়া করে <Link to='/login'>লগইন</Link> করুন।</Message>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default ProductScreen;