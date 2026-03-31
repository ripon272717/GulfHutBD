import { Navbar, Container, Badge, Image, Form, InputGroup, Offcanvas, Button, Modal, Row, Col } from 'react-bootstrap';
import { FaBars, FaHome, FaUserPlus, FaLink, FaSyncAlt, FaCamera, FaShareAlt, FaEdit, FaSearch, FaSignOutAlt, FaShoppingBag, FaUserCircle, FaShoppingCart } from 'react-icons/fa'; 
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
  const { cartItems } = useSelector((state) => state.cart || { cartItems: [] });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [logoutApiCall] = useLogoutMutation();
  const [updateProfile] = useProfileMutation();
  const [uploadUserImage, { isLoading: isUploading }] = useUploadUserImageMutation();

  // Cloudinary তে ইমেজ আপলোড এবং প্রোফাইল আপডেট (তোর অরিজিনাল লজিক)
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const uploadRes = await uploadUserImage(formData).unwrap();
      const res = await updateProfile({ 
        _id: userInfo._id, 
        image: uploadRes.image 
      }).unwrap();

      dispatch(setCredentials({ ...res }));
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error(err?.data?.message || 'Upload failed!');
    }
  };

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

  const inviteLink = userInfo ? `${window.location.origin}/register?invite=${userInfo.customId || userInfo._id}` : '';

  return (
    <header className='fixed-top shadow-sm'>
      <style>{`
        .navbar { background: #212529 !important; height: 75px; border-bottom: 2px solid #ffc107; padding: 0; }
        .notice-board { background: #ffc107; color: #000; padding: 2px 0; font-weight: bold; font-size: 11px; text-align: center; }
        
        .header-search { max-width: 320px; margin-left: 15px; }
        .search-input { border-radius: 20px 0 0 20px !important; border: none; font-size: 13px; height: 35px; }
        .search-btn { border-radius: 0 20px 20px 0 !important; background: #ffc107 !important; color: #000 !important; border: none; height: 35px; }

        .pc-menu-links { display: flex; align-items: center; margin: 0 15px; }
        .pc-menu-links a { color: white; text-decoration: none; margin: 0 10px; font-size: 14px; font-weight: 500; transition: 0.3s; }
        .pc-menu-links a:hover { color: #ffc107; }

        .cart-icon-wrapper { position: relative; cursor: pointer; color: white; font-size: 22px; margin: 0 15px; }
        .cart-badge { position: absolute; top: -8px; right: -10px; background: #ffc107; color: #000; font-size: 10px; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-weight: bold; }

        .username-text { color: #fff; font-size: 13px; font-weight: bold; line-height: 1.1; }
        .balance-text { color: #ffc107; font-size: 11px; font-weight: bold; }
        .header-profile-img { object-fit: cover; border: 2px solid #ffc107; cursor: pointer; margin-left: 10px; }

        .profile-img-box { position: relative; display: inline-block; }
        .cam-icon { position: absolute; bottom: 0; right: 0; background: #ffc107; color: #212529; padding: 6px; border-radius: 50%; border: 2px solid #fff; cursor: pointer; }

        @media (max-width: 991px) {
          .pc-item { display: none !important; }
          .header-search { max-width: 160px; }
          body { padding-bottom: 70px; }
        }
      `}</style>

      <Navbar variant='dark'>
        <Container fluid className='px-2 d-flex align-items-center'>
          
          <Navbar.Brand onClick={() => navigate('/')} style={{cursor:'pointer', textAlign: 'center'}} className='m-0 p-0'>
            <img src={logo} alt='logo' width='40'/>
            <div className='pc-item' style={{fontSize: '8px', color: '#ffc107', fontWeight: 'bold'}}>GULF HUT</div>
          </Navbar.Brand>

          <div className='header-search flex-grow-1'>
            <InputGroup>
              <Form.Control placeholder="Search..." className='search-input shadow-none' />
              <Button className='search-btn'><FaSearch /></Button>
            </InputGroup>
          </div>

          <div className='pc-menu-links pc-item'>
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className='cart-icon-wrapper pc-item' onClick={() => navigate('/cart')}>
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
                <Image src={userInfo.image || logo} roundedCircle width='38' height='38' className='header-profile-img' onClick={() => setShowProfileModal(true)} />
              </>
            ) : (
              <Button size='sm' variant='warning' className='rounded-pill px-3' onClick={() => navigate('/login')}>Login</Button>
            )}
            <FaBars className='text-white ms-3 d-lg-none' style={{fontSize: '24px', cursor: 'pointer'}} onClick={() => setShowSidebar(true)} />
          </div>
        </Container>
      </Navbar>

      <div className="notice-board"><marquee scrollamount="5">Welcome to Gulf Hut! Fastest shipping from Qatar to Bangladesh.</marquee></div>

      {/* মোবাইল বটম বার */}
      <div className='bottom-nav d-lg-none' style={{position: 'fixed', bottom: 0, width: '100%', background: '#212529', display: 'flex', justifyContent: 'space-around', padding: '10px 0', borderTop: '2px solid #ffc107', zIndex: 1030}}>
        <div onClick={() => navigate('/')} style={{color: location.pathname === '/' ? '#ffc107' : '#fff', textAlign: 'center', fontSize: '11px'}}><FaHome size={20}/><br/>Home</div>
        <div onClick={() => navigate('/shop')} style={{color: location.pathname === '/shop' ? '#ffc107' : '#fff', textAlign: 'center', fontSize: '11px'}}><FaShoppingBag size={20}/><br/>Shop</div>
        <div onClick={() => navigate('/cart')} style={{color: location.pathname === '/cart' ? '#ffc107' : '#fff', textAlign: 'center', fontSize: '11px', position: 'relative'}}><FaShoppingCart size={20}/><br/>Cart {cartItems?.length > 0 && <Badge pill bg='warning' text='dark' style={{position:'absolute', top:'-5px', right:'5px'}}>{cartItems.length}</Badge>}</div>
        <div onClick={() => setShowProfileModal(true)} style={{color: '#fff', textAlign: 'center', fontSize: '11px'}}><FaUserCircle size={20}/><br/>Profile</div>
      </div>

      {/* প্রোফাইল মডাল (সব অপশন সহ) */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered>
        <Modal.Body className='text-center p-4 position-relative'>
          <button type="button" onClick={() => setShowProfileModal(false)} style={{position:'absolute', right:'15px', top:'15px', border:'none', background:'#eee', borderRadius:'50%', width:'30px', height:'30px'}}><FaTimes /></button>
          
          <div className='profile-img-box mb-3'>
            <Image src={userInfo?.image || logo} roundedCircle width='100' height='100' style={{objectFit:'cover', border: '3px solid #ffc107'}}/>
            <div className='cam-icon' onClick={() => fileInputRef.current.click()}>
              {isUploading ? <span className='spinner-border spinner-border-sm'></span> : <FaCamera/>}
            </div>
            <input type='file' ref={fileInputRef} hidden accept="image/*" onChange={uploadFileHandler}/>
          </div>

          <h4 className='fw-bold mb-0'>{userInfo?.name}</h4>
          <p className='text-primary small fw-bold'>ID: {userInfo?.customId || 'N/A'}</p>

          <div className='bg-light p-3 rounded-4 mb-3 border d-flex justify-content-between align-items-center'>
            <div className='text-start'>
              <small className='text-muted d-block'>Balance</small>
              <h4 className='text-success fw-bold mb-0'>QR {userInfo?.balance || 0}</h4>
            </div>
            <Button variant='outline-dark' size='sm' className='rounded-pill' onClick={() => window.location.reload()}><FaSyncAlt className='me-1'/> Sync</Button>
          </div>

          <Row className='g-2 mb-3'>
            <Col xs={6}>
              <Button variant='dark' className='w-100 d-flex justify-content-between align-items-center py-2 px-2' style={{fontSize: '12px'}}>
                <span><FaUserPlus className='text-warning me-1'/> Invites</span> 
                <Badge bg='warning' text='dark'>{userInfo?.inviteCount || 0}</Badge>
              </Button>
            </Col>
            <Col xs={6}>
              <Button variant='dark' className='w-100 d-flex justify-content-between align-items-center py-2 px-2' style={{fontSize: '12px'}}>
                <span><FaShareAlt className='text-info me-1'/> Shares</span> 
                <Badge bg='info'>{userInfo?.shareCount || 0}</Badge>
              </Button>
            </Col>
          </Row>

          <div className='mt-3 p-2 rounded bg-light border'>
            <small className='fw-bold d-block mb-1 text-muted small text-start'>Invite Link:</small>
            <InputGroup size='sm'>
              <Form.Control readOnly value={inviteLink} style={{fontSize: '11px'}} />
              <Button variant='warning' onClick={() => {navigator.clipboard.writeText(inviteLink); toast.success('Copied!');}}><FaLink/></Button>
            </InputGroup>
          </div>

          <div className='d-flex gap-2 mt-4'>
            <Button variant='outline-dark' className='w-100' onClick={() => {navigate('/profile'); setShowProfileModal(false)}}>Settings</Button>
            <Button variant='danger' className='w-100' onClick={logoutHandler}>Logout</Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* সাইডবার */}
      <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement='end' className='bg-dark text-white'>
        <Offcanvas.Header closeButton closeVariant='white'>
          <Offcanvas.Title className='text-warning fw-bold'>GULF HUT MENU</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className='p-0'>
          <div className='p-3 border-bottom' onClick={() => {navigate('/'); setShowSidebar(false)}}><FaHome className='me-2 text-warning'/> Home</div>
          <div className='p-3 border-bottom' onClick={() => {navigate('/shop'); setShowSidebar(false)}}><FaShoppingBag className='me-2 text-warning'/> Shop</div>
          {userInfo?.isAdmin && (
            <div className='p-3 border-bottom text-warning fw-bold' onClick={() => {navigate('/admin/userlist'); setShowSidebar(false)}}><FaEdit className='me-2'/> Admin Panel</div>
          )}
          <div className='p-3' onClick={logoutHandler}><FaSignOutAlt className='me-2 text-danger'/> Logout</div>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
};

export default Header;