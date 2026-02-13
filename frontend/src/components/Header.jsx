import { Navbar, Container, Badge, Image, Form, InputGroup, Offcanvas, Button, Modal, Row, Col } from 'react-bootstrap';
import { FaBars, FaSearch, FaHome, FaSignOutAlt, FaEdit, FaShareAlt, FaUserPlus, FaLink, FaSyncAlt, FaTimes, FaCamera } from 'react-icons/fa'; 
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useLogoutMutation, useProfileMutation, useUploadUserImageMutation } from '../slices/usersApiSlice'; 
import { logout, setCredentials } from '../slices/authSlice';
import logo from '../assets/gulflogo.png';
import { toast } from 'react-toastify';

const Header = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const fileInputRef = useRef(null); 
  const { userInfo } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [logoutApiCall] = useLogoutMutation();
  const [updateProfile, { isLoading: loadingUpdate }] = useProfileMutation();
  const [uploadUserImage, { isLoading: loadingUpload }] = useUploadUserImageMutation();

  const handleCameraClick = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      // ১. ছবি ক্লাউডিনারিতে পাঠানো
      const uploadRes = await uploadUserImage(formData).unwrap();
      
      // ২. প্রাপ্ত URL দিয়ে ইউজারের প্রোফাইল আপডেট
      const res = await updateProfile({
        _id: userInfo._id,
        name: userInfo.name,
        email: userInfo.email,
        image: uploadRes.image, 
      }).unwrap();

      dispatch(setCredentials({ ...res })); 
      toast.success('প্রোফাইল ছবি সফলভাবে পরিবর্তন হয়েছে!');
    } catch (err) {
      toast.error(err?.data?.message || 'আপলোড ব্যর্থ হয়েছে! সার্ভার রিস্টার্ট দিয়ে দেখো।');
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

  const renderProfileIcon = (size) => {
    if (userInfo?.image) {
      return <Image src={userInfo.image} roundedCircle style={{ width: size, height: size, objectFit: 'cover', border: '2px solid #ffc107' }} />;
    }
    return <div style={{ width: size, height: size, borderRadius: '50%', background: '#ffc107', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{userInfo?.name?.charAt(0)}</div>;
  };

  const inviteLink = userInfo ? `${window.location.origin}/register?invite=${userInfo.customId || userInfo._id}` : '';

  return (
    <header className='fixed-top shadow-sm'>
      <style>{`
        .navbar { background: #212529 !important; min-height: 70px; }
        .notice-board { background: #ffc107; color: #000; padding: 4px 0; font-weight: bold; text-align: center; border-top: 1px solid #000; }
        .user-profile-modal .modal-content { border-radius: 20px; border: 3px solid #ffc107; }
        .profile-pic-box { position: relative; display: inline-block; }
        .cam-btn { position: absolute; bottom: 5px; right: 5px; background: #212529; color: #ffc107; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; cursor: pointer; }
        .referral-card { background: #fff9e6; border: 2px dashed #ffc107; border-radius: 12px; padding: 10px; margin-top: 10px; }
      `}</style>

      <Navbar variant='dark' className='p-0'>
        <Container fluid className='d-flex align-items-center justify-content-between px-2'>
          <div onClick={() => navigate('/')} style={{cursor:'pointer', textAlign: 'center'}}>
            <img src={logo} alt='Logo' style={{ width: '38px' }} />
            <div style={{fontSize: '8px', color: '#ffc107', fontWeight: 'bold'}}>GULF HUT</div>
          </div>

          <div className='d-flex align-items-center'>
            {userInfo ? (
              <div className='d-flex align-items-center' onClick={() => setShowProfileModal(true)} style={{cursor: 'pointer'}}>
                <div className='text-end me-2'>
                  <span className='d-block text-white fw-bold' style={{fontSize: '13px'}}>{userInfo.name}</span>
                  <span className='text-warning fw-bold' style={{fontSize: '11px'}}>QR {userInfo.balance || '0'}</span>
                </div>
                {renderProfileIcon('38px')}
              </div>
            ) : (
              <Button variant="warning" size="sm" onClick={() => navigate('/login')}>Login</Button>
            )}
            <FaBars className='text-white ms-3' style={{fontSize: '22px', cursor: 'pointer'}} onClick={() => setShowSidebar(true)} />
          </div>
        </Container>
      </Navbar>

      <div className="notice-board"><marquee>স্বাগতম GulfHut এ!</marquee></div>

      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered className="user-profile-modal">
        <Modal.Body className="text-center p-4">
          <button className="btn-close" style={{position:'absolute', right:'15px', top:'15px'}} onClick={() => setShowProfileModal(false)}></button>
          
          <div className="profile-pic-box">
            {renderProfileIcon('100px')}
            <div className="cam-btn" onClick={handleCameraClick}>
               {(loadingUpload || loadingUpdate) ? <span className="spinner-border spinner-border-sm"></span> : <FaCamera size={16} />}
            </div>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={uploadFileHandler} />
          </div>
          
          <h3 className="mt-2 fw-bold text-dark">{userInfo?.name}</h3>
          <p className="text-primary fw-bold mb-3">User ID: {userInfo?.customId || 'QHBD1001'}</p>

          <Row className="mb-3 g-2">
            <Col xs={7}>
              <div className="p-2 bg-light rounded text-start border shadow-sm">
                <small className="text-muted d-block fw-bold" style={{fontSize: '11px'}}>Current Balance</small>
                <h4 className="mb-0 text-success fw-bold">QR {userInfo?.balance || '0'}</h4>
              </div>
            </Col>
            <Col xs={5}>
              <Button variant="info" className="w-100 h-100 fw-bold text-white shadow-sm" onClick={() => window.location.reload()}><FaSyncAlt /></Button>
            </Col>
          </Row>

          <Button variant="dark" className="w-100 mb-2 d-flex justify-content-between align-items-center py-2 px-3 fw-bold border-0">
            <span><FaUserPlus className="text-warning me-2"/> Invites</span>
            <Badge bg="warning" text="dark">{userInfo?.inviteCount || 0}</Badge>
          </Button>

          <Button variant="dark" className="w-100 mb-2 d-flex justify-content-between align-items-center py-2 px-3 fw-bold border-0">
            <span><FaShareAlt className="text-info me-2"/> Shares</span>
            <Badge bg="info">{userInfo?.shareCount || 0}</Badge>
          </Button>

          <div className="referral-card text-start shadow-sm">
            <small className="fw-bold mb-1 d-block text-muted">Referral Link:</small>
            <InputGroup size="sm">
              <Form.Control readOnly value={inviteLink} />
              <Button variant="warning" onClick={() => {navigator.clipboard.writeText(inviteLink); toast.success('Copied!');}}><FaLink /></Button>
            </InputGroup>
          </div>

          <div className="d-flex gap-2 border-top pt-3 mt-3">
            <Button variant="warning" className="w-100 fw-bold" onClick={() => toast.info('Click camera to change photo')}>Update Photo</Button>
            <Button variant="danger" className="w-100 fw-bold" onClick={logoutHandler}>Logout</Button>
          </div>
        </Modal.Body>
      </Modal>

      <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement='end' className='bg-dark text-white'>
        <Offcanvas.Header closeButton closeVariant='white'><Offcanvas.Title className='text-warning fw-bold'>MENU</Offcanvas.Title></Offcanvas.Header>
        <Offcanvas.Body className='p-0'>
            <div className='p-3 border-bottom' onClick={() => {navigate('/'); setShowSidebar(false);}}><FaHome className='me-2'/> Home</div>
            <div className='p-3 border-bottom' onClick={() => {navigate('/profile'); setShowSidebar(false);}}><FaEdit className='me-2'/> Edit Profile</div>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
};

export default Header;