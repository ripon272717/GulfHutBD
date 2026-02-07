import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaCamera } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useProfileMutation } from '../slices/usersApiSlice';
import { useUploadProductImageMutation } from '../slices/productsApiSlice'; 
import { setCredentials } from '../slices/authSlice';
import Loader from '../components/Loader';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading: loadingUpdateProfile }] = useProfileMutation();
  const [uploadProductImage] = useUploadProductImageMutation();

  const dispatch = useDispatch();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
      setImage(userInfo.image || '');
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      try {
        const res = await updateProfile({
          _id: userInfo._id,
          name,
          email,
          password,
          image,
        }).unwrap();
        dispatch(setCredentials({ ...res }));
        toast.success('Profile updated successfully');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  // ইমেজ আপলোড হ্যান্ডেলার
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file); // 'image' নামটি ব্যাকএন্ডের সাথে মিলতে হবে

    setUploading(true);
    try {
      // স্লাইস থেকে মিউটেশন কল করা হচ্ছে
      const res = await uploadProductImage(formData).unwrap();
      
      // সফল হলে ক্লাউডিনারি ইউআরএল সেট হবে
      setImage(res.image); 
      toast.success('Image uploaded successfully');
    } catch (err) {
      console.error('Upload error details:', err);
      toast.error(err?.data?.message || 'File upload failed. Try a smaller JPG/PNG.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Row className='justify-content-md-center mt-5'>
      <Col xs={12} md={6}>
        <h2 className='text-center mb-4'>User Profile</h2>

        <div className='text-center mb-4 position-relative'>
          <img
            src={image || userInfo.image || '/images/profile.png'}
            alt='profile'
            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ffc107' }}
          />
          <label 
            htmlFor='image-upload'
            style={{ position: 'absolute', bottom: '5px', left: '55%', cursor: 'pointer', background: '#343a40', padding: '10px', borderRadius: '50%', color: '#fff' }}
          >
            <FaCamera />
          </label>
          <input 
            type='file' 
            id='image-upload' 
            hidden 
            accept="image/*"
            onChange={uploadFileHandler} 
          />
          {uploading && <div className='mt-2'><Loader /></div>}
        </div>

        <Form onSubmit={submitHandler}>
          <Form.Group className='my-2' controlId='name'>
            <Form.Label>Name</Form.Label>
            <Form.Control type='text' placeholder='Enter name' value={name} onChange={(e) => setName(e.target.value)} />
          </Form.Group>

          <Form.Group className='my-2' controlId='email'>
            <Form.Label>Email Address</Form.Label>
            <Form.Control type='email' placeholder='Enter email' value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>

          <Form.Group className='my-2' controlId='password'>
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputGroup.Text onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Form.Group className='my-2' controlId='confirmPassword'>
            <Form.Label>Confirm Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Confirm password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <InputGroup.Text onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: 'pointer' }}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Button type='submit' variant='warning' className='mt-3 w-100 fw-bold' disabled={uploading || loadingUpdateProfile}>
            {loadingUpdateProfile ? 'Updating...' : 'Update Profile'}
          </Button>
        </Form>
      </Col>
    </Row>
  );
};

export default ProfileScreen;