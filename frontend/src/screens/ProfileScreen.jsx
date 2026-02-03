import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form, Card, ListGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { useProfileMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editMode, setEditMode] = useState(false); // এডিট ফর্ম লুকানোর জন্য

  const { userInfo } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading: loadingUpdateProfile }] = useProfileMutation();

  useEffect(() => {
    setName(userInfo.name);
    setEmail(userInfo.email);
  }, [userInfo.name, userInfo.email]);

  const dispatch = useDispatch();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      try {
        const res = await updateProfile({ name, email, password }).unwrap();
        dispatch(setCredentials({ ...res }));
        toast.success('Profile updated successfully');
        setEditMode(false);
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <Row>
      <Col md={4} className="mb-4">
        <h2>User Profile</h2>
        <Card className="shadow-sm">
          <ListGroup variant="flush">
            <ListGroup.Item className="d-flex justify-content-between align-items-center">
              <strong>Balance:</strong>
              <span className="text-success fw-bold">৳ {userInfo.balance || 0}</span>
            </ListGroup.Item>
            
            {/* ইনভাইট ও শেয়ার বাটন */}
            <ListGroup.Item>
              <Button variant="primary" className="w-100 mb-2">Invite Friends</Button>
              <Button variant="outline-primary" className="w-100">Share Link</Button>
            </ListGroup.Item>

            {/* প্রোফাইল তথ্য (এখানে শুধু দেখা যাবে) */}
            {!editMode ? (
              <ListGroup.Item>
                <p className="mb-1"><strong>Name:</strong> {userInfo.name}</p>
                <p className="mb-1"><strong>Email:</strong> {userInfo.email}</p>
                <Button 
                  variant="info" 
                  size="sm" 
                  className="w-100 mt-2 text-white"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile / Password
                </Button>
              </ListGroup.Item>
            ) : (
              /* এডিট ফর্ম (বাটনে ক্লিক করলে আসবে) */
              <ListGroup.Item>
                <Form onSubmit={submitHandler}>
                  <Form.Group className='my-2' controlId='name'>
                    <Form.Label>Name</Form.Label>
                    <Form.Control type='text' value={name} onChange={(e) => setName(e.target.value)} />
                  </Form.Group>

                  <Form.Group className='my-2' controlId='email'>
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Form.Group>

                  <Form.Group className='my-2' controlId='password'>
                    <Form.Label>New Password</Form.Label>
                    <Form.Control type='password' placeholder='New password' onChange={(e) => setPassword(e.target.value)} />
                  </Form.Group>

                  <Form.Group className='my-2' controlId='confirmPassword'>
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control type='password' placeholder='Confirm password' onChange={(e) => setConfirmPassword(e.target.value)} />
                  </Form.Group>

                  <Button type='submit' variant='success' className='btn-sm mt-2'>Update</Button>
                  <Button variant='light' className='btn-sm mt-2 ms-2' onClick={() => setEditMode(false)}>Cancel</Button>
                  {loadingUpdateProfile && <Loader />}
                </Form>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Card>
      </Col>

      <Col md={8}>
        <h2>My Orders</h2>
        {/* এখানে তোমার অর্ডারের টেবিল থাকবে */}
      </Col>
    </Row>
  );
};

export default ProfileScreen;