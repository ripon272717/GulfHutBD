import { Navbar, Container, Badge, Image, Form, InputGroup, Offcanvas, Button, Modal, Row, Col, Nav } from 'react-bootstrap';
import { FaBars, FaHome, FaLink, FaSyncAlt, FaCamera, FaShareAlt, FaEdit, FaSearch, FaSignOutAlt, FaUser, FaShoppingBag, FaUserCircle, FaShoppingCart } from 'react-icons/fa'; 
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useLogoutMutation, useProfileMutation, useUploadUserImageMutation } from '../slices/usersApiSlice'; 
import { logout, setCredentials } from '../slices/authSlice';
import logo from '../assets/gulflogo.png';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';

const Header = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const fileInputRef = useRef(null); 
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart || { cartItems: [] }); // কার্ট আইটেম সংখ্যা দেখানোর জন্য

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [logoutApiCall] = useLogoutMutation();
  const [updateProfile] = useProfileMutation();
  const [uploadUserImage, { isLoading: isUploading }] = useUploadUserImageMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      setShowProfileModal(false);
      navigate('/login');
    } catch (err) {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <header className='fixed-top shadow-sm'>
      <style>{`
        .navbar { background: #212529 !important; height: 75px; border-bottom: 2px solid #ffc107; padding: 0; }
        .notice-board { background: #ffc107; color: #000; padding: 2px 0; font-weight: bold; font-size: 11px; text-align: center; }
        
        .header-search { max-width: 300px; margin-left: 15px; }
        .search-input { border-radius: 20px 0 0 20px !important; border: none; font-size: 13px; height: 35px; }
        .search-btn { border-radius: 0 20px 20px 0 !important; background: #ffc107 !important; color: #000 !important; border: none; height: 35px; }

        .pc-menu-links { display: flex; align-items: center; margin: 0 15px; }
        .pc-menu-links a { color: white; text-decoration: none; margin: 0 10px; font-size: 14px; transition: 0.3s; }
        .pc-menu-links a:hover { color: #ffc107; }

        .cart-icon-wrapper { position: relative; cursor: pointer; color: white; font-size: 20px; margin: 0 15px; transition: 0.3s; }
        .cart-icon-wrapper:hover { color: #ffc107; }
        .cart-badge { position: absolute; top: -8px; right: -10px; background: #ffc107; color: #000; font-size: 10px; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-weight: bold; }

        .username-text { color: #fff; font-size: 13px; font-weight: bold; }
        .balance-text { color: #ffc107; font-size: 11px; font-weight: bold; }
        .header-profile-img { object-fit: cover; border: 2px solid #ffc107; cursor: pointer; margin-left: 10px; }

        .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: #212529; display: flex; justify-content: space-around; padding: 10px 0; border-top: 2px solid #ffc107; z-index: 1030; }
        .bottom-nav-item { color: #fff; text-decoration: none; text-align: center; font-size: 11px; cursor: pointer; flex: 1; }
        .bottom-nav-item.active { color: #ffc107; }
        .bottom-nav-item svg { font-size: 20px; display: block; margin: 0 auto 2px; }

        @media (max-width: 991px) {
          .pc-menu-links, .pc-cart { display: none !important; }
          .header-search { max-width: 150px; }
          .username-text { display: none; }
          body { padding-bottom: 70px; }
        }
      `}</style>

      <Navbar variant='dark'>
        <Container fluid className='px-2 d-flex align-items-center'>
          
          <Navbar.Brand onClick={() => navigate('/')} style={{cursor:'pointer'}} className='m-0 p-0'>
            <img src={logo} alt='logo' width='42'/>
          </Navbar.Brand>

          <div className='header-search flex-grow-1'>
            <InputGroup>
              <Form.Control placeholder="Search..." className='search-input shadow-none' />
              <Button className='search-btn'><FaSearch /></Button>
            </InputGroup>
          </div>

          <div className='pc-menu-links'>
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/contact">Contact</Link>
          </div>

          {/* পিসি কার্ট অপশন */}
          <div className='cart-icon-wrapper pc-cart' onClick={() => navigate('/cart')}>
            <FaShoppingCart />
            {cartItems?.length > 0 && <span className='cart-badge'>{cartItems.length}</span>}
          </div>

          <div className='d-flex align-items-center ms-auto'>
            {userInfo ? (
              <>
                <div className='text-end' style={{cursor:'pointer'}} onClick={() => setShowProfileModal(true)}>
                  <div className='username-text'>{userInfo.name.split(' ')[0]}</div>
                  <div className='balance-text'>QR {userInfo.balance || 0}</div>
                </div>
                <Image 
                  src={userInfo.image || logo} 
                  roundedCircle width='38' height='38' 
                  className='header-profile-img'
                  onClick={() => setShowProfileModal(true)} 
                />
              </>
            ) : (
              <Button size='sm' variant='warning' className='rounded-pill px-3' onClick={() => navigate('/login')}>Login</Button>
            )}

            <FaBars className='text-white ms-3 d-lg-none' style={{fontSize: '24px', cursor: 'pointer'}} onClick={() => setShowSidebar(true)} />
          </div>
        </Container>
      </Navbar>

      <div className="notice-board"><marquee>Welcome to Gulf Hut! Qatar to Bangladesh Fastest Delivery.</marquee></div>

      {/* মোবাইল বটম বার (এখানে কার্ট অপশন আছেই) */}
      <div className='bottom-nav d-lg-none'>
        <div className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>
          <FaHome /> <span>Home</span>
        </div>
        <div className={`bottom-nav-item ${location.pathname === '/shop' ? 'active' : ''}`} onClick={() => navigate('/shop')}>
          <FaShoppingBag /> <span>Shop</span>
        </div>
        <div className={`bottom-nav-item ${location.pathname === '/cart' ? 'active' : ''}`} onClick={() => navigate('/cart')}>
          <FaShoppingCart /> <span>Cart</span>
          {cartItems?.length > 0 && <Badge pill bg='warning' text='dark' style={{position:'absolute', top:'5px', right:'15%'}}>{cartItems.length}</Badge>}
        </div>
        <div className='bottom-nav-item' onClick={() => setShowProfileModal(true)}>
          <FaUserCircle /> <span>Profile</span>
        </div>
      </div>

      {/* মডাল ও সাইডবার আগের মতোই থাকছে */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered className='user-modal'>
        <Modal.Body className='text-center p-4 position-relative'>
          <button type="button" onClick={() => setShowProfileModal(false)} style={{position:'absolute', right:'15px', top:'15px', border:'none', background:'#eee', borderRadius:'50%', width:'30px', height:'30px'}}><FaTimes /></button>
          <Image src={userInfo?.image || logo} roundedCircle width='90' height='90' className='mb-3' style={{objectFit:'cover', border: '3px solid #ffc107'}}/>
          <h5 className='fw-bold'>{userInfo?.name}</h5>
          <Badge bg='dark' className='mb-3'>ID: {userInfo?.customId}</Badge>
          <div className='bg-light p-3 rounded-4 mb-3 border'>
            <small className='text-muted d-block'>Balance</small>
            <h4 className='text-success fw-bold mb-0'>QR {userInfo?.balance || 0}</h4>
          </div>
          <div className='d-grid gap-2'>
            <Button variant='dark' onClick={() => {navigate('/profile'); setShowProfileModal(false)}}>Settings</Button>
            <Button variant='danger' onClick={logoutHandler}>Logout</Button>
          </div>
        </Modal.Body>
      </Modal>

      <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement='end' className='bg-dark text-white'>
        <Offcanvas.Header closeButton closeVariant='white'>
          <Offcanvas.Title className='text-warning fw-bold'>MENU</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className='p-0'>
          <div className='p-3 border-bottom' onClick={() => {navigate('/'); setShowSidebar(false)}}><FaHome className='me-2 text-warning'/> Home</div>
          <div className='p-3 border-bottom' onClick={() => {navigate('/shop'); setShowSidebar(false)}}><FaShoppingBag className='me-2 text-warning'/> Shop</div>
          <div className='p-3 border-bottom' onClick={() => {navigate('/cart'); setShowSidebar(false)}}><FaShoppingCart className='me-2 text-warning'/> My Cart</div>
          {userInfo?.isAdmin && (
            <div className='p-3 border-bottom text-warning fw-bold' onClick={() => {navigate('/admin/userlist'); setShowSidebar(false)}}><FaEdit className='me-2'/> Admin</div>
          )}
          <div className='p-3' onClick={logoutHandler}><FaSignOutAlt className='me-2 text-danger'/> Logout</div>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
};

export default Header;