import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';

import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState(''); // নতুন মোবাইল স্টেট
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referredBy, setReferredBy] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  useEffect(() => {
    // লোকাল স্টোরেজ থেকে রেফারেল কোড চেক করা
    const savedRefCode = localStorage.getItem('referrerCode');
    if (savedRefCode) {
      setReferredBy(savedRefCode);
    }

    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    // মোবাইল নম্বর ভ্যালিডেশন
    if (mobile.length < 11) {
      toast.error('সঠিক মোবাইল নম্বর দিন (কমপক্ষে ১১ ডিজিট)');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('পাসওয়ার্ড ম্যাচ করছে না!');
    } else {
      try {
        const res = await register({ 
          name, 
          mobile, // মোবাইল নম্বর পাঠানো হচ্ছে
          email, 
          password, 
          referredBy 
        }).unwrap();
        
        dispatch(setCredentials({ ...res }));
        localStorage.removeItem('referrerCode'); 
        navigate(redirect);
        
        if(referredBy) {
          toast.success('রেফারেল বোনাস সফলভাবে যোগ করা হয়েছে!');
        } else {
          toast.success('রেজিস্ট্রেশন সফল হয়েছে');
        }
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <FormContainer>
      <h1 className='mb-4'>অ্যাকাউন্ট তৈরি করুন</h1>
      
      {referredBy && (
        <Alert variant='success' className='border-success shadow-sm'>
          🎉 <strong>অভিনন্দন!</strong> আপনি একটি ইনভাইট লিঙ্ক ব্যবহার করছেন। জয়েন করলেই বোনাস পাবেন।
        </Alert>
      )}

      <Form onSubmit={submitHandler}>
        <Form.Group className='my-2' controlId='name'>
          <Form.Label>আপনার নাম (Name/Username)</Form.Label>
          <Form.Control
            type='text'
            placeholder='সম্পূর্ণ নাম লিখুন'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        <Form.Group className='my-2' controlId='mobile'>
          <Form.Label>মোবাইল নম্বর (Mobile Number)</Form.Label>
          <Form.Control
            type='text'
            placeholder='০১৭XXXXXXXX'
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        <Form.Group className='my-2' controlId='email'>
          <Form.Label>ইমেইল এড্রেস <small className='text-muted'>(ঐচ্ছিক)</small></Form.Label>
          <Form.Control
            type='email'
            placeholder='example@mail.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        
        <Form.Group className='my-2' controlId='confirmPassword'>
          <Form.Label>পাসওয়ার্ড নিশ্চিত করুন</Form.Label>
          <Form.Control
            type='password'
            placeholder='আবার পাসওয়ার্ড দিন'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        <Button disabled={isLoading} type='submit' variant='primary' className='mt-3 w-100 py-2'>
          রেজিস্ট্রেশন সম্পন্ন করুন
        </Button>

        {isLoading && <Loader />}
      </Form>

      <Row className='py-3'>
        <Col className='text-center'>
          আগে থেকেই অ্যাকাউন্ট আছে?{' '}
          <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className='fw-bold'>
            লগইন করুন
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default RegisterScreen;