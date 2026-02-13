import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Container, InputGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // আইকন ইম্পোর্ট
import Loader from '../components/Loader';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // পাসওয়ার্ড দেখানোর স্টেট

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) navigate('/');
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await register({ 
        name, 
        mobile, 
        email: email === '' ? null : email, 
        password 
      }).unwrap();
      
      dispatch(setCredentials({ ...res }));
      navigate('/');
      toast.success('Registration successful!');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Container className='d-flex justify-content-center align-items-center' style={{ minHeight: '80vh', marginTop: '80px' }}>
      <div className='p-4 border rounded shadow-sm bg-white' style={{ width: '100%', maxWidth: '450px' }}>
        <h2 className='text-center mb-4 fw-bold' style={{ color: '#212529' }}>Sign Up</h2>
        
        <Form onSubmit={submitHandler}>
          {/* নাম / ইউজারনেম */}
          <Form.Group className='mb-3' controlId='name'>
            <Form.Label className='fw-bold'>Name / Username</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter your name'
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          {/* মোবাইল নম্বর */}
          <Form.Group className='mb-3' controlId='mobile'>
            <Form.Label className='fw-bold'>Mobile Number</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter mobile number'
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </Form.Group>

          {/* ইমেইল (ঐচ্ছিক) */}
          <Form.Group className='mb-3' controlId='email'>
            <Form.Label className='fw-bold'>Email <small className='text-muted'>(Optional)</small></Form.Label>
            <Form.Control
              type='email'
              placeholder='Enter email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          {/* পাসওয়ার্ড সাথে আইকন */}
          <Form.Group className='mb-4' controlId='password'>
            <Form.Label className='fw-bold'>Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter password'
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputGroup.Text 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ cursor: 'pointer', background: 'transparent' }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Button type='submit' variant='warning' className='w-100 fw-bold py-2 shadow-sm' disabled={isLoading}>
            {isLoading ? <Loader /> : 'Register'}
          </Button>
        </Form>

        <Row className='py-3'>
          <Col className='text-center'>
            Already have an account? <Link to='/login' className='fw-bold text-decoration-none' style={{ color: '#ffc107' }}>Login</Link>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default RegisterScreen;