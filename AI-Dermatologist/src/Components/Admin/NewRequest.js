import React, { useEffect, useState } from 'react';
import styles from './Admin.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';


function NewRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password } = location.state || {};
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);

 //call api

 useEffect(() => {
  setIsLoading(true);
  fetch(`${import.meta.env.VITE_API_URL}/api/profile-for-approval`)
    .then(res => res.json())
    .then(data => {
      const pendingOnly = data.filter(req => req.approvalStatus && req.approvalStatus.toLowerCase() === 'pending');
      setRequests(pendingOnly);
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
    });
}, []);


//approve or reject status update 

const handleApproveClick = (req) => {
  setRequestToApprove(req);
  setShowApproveModal(true);
};

const handleApproveConfirm = async () => {
  if (!requestToApprove) return;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/update-approval-status/${requestToApprove.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        approvalStatus: 'Approved'
      })
    });

    if (res.ok) {
      // Remove this request from the list (filter it out)
      setRequests(prev => prev.filter(req => req.id !== requestToApprove.id));
      setShowApproveModal(false);
      setRequestToApprove(null);
    } else {
      console.error('Failed to update status');
    }
  } catch (err) {
    console.error(err);
  }
};

const handleApproveCancel = () => {
  setShowApproveModal(false);
  setRequestToApprove(null);
};

const updateStatus = async (id, status) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/update-approval-status/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        approvalStatus: status
      })
    });

    if (res.ok) {
      // Remove this request from the list (filter it out)
      setRequests(prev => prev.filter(req => req.id !== id));
    } else {
      console.error('Failed to update status');
    }
  } catch (err) {
    console.error(err);
  }
};




//logout 

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/Login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.navButtons}>
          <button className={styles.navButton} onClick={() => navigate('/ApprovedRequest')}>Approved Requests</button>
          <button className={styles.AnavButton}>New Requests</button>
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
        <h1>New Requests</h1>
        {isLoading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
            <p>Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#667eea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 10h.01M12 10h.01M16 10h.01" stroke="#667eea" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>No new requests</h3>
            <p className={styles.emptyMessage}>There are no pending profile requests at the moment. New requests will appear here when doctors submit their profiles.</p>
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
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/Details', { state: req });
                        }}
                      >
                        view
                      </a>
                    </td>
                    <td>
                      <button
                        className={styles.approveButton}
                        onClick={() => handleApproveClick(req)}
                      >
                        Approve
                      </button>
      <button
        className={styles.rejectButton}
        onClick={() => updateStatus(req.id, 'Rejected')}
      >
        Reject
      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Confirm Approval</h3>
            <p className={styles.modalMessage}>
              Are you sure you want to approve {requestToApprove?.name}'s profile?
            </p>
            <div className={styles.modalButtons}>
              <button 
                className={styles.cancelModalBtn}
                onClick={handleApproveCancel}
              >
                NO
              </button>
              <button 
                className={styles.confirmModalBtn}
                onClick={handleApproveConfirm}
              >
                YES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewRequest;
