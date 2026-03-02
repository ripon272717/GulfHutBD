import { useState, useEffect } from 'react';
import { Form, Button, Image, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
// রিয়্যাক্ট আইকনগুলো এখানে ইম্পোর্ট করা হয়েছে
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
      toast.success('ছবি আপলোড হয়েছে!');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile({ _id: userInfo._id, name, email, image }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success('প্রোফাইল আপডেট হয়েছে!');
      onHide(); 
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <div style={{ position: 'relative', padding: '20px', backgroundColor: '#fff', borderRadius: '10px' }}>
        
        {/* --- ম্যানুয়াল ক্রস বাটন (অবশ্যই দেখা যাবে) --- */}
        <div 
          onClick={onHide} 
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            cursor: 'pointer',
            fontSize: '1.5rem',
            color: '#000',
            zIndex: 100
          }}
        >
          <FaTimes /> 
        </div>

        <h2 className='text-center mb-4' style={{ fontWeight: 'bold' }}>My Profile</h2>
        
        <div className='text-center mb-4'>
          <Image 
            src={image || userInfo?.image || 'https://via.placeholder.com/150'} 
            roundedCircle 
            style={{ width: '110px', height: '110px', objectFit: 'cover', border: '3px solid #ffc107' }} 
          />
        </div>

        <Form onSubmit={submitHandler}>
          <Form.Group className='mb-3' controlId='image'>
            <Form.Label className='fw-bold'>Change Picture</Form.Label>
            <Form.Control type='file' onChange={uploadFileHandler} />
            {loadingUpload && <Loader />}
          </Form.Group>

          <Form.Group className='mb-3' controlId='name'>
            <Form.Label className='fw-bold'>Name</Form.Label>
            <Form.Control type='text' value={name} onChange={(e) => setName(e.target.value)} />
          </Form.Group>

          <Form.Group className='mb-3' controlId='mobile'>
            <Form.Label className='fw-bold'>Mobile (Fixed)</Form.Label>
            <Form.Control type='text' value={mobile} disabled style={{ backgroundColor: '#f8f9fa' }} />
          </Form.Group>

          <Form.Group className='mb-4' controlId='email'>
            <Form.Label className='fw-bold'>Email</Form.Label>
            <Form.Control type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>

          <Button type='submit' variant='warning' className='w-100 fw-bold py-2 shadow-sm'>
            Update Profile
          </Button>

          {/* --- সোশ্যাল মিডিয়া লোগো সেকশন --- */}
          <div className='mt-4 text-center'>
             <p className='text-muted small mb-2'>Share or Follow</p>
             <div className='d-flex justify-content-center gap-4' style={{ fontSize: '1.6rem' }}>
                <FaFacebook style={{ color: '#1877F2', cursor: 'pointer' }} />
                <FaWhatsapp style={{ color: '#25D366', cursor: 'pointer' }} />
                <FaShareAlt style={{ color: '#6c757d', cursor: 'pointer' }} />
             </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ProfileScreen;