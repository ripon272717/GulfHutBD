import { Navbar, Nav, Container, NavDropdown, Badge, Image, Form, InputGroup } from 'react-bootstrap'; // InputGroup যোগ করা হয়েছে
import { FaShoppingCart, FaUser, FaBars, FaChevronDown, FaSearch } from 'react-icons/fa'; 
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';

import logo from '../assets/Ourlogo.png';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [logoutApiCall] = useLogoutMutation();

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
    } else {
      navigate('/');
    }
  };

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (err) { console.error(err); }
  };

  return (
    <header>
      <style>
        {`
          .nav-link::after, .dropdown-toggle::after {
            display: none !important;
          }
          /* সার্চবার কাস্টমাইজেশন */
          .search-box {
            background: #343a40 !important;
            border: 1px solid #495057 !important;
            color: white !important;
            border-radius: 25px 0 0 25px !important;
            padding-left: 15px;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          .search-box:focus {
            background: #3d444b !important;
            border-color: #ffc107 !important;
            box-shadow: 0 0 5px rgba(255, 193, 7, 0.5) !important;
          }
          .search-btn {
            border-radius: 0 25px 25px 0 !important;
            background: #ffc107 !important;
            border: none !important;
            color: #000 !important;
            padding: 0 15px !important;
          }
          .search-btn:hover {
            background: #e0a800 !important;
          }
          /* ছোট স্ক্রিনে ফন্ট সাইজ ঠিক করা */
          @media (max-width: 576px) {
            .search-box { font-size: 12px; }
          }
        `}
      </style>

      <Navbar bg='dark' variant='dark' fixed='top' className='py-2 shadow-sm'>
        <Container className='d-flex align-items-center justify-content-between'>
          
          {/* ১. লোগো */}
          <LinkContainer to='/'>
            <Navbar.Brand className='d-flex align-items-center m-0'>
              <img src={logo} alt='GulfHut' style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
              <span className='fw-bold d-none d-md-inline ms-2' style={{fontSize: '18px'}}>GulfHut</span>
            </Navbar.Brand>
          </LinkContainer>

          {/* ২. ক্যাটাগরি (লোগোর ডানে) */}
          <Nav className='ms-2'>
            <NavDropdown 
              title={
                <span className='text-white fw-bold d-flex align-items-center' style={{ fontSize: '14px' }}>
                  Category <FaChevronDown size={10} className='ms-1' />
                </span>
              } 
              id='category-dropdown'
            >
              <LinkContainer to='/category/bra'><NavDropdown.Item>1) Bra</NavDropdown.Item></LinkContainer>
              <LinkContainer to='/category/panty'><NavDropdown.Item>2) Panty</NavDropdown.Item></LinkContainer>
              <LinkContainer to='/category/cream'><NavDropdown.Item>3) Cream</NavDropdown.Item></LinkContainer>
              <LinkContainer to='/category/night-dress'><NavDropdown.Item>4) Night Dress</NavDropdown.Item></LinkContainer>
            </NavDropdown>
          </Nav>

          {/* ৩. প্রিমিয়াম সার্চবার (সেন্টারে) */}
          <Form onSubmit={submitHandler} className='flex-grow-1 mx-2 mx-md-4' style={{ maxWidth: '400px' }}>
            <InputGroup>
              <Form.Control
                type='text'
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder='কি খুঁজছেন? এখানে লিখুন...'
                className='search-box'
              />
              <InputGroup.Text as="button" type="submit" className="search-btn">
                <FaSearch />
              </InputGroup.Text>
            </InputGroup>
          </Form>

          {/* ৪. রাইট সাইড আইকন */}
          <Nav className='d-flex align-items-center flex-row'>
            
            <LinkContainer to='/cart'>
              <Nav.Link className='me-2 position-relative p-0'>
                <FaShoppingCart size={22} />
                {cartItems.length > 0 && (
                  <Badge pill bg='success' style={{ position: 'absolute', top: '-8px', right: '-8px', fontSize: '10px' }}>
                    {cartItems.reduce((a, c) => a + c.qty, 0)}
                  </Badge>
                )}
              </Nav.Link>
            </LinkContainer>

            {userInfo ? (
              <div className='d-flex align-items-center'>
                <div className='d-flex flex-column flex-md-row align-items-center me-1'>
                  <div className='order-1 order-md-1 me-md-2 text-warning fw-bold' style={{ fontSize: '11px' }}>QR {userInfo.balance}</div>
                  <div className='order-2 order-md-2 d-none d-lg-inline text-white' style={{ fontSize: '13px' }}>{userInfo.name.split(' ')[0]}</div>
                </div>

                <div className='mx-1'>
                  <Image src={userInfo.image || '/images/profile.png'} roundedCircle style={{ width: '30px', height: '30px', border: '1px solid #fff', objectFit: 'cover' }} />
                </div>

                <NavDropdown
                  title={
                    <span className='text-white d-flex align-items-center'>
                      <span className='d-none d-md-inline me-1'>Menu <FaChevronDown size={10} /></span>
                      <FaBars size={18} className='d-md-none' />
                    </span>
                  }
                  id='nav-dropdown'
                  align='end'
                >
                  <LinkContainer to='/profile'><NavDropdown.Item>Edit Profile</NavDropdown.Item></LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
                </NavDropdown>
              </div>
            ) : (
              <LinkContainer to='/login'><Nav.Link className='p-0 text-white'><FaUser size={18} /></Nav.Link></LinkContainer>
            )}
          </Nav>

        </Container>
      </Navbar>
    </header>
  );
};

export default Header;