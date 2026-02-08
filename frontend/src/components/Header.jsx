import { Navbar, Nav, Container, Badge, Image, Form, InputGroup, Offcanvas, Button, NavDropdown, Collapse } from 'react-bootstrap';
import { FaShoppingCart, FaBars, FaSearch, FaHome, FaSignOutAlt, FaEdit, FaShareAlt, FaUserPlus, FaLink, FaBoxOpen } from 'react-icons/fa'; 
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import logo from '../assets/gulflogo.png';

const Header = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [keyword, setKeyword] = useState('');
  
  const searchContainerRef = useRef(null);
  
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutApiCall] = useLogoutMutation();

  // সার্চ বক্সের বাইরে ক্লিক করলে তা বন্ধ করার জন্য
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    if (showSearch) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch]);

  const handleCloseSidebar = () => setShowSidebar(false);
  const handleShowSidebar = () => setShowSidebar(true);

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
      setShowSearch(false);
      setKeyword('');
    }
  };

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      handleCloseSidebar();
      navigate('/login');
    } catch (err) { 
      dispatch(logout()); 
      handleCloseSidebar(); 
      navigate('/login'); 
    }
  };

  const renderProfileIcon = (user, size = '50px', fontSize = '22px') => {
    if (user?.image) {
      return <Image src={user.image} roundedCircle style={{ width: size, height: size, border: '2px solid #ffc107', objectFit: 'cover' }} />;
    }
    const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', background: '#ffc107', 
        color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: fontSize, fontWeight: 'bold', border: '2px solid #fff'
      }}>{initial}</div>
    );
  };

  const inviteLink = userInfo ? `${window.location.origin}/register?invite=${userInfo._id}` : '';

  return (
    <header ref={searchContainerRef} className='fixed-top shadow-sm'>
      <style>
        {`
          .navbar { min-height: 75px; padding: 0 !important; background: #212529 !important; }
          .nav-text { font-size: 18px !important; font-weight: bold; color: white !important; }
          .header-icon { font-size: 30px; cursor: pointer; color: white; }
          .brand-container { line-height: 1; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; }
          .brand-text-sm { font-size: 11px; font-weight: bold; color: #ffc107; margin-top: 2px; }
          
          .search-box-pc { background: #343a40 !important; border: 1px solid #495057 !important; color: white !important; border-radius: 25px 0 0 25px !important; }
          .search-btn-pc { border-radius: 0 25px 25px 0 !important; background: #ffc107 !important; border: none !important; color: #000 !important; }

          .mobile-search-bar { background: #212529; padding: 12px; border-bottom: 3px solid #ffc107; }

          .notice-board {
            background: #ffc107; color: #000; padding: 6px 0; 
            font-weight: bold; font-size: 22px; width: 100%;
            border-top: 1px solid #000;
          }

          @media (max-width: 576px) { 
            .notice-board { font-size: 18px; padding: 4px 0; }
            .navbar { min-height: 65px; }
            .header-icon { font-size: 26px; }
            .brand-text-sm { font-size: 9px; }
          }
        `}
      </style>

      {/* প্রধান ন্যাভিগেশন বার */}
      <Navbar variant='dark' className='p-0'>
        <Container fluid className='px-2'>
          
          {/* লোগো সেকশন */}
          <div className='brand-container' onClick={() => { navigate('/'); setShowSearch(false); }}>
            <img src={logo} alt='GulfHut' style={{ width: '48px', height: '48px' }} />
            <span className='brand-text-sm'>GULF HUT</span>
          </div>

          {/* ক্যাটাগরি মেনু */}
          <Nav className='ms-1'>
            <NavDropdown title={<span className='nav-text'>Category</span>} id='basic-nav-dropdown'>
              <LinkContainer to='/category/bra'><NavDropdown.Item>Bra</NavDropdown.Item></LinkContainer>
              <LinkContainer to='/category/cream'><NavDropdown.Item>Cream</NavDropdown.Item></LinkContainer>
            </NavDropdown>
          </Nav>

          {/* পিসি সার্চ বার */}
          <Form onSubmit={submitHandler} className='d-none d-lg-flex flex-grow-1 mx-4' style={{ maxWidth: '400px' }}>
            <InputGroup>
              <Form.Control type='text' value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder='কি খুঁজছেন?' className='search-box-pc' />
              <InputGroup.Text as="button" type="submit" className="search-btn-pc"><FaSearch /></InputGroup.Text>
            </InputGroup>
          </Form>

          {/* ডানদিকের আইকনসমূহ */}
          <div className='d-flex align-items-center gap-2 gap-md-3'>
            <FaSearch className='header-icon d-lg-none' onClick={() => setShowSearch(!showSearch)} />
            
            <LinkContainer to='/cart'>
              <div className='position-relative' style={{ cursor: 'pointer' }}>
                <FaShoppingCart className='header-icon' />
                {cartItems.length > 0 && (
                  <Badge pill bg='success' style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '12px' }}>
                    {cartItems.reduce((a, c) => a + c.qty, 0)}
                  </Badge>
                )}
              </div>
            </LinkContainer>

            {!userInfo ? (
              <LinkContainer to='/login'>
                <Button variant="warning" size="sm" className="fw-bold px-3">Sign Up</Button>
              </LinkContainer>
            ) : (
              <div className='d-flex align-items-center gap-2' onClick={handleShowSidebar} style={{ cursor: 'pointer' }}>
                <div className='text-end d-none d-sm-block'>
                  <small className='text-warning fw-bold'>QR {userInfo.balance}</small>
                </div>
                {renderProfileIcon(userInfo, '48px', '20px')}
              </div>
            )}
            <FaBars className='header-icon' onClick={handleShowSidebar} />
          </div>
        </Container>
      </Navbar>

      {/* মোবাইল সার্চ বক্স */}
      <Collapse in={showSearch}>
        <div className='mobile-search-bar d-lg-none'>
          <Form onSubmit={submitHandler}>
            <InputGroup>
              <Form.Control type='text' value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder='Search here...' className='search-box-pc py-2' autoFocus />
              <InputGroup.Text as="button" type="submit" className="search-btn-pc px-3"><FaSearch /></InputGroup.Text>
            </InputGroup>
          </Form>
        </div>
      </Collapse>

      {/* নোটিশ বোর্ড (Marquee) */}
      <div className="notice-board">
        <marquee behavior="scroll" direction="left">
          আমাদের শপে আপনাকে স্বাগতম! আকর্ষণীয় অফার পেতে এখনই রেজিস্টার করুন। যেকোনো সমস্যায় কল করুন আমাদের হেল্পলাইন নম্বরে।
        </marquee>
      </div>

      {/* সাইডবার মেনু */}
      <Offcanvas show={showSidebar} onHide={handleCloseSidebar} placement='end' className='bg-dark text-white'>
        <Offcanvas.Header closeButton closeVariant='white' className='border-bottom border-secondary'>
          <Offcanvas.Title className='text-warning fw-bold'>GulfHut Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className='p-0'>
          {userInfo ? (
            <div className='d-flex flex-column'>
              <div className='p-4 text-center'>
                <div onClick={() => {navigate('/profile'); handleCloseSidebar();}} style={{cursor:'pointer', display:'inline-block'}}>
                  {renderProfileIcon(userInfo, '100px', '40px')}
                </div>
                <h5 className='mt-3 mb-0'>{userInfo.name}</h5>
                <p className='text-warning mb-2'>Balance: QR {userInfo.balance}</p>
                <div className='bg-black bg-opacity-25 p-3 rounded mb-3'>
                  <Button variant="warning" className='w-100 fw-bold mb-2' onClick={() => {navigator.clipboard.writeText(inviteLink); alert('লিংক কপি হয়েছে!')}}>
                    <FaLink /> Copy Invite Link
                  </Button>
                  <div className='d-flex gap-2'>
                    <Button variant="outline-info" className='flex-grow-1'><FaShareAlt /> Share</Button>
                    <Button variant="outline-success" className='flex-grow-1'><FaUserPlus /> Invite</Button>
                  </div>
                </div>
              </div>
              <div className='sidebar-link p-3 border-bottom d-flex align-items-center gap-3' onClick={() => {navigate('/'); handleCloseSidebar();}} style={{cursor:'pointer'}}><FaHome /> Home</div>
              <div className='sidebar-link p-3 border-bottom d-flex align-items-center gap-3' onClick={() => {navigate('/profile'); handleCloseSidebar();}} style={{cursor:'pointer'}}><FaEdit /> Profile Settings</div>
              <div className='sidebar-link p-3 border-bottom d-flex align-items-center gap-3' onClick={() => {navigate('/orders'); handleCloseSidebar();}} style={{cursor:'pointer'}}><FaBoxOpen /> My Orders</div>
              <div className='p-3 text-danger d-flex align-items-center gap-3' onClick={logoutHandler} style={{cursor:'pointer'}}><FaSignOutAlt /> Logout</div>
            </div>
          ) : (
            <div className='p-4 text-center'>
              <LinkContainer to='/login' onClick={handleCloseSidebar}>
                <Button variant="warning" className='w-100 fw-bold py-2'>Login / Sign Up</Button>
              </LinkContainer>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
};

export default Header;