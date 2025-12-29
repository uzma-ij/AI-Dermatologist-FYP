import React, { useEffect, useState } from 'react';
import styles from './Admin.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';


function ApprovedRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password } = location.state || {};

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

 //call api

 const fetchRequests = () => {
  setIsLoading(true);
  fetch(`${import.meta.env.VITE_API_URL}/api/profile-for-approval`)
    .then(res => res.json())
    .then(data => {
      const approvedOnly = data.filter(req => req.approvalStatus === 'Approved' || req.approvalStatus === 'De-activated');
      setRequests(approvedOnly);
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
    });
 };

 useEffect(() => {
  fetchRequests();
}, []);



//logout 

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/Login');
  };

  // Handle Activate button click
  const handleActivate = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/update-approval-status/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approvalStatus: 'Approved' }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Status updated to Approved:', result);
        // Refresh the requests list
        fetchRequests();
      } else {
        const error = await response.json();
        console.error('Failed to activate:', error);
        alert('Failed to activate doctor profile. Please try again.');
      }
    } catch (error) {
      console.error('Error activating doctor:', error);
      alert('An error occurred while activating the doctor profile.');
    }
  };

  // Handle Deactivate button click
  const handleDeactivate = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/update-approval-status/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approvalStatus: 'De-activated' }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Status updated to De-activated:', result);
        // Refresh the requests list
        fetchRequests();
      } else {
        const error = await response.json();
        console.error('Failed to deactivate:', error);
        alert('Failed to deactivate doctor profile. Please try again.');
      }
    } catch (error) {
      console.error('Error deactivating doctor:', error);
      alert('An error occurred while deactivating the doctor profile.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.navButtons}>
          <button className={styles.AnavButton}>Approved Requests</button>
          <button className={styles.navButton} onClick={() => navigate('/NewRequest')}>New Requests</button>
        </div>
        <div className={styles.adminFooter}>
          <p className={styles.homeText}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>GO to Home Page</a>
          </p>
          <p className={styles.logoutText}>
            <a href="#" onClick={handleLogout}>SIGNOUT</a>
          </p>
        </div>
      </div>

      <div className={styles.mainContent}>
        <h1>Approved Requests</h1>
        {isLoading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
            <p>Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="#667eea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>No approved requests</h3>
            <p className={styles.emptyMessage}>There are no approved profile requests at the moment. Approved requests will appear here once profiles are approved.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.requestTable}>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Name</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, index) => (
                  <tr key={index}>
                    <td>{req.approvalStatus}</td>
                    <td>{req.name}</td>
                    <td>
                      <a
                        href=""
                        className={styles.viewLink}
                        onClick={() => navigate('/Details', { state: req })}
                      >
                        view
                      </a>
                    </td>
                    <td>
                      <button 
                        className={styles.ActivateButton}
                        onClick={() => handleActivate(req.id)}
                        disabled={req.approvalStatus === 'Approved'}
                      >
                        Activate
                      </button>
                      <button 
                        className={styles.DeactivateButton}
                        onClick={() => handleDeactivate(req.id)}
                        disabled={req.approvalStatus === 'De-activated'}
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApprovedRequest;
