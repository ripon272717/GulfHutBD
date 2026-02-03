import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form, Card, ListGroup, InputGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { useProfileMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { FaCamera, FaShareAlt, FaUserFriends, FaCopy } from 'react-icons/fa';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState('');
  const [editMode, setEditMode] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading: loadingUpdateProfile }] = useProfileMutation();

  const inviteLink = `${window.location.origin}/register?ref=${userInfo._id}`;

  useEffect(() => {
    setName(userInfo.name);
    setEmail(userInfo.email);
    setMobile(userInfo.mobile || '');
    setImage(userInfo.image || '');
  }, [userInfo]);

  const dispatch = useDispatch();

  // লিঙ্ক কপি করার ফাংশন
  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('লিঙ্কটি কপি করা হয়েছে!');
  };

  // সোশ্যাল মিডিয়া শেয়ার ফাংশন
  const shareHandler = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GulfHut এ জয়েন করুন',
          text: 'আমার রেফারেল লিঙ্ক ব্যবহার করে রেজিস্ট্রেশন করুন!',
          url: inviteLink,
        });
      } catch (err) {
        console.error('শেয়ার করা সম্ভব হয়নি');
      }
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(inviteLink)}`, '_blank');
    }
  };

  // ইমেজ আপলোড হ্যান্ডলার (সরাসরি ফাইল থেকে)
  const uploadFileHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImage(reader.result); // এটি প্রিভিউ হিসেবে দেখাবে
    };
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('পাসওয়ার্ড মিলছে না!');
    } else {
      try {
        const res = await updateProfile({ name, email, mobile, password, image }).unwrap();
        dispatch(setCredentials({ ...res }));
        toast.success('প্রোফাইল আপডেট হয়েছে!');
        setEditMode(false);
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <Row className="mt-3">
      <Col md={4} className="mb-4">
        <Card className="shadow-sm border-0 text-center p-3">
          <div className="position-relative d-inline-block mx-auto mb-3">
            <img
              src={image || '/images/default-profile.png'}
              alt="Profile"
              className="rounded-circle border"
              style={{ width: '120px', height: '120px', objectFit: 'cover' }}
            />
            <label htmlFor="image-upload" className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow-sm" style={{ cursor: 'pointer' }}>
              <FaCamera />
              <input type="file" id="image-upload" hidden accept="image/*" onChange={uploadFileHandler} />
            </label>
          </div>

          <h5 className="mb-0">{userInfo.name}</h5>
          <small className="text-success fw-bold">৳ {userInfo.walletBalance || 0}</small>
          <hr />

          <ListGroup variant="flush">
            {/* ইনভাইট ও শেয়ার সেকশন */}
            <ListGroup.Item className="py-3 border-0">
              <h6 className="small text-muted mb-2 text-start">আপনার রেফারেল লিঙ্ক:</h6>
              <InputGroup className="mb-3">
                <Form.Control value={inviteLink} readOnly size="sm" />
                <Button variant="outline-primary" onClick={copyToClipboard} size="sm"><FaCopy /></Button>
              </InputGroup>
              <div className="d-grid gap-2">
                <Button variant="primary" onClick={shareHandler} className="fw-bold">
                  <FaUserFriends className="me-2" /> Invite Friends
                </Button>
                <Button variant="success" onClick={shareHandler} className="fw-bold">
                  <FaShareAlt className="me-2" /> Share on Social Media
                </Button>
              </div>
            </ListGroup.Item>

            {/* এডিট প্রোফাইল বাটন */}
            <ListGroup.Item className="py-3 border-0 bg-light rounded">
              {!editMode ? (
                <Button variant="info" className="w-100 text-white fw-bold" onClick={() => setEditMode(true)}>
                  Edit Profile / Security
                </Button>
              ) : (
                <Form onSubmit={submitHandler} className="text-start mt-2">
                  <Form.Group className='my-2'>
                    <Form.Label>নাম</Form.Label>
                    <Form.Control type='text' value={name} onChange={(e) => setName(e.target.value)} />
                  </Form.Group>
                  <Form.Group className='my-2'>
                    <Form.Label>ইমেইল</Form.Label>
                    <Form.Control type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Form.Group>
                  <Form.Group className='my-2'>
                    <Form.Label>মোবাইল</Form.Label>
                    <Form.Control type='text' value={mobile} onChange={(e) => setMobile(e.target.value)} />
                  </Form.Group>
                  <Form.Group className='my-2'>
                    <Form.Label>নতুন পাসওয়ার্ড</Form.Label>
                    <Form.Control type='password' onChange={(e) => setPassword(e.target.value)} />
                  </Form.Group>
                  <Form.Group className='my-2'>
                    <Form.Label>নিশ্চিত করুন</Form.Label>
                    <Form.Control type='password' onChange={(e) => setConfirmPassword(e.target.value)} />
                  </Form.Group>
                  <div className="d-flex gap-2 mt-3">
                    <Button type='submit' variant='success' className='flex-grow-1'>Update</Button>
                    <Button variant='secondary' onClick={() => setEditMode(false)}>Cancel</Button>
                  </div>
                </Form>
              )}
            </ListGroup.Item>
          </ListGroup>
          {loadingUpdateProfile && <Loader />}
        </Card>
      </Col>

      <Col md={8}>
        <h2>আমার অর্ডারসমূহ</h2>
        {/* অর্ডার টেবিল এখানে থাকবে */}
      </Col>
    </Row>
  );
};

export default ProfileScreen;