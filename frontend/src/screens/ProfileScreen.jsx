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
  const [mobile, setMobile] = useState(''); // মোবাইল নম্বরের জন্য
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // এই স্টেটটি ফর্ম দেখানো বা লুকানো নিয়ন্ত্রণ করবে
  const [editMode, setEditMode] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading: loadingUpdateProfile }] = useProfileMutation();

  useEffect(() => {
    setName(userInfo.name);
    setEmail(userInfo.email);
    setMobile(userInfo.mobile || '');
  }, [userInfo]);

  const dispatch = useDispatch();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('পাসওয়ার্ড মিলছে না!');
    } else {
      try {
        const res = await updateProfile({ name, email, mobile, password }).unwrap();
        dispatch(setCredentials({ ...res }));
        toast.success('প্রোফাইল আপডেট হয়েছে');
        setEditMode(false); // আপডেট শেষে ফর্ম আবার লুকিয়ে যাবে
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <Row className="mt-3">
      {/* ড্যাশবোর্ড সেকশন (ব্যালেন্স এবং ইনভাইট সব সময় থাকবে) */}
      <Col md={4} className="mb-4">
        <Card className="shadow-sm border-0 text-center">
          <Card.Header className="bg-primary text-white py-3">
             <h5 className="mb-0">আমার ড্যাশবোর্ড</h5>
          </Card.Header>
          <ListGroup variant="flush">
            {/* ব্যালেন্স */}
            <ListGroup.Item className="py-3">
              <small className="text-muted d-block">বর্তমান ব্যালেন্স</small>
              <strong className="text-success" style={{ fontSize: '1.5rem' }}>
                ৳ {userInfo.balance || 0}
              </strong>
            </ListGroup.Item>
            
            {/* ইনভাইট ও শেয়ার বাটন */}
            <ListGroup.Item className="py-3">
              <Button variant="primary" className="w-100 mb-2 fw-bold">Invite Friends</Button>
              <Button variant="outline-primary" className="w-100 fw-bold">Share Link</Button>
            </ListGroup.Item>

            {/* প্রোফাইল এডিট সেকশন (এখানে নাম-ইমেইল লুকানো) */}
            <ListGroup.Item className="py-4 bg-light">
              {!editMode ? (
                <div>
                  <p className="text-muted small">আপনার তথ্য পরিবর্তন করতে নিচের বাটনে ক্লিক করুন</p>
                  <Button 
                    variant="info" 
                    className="w-100 text-white fw-bold"
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile / Security
                  </Button>
                </div>
              ) : (
                <Form onSubmit={submitHandler} className="text-start">
                  <h6 className="text-center mb-3">তথ্য আপডেট করুন</h6>
                  <Form.Group className='my-2' controlId='name'>
                    <Form.Label>নাম</Form.Label>
                    <Form.Control type='text' value={name} onChange={(e) => setName(e.target.value)} />
                  </Form.Group>

                  <Form.Group className='my-2' controlId='email'>
                    <Form.Label>ইমেইল</Form.Label>
                    <Form.Control type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Form.Group>

                  <Form.Group className='my-2' controlId='mobile'>
                    <Form.Label>মোবাইল নম্বর</Form.Label>
                    <Form.Control type='text' value={mobile} placeholder="017XXXXXXXX" onChange={(e) => setMobile(e.target.value)} />
                  </Form.Group>

                  <Form.Group className='my-2' controlId='password'>
                    <Form.Label>নতুন পাসওয়ার্ড</Form.Label>
                    <Form.Control type='password' placeholder='পাসওয়ার্ড দিন' onChange={(e) => setPassword(e.target.value)} />
                  </Form.Group>

                  <Form.Group className='my-2' controlId='confirmPassword'>
                    <Form.Label>পাসওয়ার্ড নিশ্চিত করুন</Form.Label>
                    <Form.Control type='password' placeholder='আবার লিখুন' onChange={(e) => setConfirmPassword(e.target.value)} />
                  </Form.Group>

                  <div className="d-flex gap-2 mt-3">
                    <Button type='submit' variant='success' className='flex-grow-1'>Update</Button>
                    <Button variant='secondary' className='flex-grow-1' onClick={() => setEditMode(false)}>Cancel</Button>
                  </div>
                  {loadingUpdateProfile && <Loader />}
                </Form>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>

      <Col md={8}>
        <h2>আমার অর্ডারসমূহ</h2>
        {/* এখানে অর্ডারের কোড থাকবে */}
      </Col>
    </Row>
  );
};

export default ProfileScreen;