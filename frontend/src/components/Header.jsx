import { Navbar, Nav, Container, NavDropdown, Badge, Image } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaBars, FaChevronDown } from 'react-icons/fa'; 
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
    } catch (err) { console.error(err); }
  };

  const openProfileModal = () => { console.log('Edit Modal Open'); };

  return (
    <header>
      <style>
        {`
          /* বুটস্ট্র্যাপের ডিফল্ট ছোট অ্যারো হাইড করা */
          .nav-link::after, .dropdown-toggle::after {
            display: none !important;
          }
        `}
      </style>

      <Navbar bg='dark' variant='dark' fixed='top' className='py-2 shadow-sm'>
        <Container className='d-flex align-items-center justify-content-between'>
          
          {/* ১. লোগো */}
          <LinkContainer to='/'>
            <Navbar.Brand className='d-flex align-items-center m-0'>
              <img src={logo} alt='GulfHut' style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
              <span className='fw-bold d-none d-sm-inline ms-2'>GulfHut</span>
            </Navbar.Brand>
          </LinkContainer>

          {/* ২. ক্যাটাগরি (সব সময় Arrow থাকবে) */}
          <Nav className='mx-auto'>
            <NavDropdown 
              title={
                <span className='text-white fw-bold d-flex align-items-center' style={{ fontSize: '15px' }}>
                  Category <FaChevronDown size={12} className='ms-1' />
                </span>
              } 
              id='category-dropdown'
            >
              <LinkContainer to='/category/bra'><NavDropdown.Item>1) Bra</NavDropdown.Item></LinkContainer>
              <LinkContainer to='/category/panty'><NavDropdown.Item>2) Panty</NavDropdown.Item></LinkContainer>
              
              <div className='dropdown-divider'></div>
              <div className='px-3 py-1 fw-bold text-muted' style={{ fontSize: '12px' }}>3) Cream</div>
              <LinkContainer to='/category/whitening'><NavDropdown.Item className='ps-4'>- Whitening Cream</NavDropdown.Item></LinkContainer>
              <LinkContainer to='/category/night-cream'><NavDropdown.Item className='ps-4'>- Night Cream</NavDropdown.Item></LinkContainer>
              <LinkContainer to='/category/removal'><NavDropdown.Item className='ps-4'>- Removal Cream</NavDropdown.Item></LinkContainer>
              <LinkContainer to='/category/moisturin'><NavDropdown.Item className='ps-4'>- Moisturin Cream</NavDropdown.Item></LinkContainer>
              <div className='dropdown-divider'></div>

              <LinkContainer to='/category/night-dress'><NavDropdown.Item>4) Night Dress</NavDropdown.Item></LinkContainer>
              <LinkContainer to='/category/nekub'><NavDropdown.Item>5) Nekub</NavDropdown.Item></LinkContainer>
              <LinkContainer to='/category/borkha'><NavDropdown.Item>6) Borkha</NavDropdown.Item></LinkContainer>
              <LinkContainer to='/category/cosmetics'><NavDropdown.Item>7) Cosmetics</NavDropdown.Item></LinkContainer>
              <LinkContainer to='/category/others'><NavDropdown.Item>8) Others</NavDropdown.Item></LinkContainer>
            </NavDropdown>
          </Nav>

          {/* ডান পাশের সেকশন */}
          <Nav className='d-flex align-items-center flex-row'>
            
            <LinkContainer to='/cart'>
              <Nav.Link className='me-3 position-relative p-0'>
                <FaShoppingCart size={22} />
                {cartItems.length > 0 && (
                  <Badge pill bg='success' style={{ position: 'absolute', top: '-8px', right: '-8px', fontSize: '10px' }}>
                    {cartItems.reduce((a, c) => a + c.qty, 0)}
                  </Badge>
                )}
              </Nav.Link>
            </LinkContainer>

            {userInfo ? (
              <div className='d-flex align-items-center'>
                <div className='d-flex flex-column flex-md-row align-items-center me-2 text-end'>
                  <div className='order-1 order-md-1 me-md-2'><span className='text-warning fw-bold' style={{ fontSize: '12px' }}>QR {userInfo.balance || 0}</span></div>
                  <div className='order-2 order-md-2'><span className='text-white' style={{ fontSize: '14px' }}>{userInfo.name.split(' ')[0]}</span></div>
                </div>

                <div onClick={openProfileModal} style={{ cursor: 'pointer' }} className='mx-1'>
                  <Image src={userInfo.image || '/images/profile.png'} roundedCircle style={{ width: '35px', height: '35px', border: '1px solid #fff', objectFit: 'cover' }} />
                </div>

                {/* ৩. মেনু বাটন লজিক */}
                <NavDropdown
                  title={
                    <span className='text-white d-flex align-items-center'>
                      {/* পিসিতে শুধু Menu + Arrow */}
                      <span className='d-none d-md-inline'>Menu <FaChevronDown size={11} className='ms-1' /></span>
                      
                      {/* মোবাইলে শুধু ৩-লাইন আইকন */}
                      <FaBars size={20} className='d-md-none' />
                    </span>
                  }
                  id='nav-dropdown'
                  align='end'
                >
                  <LinkContainer to='/profile'><NavDropdown.Item>Edit Profile</NavDropdown.Item></LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown title='আমাদের নিয়মাবলী' id='rules-nav' drop='start' className='dropdown-item'>
                    <NavDropdown.Item>Earn & Save</NavDropdown.Item>
                    <NavDropdown.Item>অর্ডার নিয়ম</NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
                </NavDropdown>
              </div>
            ) : (
              <LinkContainer to='/login'><Nav.Link className='p-0 text-white'><FaUser size={20} /></Nav.Link></LinkContainer>
            )}
          </Nav>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;