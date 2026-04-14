import { useState, useEffect } from 'react';
import { Form, Button, Image, Modal, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaTimes, FaCamera, FaUserShield, FaExternalLinkAlt, FaChartLine } from 'react-icons/fa'; 
import { setCredentials } from '../slices/authSlice';
import { useProfileMutation, useUploadUserImageMutation } from '../slices/usersApiSlice';

const ProfileScreen = ({ show, onHide }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState('');

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading: loadingUpdateProfile }] = useProfileMutation();
  const [uploadUserImage, { isLoading: loadingUpload }] = useUploadUserImageMutation();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
      setImage(userInfo.image || '');
    }
  }, [userInfo]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('media', file);
    try {
      const res = await uploadUserImage(formData).unwrap();
      setImage(res.image); 
      toast.success('ছবি আপলোড হয়েছে!');
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'আপলোড ব্যর্থ হয়েছে');
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile({ 
        _id: userInfo._id, 
        name, 
        email, 
        image 
      }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success('প্রোফাইল আপডেট হয়েছে!');
      onHide(); 
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      contentClassName="rounded-4 border-0 overflow-hidden"
    >
      {/* ১. ফিক্সড ক্রস বাটন - এটি মোডাল হেডারের কাজ করবে কিন্তু স্ক্রল হবে না */}
      <div style={{ 
        position: 'absolute', 
        top: '12px', 
        right: '12px', 
        zIndex: 2000, 
        cursor: 'pointer',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }} onClick={onHide}>
        <FaTimes size={18} color="#000" />
      </div>

      <Modal.Body className='p-0' style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="p-4 text-center mt-3">
          
          {/* প্রোফাইল ইমেজ */}
          <div className='position-relative d-inline-block mb-3'>
            <div style={{ padding: '3px', borderRadius: '50%', background: 'linear-gradient(45deg, #ffc107, #ff9800)' }}>
               <Image 
                  src={image || userInfo?.image || 'https://via.placeholder.com/150'} 
                  roundedCircle 
                  style={{ width: '105px', height: '105px', objectFit: 'cover', background: '#fff' }} 
               />
            </div>
            <label htmlFor='image-upload' className='position-absolute bottom-0 end-0 bg-warning p-2 rounded-circle border border-white shadow-sm' style={{ cursor: 'pointer' }}>
               <FaCamera size={14} /> <input type='file' id='image-upload' hidden onChange={uploadFileHandler} />
            </label>
          </div>

          {/* ২. নাম এবং কাস্টমার আইডি (তোর মার্ক করা CID এখানে শো করবে) */}
          <div className="mb-3">
            <h4 className='fw-bold mb-1' style={{ color: '#000' }}>{userInfo?.name || 'User'}</h4>
            <div className='d-inline-block' style={{ 
                backgroundColor: '#f1f1f1', 
                padding: '3px 12px', 
                borderRadius: '6px',
                border: '1px solid #ddd'
            }}>
              <span className='fw-bold' style={{ color: '#000', fontSize: '1rem' }}>
                CID: {userInfo?.customId || 'QHBD000000'}
              </span>
            </div>
          </div>

          <Badge bg="success" className='px-4 py-2 rounded-pill mb-4 text-uppercase shadow-sm'>
              <FaUserShield className='me-1' /> {userInfo?.role || 'User'}
          </Badge>

          {/* ৩. ওয়ালেট কার্ড (তোর বাকি কোডগুলো ঠিক আছে) */}
          <div className='p-3 mb-3 text-white shadow-sm text-start' style={{ backgroundColor: '#2c3e50', borderRadius: '15px' }}>
             <div className='d-flex justify-content-between align-items-center mb-1'>
                <small className="opacity-75">Available Balance</small>
                <Button size="sm" variant="outline-light" className="py-0 px-2 rounded-pill" style={{ fontSize: '10px' }}>
                  🔄 Sync
                </Button>
             </div>
             <h3 className='fw-bold mb-0' style={{ color: '#ffc107' }}>QR {userInfo?.walletBalance || 0}</h3>
          </div>

          {/* ইনভাইট ও শেয়ার সেকশন */}
          <div className="row g-2 mb-3">
             <div className="col-6">
                <div className="p-2 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                   <small className="text-muted fw-bold">Invites</small>
                   <Badge bg="warning" text="dark">0</Badge>
                </div>
             </div>
             <div className="col-6">
                <div className="p-2 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                   <small className="text-muted fw-bold">Shares</small>
                   <Badge bg="info">0</Badge>
                </div>
             </div>
          </div>

          {/* ড্যাশবোর্ড ও ইনভাইট বাটন */}
          <div className="row g-2 mb-4">
             <div className="col-6">
                <Button variant="dark" className="w-100 py-2 rounded-3 fw-bold shadow-sm" style={{ fontSize: '13px' }}>
                   <FaChartLine className="me-1"/> Dashboard
                </Button>
             </div>
             <div className="col-6">
                <Button variant="dark" className="w-100 py-2 rounded-3 fw-bold shadow-sm" style={{ fontSize: '13px' }}>
                   <FaExternalLinkAlt className="me-1"/> Invite Link
                </Button>
             </div>
          </div>

          {/* ফর্ম সেকশন */}
          <Form onSubmit={submitHandler} className="text-start pb-4">
            <Form.Group className='mb-3' controlId='name'>
              <Form.Label className='small fw-bold text-dark'>Name</Form.Label>
              <Form.Control type='text' value={name} onChange={(e) => setName(e.target.value)} style={{ color: '#000' }} />
            </Form.Group>

            <Form.Group className='mb-4' controlId='email'>
              <Form.Label className='small fw-bold text-dark'>Email</Form.Label>
              <Form.Control type='email' value={email} onChange={(e) => setEmail(e.target.value)} style={{ color: '#000' }} />
            </Form.Group>

            <Button type='submit' variant='warning' className='w-100 fw-bold py-2 rounded-pill shadow-sm' disabled={loadingUpdateProfile}>
              {loadingUpdateProfile ? 'Updating...' : 'SAVE CHANGES'}
            </Button>
          </Form>
        </div>
      </Modal.Body>
    </Modal>
  );
};



export default ProfileScreen;