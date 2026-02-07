import { Navbar, Nav, Container, NavDropdown, Badge, Image, Form, InputGroup, Collapse, Offcanvas } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaBars, FaChevronDown, FaSearch, FaTimes, FaHome, FaSignOutAlt, FaEdit, FaListUl } from 'react-icons/fa'; 
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';

import logo from '../assets/gulflogo.png';

const Header = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [keyword, setKeyword] = useState('');
  
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutApiCall] = useLogoutMutation();

  const handleCloseSidebar = () => setShowSidebar(false);
  const handleShowSidebar = () => setShowSidebar(true);

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
      handleCloseSidebar();
      navigate('/login');
    } catch (err) { 
      console.error(err);
      dispatch(logout());
    }
  };

  const goHome = () => { navigate('/'); handleCloseSidebar(); };
  const goToProfile = () => { navigate('/profile'); handleCloseSidebar(); };

  return (
    <header>
      <style>
        {`
          .nav-link::after, .dropdown-toggle::after { display: none !important; }
          .nav-text { font-size: 18px !important; font-weight: bold; }
          .header-icon { font-size: 24px; }
          .brand-text { font-size: 22px !important; }

          @media (max-width: 576px) {
            .nav-text { font-size: 16px !important; }
            .header-icon { font-size: 22px; }
            .mobile-user-name { font-size: 11px !important; font-weight: bold; }
            .mobile-balance { font-size: 11px !important; font-weight: bold; }
            .profile-img-res { width: 40px !important; height: 40px !important; border: 1.5px solid #fff !important; }
            .container-spacing { padding-left: 8px !important; padding-right: 8px !important; }
          }

          .profile-img-res { width: 35px; height: 35px; border: 2px solid #fff; object-fit: cover; }
          .search-box { background: #343a40 !important; border: 1px solid #495057 !important; color: white !important; border-radius: 25px 0 0 25px !important; }
          .search-btn { border-radius: 0 25px 25px 0 !important; background: #ffc107 !important; border: none !important; color: #000 !important; }
          
          .offcanvas { width: 280px !important; background-color: #212529 !important; color: white !important; }
          .sidebar-link { color: white !important; font-size: 17px; padding: 12px 15px; border-bottom: 1px solid #343a40; display: flex; align-items: center; gap: 10px; text-decoration: none; }
          .sidebar-link:hover { background: #343a40; color: #ffc107 !important; }
          .sidebar-category-title { background: #1a1d20; padding: 10px 15px; font-size: 14px; color: #ffc107; text-transform: uppercase; font-weight: bold; }
        `}
      </style>

      <Navbar bg='dark' variant='dark' fixed='top' className='py-2 shadow-sm'>
        <Container className='container-spacing d-flex align-items-center justify-content-between w-100'>
          
          {/* লোগো ও ক্যাটাগরি আগের জায়গাতেই থাকবে */}
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
                <LinkContainer to='/category/cream'><NavDropdown.Item>2) Cream</NavDropdown.Item></LinkContainer>
              </NavDropdown>
            </Nav>
          </div>

          {/* ডেস্কটপ সার্চবার */}
          <Form onSubmit={submitHandler} className='d-none d-lg-flex flex-grow-1 mx-4' style={{ maxWidth: '300px' }}>
            <InputGroup>
              <Form.Control type='text' value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder='কি খুঁজছেন?' className='search-box' />
              <InputGroup.Text as="button" type="submit" className="search-btn"><FaSearch /></InputGroup.Text>
            </InputGroup>
          </Form>

          {/* রাইট সাইড আইকন এবং মেনু বাটন */}
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
                <div className='d-flex flex-column align-items-end me-1' style={{ lineHeight: '1.2' }}>
                  <span className='text-warning mobile-balance'>QR {userInfo.balance}</span>
                  <span className='text-white mobile-user-name'>{userInfo.name.split(' ')[0]}</span>
                </div>

                <div onClick={handleShowSidebar} style={{ cursor: 'pointer' }} className='mx-1'>
                  <Image src={userInfo?.image ? userInfo.image : '/images/profile.png'} roundedCircle className='profile-img-res shadow-sm' />
                </div>
                
                {/* হ্যামবার্গার মেনু বাটন (সবচেয়ে ডানে) */}
                <div className='text-white ms-1' onClick={handleShowSidebar} style={{ cursor: 'pointer' }}>
                   <FaBars className='header-icon' />
                </div>
              </div>
            ) : (
              <div onClick={handleShowSidebar} style={{ cursor: 'pointer' }} className='text-white p-0'>
                <FaBars className='header-icon' />
              </div>
            )}
          </Nav>
        </Container>

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

      {/* --- মোবাইল রাইট সাইডবার (Right Side Pop-up) --- */}
      <Offcanvas show={showSidebar} onHide={handleCloseSidebar} placement='end' className='text-white'>
        <Offcanvas.Header closeButton closeVariant='white' className='border-bottom border-secondary'>
          <Offcanvas.Title className='fw-bold text-warning'>GulfHut Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className='p-0'>
          <div className='d-flex flex-column'>
            {userInfo && (
              <div className='p-3 bg-secondary bg-opacity-25 text-center border-bottom border-secondary'>
                <Image src={userInfo?.image ? userInfo.image : '/images/profile.png'} roundedCircle className='mb-2 shadow' style={{ width: '70px', height: '70px', objectFit: 'cover', border: '2px solid #ffc107' }} />
                <h5 className='mb-0'>{userInfo.name}</h5>
                <small className='text-warning'>Balance: QR {userInfo.balance}</small>
              </div>
            )}

            <LinkContainer to='/' onClick={handleCloseSidebar}>
              <div className='sidebar-link'><FaHome /> Home</div>
            </LinkContainer>

            <div className='sidebar-category-title'>Settings & Account</div>

            <LinkContainer to='/profile' onClick={handleCloseSidebar}>
              <div className='sidebar-link'><FaEdit /> Edit Profile</div>
            </LinkContainer>

            <LinkContainer to='/cart' onClick={handleCloseSidebar}>
              <div className='sidebar-link'><FaShoppingCart /> My Cart</div>
            </LinkContainer>

            {userInfo ? (
              <div className='sidebar-link text-danger' onClick={logoutHandler} style={{ cursor: 'pointer' }}>
                <FaSignOutAlt /> Logout
              </div>
            ) : (
              <LinkContainer to='/login' onClick={handleCloseSidebar}>
                <div className='sidebar-link'><FaUser /> Login</div>
              </LinkContainer>
            )}
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
};

export default Header;