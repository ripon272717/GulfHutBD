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
  
  // এডিট মোড কন্ট্রোল করার জন্য
  const [showEditForm, setShowEditForm] = useState(false);

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
        setShowEditForm(false);
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <div className="profile-page">
      <Row>
        {/* বাম দিকের সেকশন: ব্যালেন্স এবং রেফারেল (সবসময় থাকবে) */}
        <Col md={4} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white text-center">
              <h4>Dashboard</h4>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <strong>Balance:</strong>
                <span className="text-success fw-bold">৳ 500.00</span>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Referral Link:</strong>
                <div className="d-flex mt-2">
                  <Form.Control 
                    readOnly 
                    value={`https://gulfhut.com/ref/${userInfo._id}`} 
                    size="sm" 
                  />
                  <Button variant="outline-secondary" size="sm" className="ms-1">Copy</Button>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <Button variant="warning" className="w-100 mb-2">Withdraw Money</Button>
                <Button variant="info" className="w-100 text-white">Referral List</Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        {/* ডান দিকের সেকশন: পার্সোনাল ইনফো এবং এডিট বাটন */}
        <Col md={8}>
          <Card className="shadow-sm p-4">
            {!showEditForm ? (
              <div className="personal-info">
                <h3>Account Information</h3>
                <hr />
                <p><strong>Name:</strong> {userInfo.name}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
                {/* মোবাইল নম্বর তোমার ডাটাবেসে থাকলে এখানে দেখাবে */}
                <p><strong>Mobile:</strong> 017XXXXXXXX</p> 
                
                <Button 
                  variant="primary" 
                  onClick={() => setShowEditForm(true)}
                  className="mt-3"
                >
                  Edit Profile / Update Password
                </Button>
              </div>
            ) : (
              <Form onSubmit={submitHandler}>
                <h3>Update Profile</h3>
                <hr />
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
                  <Form.Control type='password' placeholder='Enter new password' onChange={(e) => setPassword(e.target.value)} />
                </Form.Group>

                <Form.Group className='my-2' controlId='confirmPassword'>
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control type='password' placeholder='Confirm new password' onChange={(e) => setConfirmPassword(e.target.value)} />
                </Form.Group>

                <div className="mt-3">
                  <Button type='submit' variant='success' className="me-2">Update Now</Button>
                  <Button variant='secondary' onClick={() => setShowEditForm(false)}>Cancel</Button>
                </div>
                {loadingUpdateProfile && <Loader />}
              </Form>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfileScreen;