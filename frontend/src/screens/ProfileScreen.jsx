import { useState, useEffect } from 'react';
import { Form, Button, Image, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
// লোগো এবং ক্রস সাইনের জন্য রিয়্যাক্ট আইকন
import { FaTimes, FaFacebook, FaWhatsapp, FaShareAlt } from 'react-icons/fa'; 
import Loader from '../components/Loader';
import { setCredentials } from '../slices/authSlice';
import { useProfileMutation, useUploadUserImageMutation } from '../slices/usersApiSlice';

const ProfileScreen = ({ show, onHide }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [image, setImage] = useState('');

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading: loadingUpdateProfile }] = useProfileMutation();
  const [uploadUserImage, { isLoading: loadingUpload }] = useUploadUserImageMutation();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
      setMobile(userInfo.mobile || '');
      setImage(userInfo.image || '');
    }
  }, [userInfo]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await uploadUserImage(formData).unwrap();
      setImage(res.image); 
      toast.success('ছবি আপলোড হয়েছে!');
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'ইমেজ আপলোড ফেইল্ড');
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile({ _id: userInfo._id, name, email, image }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success('প্রোফাইল আপডেট হয়েছে!');
      onHide(); 
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header>
        <Modal.Title className='fw-bold text-warning'>
          User ID: {userInfo?.userId || 'QHB1006'}
        </Modal.Title>
        {/* --- ম্যানুয়াল ক্রস বাটন (X) --- */}
        <div 
          onClick={onHide} 
          style={{ 
            cursor: 'pointer', 
            fontSize: '1.5rem', 
            marginLeft: 'auto', 
            color: '#333',
            padding: '5px' 
          }}
        >
          <FaTimes /> 
        </div>
      </Modal.Header>
      
      <Modal.Body className='text-center'>
        <div className='position-relative d-inline-block mb-4'>
          <Image 
            src={image || userInfo?.image || 'https://via.placeholder.com/150'} 
            roundedCircle 
            style={{ width: '120px', height: '120px', objectFit: 'cover', border: '3px solid #ffc107' }} 
          />
          <label 
            htmlFor='image-upload' 
            className='position-absolute bottom-0 end-0 bg-warning p-2 rounded-circle' 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
             📸
             <input type='file' id='image-upload' hidden onChange={uploadFileHandler} />
          </label>
        </div>

        {loadingUpload && <Loader />}

        <Form onSubmit={submitHandler}>
          <Form.Group className='mb-3 text-start' controlId='name'>
            <Form.Label className='fw-bold small text-muted'>Full Name</Form.Label>
            <Form.Control 
              type='text' 
              placeholder='Enter name' 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </Form.Group>

          <Form.Group className='mb-3 text-start' controlId='email'>
            <Form.Label className='fw-bold small text-muted'>Email Address</Form.Label>
            <Form.Control 
              type='email' 
              placeholder='Enter email' 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </Form.Group>

          <Button 
            type='submit' 
            variant='warning' 
            className='w-100 fw-bold py-2 shadow-sm'
            disabled={loadingUpdateProfile}
          >
            {loadingUpdateProfile ? 'Saving...' : 'Update Profile'}
          </Button>

          {/* --- সোশ্যাল মিডিয়া লোগো সেকশন --- */}
          <div className='mt-4 pt-3 border-top'>
             <p className='text-muted small mb-3'>Invite or Share Profile</p>
             <div className='d-flex justify-content-center gap-4' style={{ fontSize: '1.8rem' }}>
                <FaFacebook style={{ color: '#1877F2', cursor: 'pointer' }} title="Facebook" />
                <FaWhatsapp style={{ color: '#25D366', cursor: 'pointer' }} title="WhatsApp" />
                <FaShareAlt style={{ color: '#6c757d', cursor: 'pointer' }} title="Share" />
             </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ProfileScreen;