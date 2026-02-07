import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, InputGroup, Card, Stack } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaCamera, FaShareAlt, FaUserPlus, FaLink } from 'react-icons/fa';
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
  const dispatch = useDispatch();
  const [updateProfile, { isLoading: loadingUpdateProfile }] = useProfileMutation();
  const [uploadProductImage] = useUploadProductImageMutation();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
      setImage(userInfo.image || '');
    }
  }, [userInfo]);

  // ইনভাইট লিঙ্ক জেনারেটর
  const inviteLink = `${window.location.origin}/register?invite=${userInfo._id}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Link copied!');
  };

  const shareFriend = () => {
    if (navigator.share) {
      navigator.share({
        title: 'GulfHutBD',
        text: 'Join GulfHutBD!',
        url: inviteLink,
      }).catch(console.error);
    } else {
      copyInviteLink();
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const res = await uploadProductImage(formData).unwrap();
      setImage(res.image); 
      dispatch(setCredentials({ ...userInfo, image: res.image }));
      toast.success('Image uploaded!');
      setUploading(false);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
      setUploading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      try {
        const res = await updateProfile({ _id: userInfo._id, name, email, password, image }).unwrap();
        dispatch(setCredentials({ ...userInfo, ...res }));
        toast.success('Profile updated');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <Row className='justify-content-md-center mt-3 mx-0'>
      <Col xs={12} md={6}>
        {/* সবার উপরে বাটনগুলো */}
        <div className='mb-4'>
          <Stack gap={2}>
             <Button variant='warning' className='d-flex align-items-center justify-content-center gap-2 fw-bold text-dark' onClick={copyInviteLink}>
                <FaLink /> Copy Invite Link
             </Button>
             <div className='d-flex gap-2'>
                <Button variant='info' className='flex-grow-1 d-flex align-items-center justify-content-center gap-2 text-white' onClick={shareFriend}>
                  <FaShareAlt /> Share
                </Button>
                <Button variant='success' className='flex-grow-1 d-flex align-items-center justify-content-center gap-2' onClick={shareFriend}>
                  <FaUserPlus /> Invite
                </Button>
             </div>
          </Stack>
        </div>

        <Card className='p-4 shadow border-0 bg-dark text-white rounded-4'>
          <h2 className='text-center mb-4'>User Profile</h2>

          <div className='text-center mb-4 position-relative'>
            <img
              src={image || userInfo.image || '/images/profile.png'}
              alt='profile'
              style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ffc107' }}
            />
            <label htmlFor='image-upload' style={{ position: 'absolute', bottom: '0', left: '55%', cursor: 'pointer', background: '#ffc107', padding: '8px', borderRadius: '50%', color: '#000' }}>
              <FaCamera size={14}/>
            </label>
            <input type='file' id='image-upload' hidden onChange={uploadFileHandler} />
            {uploading && <Loader />}
          </div>

          <Form onSubmit={submitHandler}>
            <Form.Group className='mb-3' controlId='name'>
              <Form.Label>Name</Form.Label>
              <Form.Control type='text' value={name} onChange={(e) => setName(e.target.value)} />
            </Form.Group>

            <Form.Group className='mb-3' controlId='email'>
              <Form.Label>Email Address</Form.Label>
              <Form.Control type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>

            <Form.Group className='mb-3' controlId='password'>
              <Form.Label>New Password</Form.Label>
              <InputGroup>
                <Form.Control type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                <InputGroup.Text onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Group className='mb-4' controlId='confirmPassword'>
              <Form.Label>Confirm Password</Form.Label>
              <InputGroup>
                <Form.Control type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <InputGroup.Text onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: 'pointer' }}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Button type='submit' variant='warning' className='w-100 fw-bold py-2 shadow-sm' disabled={uploading}>
              Update Profile
            </Button>
          </Form>
          {loadingUpdateProfile && <Loader />}
        </Card>
      </Col>
    </Row>
  );
};

export default ProfileScreen;