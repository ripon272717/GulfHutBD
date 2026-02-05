import React from 'react';
import { Table, Button, Container, Badge } from 'react-bootstrap';
import { FaTrash, FaEdit, FaCheck, FaTimes, FaWallet } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import {
  useDeleteUserMutation,
  useGetUsersQuery,
} from '../../slices/usersApiSlice';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UserListScreen = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();

  // লগইন করা ইউজারের তথ্য (চেক করার জন্য যে সে Super Admin কি না)
  const { userInfo } = useSelector((state) => state.auth);

  const deleteHandler = async (id) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই ইউজারটি ডিলিট করতে চান?')) {
      try {
        await deleteUser(id);
        refetch();
        toast.success('ইউজার ডিলিট করা হয়েছে');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <Container className="mt-5 pt-5">
      <h1 className="text-white">Users Management</h1>
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
            {users.map((user) => (
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
                    {/* সাধারণ এডিট বাটন */}
                    <Button
                      as={Link}
                      to={`/admin/user/${user._id}/edit`}
                      variant='light'
                      className='btn-sm me-2'
                    >
                      <FaEdit />
                    </Button>

                    {/* ব্যালেন্স এডিট বাটন: শুধুমাত্র Super Admin দেখতে পাবে */}
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

                    {/* ডিলিট বাটন: নিজেকে বা অন্য সুপার অ্যাডমিনকে ডিলিট করা যাবে না */}
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