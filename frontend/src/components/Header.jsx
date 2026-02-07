import { Navbar, Nav, Container, Badge, Image, Form, InputGroup, Offcanvas, Button, NavDropdown, Collapse } from 'react-bootstrap';
import { FaShoppingCart, FaBars, FaChevronDown, FaSearch, FaHome, FaSignOutAlt, FaEdit, FaShareAlt, FaUserPlus, FaLink, FaBoxOpen } from 'react-icons/fa'; 
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
  
  // সার্চ বক্সের বাইরে ক্লিক হ্যান্ডেল করার জন্য
  const searchContainerRef = useRef(null);
  
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutApiCall] = useLogoutMutation();

  // বাইরে ক্লিক করলে সার্চ বক্স বন্ধ করার লজিক
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }
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

  // নামের প্রথম অক্ষর দিয়ে আইকন বানানোর ফাংশন (যদি ছবি না থাকে)
  const renderProfileIcon = (user, size = '55px', fontSize = '24px') => {
    if (user?.image) {
      return <Image src={user.image} roundedCircle style={{ width: size, height: size, border: '2px solid #ffc107', objectFit: 'cover' }} />;
    }
    const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', background: '#ffc107', 
        color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: fontSize, fontWeight: 'bold', border: '2px solid #fff'
      }}>
        {initial}
      </div>
    );
  };

  const inviteLink = userInfo ? `${window.location.origin}/register?invite=${userInfo._id}` : '';

  return (
    <header ref={searchContainerRef}>
      <style>
        {`
          .navbar { min-height: 80px; padding: 0 !important; }
          .nav-text { font-size: 19px !important; font-weight: bold; color: white !important; }
          .header-icon { font-size: 32px; cursor: pointer; color: white; }
          .brand-container { line-height: 1; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; padding-left: 8px; }
          .brand-text-sm { font-size: 13px; font-weight: bold; color: #ffc107; margin-top: 3px; letter-spacing: 0.5px; }
          
          .search-box-pc { background: #343a40 !important; border: 1px solid #495057 !important; color: white !important; border-radius: 25px 0 0 25px !important; }
          .search-btn-pc { border-radius: 0 25px 25px 0 !important; background: #ffc107 !important; border: none !important; color: #000 !important; }

          @media (max-width: 576px) {
            .navbar { min-height: 75px; }
            .header-icon { font-size: 30px; }
            .brand-text-sm { font-size: 11px; }
            .container-spacing { padding-left: 5px !important; padding-right: 5px !important; }
          }

          .sidebar-link { font-size: 19px; padding: 15px; border-bottom: 1px solid #343a40; display: flex; align-items: center; gap: 12px; color: white; text-decoration: none; }
          .sidebar-link:hover { background: #343a40; color: #ffc107; }
          
          .mobile-search-bar {
            background: #212529; padding: 15px; border-bottom: 3px solid #ffc107;
            position: absolute; top: 100%; left: 0; width: 100%; z-index: 1050;
            box-shadow: 0 10px 20px rgba(0,0,0,0.4);
          }
        `}
      </style>

      <Navbar bg='dark' variant='dark' fixed='top' className='shadow-sm'>
        <Container fluid className='container-spacing d-flex align-items-center justify-content-between px-2'>
          
          {/* লোগো ও নাম */}
          <div className='brand-container' onClick={() => { navigate('/'); setShowSearch(false); }}>
            <img src={logo} alt='GulfHut' style={{ width: '55px', height: '55px' }} />
            <span className='brand-text-sm'>GULF HUT</span>
          </div>

          {/* ক্যাটাগরি */}
          <Nav className='ms-1 ms-md-2'>
            <NavDropdown title={<span className='nav-text'>Category</span>} id='category-dropdown'>
              <LinkContainer to='/category/bra'><NavDropdown.Item>Bra</NavDropdown.Item></LinkContainer>
              <LinkContainer to='/category/cream'><NavDropdown.Item>Cream</NavDropdown.Item></LinkContainer>
            </NavDropdown>
          </Nav>

          {/* ডেস্কটপ সার্চ */}
          <Form onSubmit={submitHandler} className='d-none d-lg-flex flex-grow-1 mx-4' style={{ maxWidth: '400px' }}>
            <InputGroup>
              <Form.Control type='text' value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder='কি খুঁজছেন?' className='search-box-pc' />
              <InputGroup.Text as="button" type="submit" className="search-btn-pc"><FaSearch /></InputGroup.Text>
            </InputGroup>
          </Form>

          {/* রাইট সাইড আইকন */}
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
                <div className='text-end d-none d-sm-block' style={{ lineHeight: '1' }}>
                  <small className='text-warning d-block fw-bold'>QR {userInfo.balance}</small>
                </div>
                {renderProfileIcon(userInfo, '55px', '24px')}
              </div>
            )}
            
            <FaBars className='header-icon' onClick={handleShowSidebar} />
          </div>
        </Container>

        {/* মোবাইল সার্চ বক্স (হেডারের নিচে পপ-আপ) */}
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
      </Navbar>

      {/* ড্রয়ার বা সাইডবার */}
      <Offcanvas show={showSidebar} onHide={handleCloseSidebar} placement='end' className='bg-dark text-white'>
        <Offcanvas.Header closeButton closeVariant='white' className='border-bottom border-secondary'>
          <Offcanvas.Title className='text-warning fw-bold'>GulfHut Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className='p-0'>
          {userInfo ? (
            <div className='d-flex flex-column'>
              <div className='p-4 text-center'>
                <div onClick={() => {navigate('/profile'); handleCloseSidebar();}} style={{cursor:'pointer', display:'inline-block'}}>
                  {renderProfileIcon(userInfo, '110px', '45px')}
                </div>
                <h5 className='mt-3 mb-0'>{userInfo.name}</h5>
                <p className='text-warning mb-2'>Balance: QR {userInfo.balance}</p>
                
                <div className='bg-black bg-opacity-25 p-3 rounded mb-3 text-start'>
                  <Button variant="warning" className='w-100 fw-bold mb-3 d-flex align-items-center justify-content-center gap-2' onClick={() => {navigator.clipboard.writeText(inviteLink); alert('Link Copied!')}}>
                    <FaLink /> Copy Your Link
                  </Button>
                  <div className='d-flex gap-2'>
                    <Button variant="outline-info" className='flex-grow-1' onClick={() => {navigator.clipboard.writeText(inviteLink); alert('Shared!')}}><FaShareAlt /> Share</Button>
                    <Button variant="outline-success" className='flex-grow-1'><FaUserPlus /> Invite</Button>
                  </div>
                </div>
              </div>

              <div className='sidebar-link' onClick={() => {navigate('/'); handleCloseSidebar();}}><FaHome /> Home</div>
              <div className='sidebar-link' onClick={() => {navigate('/profile'); handleCloseSidebar();}}><FaEdit /> Edit Profile</div>
              <div className='sidebar-link' onClick={() => {navigate('/orders'); handleCloseSidebar();}}><FaBoxOpen /> My Orders</div>
              <div className='sidebar-link text-danger mt-3' onClick={logoutHandler}><FaSignOutAlt /> Logout</div>
            </div>
          ) : (
            <div className='p-4 text-center'>
              <LinkContainer to='/login' onClick={handleCloseSidebar}>
                <Button variant="warning" className='w-100 fw-bold py-3'>Login / Sign Up</Button>
              </LinkContainer>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
};

export default Header;