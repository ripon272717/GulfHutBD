import React from 'react';
import { Table, Button, Container, Badge } from 'react-bootstrap';
import { FaTrash, FaEdit, FaWallet, FaPlus } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import {
  useDeleteUserMutation,
  useGetUsersQuery,
} from '../../slices/usersApiSlice';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate ইম্পোর্ট করা হয়েছে
import { useSelector } from 'react-redux';

const UserListScreen = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();

  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const deleteHandler = async (id) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই ইউজারটি ডিলিট করতে চান?')) {
      try {
        await deleteUser(id);
        refetch();
        toast.success('ইউজার ডিলিট করা হয়েছে');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  // নতুন ইউজার তৈরির হ্যান্ডলার
  const createUserHandler = () => {
    navigate('/admin/user/create');
  };

  return (
    <Container className="mt-5 pt-5">
      {/* তোমার দেওয়া স্টাইলিশ হেডার এবং বাটন */}
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h1 className='text-white'>Users Management</h1>
        <Button className='btn-sm m-3 py-2 px-3' onClick={createUserHandler} variant='warning'>
          <FaPlus /> Create New User
        </Button>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Table striped bordered hover responsive variant='dark' className='table-sm mt-3 shadow'>
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>MOBILE</th>
              <th>BALANCE (QR)</th>
              <th>ROLE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users && users
              .filter((user) => {
                // রোল ভিত্তিক ফিল্টারিং: 
                // ওনার সবাইকে দেখবে, কিন্তু অ্যাডমিন শুধু সাধারণ ইউজার দেখবে
                if (userInfo && userInfo.isSuperAdmin) return true;
                return !user.isAdmin && !user.isSuperAdmin;
              })
              .map((user) => (
                <tr key={user._id}>
                  <td>{user._id.slice(-5)}</td>
                  <td>{user.name}</td>
                  <td>{user.mobile}</td>
                  <td className="text-warning fw-bold">
                    {user.walletBalance || 0}
                  </td>
                  <td>
                    {user.isSuperAdmin ? (
                      <Badge bg="danger">Owner</Badge>
                    ) : user.isAdmin ? (
                      <Badge bg="success">Admin</Badge>
                    ) : (
                      <Badge bg="secondary">User</Badge>
                    )}
                  </td>
                  <td>
                    <div className='d-flex align-items-center'>
                      {/* এডিট বাটন */}
                      <Button
                        as={Link}
                        to={`/admin/user/${user._id}/edit`}
                        variant='light'
                        className='btn-sm me-2'
                      >
                        <FaEdit />
                      </Button>

                      {/* ব্যালেন্স এডিট বাটন: শুধুমাত্র Super Admin (Owner) দেখতে পাবে */}
                      {userInfo && userInfo.isSuperAdmin && (
                        <Button
                          as={Link}
                          to={`/admin/user/${user._id}/balance`}
                          variant='warning'
                          className='btn-sm me-2'
                          title="Edit Balance"
                        >
                          <FaWallet />
                        </Button>
                      )}

                      {/* ডিলিট বাটন: নিজেকে বা অন্য ওনারকে ডিলিট করা যাবে না */}
                      {!user.isSuperAdmin && (
                        <Button
                          variant='danger'
                          className='btn-sm'
                          onClick={() => deleteHandler(user._id)}
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default UserListScreen;