import { Navbar, Nav, Container, NavDropdown, Badge, Button } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaUserPlus, FaWallet } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import SearchBox from './SearchBox';
import logo from '../assets/logo.png';
import { resetCart } from '../slices/cartSlice';

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
      dispatch(resetCart());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header>
      <Navbar bg='primary' variant='dark' expand='lg' collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to='/'>
            <img src={logo} alt='ProShop' />
            ProShop
          </Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto align-items-center'>
              <SearchBox />
              <Nav.Link as={Link} to='/cart' className='me-3'>
                <FaShoppingCart /> Cart
                {cartItems.length > 0 && (
                  <Badge pill bg='success' style={{ marginLeft: '5px' }}>
                    {cartItems.reduce((a, c) => a + c.qty, 0)}
                  </Badge>
                )}
              </Nav.Link>

              {userInfo ? (
                <div className='d-flex align-items-center'>
                  {/* ব্যালেন্স এবং নামের ড্রপডাউন */}
                  <div className='text-end me-2' style={{ lineHeight: '1.2' }}>
                    <small className='d-block text-warning fw-bold' style={{ fontSize: '0.7rem' }}>
                      <FaWallet size={10} className='me-1' />
                      ${userInfo.walletBalance || 0}
                    </small>
                    <NavDropdown 
                      title={userInfo.name} 
                      id='username' 
                      align='end'
                      style={{ fontSize: '0.9rem', display: 'inline-block' }}
                    >
                      <NavDropdown.Item as={Link} to='/profile'>
                        Edit Profile
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={logoutHandler}>
                        Logout
                      </NavDropdown.Item>
                    </NavDropdown>
                  </div>

                  {/* প্রোফাইল ইমেজ - ক্লিক করলে প্রোফাইল পেজে যাবে */}
                  <Link to='/profile'>
                    <img
                      src={userInfo.image || '/images/default-profile.png'}
                      alt='user'
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #FFD700',
                        cursor: 'pointer',
                      }}
                      title='Go to Profile'
                    />
                  </Link>
                </div>
              ) : (
                <div className='d-flex align-items-center'>
                  <Nav.Link as={Link} to='/login'>
                    <FaUser /> Sign In
                  </Nav.Link>
                  <Link to='/register'>
                    <Button variant='info' size='sm' className='ms-2 text-white fw-bold'>
                      <FaUserPlus className='me-1' /> Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Admin Links */}
              {userInfo && userInfo.isAdmin && (
                <NavDropdown title='Admin' id='adminmenu' className='ms-2'>
                  <NavDropdown.Item as={Link} to='/admin/productlist'>
                    Products
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to='/admin/orderlist'>
                    Orders
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to='/admin/userlist'>
                    Users
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;