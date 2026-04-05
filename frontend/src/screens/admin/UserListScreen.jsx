import React, { useState } from 'react';
import { Table, Button, Badge, Card, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { FaTrash, FaUserEdit, FaWallet, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  useGetUsersQuery, 
  useDeleteUserMutation, 
  useUpdateUserMutation 
} from '../../slices/usersApiSlice';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';

const UserListScreen = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { userInfo } = useSelector((state) => state.auth);
  // সুপার এডমিন চেক
  const isSuperAdmin = userInfo && userInfo.role === 'superadmin';

  const { data: users, refetch, isLoading, error } = useGetUsersQuery();
  const [deleteUser, { isLoading: loadingDelete }] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  // --- স্ট্যাটাস পরিবর্তন (টিক/ক্রস) লজিক ---
  const toggleStatusHandler = async (user) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে এই ইউজারকে ${user.status === 'active' ? 'ব্যান' : 'অ্যাক্টিভ'} করতে চান?`)) {
      return;
    }

    try {
      const newStatus = user.status === 'active' ? 'banned' : 'active';
      
      // ব্যাকএন্ডে শুধু স্ট্যাটাস আপডেট পাঠানো হচ্ছে
      await updateUser({
        userId: user._id,
        status: newStatus,
      }).unwrap();

      refetch(); // ডাটাবেস থেকে নতুন স্ট্যাটাস টেনে আনা
      toast.success(newStatus === 'active' ? 'অ্যাকাউন্ট সচল করা হয়েছে (টিক)' : 'অ্যাকাউন্ট ব্যান করা হয়েছে (ক্রস)');
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'কিছু একটা ভুল হয়েছে');
    }
  };

  // --- ইউজার ডিলিট লজিক ---
  const deleteHandler = async (id) => {
    if (window.confirm('আপনি কি নিশ্চিত? এটি ডিলিট করলে আর ফিরে পাওয়া যাবে না!')) {
      try {
        await deleteUser(id);
        refetch();
        toast.success('ইউজার সফলভাবে রিমুভ করা হয়েছে');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  // --- অ্যাডভান্সড সার্চ লজিক ---
  const filteredUsers = users?.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.customId?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.mobile?.includes(search) ||
      user.referrerName?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="container mt-4 pb-5">
      <Row className="mb-4 align-items-center">
        <Col md={12} className="mb-3">
          <h2 className="fw-bold m-0">User Control Center</h2>
          <Badge bg={isSuperAdmin ? "danger" : "primary"} className="mt-2 px-3 py-2">
            {isSuperAdmin ? "SUPER ADMIN ACCESS" : "ADMIN ACCESS"}
          </Badge>
        </Col>
        
        {/* সার্চ বার */}
        <Col md={12}>
          <InputGroup className="shadow-sm rounded-pill overflow-hidden border">
            <InputGroup.Text className="bg-white border-0 ps-3">
              <FaSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="নাম, CID, মোবাইল, ইমেইল বা স্পন্সর দিয়ে খুঁজুন..."
              className="border-0 py-2 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      {loadingDelete && <Loader />}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mt-2">
          <Table hover responsive className='align-middle mb-0 text-center'>
            <thead className='bg-dark text-white small'>
              <tr>
                <th className="p-3 text-start">USER & CID</th>
                <th>ROLE</th>
                <th>SPONSOR</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers?.map((user) => (
                <tr key={user._id}>
                  {/* ইউজার ও CID */}
                  <td className="p-3 text-start">
                    <div className="fw-bold text-dark">{user.name}</div>
                    <small className="text-muted">CID: {user.customId || 'QH-001'}</small>
                  </td>

                  {/* রোল */}
                  <td>
                    <Badge 
                      bg={user.role === 'superadmin' ? 'danger' : user.role === 'admin' ? 'success' : 'info'} 
                      className="text-uppercase" 
                      style={{fontSize: '10px'}}
                    >
                      {user.role || 'user'}
                    </Badge>
                  </td>
                  
                  {/* স্পন্সর */}
                  <td>
                    <div className="small fw-bold text-primary">{user.referrerName || 'Direct Join'}</div>
                    <div className="text-muted" style={{fontSize:'10px'}}>{user.referrerCid}</div>
                  </td>

                  {/* স্ট্যাটাস টিক/ক্রস */}
                  <td>
                    <div 
                      onClick={() => toggleStatusHandler(user)} 
                      style={{ cursor: 'pointer', display: 'inline-block' }}
                    >
                      {user.status === 'active' ? (
                        <FaCheck className="text-success" size={24} title="Account Active (Click to Ban)" />
                      ) : (
                        <FaTimes className="text-danger" size={24} title="Account Banned (Click to Unban)" />
                      )}
                    </div>
                  </td>

                  {/* এডিট/ব্যালেন্স/ডিলিট বাটন */}
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      {isSuperAdmin ? (
                        <>
                          <Button 
                            variant='outline-primary' 
                            size='sm' 
                            className="rounded-circle" 
                            onClick={() => navigate(`/admin/user/${user._id}/edit`)}
                          >
                            <FaUserEdit />
                          </Button>
                          <Button 
                            variant='outline-warning' 
                            size='sm' 
                            className="rounded-circle" 
                            onClick={() => navigate(`/admin/user/${user._id}/balance`)}
                          >
                            <FaWallet />
                          </Button>
                          <Button 
                            variant='outline-danger' 
                            size='sm' 
                            className="rounded-circle" 
                            onClick={() => deleteHandler(user._id)}
                          >
                            <FaTrash />
                          </Button>
                        </>
                      ) : (
                        <small className="text-muted">View Only</small>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default UserListScreen;