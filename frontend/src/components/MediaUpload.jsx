import React, { useState } from 'react';
import axios from 'axios';

const MediaUpload = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);

  // ১. সরাসরি ক্লাউডিনারি উইজেট (গুগল সার্চের জন্য)
  const openWidget = () => {
  if (window.cloudinary) {
    window.cloudinary.openUploadWidget(
      {
        cloudName: 'diao4zmtr',
        uploadPreset: 'gulfhut_preset',
        sources: ['local', 'url', 'image_search', 'google_drive'],
        resourceType: 'auto', // এটা 'auto' থাকলে ইমেজ ও ভিডিও দুইটাই নেবে
        clientAllowedFormats: ['png', 'jpg', 'jpeg', 'mp4', 'mov', 'avi'], // ভিডিও ফরম্যাট যোগ করা হলো
        multiple: false,
      },
      (error, result) => {
        if (!error && result.event === "success") {
          // ভিডিও আপলোড হলে তার সিকিউর লিঙ্কটা তোর ভিডিও স্টেট-এ পাঠিয়ে দেব
          onUploadSuccess(result.info.secure_url);
        }
      }
    );
  }
};
  // ২. পিসি থেকে ম্যানুয়াল আপলোড (Multer এর জন্য)
  const manualUploadHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('media', file); // এখানে 'media' রাখবি কারণ ব্যাকএন্ডে এটাই দেওয়া আছে

    setLoading(true);
    try {
      const { data } = await axios.post('/api/upload', formData);
      onUploadSuccess(data.url);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* ড্র্যাগ অ্যান্ড ড্রপ লুক ওয়ালা বক্স */}
      <div style={styles.dropzone} onClick={() => document.getElementById('fileInput').click()}>
        <i className="fas fa-cloud-upload-alt" style={{ fontSize: '30px', color: '#007bff' }}></i>
        <p style={{ margin: '10px 0' }}>ছবি এখানে টেনে আনুন অথবা ক্লিক করুন</p>
        <input 
          id="fileInput"
          type="file" 
          hidden 
          onChange={manualUploadHandler} 
        />
      </div>

      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <span>অথবা</span>
        <br />
        <button type="button" onClick={openWidget} className="btn btn-dark mt-2">
          গুগল থেকে ছবি খুঁজুন
        </button>
      </div>
      
      {loading && <p>আপলোড হচ্ছে...</p>}
    </div>
  );
};

const styles = {
  container: { border: '1px solid #ddd', padding: '20px', borderRadius: '10px' },
  dropzone: {
    border: '2px dashed #007bff',
    padding: '30px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f9f9f9'
  }
};

export default MediaUpload;