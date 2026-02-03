import React, { useEffect, useState } from 'react';
import { Table, Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes, FaWallet, FaCamera, FaUsers, FaShareAlt, FaPaperPlane, FaUserCheck } from 'react-icons/fa';
import axios from 'axios';

import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { useProfileMutation } from '../slices/usersApiSlice';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { Link } from 'react-router-dom';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();
  const [updateProfile, { isLoading: loadingUpdateProfile }] = useProfileMutation();

  const dispatch = useDispatch();

  useEffect(() => {
    setName(userInfo.name);
    setEmail(userInfo.email);
    setImage(userInfo.image || '');
  }, [userInfo]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('/api/upload', formData, config);
      setImage(data.image);
      setUploading(false);
      toast.success('ছবি আপলোড সফল হয়েছে');
    } catch (err) {
      setUploading(false);
      toast.error(err?.data?.message || 'ছবি আপলোড ব্যর্থ হয়েছে');
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('পাসওয়ার্ড ম্যাচ করছে না');
    } else {
      try {
        const res = await updateProfile({ name, email, password, image }).unwrap();
        dispatch(setCredentials({ ...res }));
        toast.success('প্রোফাইল আপডেট সফল হয়েছে');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const inviteLink = `${window.location.origin}/register?ref=${userInfo?.referralCode}`;

  const inviteHandler = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GulfHutBD ইনভাইটেশন',
          text: `বন্ধু! GulfHutBD তে জয়েন করো আর আমার কোড "${userInfo.referralCode}" ব্যবহার করে বোনাস পাও!`,
          url: inviteLink,
        });
      } catch (err) { console.log(err); }
    } else {
      navigator.clipboard.writeText(inviteLink);
      toast.info('লিঙ্ক কপি হয়েছে!');
    }
  };

  const shareHandler = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: inviteLink });
      } catch (err) { console.log(err); }
    } else {
      navigator.clipboard.writeText(inviteLink);
      toast.success('লিঙ্ক কপি হয়েছে!');
    }
  };

  return (
    <Row>
      <Col md={3}>
        <h2 className='mb-3'>ইউজার প্রোফাইল</h2>

        <div className='text-center mb-4'>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={image || userInfo.image || '/images/default-profile.png'}
              alt='profile'
              className='rounded-circle img-thumbnail shadow-sm'
              style={{ width: '130px', height: '130px', objectFit: 'cover' }}
            />
            <label htmlFor='profile-image' style={{ position: 'absolute', bottom: '5px', right: '5px', cursor: 'pointer' }}>
              <div className='bg-primary text-white rounded-circle p-2 shadow-sm'>
                <FaCamera size={18} />
              </div>
              <input type='file' id='profile-image' hidden onChange={uploadFileHandler} />
            </label>
          </div>
          {uploading && <Loader />}
        </div>

        {/* --- রিওয়ার্ড ও রেফারেল কার্ড --- */}
        <Card className='my-3 shadow-sm border-0' style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
          <Card.Body className='text-center'>
            <Row className='align-items-center mb-3'>
              <Col xs={6} className='border-end'>
                <FaWallet size={22} className='text-success mb-1' />
                <h5 className='mb-0'>৳{userInfo.walletBalance || 0}</h5>
                <small className='text-muted' style={{ fontSize: '0.7rem' }}>ব্যালেন্স</small>
              </Col>
              <Col xs={6}>
                <FaUsers size={22} className='text-primary mb-1' />
                <h5 className='mb-0'>{userInfo.referralCount || 0}</h5>
                <small className='text-muted' style={{ fontSize: '0.7rem' }}>রেফারেল</small>
              </Col>
            </Row>

            {/* কার মাধ্যমে রেফার হয়েছে */}
            {userInfo.referredBy && (
              <div className='mb-3 text-start bg-white p-2 rounded border'>
                <small className='text-muted' style={{ fontSize: '0.7rem' }}>
                  <FaUserCheck className='text-success me-1' /> Referred By: <strong>{userInfo.referredBy}</strong>
                </small>
              </div>
            )}

            {/* ইনভাইট লিঙ্ক বক্স (সরাসরি দেখার জন্য) */}
            <div className='bg-white p-2 rounded border mb-3 text-start'>
              <small className='d-block text-muted mb-1 fw-bold' style={{ fontSize: '0.65rem' }}>আপনার রেফারেল লিঙ্ক:</small>
              <div className='p-2 mb-2 bg-light text-break' style={{ fontSize: '0.7rem', border: '1px dashed #ccc', borderRadius: '5px', color: '#555' }}>
                {inviteLink}
              </div>
              <small className='d-block text-muted' style={{ fontSize: '0.7rem' }}>কোড: <strong className='text-primary'>{userInfo.referralCode}</strong></small>
            </div>

            <Row className='g-2'>
              <Col xs={6}>
                <Button variant='success' size='sm' className='w-100' onClick={inviteHandler}>
                  <FaPaperPlane className='me-1' /> Invite
                </Button>
              </Col>
              <Col xs={6}>
                <Button variant='primary' size='sm' className='w-100' onClick={shareHandler}>
                  <FaShareAlt className='me-1' /> Share
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Form onSubmit={submitHandler}>
          <Form.Group className='my-2' controlId='name'>
            <Form.Label>নাম</Form.Label>
            <Form.Control type='text' value={name} onChange={(e) => setName(e.target.value)} />
          </Form.Group>
          <Form.Group className='my-2' controlId='email'>
            <Form.Label>ইমেইল</Form.Label>
            <Form.Control type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>
          <Form.Group className='my-2' controlId='password'>
            <Form.Label>পাসওয়ার্ড</Form.Label>
            <Form.Control type='password' placeholder='নতুন পাসওয়ার্ড' value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>
          <Form.Group className='my-2' controlId='confirmPassword'>
            <Form.Label>নিশ্চিত করুন</Form.Label>
            <Form.Control type='password' placeholder='আবার লিখুন' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </Form.Group>
          <Button type='submit' variant='primary' className='w-100 mt-2'>আপডেট করুন</Button>
          {loadingUpdateProfile && <Loader />}
        </Form>
      </Col>

      <Col md={9}>
        <h2>আমার অর্ডারসমূহ</h2>
        {isLoading ? <Loader /> : error ? <Message variant='danger'>{error?.data?.message || error.error}</Message> : (
          <Table striped hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>আইডি</th>
                <th>তারিখ</th>
                <th>মোট</th>
                <th>পেমেন্ট</th>
                <th>ডেলিভারি</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>৳{order.totalPrice}</td>
                  <td>{order.isPaid ? order.paidAt.substring(0, 10) : <FaTimes style={{ color: 'red' }} />}</td>
                  <td>{order.isDelivered ? order.deliveredAt.substring(0, 10) : <FaTimes style={{ color: 'red' }} />}</td>
                  <td><Button as={Link} to={`/order/${order._id}`} className='btn-sm' variant='light'>বিস্তারিত</Button></td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  );
};

export default ProfileScreen;