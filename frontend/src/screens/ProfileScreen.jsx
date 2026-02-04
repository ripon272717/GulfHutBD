import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, InputGroup, Container, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { useProfileMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { FaUser, FaEnvelope, FaLock, FaCamera, FaCopy, FaCheck, FaWallet, FaLink, FaEdit, FaShareAlt, FaUserPlus } from 'react-icons/fa';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading: resLoading }] = useProfileMutation();

  const dispatch = useDispatch();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
      setImage(userInfo.image || '');
    }
  }, [userInfo]);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const uploadFileHandler = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImage(reader.result);
    };
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('পাসওয়ার্ড মিলছে না!');
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
        handleClose();
        toast.success('প্রোফাইল আপডেট সফল হয়েছে!');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const copyToClipboard = () => {
    const inviteLink = `${window.location.origin}/register?ref=${userInfo?._id}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('লিঙ্ক কপি হয়েছে!');
  };

  const shareHandler = () => {
    const inviteLink = `${window.location.origin}/register?ref=${userInfo?._id}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join Gulf Hut BD',
        text: 'আমার রেফারেল লিঙ্ক ব্যবহার করে জয়েন করুন!',
        url: inviteLink,
      });
    } else {
      copyToClipboard();
    }
  };

  return (
    <Container className='mt-3 mb-5'>
      <Row className='justify-content-center'>
        <Col md={6} xs={12}>
          
          {/* ১. প্রোফাইল কার্ড (সবার উপরে) */}
          <Card className='shadow-lg border-0 rounded-4 overflow-hidden mb-3'>
            <div className='bg-primary p-4 text-center text-white'>
              <div className='position-relative d-inline-block'>
                <img
                  src={image || 'https://via.placeholder.com/150'}
                  alt='profile'
                  className='rounded-circle border border-4 border-white shadow'
                  style={{ width: '110px', height: '110px', objectFit: 'cover' }}
                />
              </div>
              <h4 className='mt-2 fw-bold text-white mb-1'>{userInfo?.name}</h4>
              <div className='badge bg-warning text-dark px-3 py-2 rounded-pill mb-2 shadow-sm'>
                <FaWallet className='me-2' /> ব্যালেন্স: $0.00
              </div>
              <br />
              <Button variant='light' size='sm' className='rounded-pill px-4 text-primary fw-bold shadow-sm' onClick={handleShow}>
                <FaEdit className='me-1' /> প্রোফাইল এডিট করুন
              </Button>
            </div>
            
            <Card.Body className='p-3 text-center bg-white'>
               <div className='d-flex justify-content-around'>
                  <div><strong>0</strong><br/><small className='text-muted'>রেফারেল</small></div>
                  <div><strong>0</strong><br/><small className='text-muted'>অর্ডার</small></div>
               </div>
            </Card.Body>
          </Card>

          {/* ২. অ্যাকশন সেকশন (ইনভাইট ও শেয়ার) */}
          <Card className='shadow-sm border-0 rounded-4 mb-3'>
            <Card.Body className='p-3'>
              <p className='fw-bold text-center mb-2 small text-muted'><FaLink /> আপনার রেফারেল লিঙ্ক</p>
              <InputGroup className='mb-3 shadow-sm'>
                <Form.Control
                  readOnly
                  value={`${window.location.origin}/register?ref=${userInfo?._id}`}
                  className='bg-light border-0 text-center small py-2'
                />
                <Button variant='primary' onClick={copyToClipboard}>
                  {copied ? <FaCheck /> : <FaCopy />}
                </Button>
              </InputGroup>

              {/* Invite Button */}
              <Button variant='dark' className='w-100 rounded-pill fw-bold mb-2 py-2 shadow-sm' onClick={copyToClipboard}>
                <FaUserPlus className='me-2' /> বন্ধুদের ইনভাইট করুন
              </Button>

              {/* Share Button */}
              <Button variant='success' className='w-100 rounded-pill fw-bold py-2 shadow-sm' onClick={shareHandler}>
                <FaShareAlt className='me-2' /> এখনই শেয়ার করুন
              </Button>
            </Card.Body>
          </Card>

        </Col>
      </Row>

      {/* ৩. এডিট প্রোফাইল মোডাল (পপ-আপ) */}
      <Modal show={showModal} onHide={handleClose} centered size="md">
        <Modal.Header closeButton className='border-0 px-4 pt-4'>
          <Modal.Title className='fw-bold'>তথ্য আপডেট করুন</Modal.Title>
        </Modal.Header>
        <Modal.Body className='px-4 pb-4'>
          <Form onSubmit={submitHandler}>
            <div className='text-center mb-4'>
               <div className='position-relative d-inline-block'>
                  <img src={image || 'https://via.placeholder.com/150'} alt='preview' className='rounded-circle border' style={{width: '90px', height: '90px', objectFit: 'cover'}} />
                  <label htmlFor='modal-image' className='position-absolute bottom-0 end-0 bg-primary text-white p-2 rounded-circle shadow' style={{cursor: 'pointer'}}>
                    <FaCamera size={12} />
                    <input type='file' id='modal-image' hidden onChange={uploadFileHandler} />
                  </label>
               </div>
            </div>

            <Form.Group className='mb-3'>
              <Form.Label className='small fw-bold'>পুরো নাম</Form.Label>
              <InputGroup>
                <InputGroup.Text><FaUser className='text-primary'/></InputGroup.Text>
                <Form.Control type='text' value={name} onChange={(e) => setName(e.target.value)} />
              </InputGroup>
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label className='small fw-bold'>ইমেইল অ্যাড্রেস</Form.Label>
              <InputGroup>
                <InputGroup.Text><FaEnvelope className='text-primary'/></InputGroup.Text>
                <Form.Control type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
              </InputGroup>
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label className='small fw-bold'>নতুন পাসওয়ার্ড (ঐচ্ছিক)</Form.Label>
              <InputGroup>
                <InputGroup.Text><FaLock className='text-primary'/></InputGroup.Text>
                <Form.Control type='password' placeholder='নতুন পাসওয়ার্ড দিন' value={password} onChange={(e) => setPassword(e.target.value)} />
              </InputGroup>
            </Form.Group>

            <Form.Group className='mb-4'>
              <Form.Label className='small fw-bold'>পাসওয়ার্ড নিশ্চিত করুন</Form.Label>
              <InputGroup>
                <InputGroup.Text><FaLock className='text-primary'/></InputGroup.Text>
                <Form.Control type='password' placeholder='আবার টাইপ করুন' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </InputGroup>
            </Form.Group>

            <Button type='submit' variant='primary' className='w-100 rounded-pill fw-bold py-2 shadow' disabled={resLoading}>
              {resLoading ? <Loader size="sm" /> : 'পরিবর্তনগুলো সেভ করুন'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProfileScreen;