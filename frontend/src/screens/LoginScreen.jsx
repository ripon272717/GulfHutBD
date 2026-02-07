import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap'; // InputGroup যোগ করা হয়েছে
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // আইকন ইমপোর্ট
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';

import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

const LoginScreen = () => {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // পাসওয়ার্ড দেখানোর স্টেট

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
      const res = await login({ identity, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
      toast.success('লগইন সফল হয়েছে');
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
          <Form.Label>পাসওয়ার্ড (Password)</Form.Label>
          <InputGroup> {/* ইনপুট গ্রুপ শুরু */}
            <Form.Control
              type={showPassword ? 'text' : 'password'} // টগল লজিক
              placeholder='পাসওয়ার্ড দিন'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            ></Form.Control>
            <InputGroup.Text 
              onClick={() => setShowPassword(!showPassword)} 
              style={{ cursor: 'pointer' }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />} {/* আইকন পরিবর্তন */}
            </InputGroup.Text>
          </InputGroup>
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

      <Row>
        <Col className='text-center'>
          <Link to='/forgot-password' style={{ fontSize: '0.85rem', color: 'gray' }}>
            পাসওয়ার্ড ভুলে গেছেন?
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginScreen;