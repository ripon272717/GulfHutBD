import { Navbar, Container, Badge, Image, Form, InputGroup, Offcanvas, Button, Modal, Row, Col, Nav } from 'react-bootstrap';
import { FaBars, FaHome, FaUserPlus, FaLink, FaSyncAlt, FaCamera, FaShareAlt, FaEdit, FaSearch, FaSignOutAlt, FaShoppingBag, FaUserCircle, FaShoppingCart, FaChartLine, FaCheckCircle } from 'react-icons/fa'; 
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
  const [name, setName] = useState(''); 
  const fileInputRef = useRef(null); 
  
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart || { cartItems: [] });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [logoutApiCall] = useLogoutMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useProfileMutation();
  const [uploadUserImage, { isLoading: isUploading }] = useUploadUserImageMutation();

  const isSuperAdmin = userInfo && userInfo.role === 'superadmin';
  const isAdmin = userInfo && (userInfo.role === 'admin' || userInfo.role === 'superadmin');

  const updateProfileHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile({
        _id: userInfo._id,
        name: name || userInfo.name,
      }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success('Profile updated!');
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
        
        .header-search { max-width: 320px; margin-left: 15px; }
        .search-input { border-radius: 20px 0 0 20px !important; border: none; font-size: 13px; height: 35px; }
        .search-btn { border-radius: 0 20px 20px 0 !important; background: #ffc107 !important; color: #000 !important; border: none; height: 35px; }

        .pc-menu { display: flex; align-items: center; margin-left: 20px; gap: 15px; }
        .pc-menu a { color: white; text-decoration: none; font-size: 14px; font-weight: 500; }
        .pc-menu a:hover { color: #ffc107; }

        .role-badge { font-size: 10px; padding: 2px 10px; border-radius: 12px; margin-top: 5px; display: inline-block; font-weight: bold; }
        .bg-superadmin { background: #dc3545; color: white; }
        .bg-admin { background: #fd7e14; color: white; }
        .bg-user { background: #198754; color: white; }

        @media (max-width: 991px) {
          .pc-view { display: none !important; }
          .header-search { max-width: 160px; }
        }
      `}</style>

      <Navbar variant='dark'>
        <Container fluid className='px-2 d-flex align-items-center'>
          <Navbar.Brand onClick={() => navigate('/')} style={{cursor:'pointer'}} className='m-0 p-0 text-center'>
            <img src={logo} alt='logo' width='42'/>
            <div className='pc-view' style={{fontSize: '8px', color: '#ffc107', fontWeight: 'bold'}}>GULF HUT</div>
          </Navbar.Brand>

          <div className='header-search flex-grow-1'>
            <InputGroup>
              <Form.Control placeholder="Search..." className='search-input shadow-none' />
              <Button className='search-btn'><FaSearch /></Button>
            </InputGroup>
          </div>

          <div className='pc-menu pc-view'>
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            {isAdmin && <Link to="/admin/dashboard" className='text-warning fw-bold'>Dashboard</Link>}
          </div>

          <div className='d-flex align-items-center ms-auto'>
            <div className='pc-view me-3' style={{position:'relative', color:'white', cursor:'pointer'}} onClick={() => navigate('/cart')}>
               <FaShoppingCart size={22}/>
               {cartItems.length > 0 && <Badge pill bg='warning' text='dark' style={{position:'absolute', top:'-10px', right:'-10px'}}>{cartItems.length}</Badge>}
            </div>

            {userInfo ? (
              <div className='d-flex align-items-center' onClick={() => setShowProfileModal(true)} style={{cursor:'pointer'}}>
                <div className='text-end me-2'>
                  <div style={{color:'white', fontSize:'12px', fontWeight:'bold'}}>{userInfo.name.split(' ')[0]}</div>
                  <div style={{color:'#ffc107', fontSize:'11px'}}>QR {userInfo.balance || 0}</div>
                </div>
                <Image src={userInfo.image || logo} roundedCircle width='40' height='40' style={{border: '2px solid #ffc107', objectFit:'cover'}} />
              </div>
            ) : (
              <Button size='sm' variant='warning' className='rounded-pill px-3' onClick={() => navigate('/login')}>Login</Button>
            )}
            <FaBars className='text-white ms-3 d-lg-none' style={{fontSize: '24px', cursor: 'pointer'}} onClick={() => setShowSidebar(true)} />
          </div>
        </Container>
      </Navbar>
      <div className="notice-board"><marquee scrollamount="5">Welcome to Gulf Hut! Fastest shipping from Qatar to Bangladesh.</marquee></div>

      {/* প্রোফাইল মডাল */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered>
        <Modal.Body className='text-center p-4 position-relative'>
          <button type="button" onClick={() => setShowProfileModal(false)} style={{position:'absolute', right:'15px', top:'15px', border:'none', background:'#eee', borderRadius:'50%', width:'30px', height:'30px'}}><FaTimes /></button>
          
          <div className='position-relative d-inline-block mb-3'>
            <Image src={userInfo?.image || logo} roundedCircle width='100' height='100' style={{objectFit:'cover', border: '3px solid #ffc107'}}/>
            <div onClick={() => fileInputRef.current.click()} style={{position:'absolute', bottom:0, right:0, background:'#ffc107', borderRadius:'50%', padding:'6px', cursor:'pointer', border:'2px solid #fff'}}>
              {isUploading ? <span className='spinner-border spinner-border-sm'></span> : <FaCamera size={14}/>}
            </div>
            <input type='file' ref={fileInputRef} hidden onChange={uploadFileHandler}/>
          </div>

          <div className='mb-2'>
            <input 
              type="text" 
              className='form-control text-center fw-bold border-0 bg-transparent' 
              defaultValue={userInfo?.name} 
              onChange={(e) => setName(e.target.value)}
              style={{fontSize: '20px'}}
            />
            <div className={`role-badge bg-${userInfo?.role || 'user'}`}>
              {userInfo?.role?.toUpperCase() || 'USER'}
            </div>
          </div>

          <div className='bg-light p-3 rounded-4 mb-3 border d-flex justify-content-between align-items-center'>
            <div className='text-start'>
              <small className='text-muted d-block'>Current Balance</small>
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

          <Row className='g-2 mb-3'>
            <Col xs={6}>
              <div className='p-2 border rounded-3 bg-light' style={{cursor:'pointer'}} onClick={() => {navigate(isAdmin ? '/admin/dashboard' : '/dashboard'); setShowProfileModal(false)}}>
                <FaChartLine className='text-warning mb-1'/><br/><span style={{fontSize:'12px', fontWeight:'bold'}}>Dashboard</span>
              </div>
            </Col>
            <Col xs={6}>
              <div className='p-2 border rounded-3 bg-light' onClick={() => {navigator.clipboard.writeText(inviteLink); toast.success('Link Copied!')}} style={{cursor:'pointer'}}>
                <FaLink className='text-warning mb-1'/><br/><span style={{fontSize:'12px', fontWeight:'bold'}}>Copy Link</span>
              </div>
            </Col>
          </Row>

          <Button variant='warning' className='w-100 rounded-pill mb-2 fw-bold py-2 shadow-sm' onClick={updateProfileHandler} disabled={isUpdatingProfile}>
            <FaCheckCircle className='me-2'/> {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
          </Button>

          <Button variant='danger' className='w-100 rounded-pill py-2' onClick={logoutHandler}><FaSignOutAlt className='me-2'/> Logout</Button>
        </Modal.Body>
      </Modal>

      {/* মোবাইল বটম বার */}
      <div className='d-lg-none' style={{position:'fixed', bottom:0, width:'100%', background:'#212529', display:'flex', justifyAround:'space-around', padding:'10px 0', borderTop:'2px solid #ffc107', zIndex:1030}}>
        <div onClick={() => navigate('/')} style={{color:'#fff', textAlign:'center', flex:1, fontSize:'11px'}}><FaHome size={20}/><br/>Home</div>
        <div onClick={() => navigate('/shop')} style={{color:'#fff', textAlign:'center', flex:1, fontSize:'11px'}}><FaShoppingBag size={20}/><br/>Shop</div>
        <div onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/dashboard')} style={{color:'#ffc107', textAlign:'center', flex:1, fontSize:'11px'}}><FaChartLine size={20}/><br/>Dashboard</div>
        <div onClick={() => navigate('/cart')} style={{color:'#fff', textAlign:'center', flex:1, fontSize:'11px', position:'relative'}}><FaShoppingCart size={20}/><br/>Cart {cartItems.length > 0 && <Badge pill bg='warning' text='dark' style={{position:'absolute', top:'-5px'}}>{cartItems.length}</Badge>}</div>
        <div onClick={() => setShowProfileModal(true)} style={{color:'#fff', textAlign:'center', flex:1, fontSize:'11px'}}><FaUserCircle size={20}/><br/>Profile</div>
      </div>
    </header>
  );
};

export default Header;