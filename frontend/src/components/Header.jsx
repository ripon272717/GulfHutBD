import { Navbar, Container, Badge, Image, Form, InputGroup, Nav, Button, Modal, Row, Col, Offcanvas } from 'react-bootstrap';
import { FaBars, FaHome, FaUserPlus, FaLink, FaSyncAlt, FaCamera, FaShareAlt, FaEdit, FaSearch, FaSignOutAlt, FaShoppingBag, FaUserCircle, FaShoppingCart, FaChartLine, FaCheckCircle, FaThList } from 'react-icons/fa'; 
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useLogoutMutation, useProfileMutation, useUploadUserImageMutation } from '../slices/usersApiSlice'; 
import { logout, setCredentials } from '../slices/authSlice';
import logo from '../assets/gulflogo.png';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';

const Header = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); 
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fileInputRef = useRef(null); 
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart || { cartItems: [] });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [logoutApiCall] = useLogoutMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useProfileMutation();
  const [uploadUserImage, { isLoading: isUploading }] = useUploadUserImageMutation();

  const isAdmin = userInfo && (userInfo.role === 'admin' || userInfo.role === 'superadmin');

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const updateProfileHandler = async (e) => {
    e.preventDefault();
    if (name.length < 4 || name.length > 8) {
        toast.error('Username must be 4-8 characters');
        return;
    }
    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const res = await updateProfile({
        _id: userInfo._id,
        name: name || userInfo.name,
        email: email || userInfo.email,
        password: password || undefined,
      }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success('Profile updated!');
      setIsEditMode(false);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const uploadRes = await uploadUserImage(formData).unwrap();
      const res = await updateProfile({ _id: userInfo._id, image: uploadRes.image }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success('Photo updated!');
    } catch (err) {
      toast.error('Upload failed!');
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
        .search-input { border-radius: 20px 0 0 20px !important; border: none; font-size: 13px; height: 35px; }
        .search-btn { border-radius: 0 20px 20px 0 !important; background: #ffc107 !important; color: #000 !important; border: none; height: 35px; }
        .user-name-box { max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: white; font-size: 13px; font-weight: bold; line-height: 1.1; }
        .role-badge { font-size: 10px; padding: 2px 10px; border-radius: 12px; margin-top: 5px; display: inline-block; font-weight: bold; text-transform: uppercase; }
        .bg-superadmin { background: #dc3545; color: white; }
        .bg-admin { background: #fd7e14; color: white; }
        .bg-user { background: #198754; color: white; }
        .edit-input { background: #fff !important; border: 1px solid #ddd !important; border-radius: 8px !important; font-size: 14px; margin-bottom: 10px; }
        .offcanvas { background: #212529 !important; color: white !important; }
        .offcanvas-link { color: white !important; text-decoration: none; padding: 15px 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #333; transition: 0.3s; }
        .offcanvas-link:hover { background: #333; color: #ffc107 !important; }
        @media (max-width: 991px) { .pc-only { display: none !important; } }
      `}</style>

      <Navbar variant='dark'>
        <Container fluid className='px-2 d-flex align-items-center'>
          {/* Mobile Bars */}
          <FaBars className='text-white me-2 d-lg-none' style={{fontSize: '22px', cursor: 'pointer'}} onClick={() => setShowSidebar(true)} />
          
          {/* Logo */}
          <Navbar.Brand onClick={() => navigate('/')} style={{cursor:'pointer'}} className='m-0 p-0 me-2'>
            <img src={logo} alt='logo' width='40'/>
          </Navbar.Brand>

          {/* PC Menu (Left Side) */}
          <div className='pc-only me-auto'>
            <Nav className='gap-3 align-items-center'>
              <Link to="/" className='text-white text-decoration-none small'><FaHome/> Home</Link>
              <Link to="/category" className='text-white text-decoration-none small'><FaThList/> Category</Link>
              <Link to="/shop" className='text-white text-decoration-none small'><FaShoppingBag/> Shop</Link>
              {isAdmin && <Link to="/admin/dashboard" className='text-warning text-decoration-none small fw-bold'>Dashboard</Link>}
            </Nav>
          </div>

          {/* Search Box */}
          <div className='flex-grow-1 mx-2' style={{maxWidth: '300px'}}>
            <InputGroup size="sm">
              <Form.Control placeholder="Search..." className='search-input shadow-none' />
              <Button className='search-btn'><FaSearch /></Button>
            </InputGroup>
          </div>

          {/* User Profile & Balance */}
          <div className='d-flex align-items-center ms-2'>
            <div className='pc-only me-3 position-relative' style={{color:'white', cursor:'pointer'}} onClick={() => navigate('/cart')}>
               <FaShoppingCart size={22}/>
               {cartItems.length > 0 && <Badge pill bg='warning' text='dark' style={{position:'absolute', top:'-10px', right:'-10px'}}>{cartItems.length}</Badge>}
            </div>

            {userInfo ? (
              <div className='d-flex align-items-center' onClick={() => setShowProfileModal(true)} style={{cursor:'pointer'}}>
                <div className='text-end me-2'>
                  <div className="user-name-box">{userInfo.name}</div>
                  <div style={{color:'#ffc107', fontSize:'11px', fontWeight: 'bold'}}>QR {userInfo.balance || 0}</div>
                </div>
                <Image src={userInfo.image || logo} roundedCircle width='38' height='38' style={{border: '2px solid #ffc107', objectFit:'cover'}} />
              </div>
            ) : (
              <Button size='sm' variant='warning' className='rounded-pill px-3' onClick={() => navigate('/login')}>Login</Button>
            )}
          </div>
        </Container>
      </Navbar>
      <div className="notice-board"><marquee scrollamount="5">Fastest shipping from Qatar to Bangladesh - Gulf Hut</marquee></div>

      {/* Mobile Sidebar (Offcanvas) */}
      <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement='start'>
        <Offcanvas.Header closeButton closeVariant='white' className='border-bottom border-secondary'>
          <Offcanvas.Title className='text-warning fw-bold'>GULF HUT MENU</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className='p-0'>
          <Link to="/" className='offcanvas-link' onClick={() => setShowSidebar(false)}><FaHome/> Home</Link>
          <Link to="/category" className='offcanvas-link' onClick={() => setShowSidebar(false)}><FaThList/> Categories</Link>
          <Link to="/shop" className='offcanvas-link' onClick={() => setShowSidebar(false)}><FaShoppingBag/> Shop</Link>
          {isAdmin && (
            <Link to="/admin/dashboard" className='offcanvas-link text-warning fw-bold' onClick={() => setShowSidebar(false)}>
              <FaChartLine/> Admin Dashboard
            </Link>
          )}
          <Link to="/cart" className='offcanvas-link' onClick={() => setShowSidebar(false)}><FaShoppingCart/> My Cart ({cartItems.length})</Link>
          <div className='p-4 mt-auto'>
            <Button variant='danger' className='w-100 rounded-pill' onClick={logoutHandler}><FaSignOutAlt/> Logout</Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Profile Modal */}
      <Modal show={showProfileModal} onHide={() => {setShowProfileModal(false); setIsEditMode(false);}} centered scrollable>
        <Modal.Body className='text-center p-4 position-relative'>
          <button onClick={() => {setShowProfileModal(false); setIsEditMode(false);}} style={{position:'absolute', right:'15px', top:'15px', border:'none', background:'#eee', borderRadius:'50%', width:'30px', height:'30px'}}><FaTimes /></button>
          
          <div className='position-relative d-inline-block mb-3 mt-2'>
            <Image src={userInfo?.image || logo} roundedCircle width='95' height='95' style={{objectFit:'cover', border: '3px solid #ffc107'}}/>
            <div onClick={() => fileInputRef.current.click()} style={{position:'absolute', bottom:0, right:0, background:'#ffc107', borderRadius:'50%', padding:'6px', cursor:'pointer', border:'2px solid #fff'}}>
              <FaCamera size={14}/>
            </div>
            <input type='file' ref={fileInputRef} hidden onChange={uploadFileHandler}/>
          </div>

          <div className='mb-3'>
            <h5 className='fw-bold mb-0'>{userInfo?.name}</h5>
            <div className={`role-badge bg-${userInfo?.role || 'user'}`}>{userInfo?.role || 'user'}</div>
          </div>

          <div className='bg-dark text-white p-3 rounded-4 mb-3 d-flex justify-content-between align-items-center text-start'>
            <div>
              <small className='opacity-75'>Total Balance</small>
              <h4 className='text-warning fw-bold mb-0'>QR {userInfo?.balance || 0}</h4>
            </div>
            <Button variant='outline-warning' size='sm' className='rounded-pill' onClick={() => window.location.reload()}><FaSyncAlt/> Sync</Button>
          </div>

          <Row className='g-2 mb-3'>
            <Col xs={6}>
               <Button variant='dark' className='w-100 d-flex justify-content-between align-items-center py-2 px-2 shadow-none' style={{fontSize: '12px'}}>
                <span><FaUserPlus className='text-warning me-1'/> Invites</span> 
                <Badge bg='warning' text='dark'>{userInfo?.inviteCount || 0}</Badge>
              </Button>
            </Col>
            <Col xs={6}>
               <Button variant='dark' className='w-100 d-flex justify-content-between align-items-center py-2 px-2 shadow-none' style={{fontSize: '12px'}}>
                <span><FaShareAlt className='text-info me-1'/> Shares</span> 
                <Badge bg='info'>{userInfo?.shareCount || 0}</Badge>
              </Button>
            </Col>
          </Row>

          <Row className='g-2 mb-3'>
            <Col xs={6}><Button variant='light' className='w-100 border py-2 shadow-sm' onClick={() => {navigate(isAdmin ? '/admin/dashboard' : '/dashboard'); setShowProfileModal(false)}}><FaChartLine className='text-warning d-block mx-auto mb-1'/> <b>Dashboard</b></Button></Col>
            <Col xs={6}><Button variant='light' className='w-100 border py-2 shadow-sm' onClick={() => {navigator.clipboard.writeText(inviteLink); toast.success('Link Copied!')}}><FaLink className='text-warning d-block mx-auto mb-1'/> <b>Invite Link</b></Button></Col>
          </Row>

          {isEditMode && (
            <Form className='text-start border-top pt-3'>
              <small className='fw-bold text-muted'>User Name (4-8 chars)</small>
              <Form.Control className='edit-input shadow-none' maxLength={8} value={name} onChange={(e) => setName(e.target.value)} />
              <small className='fw-bold text-muted'>Email Address</small>
              <Form.Control className='edit-input shadow-none' value={email} onChange={(e) => setEmail(e.target.value)} />
              <small className='fw-bold text-muted'>New Password</small>
              <Form.Control className='edit-input shadow-none' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form>
          )}

          {!isEditMode ? (
            <Button variant='warning' className='w-100 rounded-pill fw-bold py-2 shadow-sm mb-2' onClick={() => setIsEditMode(true)}>
              <FaEdit className='me-2'/> Edit Profile
            </Button>
          ) : (
            <div className='d-flex gap-2 mb-2'>
              <Button variant='secondary' className='w-100 rounded-pill' onClick={() => setIsEditMode(false)}>Cancel</Button>
              <Button variant='warning' className='w-100 rounded-pill fw-bold' onClick={updateProfileHandler} disabled={isUpdatingProfile}>
                <FaCheckCircle className='me-2'/> Update Profile
              </Button>
            </div>
          )}
          <Button variant='link' className='text-danger w-100 mt-2 text-decoration-none small fw-bold' onClick={logoutHandler}><FaSignOutAlt className='me-1'/> Logout</Button>
        </Modal.Body>
      </Modal>

      {/* Mobile Bottom Bar */}
      <div className='d-lg-none' style={{position:'fixed', bottom:0, width:'100%', background:'#212529', display:'flex', padding:'10px 0', borderTop:'2px solid #ffc107', zIndex:1030}}>
        <div onClick={() => navigate('/')} className='flex-grow-1 text-center text-white' style={{fontSize:'11px'}}><FaHome size={20}/><br/>Home</div>
        <div onClick={() => navigate('/shop')} className='flex-grow-1 text-center text-white' style={{fontSize:'11px'}}><FaShoppingBag size={20}/><br/>Shop</div>
        <div onClick={() => navigate('/cart')} className='flex-grow-1 text-center text-white' style={{fontSize:'11px', position:'relative'}}><FaShoppingCart size={20}/><br/>Cart {cartItems.length > 0 && <Badge pill bg='warning' text='dark' style={{position:'absolute', top:'-5px'}}>{cartItems.length}</Badge>}</div>
        <div onClick={() => setShowProfileModal(true)} className='flex-grow-1 text-center text-white' style={{fontSize:'11px'}}><FaUserCircle size={20}/><br/>Profile</div>
      </div>
    </header>
  );
};

export default Header;