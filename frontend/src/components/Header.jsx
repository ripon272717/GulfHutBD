import { Navbar, Container, Badge, Image, Form, InputGroup, Offcanvas, Button, Modal, Row, Col } from 'react-bootstrap';
import { FaBars, FaHome, FaUserPlus, FaLink, FaSyncAlt, FaCamera, FaShareAlt, FaEdit } from 'react-icons/fa'; 
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
  const [updateProfile] = useProfileMutation();
  const [uploadUserImage, { isLoading: isUploading }] = useUploadUserImageMutation();

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      // 1. Image upload to Cloudinary via backend
      const uploadRes = await uploadUserImage(formData).unwrap();
      
      // 2. Update user profile with new image URL
      const res = await updateProfile({ 
        _id: userInfo._id, 
        image: uploadRes.image 
      }).unwrap();

      dispatch(setCredentials({ ...res }));
      toast.success('Profile picture updated successfully!');
    } catch (err) {
      toast.error(err?.data?.message || 'Upload failed! Server check koro.');
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
        .navbar { background: #212529 !important; height: 70px; }
        .user-modal .modal-content { border-radius: 20px; border: 3px solid #ffc107; }
        .profile-img-box { position: relative; display: inline-block; }
        .cam-icon { position: absolute; bottom: 5px; right: 5px; background: #212529; color: #ffc107; padding: 8px; border-radius: 50%; border: 2px solid #fff; cursor: pointer; }
        .notice-board { background: #ffc107; color: #000; padding: 2px 0; font-weight: bold; font-size: 12px; }
      `}</style>

      <Navbar variant='dark' className='p-0'>
        <Container fluid className='px-2 d-flex justify-content-between align-items-center'>
          <div onClick={() => navigate('/')} style={{cursor:'pointer', textAlign: 'center'}}>
            <img src={logo} alt='logo' width='38'/>
            <div style={{fontSize: '8px', color: '#ffc107', fontWeight: 'bold'}}>GULF HUT</div>
          </div>

          <div className='d-flex align-items-center'>
            {userInfo ? (
              <div className='d-flex align-items-center' onClick={() => setShowProfileModal(true)} style={{cursor:'pointer'}}>
                <div className='text-end me-2 text-white' style={{fontSize:'12px'}}>
                  <b>{userInfo.name}</b><br/><span className='text-warning'>QR {userInfo.balance || 0}</span>
                </div>
                <Image src={userInfo.image || logo} roundedCircle width='38' height='38' style={{objectFit:'cover', border: '2px solid #ffc107'}}/>
              </div>
            ) : (
              <Button size='sm' variant='warning' onClick={() => navigate('/login')}>Login</Button>
            )}
            <FaBars className='text-white ms-3' style={{fontSize: '22px', cursor: 'pointer'}} onClick={() => setShowSidebar(true)} />
          </div>
        </Container>
      </Navbar>

      <div className="notice-board"><marquee>Welcome to Gulf Hut! Happy Shopping.</marquee></div>

      {/* Profile Modal */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered className='user-modal'>
        <Modal.Body className='text-center p-4'>
          <div className='profile-img-box'>
            <Image src={userInfo?.image || logo} roundedCircle width='100' height='100' style={{objectFit:'cover', border: '3px solid #ffc107'}}/>
            <div className='cam-icon' onClick={() => fileInputRef.current.click()}>
              {isUploading ? <span className='spinner-border spinner-border-sm'></span> : <FaCamera/>}
            </div>
            <input type='file' ref={fileInputRef} hidden accept="image/*" onChange={uploadFileHandler}/>
          </div>
          
          <h4 className='mt-2 fw-bold'>{userInfo?.name}</h4>
          <p className='text-primary fw-bold mb-3'>User ID: {userInfo?.customId || 'N/A'}</p>
          
          <Row className='g-2 mb-3'>
            <Col xs={8}>
              <div className='p-2 bg-light border rounded text-start'>
                <small className='text-muted d-block' style={{fontSize:'10px'}}>Total Balance</small>
                <h5 className='mb-0 text-success fw-bold'>QR {userInfo?.balance || 0}</h5>
              </div>
            </Col>
            <Col xs={4}>
              <Button variant='info' className='w-100 h-100 text-white shadow-sm' onClick={() => window.location.reload()}>
                <FaSyncAlt/>
              </Button>
            </Col>
          </Row>

          <Button variant='dark' className='w-100 mb-2 d-flex justify-content-between align-items-center py-2 px-3'>
            <span><FaUserPlus className='text-warning me-2'/> Invites</span> 
            <Badge bg='warning' text='dark'>{userInfo?.inviteCount || 0}</Badge>
          </Button>
          
          <Button variant='dark' className='w-100 mb-2 d-flex justify-content-between align-items-center py-2 px-3'>
            <span><FaShareAlt className='text-info me-2'/> Shares</span> 
            <Badge bg='info'>{userInfo?.shareCount || 0}</Badge>
          </Button>

          <div className='mt-3 p-2 rounded bg-light border'>
            <small className='fw-bold d-block mb-1 text-muted'>Invite Link:</small>
            <InputGroup size='sm'>
              <Form.Control readOnly value={inviteLink} />
              <Button variant='warning' onClick={() => {navigator.clipboard.writeText(inviteLink); toast.success('Link Copied!');}}>
                <FaLink/>
              </Button>
            </InputGroup>
          </div>

          <div className='d-flex gap-2 mt-4'>
            <Button variant='danger' className='w-100 fw-bold' onClick={logoutHandler}>Logout</Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Sidebar (Offcanvas) */}
      <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement='end' className='bg-dark text-white'>
        <Offcanvas.Header closeButton closeVariant='white'>
          <Offcanvas.Title className='text-warning fw-bold'>GULF HUT MENU</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className='p-0'>
          <div className='p-3 border-bottom' onClick={() => {navigate('/'); setShowSidebar(false)}} style={{cursor:'pointer'}}>
            <FaHome className='me-2 text-warning'/> Home
          </div>
          {userInfo?.isAdmin && (
            <div className='p-3 border-bottom text-warning fw-bold' onClick={() => {navigate('/admin/userlist'); setShowSidebar(false)}} style={{cursor:'pointer'}}>
              <FaEdit className='me-2'/> Admin Dashboard
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
};

export default Header;