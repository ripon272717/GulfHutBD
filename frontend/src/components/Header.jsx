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
import { NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { CATEGORIES } from '../constants';

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
  const location = useLocation();

  const [logoutApiCall] = useLogoutMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useProfileMutation();
  const [uploadUserImage, { isLoading: isUploading }] = useUploadUserImageMutation();

  const isAdmin = userInfo && (userInfo.role === 'admin' || userInfo.role === 'superadmin');

  const fetchLatestProfile = async () => {
    if (!userInfo) return;
    try {
      const res = await updateProfile({ _id: userInfo._id }).unwrap(); 
      dispatch(setCredentials({ ...res }));
      
      if (res.role !== userInfo.role) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Auto-sync failed');
    }
  };

  useEffect(() => {
    if (showProfileModal) {
      fetchLatestProfile();
    }
  }, [showProfileModal]);

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
        .notice-board { background: #ffc107; color: #000; padding: 2px 0; font-weight: bold; font-size: 11px; text-align: center; display: flex; align-items: center; }
        .search-input { border-radius: 20px 0 0 20px !important; border: none; font-size: 13px; height: 35px; }
        .search-btn { border-radius: 0 20px 20px 0 !important; background: #ffc107 !important; color: #000 !important; border: none; height: 35px; }
        .user-name-box { max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: white; font-size: 13px; font-weight: bold; line-height: 1.1; }
        .role-badge { font-size: 10px; padding: 2px 10px; border-radius: 12px; margin-top: 5px; display: inline-block; font-weight: bold; text-transform: uppercase; }
        .bg-superadmin { background: #dc3545 !important; color: white; }
        .bg-admin { background: #fd7e14 !important; color: white; }
        .bg-user { background: #198754 !important; color: white; }
        .edit-input { background: #fff !important; border: 1px solid #ddd !important; border-radius: 8px !important; font-size: 14px; margin-bottom: 10px; }
        .offcanvas { background: #212529 !important; color: white !important; }
        .offcanvas-link { color: white !important; text-decoration: none; padding: 15px 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #333; transition: 0.3s; cursor: pointer; }
        .offcanvas-link:hover { background: #333; color: #ffc107 !important; }
        
        /* Category Dropdown Styling */
        .category-dropdown .dropdown-toggle::after { display: none; }
        .category-dropdown .dropdown-menu { background: #212529; border: 1px solid #ffc107; border-radius: 10px; padding: 10px; }
        .category-dropdown .dropdown-item { color: white; font-size: 13px; border-bottom: 1px solid #333; padding: 8px 15px; }
        .category-dropdown .dropdown-item:hover { background: #ffc107 !important; color: black !important; border-radius: 5px; }

        /* Submenu Styling for PC */
        .dropdown-submenu { position: relative; }
        .dropdown-submenu .submenu-content { 
          display: none; position: absolute; left: 100%; top: 0; 
          background: #212529; border: 1px solid #ffc107; min-width: 160px; 
          border-radius: 8px; z-index: 1000; padding: 5px;
        }
        .dropdown-submenu:hover .submenu-content { display: block; }
        .dropdown-submenu:hover > span { color: #ffc107 !important; }
        
        @media (max-width: 991px) { 
          .pc-only { display: none !important; }
          .user-name-box { max-width: 80px; font-size: 11px; }
        }
      `}</style>

      <Navbar variant='dark'>
        <Container fluid className='px-2 d-flex align-items-center'>
          {/* PC ও মোবাইল সবখানে ব্র্যান্ড লোগো */}
          <Navbar.Brand onClick={() => navigate('/')} style={{cursor:'pointer'}} className='m-0 p-0 me-2'>
            <img src={logo} alt='logo' width='40'/>
          </Navbar.Brand>

          {/* PC Menu (Left Side) */}
          <div className='pc-only me-auto'>
            <Nav className='gap-4 align-items-center'>
              <Link to="/" className='text-white text-decoration-none small d-flex align-items-center gap-1'>
                <FaHome className='text-warning'/> Home
              </Link>

              <NavDropdown 
                title={<span><FaThList className='text-warning me-1'/> Category</span>} 
                id="pc-category-dropdown" 
                className="category-dropdown small"
              >
                {CATEGORIES.map((item) => (
                  item.sub && item.sub.length > 0 ? (
                    <div key={item.name} className="dropdown-submenu px-3 py-2 text-white" style={{cursor: 'pointer'}}>
                      <span className="d-flex justify-content-between align-items-center" style={{fontSize: '13px'}}>
                        {item.name} <small>▶</small>
                      </span>
                      <div className="submenu-content shadow">
                        {item.sub.map((s) => (
                          <LinkContainer key={s} to={`/search/category/${s}`}>
                            <NavDropdown.Item>{s}</NavDropdown.Item>
                          </LinkContainer>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <LinkContainer key={item.name} to={`/search/category/${item.name}`}>
                      <NavDropdown.Item>{item.name}</NavDropdown.Item>
                    </LinkContainer>
                  )
                ))}
              </NavDropdown>

              <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} className='text-white text-decoration-none small d-flex align-items-center gap-1'>
                <FaChartLine className='text-warning'/> Dashboard
              </Link>
              <Link to="/about" className='text-white text-decoration-none small d-flex align-items-center gap-1'>
                <FaUserPlus className='text-warning'/> About Us
              </Link>
              <Link to="/rules" className='text-white text-decoration-none small d-flex align-items-center gap-1'>
                <FaCheckCircle className='text-warning'/> Discussion
              </Link>
            </Nav>
          </div>

          {/* Search Box */}
          <div className='flex-grow-1 mx-2' style={{maxWidth: '300px'}}>
            <InputGroup size="sm">
              <Form.Control placeholder="Search..." className='search-input shadow-none' />
              <Button className='search-btn'><FaSearch /></Button>
            </InputGroup>
          </div>

          {/* Right Side: Profile & Cart */}
          <div className='d-flex align-items-center ms-auto'>
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
                <Image src={userInfo.image || logo} roundedCircle width='35' height='35' style={{border: '2px solid #ffc107', objectFit:'cover'}} />
              </div>
            ) : (
              <Button size='sm' variant='warning' className='rounded-pill px-3 fw-bold' onClick={() => navigate('/login')}>Login</Button>
            )}
          </div>
        </Container>
      </Navbar>

      {/* Notice Board with Mobile Menu Icon on the Left */}
      <div className="notice-board">
        <div className="d-lg-none px-2 border-end border-dark" onClick={() => setShowSidebar(true)} style={{cursor: 'pointer'}}>
          <FaBars size={18} />
        </div>
        <marquee scrollamount="5" className="flex-grow-1">Fastest shipping from Qatar to Bangladesh - Gulf Hut</marquee>
      </div>

      {/* Mobile Sidebar (Offcanvas) */}
      <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement='start'>
        <Offcanvas.Header closeButton closeVariant='white' className='border-bottom border-secondary'>
          <Offcanvas.Title className='text-warning fw-bold'>GULF HUT MENU</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className='p-0 d-flex flex-column'>
          <Link to="/" className='offcanvas-link' onClick={() => setShowSidebar(false)}>
            <FaHome className='text-warning'/> Home
          </Link>

          <NavDropdown 
            title={<span><FaThList className='text-warning me-2'/> Categories</span>} 
            className='offcanvas-link text-white w-100' 
            id="mobile-category-dropdown"
          >
            {CATEGORIES.map((item) => (
              item.sub && item.sub.length > 0 ? (
                <div key={item.name} className="ps-3 border-bottom border-secondary bg-dark pb-2">
                  <div className="text-warning fw-bold py-2 small" style={{fontSize:'12px'}}>{item.name}</div>
                  {item.sub.map((s) => (
                    <LinkContainer key={s} to={`/search/category/${s}`} onClick={() => setShowSidebar(false)}>
                      <NavDropdown.Item className='text-white-50 ps-4 small py-1' style={{background:'transparent'}}>- {s}</NavDropdown.Item>
                    </LinkContainer>
                  ))}
                </div>
              ) : (
                <LinkContainer key={item.name} to={`/search/category/${item.name}`} onClick={() => setShowSidebar(false)}>
                  <NavDropdown.Item className='bg-dark text-white border-bottom border-secondary py-2'>{item.name}</NavDropdown.Item>
                </LinkContainer>
              )
            ))}
          </NavDropdown>

          <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} className='offcanvas-link' onClick={() => setShowSidebar(false)}>
            <FaChartLine className='text-warning'/> Dashboard
          </Link>
          <Link to="/about" className='offcanvas-link' onClick={() => setShowSidebar(false)}>
            <FaUserPlus className='text-warning'/> About Us
          </Link>
          <Link to="/rules" className='offcanvas-link' onClick={() => setShowSidebar(false)}>
            <FaCheckCircle className='text-warning'/> Rules & Discussion
          </Link>
          <Link to="/cart" className='offcanvas-link' onClick={() => setShowSidebar(false)}>
            <FaShoppingCart className='text-warning'/> My Cart ({cartItems.length})
          </Link>

          <div className='p-4 mt-auto'>
            <Button variant='danger' className='w-100 rounded-pill' onClick={logoutHandler}>
              <FaSignOutAlt className='me-2'/> Logout
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Profile Modal */}
      <Modal 
        show={showProfileModal} 
        onHide={() => {setShowProfileModal(false); setIsEditMode(false);}} 
        centered 
        scrollable
        contentClassName="rounded-4 border-0 overflow-hidden"
      >
        <button 
          onClick={() => {setShowProfileModal(false); setIsEditMode(false);}} 
          style={{
            position: 'absolute', right: '15px', top: '15px', zIndex: 10, border: 'none', 
            background: '#f1f1f1', borderRadius: '50%', width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          <FaTimes />
        </button>
        
        <Modal.Body className='text-center p-4'>
          <div className='position-relative d-inline-block mb-3 mt-4'>
            <Image 
              src={userInfo?.image || logo} 
              roundedCircle 
              width='95' 
              height='95' 
              style={{objectFit:'cover', border: '3px solid #ffc107'}}
            />
            <div 
              onClick={() => fileInputRef.current.click()} 
              style={{position:'absolute', bottom:0, right:0, background:'#ffc107', borderRadius:'50%', padding:'6px', cursor:'pointer', border:'2px solid #fff'}}
            >
              <FaCamera size={14}/>
            </div>
            <input type='file' ref={fileInputRef} hidden onChange={uploadFileHandler}/>
          </div>

          <div className='mb-3'>
            <div className='d-block mb-2'>
              <h5 className='fw-bold m-0' style={{ color: '#000000', display: 'block' }}>
                {userInfo?.name || "User Name"}
              </h5>
            </div>
            <div className='d-block mb-2'>
              <div style={{ display: 'inline-block', background: '#f8f9fa', border: '1px solid #ddd', padding: '2px 12px', borderRadius: '6px' }}>
                <span className='fw-bold' style={{ fontSize: '0.9rem', color: '#333' }}>
                  CID: {userInfo?.customId || 'QHBD000000'}
                </span>
              </div>
            </div>
            <div className='d-block'>
              <div className={`role-badge bg-${userInfo?.role || 'user'}`} style={{ display: 'inline-block' }}>
                {userInfo?.role || 'user'}
              </div>
            </div>
          </div>

          <div className='bg-dark text-white p-3 rounded-4 mb-3 d-flex justify-content-between align-items-center text-start'>
            <div>
              <small className='opacity-75'>Total Balance</small>
              <h4 className='text-warning fw-bold mb-0'>QR {userInfo?.balance || 0}</h4>
            </div>
            <Button variant='outline-warning' size='sm' className='rounded-pill' onClick={fetchLatestProfile}><FaSyncAlt/> Sync</Button>
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
            <Col xs={6}>
              <Button variant='light' className='w-100 border py-2 shadow-sm' onClick={() => {navigate(isAdmin ? '/admin/dashboard' : '/dashboard'); setShowProfileModal(false)}}>
                <FaChartLine className='text-warning d-block mx-auto mb-1'/> <b>Dashboard</b>
              </Button>
            </Col>
            <Col xs={6}>
              <Button variant='light' className='w-100 border py-2 shadow-sm' onClick={() => {navigator.clipboard.writeText(inviteLink); toast.success('Link Copied!')}}>
                <FaLink className='text-warning d-block mx-auto mb-1'/> <b>Invite Link</b>
              </Button>
            </Col>
          </Row>

          {isEditMode && (
            <Form className='text-start border-top pt-3'>
              <small className='fw-bold text-muted'>User Name (4-8 chars)</small>
              <Form.Control className='edit-input shadow-none mb-2' maxLength={8} value={name} onChange={(e) => setName(e.target.value)} />
              <small className='fw-bold text-muted'>Email Address</small>
              <Form.Control className='edit-input shadow-none mb-2' value={email} onChange={(e) => setEmail(e.target.value)} />
              <small className='fw-bold text-muted'>New Password</small>
              <Form.Control className='edit-input shadow-none mb-2' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <small className='fw-bold text-muted'>Confirm Password</small>
              <Form.Control className='edit-input shadow-none mb-2' type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
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
          
          <Button variant='link' className='text-danger w-100 mt-2 text-decoration-none small fw-bold' onClick={logoutHandler}>
            <FaSignOutAlt className='me-1'/> Logout
          </Button>
        </Modal.Body>
      </Modal>

      {/* Mobile Bottom Navigation Bar */}
      <div className='d-lg-none' style={{
        position:'fixed', bottom:0, width:'100%', background:'#212529', display:'flex', 
        justifyContent: 'space-around', padding:'8px 0', borderTop:'2px solid #ffc107', 
        zIndex:1030, boxShadow: '0 -2px 10px rgba(0,0,0,0.3)'
      }}>
        <div onClick={() => navigate('/')} className='text-center text-white' style={{fontSize:'10px', flex: 1}}>
          <FaHome size={20} style={{color: location.pathname === '/' ? '#ffc107' : 'white'}}/><br/>Home
        </div>
        <div onClick={() => navigate('/category')} className='text-center text-white' style={{fontSize:'10px', flex: 1}}>
          <FaThList size={20} style={{color: location.pathname === '/category' ? '#ffc107' : 'white'}}/><br/>Category
        </div>
        <div onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/dashboard')} className='text-center text-white' style={{fontSize:'10px', flex: 1}}>
          <div style={{
            background: '#ffc107', width: '45px', height: '45px', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '-25px auto 5px', 
            border: '4px solid #212529', boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}>
            <FaChartLine size={20} color='#000'/>
          </div>
          Dashboard
        </div>
        <div onClick={() => navigate('/contact')} className='text-center text-white' style={{fontSize:'10px', flex: 1}}>
          <FaUserPlus size={20} style={{color: location.pathname === '/contact' ? '#ffc107' : 'white'}}/><br/>Contact
        </div>
        <div onClick={() => setShowProfileModal(true)} className='text-center text-white' style={{fontSize:'10px', flex: 1}}>
          <div className="position-relative d-inline-block">
            <FaUserCircle size={20} style={{color: showProfileModal ? '#ffc107' : 'white'}}/>
            {cartItems.length > 0 && (
               <Badge pill bg='warning' text='dark' style={{position:'absolute', top:'-8px', right:'-8px', fontSize: '8px'}}>
                 {cartItems.length}
               </Badge>
            )}
          </div>
          <br/>Profile
        </div>
      </div>
    </header>
  );
};

export default Header;