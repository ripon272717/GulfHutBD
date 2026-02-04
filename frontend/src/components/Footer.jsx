import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ 
      backgroundColor: '#f8f9fa', // একদম হালকা সুন্দর একটি কালার
      borderTop: '1px solid #e7e7e7', // উপরে চিকন একটা বর্ডার লাইন
      marginTop: '50px', 
      padding: '20px 0' 
    }}>
      <Container>
        <Row>
          <Col className='text-center'>
            <h5 style={{ fontWeight: '600', color: '#333' }}>Qatari Hut</h5>
            <p style={{ margin: '5px 0', color: '#555' }}>
              Enjoy Qatari Market | Qatari Hut Bangladesh
            </p>
            <p style={{ fontSize: '14px', color: '#888' }}>
              &copy; {currentYear} All Rights Reserved
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;