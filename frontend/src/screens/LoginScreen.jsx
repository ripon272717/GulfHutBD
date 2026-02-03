import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';

import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

const LoginScreen = () => {
  // এখন 'email' এর বদলে 'identity' স্টেট ব্যবহার করছি
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      // ব্যাকএন্ডে 'identity' হিসেবে ডাটা পাঠানো হচ্ছে
      const res = await login({ identity, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
      toast.success('লগইন সফল হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <h1 className='mb-4'>লগইন করুন</h1>

      <Form onSubmit={submitHandler}>
        <Form.Group className='my-2' controlId='identity'>
          <Form.Label>মোবাইল / নাম / ইমেইল</Form.Label>
          <Form.Control
            type='text'
            placeholder='মোবাইল নম্বর বা ইমেইল লিখুন'
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        <Form.Group className='my-2' controlId='password'>
          <Form.Label>পাসওয়ার্ড (Password)</Form.Label>
          <Form.Control
            type='password'
            placeholder='পাসওয়ার্ড দিন'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        <Button disabled={isLoading} type='submit' variant='primary' className='mt-3 w-100 py-2'>
          প্রবেশ করুন
        </Button>

        {isLoading && <Loader />}
      </Form>

      <Row className='py-3'>
        <Col className='text-center'>
          নতুন ইউজার?{' '}
          <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className='fw-bold'>
            অ্যাকাউন্ট তৈরি করুন
          </Link>
        </Col>
      </Row>

      {/* পাসওয়ার্ড রিকভারি লিঙ্ক (ভবিষ্যতের জন্য) */}
      <Row>
        <Col className='text-center'>
          <Link to='/forgot-password' style={{ fontSize: '0.85rem', color: 'gray' }}>
            পাসওয়ার্ড ভুলে গেছেন?
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginScreen;