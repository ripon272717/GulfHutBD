import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Image } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { setCredentials } from '../slices/authSlice';
import { useProfileMutation, useUploadUserImageMutation } from '../slices/usersApiSlice';

const ProfileScreen = () => {
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

  // ইমেজ আপলোড করার সাথে সাথেই ক্লাউডিনারিতে চলে যাবে
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await uploadUserImage(formData).unwrap();
      setImage(res.image); // ক্লাউডিনারি থেকে আসা লিঙ্কটি সেভ হচ্ছে
      toast.success('ছবি আপলোড হয়েছে! এবার সেভ করতে নিচের Update বাটনে ক্লিক করুন।');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault(); // এই লাইনটা মাস্ট, যাতে পেজ রিফ্রেশ বা অন্য কিছু না হয়

    try {
      const res = await updateProfile({
        _id: userInfo._id,
        name,
        email,
        image, // ক্লাউডিনারির নতুন ছবির লিঙ্ক
      }).unwrap();

      dispatch(setCredentials({ ...res }));
      toast.success('প্রোফাইল সফলভাবে আপডেট হয়েছে!');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <div className='p-4 shadow rounded bg-white mt-5'>
        <h2 className='text-center mb-4' style={{ fontWeight: 'bold' }}>My Profile</h2>
        
        {/* প্রোফাইল ইমেজ সেকশন */}
        <div className='text-center mb-4'>
          <Image 
            src={image || 'https://via.placeholder.com/150'} 
            roundedCircle 
            style={{ width: '130px', height: '130px', objectFit: 'cover', border: '3px solid #ffc107' }} 
          />
        </div>

        <Form onSubmit={submitHandler}>
          {/* ইমেজ আপলোড ফিল্ড */}
          <Form.Group className='mb-3' controlId='image-upload'>
            <Form.Label className='fw-bold'>Change Profile Picture</Form.Label>
            <Form.Control
              type='file'
              onChange={uploadFileHandler}
            ></Form.Control>
            {loadingUpload && <Loader />}
          </Form.Group>

          <Form.Group className='mb-3' controlId='name'>
            <Form.Label className='fw-bold'>Name</Form.Label>
            <Form.Control
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='আপনার নাম লিখুন'
            ></Form.Control>
          </Form.Group>

          <Form.Group className='mb-3' controlId='mobile'>
            <Form.Label className='fw-bold'>Mobile (Fixed)</Form.Label>
            <Form.Control
              type='text'
              value={mobile}
              disabled
              style={{ backgroundColor: '#f8f9fa' }}
            ></Form.Control>
          </Form.Group>

          <Form.Group className='mb-4' controlId='email'>
            <Form.Label className='fw-bold'>Email</Form.Label>
            <Form.Control
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='ইমেইল লিখুন'
            ></Form.Control>
          </Form.Group>

          <Button 
            type='submit' 
            variant='warning' 
            className='w-100 fw-bold py-2 shadow-sm'
            disabled={loadingUpdateProfile || loadingUpload}
          >
            {loadingUpdateProfile ? 'Updating...' : 'Update Profile'}
          </Button>

          {loadingUpdateProfile && <Loader />}
        </Form>
      </div>
    </FormContainer>
  );
};

export default ProfileScreen;