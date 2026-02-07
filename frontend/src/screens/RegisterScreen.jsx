import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // পাসওয়ার্ড শো/হাইড করার জন্য স্টেট
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

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

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      try {
        const res = await register({ name, email, password }).unwrap();
        dispatch(setCredentials({ ...res }));
        navigate(redirect);
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <FormContainer>
      <style>
        {`
          .register-card { background: #fff; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
          .form-label { font-weight: bold; font-size: 14px; color: #555; }
          .input-group-text { background: transparent; border-right: none; color: #888; }
          .form-control { border-left: none; padding-left: 0; }
          .form-control:focus { box-shadow: none; border-color: #ced4da; }
          .eye-icon { cursor: pointer; background: transparent; border-left: none; color: #888; }
          .register-btn { background: #ffc107; border: none; color: #000; font-weight: bold; padding: 12px; border-radius: 10px; transition: 0.3s; }
          .register-btn:hover { background: #e0a800; }
        `}
      </style>

      <div className="register-card mt-5">
        <h1 className='text-center mb-4'>Create Account</h1>

        <Form onSubmit={submitHandler}>
          {/* Name Field */}
          <Form.Group className='my-3' controlId='name'>
            <Form.Label>Full Name</Form.Label>
            <InputGroup>
              <InputGroup.Text><FaUser /></InputGroup.Text>
              <Form.Control
                type='text'
                placeholder='Enter name'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </InputGroup>
          </Form.Group>

          {/* Email Field */}
          <Form.Group className='my-3' controlId='email'>
            <Form.Label>Email Address</Form.Label>
            <InputGroup>
              <InputGroup.Text><FaEnvelope /></InputGroup.Text>
              <Form.Control
                type='email'
                placeholder='Enter email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </InputGroup>
          </Form.Group>

          {/* Password Field */}
          <Form.Group className='my-3' controlId='password'>
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <InputGroup.Text><FaLock /></InputGroup.Text>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ borderRight: 'none' }}
              />
              <InputGroup.Text 
                className="eye-icon" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          {/* Confirm Password Field */}
          <Form.Group className='my-3' controlId='confirmPassword'>
            <Form.Label>Confirm Password</Form.Label>
            <InputGroup>
              <InputGroup.Text><FaLock /></InputGroup.Text>
              <Form.Control
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Confirm password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ borderRight: 'none' }}
              />
              <InputGroup.Text 
                className="eye-icon" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Button 
            disabled={isLoading} 
            type='submit' 
            variant='primary' 
            className='w-100 mt-4 register-btn'
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </Button>

          {isLoading && <Loader />}
        </Form>

        <Row className='py-3'>
          <Col className='text-center'>
            Already have an account?{' '}
            <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} style={{ color: '#ffc107', fontWeight: 'bold', textDecoration: 'none' }}>
              Login
            </Link>
          </Col>
        </Row>
      </div>
    </FormContainer>
  );
};

export default RegisterScreen;