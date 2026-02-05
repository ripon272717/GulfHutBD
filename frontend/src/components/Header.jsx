import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaChartLine } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import logo from '../assets/Ourlogo.png';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header>
      <Navbar bg='dark' variant='dark' expand='lg' collapseOnSelect fixed='top'>
        <Container>
          <LinkContainer to='/'>
            <Navbar.Brand>
              <img src={logo} alt='ProShop' style={{ width: '40px', marginRight: '10px' }} />
              Qatari Hut BD
            </Navbar.Brand>
          </LinkContainer>

          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto'>
              <LinkContainer to='/cart'>
                <Nav.Link>
                  <FaShoppingCart /> Cart
                  {cartItems.length > 0 && (
                    <Badge pill bg='success' style={{ marginLeft: '5px' }}>
                      {cartItems.reduce((a, c) => a + c.qty, 0)}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>

              {userInfo ? (
                <>
                  {/* --- ড্যাশবোর্ড মেনু লজিক শুরু --- */}
                  <NavDropdown 
                    title={
                      <span>
                        <FaChartLine /> Dashboard
                      </span>
                    } 
                    id='dashboard-menu'
                  >
                    {/* সবার জন্য (Profile & Orders) */}
                    <LinkContainer to='/profile'>
                      <NavDropdown.Item>My Profile</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to='/my-orders'>
                      <NavDropdown.Item>My Orders</NavDropdown.Item>
                    </LinkContainer>

                    {/* অ্যাডমিন এবং ওনারের জন্য কমন ম্যানেজমেন্ট */}
                    {(userInfo.isAdmin || userInfo.isSuperAdmin) && (
                      <>
                        <NavDropdown.Divider />
                        <div className="dropdown-header text-primary fw-bold">Admin Section</div>
                        <LinkContainer to='/admin/userlist'>
                          <NavDropdown.Item>Users List</NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to='/admin/productlist'>
                          <NavDropdown.Item>Products List</NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to='/admin/orderlist'>
                          <NavDropdown.Item>Orders List</NavDropdown.Item>
                        </LinkContainer>
                      </>
                    )}

                    {/* শুধুমাত্র ওনারের জন্য স্পেশাল (Owner Only) */}
                    {userInfo.isSuperAdmin && (
                      <>
                        <NavDropdown.Divider />
                        <div className="dropdown-header text-danger fw-bold">Owner Access</div>
                        <LinkContainer to='/admin/reports'>
                          <NavDropdown.Item>Financial Stats</NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to='/admin/settings'>
                          <NavDropdown.Item>System Settings</NavDropdown.Item>
                        </LinkContainer>
                      </>
                    )}

                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={logoutHandler}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>

                  {/* ইউজারনেম ডিসপ্লে */}
                  <Nav.Link disabled className='text-light ms-2'>
                    | {userInfo.name} ({userInfo.walletBalance} QR)
                  </Nav.Link>
                </>
              ) : (
                <LinkContainer to='/login'>
                  <Nav.Link>
                    <FaUser /> Sign In
                  </Nav.Link>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;