import React, { useState, useRef, useEffect } from 'react';
import styles from './ProfileDraft.module.css';
import Navbar from '../Homepage/Navbar';
import upload from '../../assets/upload.png';
import { submitProfileToSupabase } from './SubmitProfile';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';


const ProfileDraft = ({ user }) => {
  const navigate = useNavigate();
  const [profileStatus, setProfileStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    experience: '',
    email: '',
    phone: '',
    cnic: '',
    specialization: '',
    location: ''
  });
 

  const [uploadFiles, setUploadFiles] = useState({
    pmcCertificate: null,
    houseJobCertificate: null,
    cnicFront: null,
    cnicBack: null,
    profilePhoto: null
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const fileInputRef = useRef(null);

  // Check profile status on mount
  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('ProfileforApproval')
          .select('approvalStatus')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          setProfileStatus(data.approvalStatus);
          setProfileExists(true);
        } else {
          setProfileExists(false);
        }
      } catch (err) {
        console.error('Error checking profile status:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileStatus();
  }, [user?.id]);

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Name is required';
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters';
        }
        break;
      case 'gender':
        if (!value) {
          error = 'Please select your gender';
        }
        break;
      case 'experience':
        if (!value) {
          error = 'Experience is required';
        } else if (isNaN(value) || parseFloat(value) < 0) {
          error = 'Experience must be a valid number';
        } else if (parseFloat(value) > 50) {
          error = 'Experience cannot exceed 50 years';
        }
        break;
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (!value) {
          error = 'Phone number is required';
        } else if (!/^[0-9]{10,15}$/.test(value.replace(/[\s-]/g, ''))) {
          error = 'Phone number must be 10-15 digits';
        }
        break;
      case 'cnic':
        if (!value.trim()) {
          error = 'CNIC is required';
        }
        break;
      case 'specialization':
        if (!value.trim()) {
          error = 'Specialization is required';
        }
        break;
      case 'location':
        if (!value.trim()) {
          error = 'Location is required';
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name] && touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleFileChange = (e, label) => {
    setUploadFiles({ ...uploadFiles, [label]: e.target.files[0] });
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const validateAllFields = () => {
    const newErrors = {};
    const newTouched = {};
    
    Object.keys(formData).forEach((name) => {
      newTouched[name] = true;
      const error = validateField(name, formData[name]);
      if (error) {
        newErrors[name] = error;
      }
    });

    // Validate file uploads
    const requiredFiles = ['pmcCertificate', 'houseJobCertificate', 'cnicFront', 'cnicBack'];
    requiredFiles.forEach((fileKey) => {
      if (!uploadFiles[fileKey]) {
        newErrors[fileKey] = 'This document is required';
      }
    });

    setErrors(newErrors);
    setTouched(newTouched);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAllFields()) {
      return;
    }

    // If resubmitting after rejection, update existing record
    if (profileStatus === 'Rejected') {
      const error = await submitProfileToSupabase(formData, uploadFiles, user?.id, true);
      if (error) {
        alert('Error resubmitting profile: ' + error.message);
      } else {
        alert('Profile resubmitted successfully! Status changed to Pending.');
        navigate('/');
      }
    } else {
      const error = await submitProfileToSupabase(formData, uploadFiles, user?.id);
      if (error) {
        alert('Error submitting profile: ' + error.message);
      } else {
        alert('Profile submitted successfully!');
        navigate('/');
      }
    }
  };

  // If profile is pending or approved, show message instead of form
  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar user={user} />
        <div className={styles.loadingMessage}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (profileStatus === 'Pending') {
    return (
      <div className={styles.pageContainer}>
        <Navbar user={user} />
        <div className={styles.statusMessage}>
          <h2>Profile Under Review</h2>
          <p>Your profile is currently pending approval. Please wait for admin review.</p>
        </div>
      </div>
    );
  }

  if (profileStatus === 'Approved') {
    return (
      <div className={styles.pageContainer}>
        <Navbar user={user} />
        <div className={styles.statusMessage}>
          <h2>Profile Already Approved</h2>
          <p>Your profile has been approved. You can update your settings from the profile menu.</p>
        </div>
      </div>
    );
  }

  // If profile exists and is not rejected, disable form
  const isFormDisabled = profileExists && profileStatus !== 'Rejected';

  return (
    <div className={styles.pageContainer}>
      <Navbar user={user} />
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>{profileStatus === 'Rejected' ? 'Resubmit Profile Form' : 'Profile Approval Form'}</h2>

        <div className={styles.fieldContainer}>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            className={`${styles.input} ${errors.name && touched.name ? styles.inputError : ''}`}
            value={formData.name}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {errors.name && touched.name && <span className={styles.errorMessage}>{errors.name}</span>}
        </div>

        <div className={styles.fieldContainer}>
          <select
            name="gender"
            className={`${styles.input} ${errors.gender && touched.gender ? styles.inputError : ''}`}
            value={formData.gender}
            onChange={handleInputChange}
            onBlur={handleBlur}
          >
            <option value="">Select your gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && touched.gender && <span className={styles.errorMessage}>{errors.gender}</span>}
        </div>

        <div className={styles.fieldContainer}>
          <input
            type="number"
            name="experience"
            placeholder="Enter your experience (years)"
            className={`${styles.input} ${errors.experience && touched.experience ? styles.inputError : ''}`}
            value={formData.experience}
            onChange={handleInputChange}
            onBlur={handleBlur}
            min="0"
            max="50"
          />
          {errors.experience && touched.experience && <span className={styles.errorMessage}>{errors.experience}</span>}
        </div>

        <div className={styles.fieldContainer}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className={`${styles.input} ${errors.email && touched.email ? styles.inputError : ''}`}
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {errors.email && touched.email && <span className={styles.errorMessage}>{errors.email}</span>}
        </div>

        <div className={styles.fieldContainer}>
          <input
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            className={`${styles.input} ${errors.phone && touched.phone ? styles.inputError : ''}`}
            value={formData.phone}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {errors.phone && touched.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
        </div>

        <div className={styles.fieldContainer}>
          <input
            type="text"
            name="cnic"
            placeholder="Enter your CNIC"
            className={`${styles.input} ${errors.cnic && touched.cnic ? styles.inputError : ''}`}
            value={formData.cnic}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {errors.cnic && touched.cnic && <span className={styles.errorMessage}>{errors.cnic}</span>}
        </div>

        <div className={styles.fieldContainer}>
          <input
            type="text"
            name="specialization"
            placeholder="Enter your specialization"
            className={`${styles.input} ${errors.specialization && touched.specialization ? styles.inputError : ''}`}
            value={formData.specialization}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {errors.specialization && touched.specialization && <span className={styles.errorMessage}>{errors.specialization}</span>}
        </div>

        <div className={styles.fieldContainer}>
          <input
            type="text"
            name="location"
            placeholder="Enter your location"
            className={`${styles.input} ${errors.location && touched.location ? styles.inputError : ''}`}
            value={formData.location}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {errors.location && touched.location && <span className={styles.errorMessage}>{errors.location}</span>}
        </div>

        {[
          ['pmcCertificate', 'PMC Registration Certificate'],
          ['houseJobCertificate', 'House Job Certificate'],
          ['cnicFront', 'CNIC front side'],
          ['cnicBack', 'CNIC back side']
        ].map(([label, display]) => (
          <div className={styles.uploadContainer} key={label}>
            <label className={styles.uploadLabel}>Upload {display}</label>
            <label className={`${styles.fileLabel} ${errors[label] && touched[label] ? styles.fileLabelError : ''}`}>
              {uploadFiles[label] ? (
                <span>{uploadFiles[label].name}</span>
              ) : (
                <>
                  <img src={upload} alt="upload" className={styles.uploadIcon} />
                  <span>Upload image</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => {
                  handleFileChange(e, label);
                  setTouched({ ...touched, [label]: true });
                  if (e.target.files[0]) {
                    setErrors({ ...errors, [label]: '' });
                  }
                }}
                onBlur={() => {
                  setTouched({ ...touched, [label]: true });
                  if (!uploadFiles[label]) {
                    setErrors({ ...errors, [label]: 'This document is required' });
                  }
                }}
              />
            </label>
            {errors[label] && touched[label] && <span className={styles.errorMessage}>{errors[label]}</span>}
          </div>
        ))}

        <div className={styles.photoUploadSection}>
          <div className={styles.avatar}>
            {uploadFiles.profilePhoto && (
              <img
                src={URL.createObjectURL(uploadFiles.profilePhoto)}
                alt="Uploaded Avatar"
                className={styles.avatar}
              />
            )}
          </div>
          <button type="button" className={styles.uploadButton} onClick={handleButtonClick}>
            + Upload photo
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => handleFileChange(e, 'profilePhoto')}
          />
        </div>

        <div className={styles.submitButtonContainer}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isFormDisabled}
            title={isFormDisabled ? "Can't submit another profile" : ""}
          >
            Submit your profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileDraft;
