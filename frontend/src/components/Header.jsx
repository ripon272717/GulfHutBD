import { Navbar, Nav, Container, NavDropdown, Badge, Image, Form, InputGroup, Collapse } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaBars, FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa'; 
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';

import logo from '../assets/Ourlogo.png';

const Header = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [keyword, setKeyword] = useState('');
  
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutApiCall] = useLogoutMutation();

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
      setShowSearch(false);
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

  // হোম পেজে যাওয়ার ফাংশন
  const goHome = () => navigate('/');

  // প্রোফাইল এডিট পেজে যাওয়ার ফাংশন (ইমেজ বা আইকনে ক্লিক করলে কাজ করবে)
  const goToProfile = () => {
    navigate('/profile');
    console.log('Navigating to Profile Edit...');
  };

  return (
    <header>
      <style>
        {`
          .nav-link::after, .dropdown-toggle::after { display: none !important; }
          .search-box {
            background: #343a40 !important; border: 1px solid #495057 !important;
            color: white !important; border-radius: 25px 0 0 25px !important;
          }
          .search-btn {
            border-radius: 0 25px 25px 0 !important; background: #ffc107 !important;
            border: none !important; color: #000 !important;
          }
          .mobile-search-area { background: #212529; padding: 10px; }
        `}
      </style>

      <Navbar bg='dark' variant='dark' fixed='top' className='py-2 shadow-sm flex-column'>
        <Container className='d-flex align-items-center justify-content-between w-100'>
          
          {/* ১. লোগো ও হোমে যাওয়ার ফাঁকা জায়গা */}
          <div onClick={goHome} className='d-flex align-items-center m-0' style={{ cursor: 'pointer' }}>
            <img src={logo} alt='GulfHut' style={{ width: '32px', height: '32px' }} />
            <span className='fw-bold d-none d-md-inline ms-2 text-white' style={{fontSize: '18px'}}>GulfHut</span>
          </div>

          {/* ২. ক্যাটাগরি */}
          <Nav className='ms-2'>
            <NavDropdown title={<span className='text-white fw-bold'>Category <FaChevronDown size={10} /></span>} id='category-dropdown'>
              <LinkContainer to='/category/bra'><NavDropdown.Item>1) Bra</NavDropdown.Item></LinkContainer>
              <LinkContainer to='/category/cream'><NavDropdown.Item>3) Cream</NavDropdown.Item></LinkContainer>
            </NavDropdown>
          </Nav>

          {/* ৩. পিসি সার্চবার */}
          <Form onSubmit={submitHandler} className='d-none d-lg-flex flex-grow-1 mx-4' style={{ maxWidth: '400px' }}>
            <InputGroup>
              <Form.Control type='text' value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder='কি খুঁজছেন?' className='search-box' />
              <InputGroup.Text as="button" type="submit" className="search-btn"><FaSearch /></InputGroup.Text>
            </InputGroup>
          </Form>

          {/* ৪. ডান পাশের সেকশন */}
          <Nav className='d-flex align-items-center flex-row'>
            <Nav.Link className='d-lg-none me-2 p-0' onClick={() => setShowSearch(!showSearch)}>
              {showSearch ? <FaTimes size={20} className='text-warning' /> : <FaSearch size={20} />}
            </Nav.Link>

            <LinkContainer to='/cart'>
              <Nav.Link className='me-3 position-relative p-0'>
                <FaShoppingCart size={22} />
                {cartItems.length > 0 && <Badge pill bg='success' style={{ position: 'absolute', top: '-8px', right: '-8px', fontSize: '10px' }}>{cartItems.reduce((a, c) => a + c.qty, 0)}</Badge>}
              </Nav.Link>
            </LinkContainer>

            {userInfo ? (
              <div className='d-flex align-items-center'>
                {/* ব্যালেন্স */}
                <div className='me-2 text-warning fw-bold d-none d-sm-block' style={{ fontSize: '12px' }}>
                  QR {userInfo.balance}
                </div>

                {/* প্রোফাইল ইমেজ - ক্লিক করলে এডিটে যাবে */}
                <div onClick={goToProfile} style={{ cursor: 'pointer' }} className='mx-1'>
                  <Image 
                    src={userInfo.image || '/images/profile.png'} 
                    roundedCircle 
                    style={{ width: '32px', height: '32px', border: '1.5px solid #fff', objectFit: 'cover' }} 
                  />
                </div>

                {/* মেনু ড্রপডাউন */}
                <NavDropdown 
                  title={
                    <span>
                      <span className='d-none d-md-inline text-white ms-1'>Menu <FaChevronDown size={10} /></span>
                      <FaBars size={18} className='d-md-none text-white' />
                    </span>
                  } 
                  align='end'
                >
                  <NavDropdown.Item onClick={goToProfile}>Edit Profile</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
                </NavDropdown>
              </div>
            ) : (
              /* ইউজার লগইন না থাকলে এই আইকনে ক্লিক করলেও লগইন বা প্রোফাইল পেজে যাবে */
              <div onClick={goToProfile} style={{ cursor: 'pointer' }} className='text-white p-0'>
                <FaUser size={18} />
              </div>
            )}
          </Nav>
        </Container>

        {/* ৫. মোবাইল সার্চ স্লাইডার */}
        <Collapse in={showSearch}>
          <div className='w-100 d-lg-none mobile-search-area'>
            <Container>
              <Form onSubmit={submitHandler}>
                <InputGroup>
                  <Form.Control type='text' value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder='এখানে লিখুন...' className='search-box' />
                  <InputGroup.Text as="button" type="submit" className="search-btn"><FaSearch /></InputGroup.Text>
                </InputGroup>
              </Form>
            </Container>
          </div>
        </Collapse>
      </Navbar>
    </header>
  );
};

export default Header;