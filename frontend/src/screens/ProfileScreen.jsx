import React, { useEffect, useState } from 'react';
import { Table, Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes, FaCopy, FaWallet, FaCamera, FaUsers } from 'react-icons/fa';
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

  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation();

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
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const { data } = await axios.post('/api/upload', formData, config);
      setImage(data.image);
      setUploading(false);
      toast.success('Image uploaded successfully');
    } catch (err) {
      setUploading(false);
      toast.error(err?.data?.message || 'Image upload failed');
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      try {
        const res = await updateProfile({
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

  // ProfileScreen.jsx এর ভেতরে
const inviteLink = userInfo?.referralCode 
  ? `${window.location.origin}/?ref=${userInfo.referralCode}`
  : 'Loading link...';

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied to clipboard!');
  };

  return (
    <Row>
      <Col md={3}>
        <h2>User Profile</h2>

        <div className='text-center mb-4'>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={image || userInfo.image || '/images/default-profile.png'}
              alt='profile'
              className='rounded-circle img-thumbnail shadow-sm'
              style={{ width: '130px', height: '130px', objectFit: 'cover' }}
            />
            <label
              htmlFor='profile-image'
              style={{
                position: 'absolute',
                bottom: '5px',
                right: '5px',
                cursor: 'pointer',
              }}
            >
              <div className='bg-primary text-white rounded-circle p-2 shadow-sm'>
                <FaCamera size={18} />
              </div>
              <input
                type='file'
                id='profile-image'
                hidden
                onChange={uploadFileHandler}
              />
            </label>
          </div>
          {uploading && <Loader />}
        </div>

        <Card className='my-3 shadow-sm border-0' style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
          <Card.Body className='text-center'>
            <Row className='align-items-center'>
              <Col xs={6} className='border-end'>
                <FaWallet size={22} className='text-success mb-1' />
                <h5 className='mb-0'>${userInfo.walletBalance || 0}</h5>
                <small className='text-muted' style={{ fontSize: '0.7rem' }}>Wallet</small>
              </Col>
              
              <Col xs={6}>
                <FaUsers size={22} className='text-primary mb-1' />
                <h5 className='mb-0'>{userInfo.referralCount || 0}</h5>
                <small className='text-muted' style={{ fontSize: '0.7rem' }}>Friends</small>
              </Col>
            </Row>
            
            <hr />
            
            <div className='bg-white p-2 rounded border mb-2 text-start'>
              <small className='d-block text-muted mb-1 fw-bold' style={{ fontSize: '0.7rem' }}>Your Invite Link:</small>
              <div
                className='p-2 mb-2 text-break'
                style={{
                  backgroundColor: '#fffbe6',
                  borderRadius: '5px',
                  fontSize: '0.65rem',
                  color: '#856404',
                  border: '1px dashed #ffeeba',
                  fontFamily: 'monospace',
                }}
              >
                {inviteLink}
              </div>
              <Button variant='outline-primary' size='sm' className='w-100 py-1' style={{ fontSize: '0.75rem' }} onClick={copyInviteLink}>
                <FaCopy className='me-1' /> Copy Link
              </Button>
            </div>
          </Card.Body>
        </Card>

        <Form onSubmit={submitHandler}>
          <Form.Group className='my-2' controlId='name'>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter name'
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group className='my-2' controlId='email'>
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type='email'
              placeholder='Enter email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group className='my-2' controlId='password'>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type='password'
              placeholder='Enter password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group className='my-2' controlId='confirmPassword'>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type='password'
              placeholder='Confirm password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Button type='submit' variant='primary' className='w-100 mt-2'>
            Update Profile
          </Button>
          {loadingUpdateProfile && <Loader />}
        </Form>
      </Col>

      <Col md={9}>
        <h2>My Orders</h2>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error?.data?.message || error.error}</Message>
        ) : (
          <Table striped hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>ID</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>${order.totalPrice}</td>
                  <td>
                    {order.isPaid ? (
                      order.paidAt.substring(0, 10)
                    ) : (
                      <FaTimes style={{ color: 'red' }} />
                    )}
                  </td>
                  <td>
                    {order.isDelivered ? (
                      order.deliveredAt.substring(0, 10)
                    ) : (
                      <FaTimes style={{ color: 'red' }} />
                    )}
                  </td>
                  <td>
                    <Button as={Link} to={`/order/${order._id}`} className='btn-sm' variant='light'>
                      Details
                    </Button>
                  </td>
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