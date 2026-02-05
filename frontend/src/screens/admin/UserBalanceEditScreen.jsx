import React, { useState, useEffect } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetUserDetailsQuery, useUpdateUserBalanceMutation } from '../../slices/usersApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const UserBalanceEditScreen = () => {
  const { id: userId } = useParams();
  const [walletBalance, setWalletBalance] = useState(0);

  const { data: user, isLoading, error, refetch } = useGetUserDetailsQuery(userId);
  const [updateBalance, { isLoading: loadingUpdate }] = useUpdateUserBalanceMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setWalletBalance(user.walletBalance);
    }
  }, [user]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateBalance({ userId, walletBalance }).unwrap();
      toast.success('ব্যালেন্স সফলভাবে আপডেট হয়েছে');
      refetch();
      navigate('/admin/userlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Container className='mt-5'>
      <Link to='/admin/userlist' className='btn btn-light my-3'>
        ফিরে যান
      </Link>
      <div className='p-4 bg-dark rounded shadow border border-warning'>
        <h2 className='text-white mb-4'>ইউজার ব্যালেন্স এডিট: {user?.name}</h2>
        {loadingUpdate && <Loader />}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error?.data?.message || error.error}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group controlId='balance' className='my-2'>
              <Form.Label className='text-white'>পরিমাণ (QR)</Form.Label>
              <Form.Control
                type='number'
                placeholder='টাকার পরিমাণ লিখুন'
                value={walletBalance}
                onChange={(e) => setWalletBalance(e.target.value)}
                className='bg-secondary text-white border-0'
              ></Form.Control>
            </Form.Group>

            <Button type='submit' variant='warning' className='mt-3 fw-bold w-100 py-2'>
              Update Wallet Balance
            </Button>
          </Form>
        )}
      </div>
    </Container>
  );
};

export default UserBalanceEditScreen;