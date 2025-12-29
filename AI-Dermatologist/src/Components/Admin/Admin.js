// import React from 'react';
// import './Admin.module.css';
// import adminpng from '../../assets/user.png'
// import { useLocation } from 'react-router-dom';

// function Admin() {


// const location = useLocation();
// const { email, password } = location.state || {};


//   return (
//     <div className="container">
//       <div className="sidebar">
//         <div className="nav-buttons">
//           <button className="nav-button">New Requests</button>
//           <button className="nav-button">Approved Requests</button>
//         </div>
//         <div className="admin-footer">
//           <span className="admin-icon"><img></img></span>
//           <span className="admin-text">Admin</span>
//         </div>
//       </div>

//       <div className="main-content">
//         <h1>Hello Admin</h1>
//         <div className="form-card">
//           <div className="form-group">
//             <label>Email</label>
//             <input type="text" value={email || ''} disabled />
//           </div>
//           <div className="form-group">
//             <label>Password</label>
//             <input type="password" value={password || ''} disabled />
//           </div>
//           <button className="change-button">Change</button>
//           <p className="logout-text">
//             Do you want to log out? <a href="#">LOGOUT</a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Admin;

import React from 'react';
import styles from './Admin.module.css';
import {useState} from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { supabase } from '../../supabase';

function Admin() {

  const navigate = useNavigate();

  const handlelogout = async () => {
    await supabase.auth.signOut();
    navigate('/Login');
  }

//  password and email from login

const location = useLocation();
  const { email, password } = location.state || {};



  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.navButtons}>
          <button className={styles.navButton} onClick={() => navigate('/ApprovedRequest')}>Approved Requests</button>
          <button className={styles.navButton} onClick={() => navigate('/NewRequest')}>New Requests</button>
        </div>
        <div className={styles.adminFooter}>
          <p className={styles.homeText}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>GO to Home Page</a>
          </p>
          <p className={styles.logoutText}>
            <a href="#" onClick={handlelogout}>SIGNOUT</a>
          </p>
        </div>
      </div>

      <div className={styles.mainContent}>
        <h1>Hello Admin</h1>

        <h3>Welcome to the Admin Dashboard</h3>


 
      </div>
    </div>
  );
}

export default Admin;