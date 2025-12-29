import React, { useState, useEffect } from 'react';
import styles from './details.module.css';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Details() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for images and data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className={styles.detailscontainer}>
        <div className={styles.loaderContainer}>
          <div className={styles.loader}></div>
          <p>Loading details...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.detailscontainer}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.detailscontainer}>
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>View Details</h1>
          <button 
            onClick={() => navigate(-1)}
            className={styles.backButton}
          >
            ← Back
          </button>
        </div>
      </div>

      <div className={styles.infosection}>
        <h2>Personal Information</h2>
        <p><strong>Name:</strong> {data.name}</p>
        <p><strong>Gender:</strong> {data.gender}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Phone:</strong> {data.phone}</p>
        <p><strong>CNIC:</strong> {data.cnic}</p>

        <div className={styles.imagegroup}>
          <div>
            <p><strong>Profile Picture:</strong></p>
            <a href={data.photoUrl} target="_blank" rel="noopener noreferrer">
              <img src={data.photoUrl} alt="Profile" className={styles.image} />
            </a>
          </div>
          <div>
            <p><strong>CNIC Front:</strong></p>
            <a href={data.cnicFrontUrl} target="_blank" rel="noopener noreferrer">
              <img src={data.cnicFrontUrl} alt="CNIC Front" className={styles.image} />
            </a>
          </div>
          <div>
            <p><strong>CNIC Back:</strong></p>
            <a href={data.cnicBackUrl} target="_blank" rel="noopener noreferrer">
              <img src={data.cnicBackUrl} alt="CNIC Back" className={styles.image} />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.infosection}>
        <h2>Professional Information</h2>
        <p><strong>Specialization:</strong> {data.specialization}</p>
        <p><strong>Experience:</strong> {data.experience} years</p>
        <p><strong>Clinic Location:</strong> {data.location}</p>

        <div className={styles.imagegroup}>
          <div>
            <p><strong>PMC Registration Certificate:</strong></p>
            <a href={data.pmcCertificateUrl} target="_blank" rel="noopener noreferrer">
              <img src={data.pmcCertificateUrl} alt="PMC Certificate" className={styles.image} />
            </a>
          </div>
          <div>
            <p><strong>House Job Certificate:</strong></p>
            <a href={data.housejobCertUrl} target="_blank" rel="noopener noreferrer">
              <img src={data.housejobCertUrl} alt="House Job Certificate" className={styles.image} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
