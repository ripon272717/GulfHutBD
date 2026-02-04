import { Navbar, Nav, Container, NavDropdown, Badge, Button } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaUserPlus, FaWallet } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import SearchBox from './SearchBox';
import logo from '../assets/Ourlogo.png';
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
      <Navbar bg='primary' variant='dark' expand='lg' fixed='top' collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to='/'>
            <img src={logo} alt='Qatari Hut BD' 
            style={{ 
    height: '50px', 
    width: 'auto',   
    marginRight: '10px',
    borderRadius: '10px' // এই লাইনটি যোগ করুন
         }}
            />
            QHut BD
          </Navbar.Brand>

          {/* মোবাইল ভিউতে টগলারের বাম পাশে ইউজার ইনফো */}
          <div className='d-flex align-items-center order-lg-last'>
            {userInfo ? (
              <div className='d-flex align-items-center me-2'>
                {/* প্রোফাইল লোগো (ছবি না থাকলে নামের প্রথম অক্ষর) */}
                <Link to='/profile' className='me-2'>
                  {userInfo.image ? (
                    <img
                      src={userInfo.image}
                      alt='user'
                      style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #FFD700',
                      }}
                    />
                  ) : (
                    <div
                      className='rounded-circle bg-warning d-flex align-items-center justify-content-center text-dark fw-bold'
                      style={{ width: '35px', height: '35px', fontSize: '16px' }}
                    >
                      {userInfo.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>

                {/* নাম এবং ব্যালেন্স */}
                <div className='text-start text-white me-2' style={{ lineHeight: '1.2' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{userInfo.name.split(' ')[0]}</div>
                  <div style={{ fontSize: '11px', color: '#ffc107' }}>
                    <FaWallet size={9} /> ৳{userInfo.walletBalance || 0}
                  </div>
                </div>
              </div>
            ) : null}

            <Navbar.Toggle aria-controls='basic-navbar-nav' />
          </div>

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
                <NavDropdown title='Menu' id='username' align='end'>
                  <NavDropdown.Item as={Link} to='/profile'>
                    Edit Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
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

              {userInfo && userInfo.isAdmin && (
                <NavDropdown title='Admin' id='adminmenu' className='ms-2'>
                  <NavDropdown.Item as={Link} to='/admin/productlist'>Products</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to='/admin/orderlist'>Orders</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to='/admin/userlist'>Users</NavDropdown.Item>
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