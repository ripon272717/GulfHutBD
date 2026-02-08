import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, InputGroup, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaEye, FaEyeSlash, FaUser, FaPhoneAlt, FaEnvelope, FaLock } from 'react-icons/fa';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    if (!name || !mobile || !password) {
      toast.error('সবগুলো ঘর পূরণ করুন!');
      return;
    }

    try {
      // মোবাইল নম্বরের সাথে কান্ট্রি কোড যোগ করে পাঠানো
      const fullMobile = '+880' + mobile;
      const res = await register({ name, email, mobile: fullMobile, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <div className="p-4 shadow rounded bg-white mt-5">
        <h2 className='text-center mb-4' style={{fontWeight:'bold'}}>Create Account</h2>
        <Form onSubmit={submitHandler}>
          
          {/* নাম/ইউজার নেম */}
          <Form.Group className='mb-3' controlId='name'>
            <Form.Label className='fw-bold'>User Name / Name <span className='text-danger'>*</span></Form.Label>
            <InputGroup>
              <InputGroup.Text><FaUser /></InputGroup.Text>
              <Form.Control 
                type='text' 
                placeholder='আপনার নাম লিখুন' 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </InputGroup>
          </Form.Group>

          {/* মোবাইল নম্বর */}
          <Form.Group className='mb-3' controlId='mobile'>
            <Form.Label className='fw-bold'>Mobile Number <span className='text-danger'>*</span></Form.Label>
            <InputGroup>
              <InputGroup.Text style={{background:'#f8f9fa', fontWeight:'bold'}}>+880</InputGroup.Text>
              <Form.Control 
                type='number' 
                placeholder='1XXXXXXXXX' 
                value={mobile} 
                onChange={(e) => setMobile(e.target.value)} 
                required 
              />
            </InputGroup>
          </Form.Group>

          {/* ইমেইল (ঐচ্ছিক) */}
          <Form.Group className='mb-3' controlId='email'>
            <Form.Label className='fw-bold'>Email (Optional)</Form.Label>
            <InputGroup>
              <InputGroup.Text><FaEnvelope /></InputGroup.Text>
              <Form.Control 
                type='email' 
                placeholder='ইমেইল (না দিলেও হবে)' 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </InputGroup>
          </Form.Group>

          {/* পাসওয়ার্ড */}
          <Form.Group className='mb-3' controlId='password'>
            <Form.Label className='fw-bold'>Password <span className='text-danger'>*</span></Form.Label>
            <InputGroup>
              <InputGroup.Text><FaLock /></InputGroup.Text>
              <Form.Control 
                type={showPassword ? 'text' : 'password'} 
                placeholder='পাসওয়ার্ড দিন' 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                autoComplete="new-password"
              />
              <InputGroup.Text onClick={() => setShowPassword(!showPassword)} style={{cursor:'pointer'}}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Button disabled={isLoading} type='submit' variant='warning' className='w-100 fw-bold py-2 mt-2 shadow-sm'>
            {isLoading ? 'Registering...' : 'Register Now'}
          </Button>

          {isLoading && <Loader />}
        </Form>

        <Row className='py-3 text-center'>
          <Col>
            আগে অ্যাকাউন্ট আছে?{' '}
            <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className='fw-bold text-warning text-decoration-none'>
              Login
            </Link>
          </Col>
        </Row>
      </div>
    </FormContainer>
  );
};

export default RegisterScreen;