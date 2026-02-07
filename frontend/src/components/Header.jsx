import { Navbar, Nav, Container, NavDropdown, Badge, Image, Form, InputGroup, Collapse } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaBars, FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa'; 
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';

import logo from '../assets/ourlogo.png';

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

  const goHome = () => navigate('/');
  const goToProfile = () => navigate('/profile');

  return (
    <header>
      <style>
        {`
          .nav-link::after, .dropdown-toggle::after { display: none !important; }
          
          /* PC (Large Screens) */
          .nav-text { font-size: 18px !important; font-weight: bold; }
          .header-icon { font-size: 24px; }
          .brand-text { font-size: 22px !important; }

          /* Mobile (Small Screens) */
          @media (max-width: 576px) {
            .nav-text { font-size: 16px !important; }
            .header-icon { font-size: 22px; }
            /* মোবাইল ইউজার টেক্সট (নাম ও ব্যালেন্স) */
            .mobile-user-name { font-size: 11px !important; font-weight: bold; display: block !important; }
            .mobile-balance { font-size: 11px !important; font-weight: bold; display: block !important; }
            /* প্রোফাইল ইমেজ মোবাইলে বড় */
            .profile-img-res { width: 42px !important; height: 42px !important; border: 1.5px solid #fff !important; }
            .container-spacing { padding-left: 5px !important; padding-right: 5px !important; }
          }

          /* General Profile Image */
          .profile-img-res { width: 35px; height: 35px; border: 2px solid #fff; object-fit: cover; }

          .search-box {
            background: #343a40 !important; border: 1px solid #495057 !important;
            color: white !important; border-radius: 25px 0 0 25px !important;
          }
          .search-btn {
            border-radius: 0 25px 25px 0 !important; background: #ffc107 !important;
            border: none !important; color: #000 !important;
          }
        `}
      </style>

      <Navbar bg='dark' variant='dark' expand='lg' fixed='top' className='py-2 shadow-sm'>
        <Container className='container-spacing d-flex align-items-center justify-content-between w-100'>
          
          {/* ১. লোগো ও ক্যাটাগরি */}
          <div className='d-flex align-items-center'>
            <div onClick={goHome} className='d-flex align-items-center' style={{ cursor: 'pointer' }}>
              <img src={logo} alt='GulfHut' style={{ width: '30px', height: '30px' }} />
              <span className='fw-bold d-none d-md-inline ms-2 text-white brand-text'>GulfHut</span>
            </div>
            
            <Nav className='ms-1 ms-md-3'>
              <NavDropdown title={
                <span className='text-white nav-text d-flex align-items-center'>
                  Category <FaChevronDown size={10} className='ms-1' />
                </span>
              } id='category-dropdown'>
                <LinkContainer to='/category/bra'><NavDropdown.Item>1) Bra</NavDropdown.Item></LinkContainer>
                <LinkContainer to='/category/cream'><NavDropdown.Item>3) Cream</NavDropdown.Item></LinkContainer>
              </NavDropdown>
            </Nav>
          </div>

          {/* ২. পিসি সার্চবার */}
          <Form onSubmit={submitHandler} className='d-none d-lg-flex flex-grow-1 mx-4' style={{ maxWidth: '350px' }}>
            <InputGroup>
              <Form.Control type='text' value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder='কি খুঁজছেন?' className='search-box' />
              <InputGroup.Text as="button" type="submit" className="search-btn"><FaSearch /></InputGroup.Text>
            </InputGroup>
          </Form>

          {/* ৩. রাইট সাইড আইকন */}
          <Nav className='d-flex align-items-center flex-row'>
            <div className='d-lg-none me-2 text-white' onClick={() => setShowSearch(!showSearch)} style={{ cursor: 'pointer' }}>
              {showSearch ? <FaTimes className='header-icon text-warning' /> : <FaSearch className='header-icon' />}
            </div>

            <LinkContainer to='/cart'>
              <Nav.Link className='me-2 position-relative p-0 text-white'>
                <FaShoppingCart className='header-icon' />
                {cartItems.length > 0 && <Badge pill bg='success' style={{ position: 'absolute', top: '-8px', right: '-8px', fontSize: '10px' }}>{cartItems.reduce((a, c) => a + c.qty, 0)}</Badge>}
              </Nav.Link>
            </LinkContainer>

            {userInfo ? (
              <div className='d-flex align-items-center'>
                {/* ব্যালেন্স এবং নাম - মোবাইলে দৃশ্যমান করা হলো */}
                <div className='d-flex flex-column align-items-end me-1' style={{ lineHeight: '1.2' }}>
                  <span className='text-warning mobile-balance'>QR {userInfo.balance}</span>
                  <span className='text-white mobile-user-name'>{userInfo.name.split(' ')[0]}</span>
                </div>

                {/* প্রোফাইল ইমেজ */}
                <div onClick={goToProfile} style={{ cursor: 'pointer' }} className='mx-1'>
                  <Image 
                    src={userInfo.image || '/images/profile.png'} 
                    roundedCircle 
                    className='profile-img-res shadow-sm'
                  />
                </div>

                <NavDropdown 
                  title={
                    <span className='d-flex align-items-center'>
                      <span className='d-none d-md-inline text-white ms-1 nav-text'>Menu <FaChevronDown size={10} /></span>
                      <FaBars className='header-icon text-white d-md-none' />
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
              <div onClick={goToProfile} style={{ cursor: 'pointer' }} className='text-white p-0'>
                <FaUser className='header-icon' />
              </div>
            )}
          </Nav>
        </Container>

        {/* মোবাইল সার্চ */}
        <Collapse in={showSearch}>
          <div className='w-100 d-lg-none bg-dark p-2 border-top border-secondary'>
            <Container>
              <Form onSubmit={submitHandler}>
                <InputGroup>
                  <Form.Control type='text' value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder='Search product...' className='search-box py-2' />
                  <InputGroup.Text as="button" type="submit" className="search-btn px-3"><FaSearch size={18} /></InputGroup.Text>
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