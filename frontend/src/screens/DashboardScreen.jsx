import React from 'react';
import { Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { FaBox, FaPlaneDeparture, FaWarehouse, FaTruck, FaFileAlt, FaHeart, FaUsers, FaShoppingCart, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const DashboardScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const isAdmin = userInfo && (userInfo.role === 'admin' || userInfo.role === 'superadmin');

  // --- ১. অ্যাডমিন ড্যাশবোর্ড ভিউ ---
  const AdminDashboard = () => (
    <div className="mt-4">
      <h3 className="fw-bold mb-4">Admin Overview</h3>
      <Row className="g-3">
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm bg-primary text-white p-3 rounded-4">
            <FaShoppingCart size={25} className="mb-2"/>
            <h5>Total Orders</h5>
            <h3 className="fw-bold">45</h3>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm bg-success text-white p-3 rounded-4">
            <FaMoneyBillWave size={25} className="mb-2"/>
            <h5>Total Sales</h5>
            <h3 className="fw-bold">QR 12,500</h3>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm bg-warning text-dark p-3 rounded-4">
            <FaUsers size={25} className="mb-2"/>
            <h5>Total Users</h5>
            <h3 className="fw-bold">120</h3>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm bg-info text-white p-3 rounded-4">
            <FaChartLine size={25} className="mb-2"/>
            <h5>New Leads</h5>
            <h3 className="fw-bold">8</h3>
          </Card>
        </Col>
      </Row>

      <div className="mt-5">
        <h5 className="fw-bold mb-3">Quick Actions</h5>
        <div className="d-flex gap-2 flex-wrap">
          <Button variant="dark" className="rounded-pill" onClick={() => navigate('/admin/productlist')}>Manage Products</Button>
          <Button variant="dark" className="rounded-pill" onClick={() => navigate('/admin/orderlist')}>Check Orders</Button>
          <Button variant="dark" className="rounded-pill" onClick={() => navigate('/admin/userlist')}>User Management</Button>
        </div>
      </div>
    </div>
  );

  // --- ২. ইউজার ড্যাশবোর্ড ভিউ ---
  const UserDashboard = () => (
    <div className="mt-4">
      <h3 className="fw-bold">স্বাগতম, {userInfo?.name}!</h3>
      <p className="text-muted small">আপনার অর্ডার এবং শিপিং স্ট্যাটাস এখান থেকে ট্র্যাক করুন।</p>
      
      {/* অর্ডার ট্র্যাকিং কার্ড (আগের সেই কোড) */}
      <Card className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden mt-4">
        <Card.Header className="bg-dark text-white d-flex justify-content-between py-3">
          <span className="small">Order ID: <b>#QH-10254</b></span>
          <Badge bg="warning" text="dark" className="rounded-pill px-3">Shipping</Badge>
        </Card.Header>
        <Card.Body className="p-4 text-center">
          <Row className="g-3">
            <Col xs={6} md={3}>
              <FaBox className="text-success mb-2" size={20}/><br/>
              <small className="fw-bold d-block">অর্ডার কনফার্ম</small>
            </Col>
            <Col xs={6} md={3}>
              <FaPlaneDeparture className="text-primary mb-2" size={20}/><br/>
              <small className="fw-bold d-block">কাতার থেকে শিপিং</small>
            </Col>
            <Col xs={6} md={3}>
              <FaWarehouse className="text-muted mb-2" size={20}/><br/>
              <small className="fw-bold d-block">বাংলাদেশে পৌঁছাবে</small>
            </Col>
            <Col xs={6} md={3}>
              <FaTruck className="text-muted mb-2" size={20}/><br/>
              <small className="fw-bold d-block">কুরিয়ারে হস্তান্তর</small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <h5 className="fw-bold mt-5 mb-3"><FaHeart className="text-danger me-2"/> Favourite Products</h5>
      <p className="text-muted small">আপনার পছন্দের তালিকায় কোনো পণ্য নেই।</p>
    </div>
  );

  return (
    <div className="container mt-5 pt-4 pb-5">
      {/* রোল অনুযায়ী ড্যাশবোর্ড কন্টেন্ট দেখাবে */}
      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
};

export default DashboardScreen;