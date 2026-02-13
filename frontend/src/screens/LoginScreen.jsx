import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, InputGroup, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaEye, FaEyeSlash, FaUserShield, FaLock } from 'react-icons/fa';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

const LoginScreen = () => {
  // ভেরিয়েবল নাম loginId রাখা হয়েছে যেন ইউজার আইডি/মোবাইল/নাম যাই দিক কাজ করে
  const [loginId, setLoginId] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      // Backend যেহেতু 'email' কী (key) খুঁজছে, তাই আমরা loginId-কে email হিসেবে পাঠাচ্ছি
      const res = await login({ email: loginId, password }).unwrap(); 
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <div className="p-4 shadow rounded bg-white mt-5">
        <h2 className='text-center mb-4' style={{fontWeight:'bold'}}>Login</h2>
        <Form onSubmit={submitHandler}>
          
          {/* ইউজার আইডি ফিল্ড */}
          <Form.Group className='mb-3' controlId='loginId'>
            <Form.Label className='fw-bold'>Name / Mobile / Email / ID</Form.Label>
            <InputGroup>
              <InputGroup.Text><FaUserShield /></InputGroup.Text>
              <Form.Control
                  type='text'
                  placeholder='নাম, মোবাইল, ইমেইল বা আইডি দিন'
                  value={loginId} // এখানে আগে 'email' ছিল, যা ভুল ছিল
                  onChange={(e) => setLoginId(e.target.value)} // এখানে 'setEmail' ছিল, যা ভুল ছিল
                  required
              ></Form.Control>
            </InputGroup>
          </Form.Group>

          {/* পাসওয়ার্ড ফিল্ড */}
          <Form.Group className='mb-3' controlId='password'>
            <Form.Label className='fw-bold'>Password</Form.Label>
            <InputGroup>
              <InputGroup.Text><FaLock /></InputGroup.Text>
              <Form.Control 
                type={showPassword ? 'text' : 'password'} 
                placeholder='পাসওয়ার্ড দিন' 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                autoComplete="current-password"
              />
              <InputGroup.Text onClick={() => setShowPassword(!showPassword)} style={{cursor:'pointer'}}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Button disabled={isLoading} type='submit' variant='warning' className='w-100 fw-bold py-2 mt-2 shadow-sm'>
            {isLoading ? 'Logging In...' : 'Login Now'}
          </Button>

          {isLoading && <Loader />}
        </Form>

        <Row className='py-3 text-center'>
          <Col>
            নতুন ইউজার?{' '}
            <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className='fw-bold text-warning text-decoration-none'>
              Create Account
            </Link>
          </Col>
        </Row>
      </div>
    </FormContainer>
  );
};

export default LoginScreen;