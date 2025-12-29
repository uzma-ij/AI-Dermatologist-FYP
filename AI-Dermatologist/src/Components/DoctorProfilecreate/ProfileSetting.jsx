import React, { useState, useEffect } from 'react';
import styles from './Profilesetting.module.css';
import Navbar from '../Homepage/Navbar';
import { useNavigate } from 'react-router-dom';

const ProfileSetting = ({ user }) => {
    const navigate = useNavigate();
    const [formdata, setformdata] = useState({
        fees: '',
        about: '',
    });

    const [experience, setExperience] = useState([
        { hospital: '', role: '', start: '', end: '' },
    ]);

    const [faqs, setFaqs] = useState([
        { question: '', answer: '' },
    ]);

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [experienceErrors, setExperienceErrors] = useState([{}]);
    const [faqErrors, setFaqErrors] = useState([{}]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasExistingSettings, setHasExistingSettings] = useState(false);

    // Sync error arrays when experience/faqs arrays change
    useEffect(() => {
        if (experienceErrors.length !== experience.length) {
            const newErrors = experience.map(() => ({}));
            setExperienceErrors(newErrors);
        }
    }, [experience.length]);

    useEffect(() => {
        if (faqErrors.length !== faqs.length) {
            const newErrors = faqs.map(() => ({}));
            setFaqErrors(newErrors);
        }
    }, [faqs.length]);

    // Fetch existing profile settings on component mount
    useEffect(() => {
        const fetchProfileSettings = async () => {
            if (!user?.id) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Profile/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.setting) {
                        // Populate form with existing data
                        setformdata({
                            fees: data.setting.fees || '',
                            about: data.setting.about || '',
                        });

                        // Parse and set experience (stored as JSON in database)
                        if (data.setting.experience) {
                            const parsedExperience = typeof data.setting.experience === 'string' 
                                ? JSON.parse(data.setting.experience) 
                                : data.setting.experience;
                            if (Array.isArray(parsedExperience) && parsedExperience.length > 0) {
                                setExperience(parsedExperience);
                                setExperienceErrors(parsedExperience.map(() => ({})));
                            }
                        }

                        // Parse and set FAQs (stored as JSON in database)
                        if (data.setting.faqs) {
                            const parsedFaqs = typeof data.setting.faqs === 'string' 
                                ? JSON.parse(data.setting.faqs) 
                                : data.setting.faqs;
                            if (Array.isArray(parsedFaqs) && parsedFaqs.length > 0) {
                                setFaqs(parsedFaqs);
                                setFaqErrors(parsedFaqs.map(() => ({})));
                            }
                        }

                        setHasExistingSettings(true);
                    }
                }
            } catch (err) {
                console.error('Error fetching profile settings:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileSettings();
    }, [user?.id]);

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'fees':
                if (!value) {
                    error = 'Consultation fee is required';
                } else if (isNaN(value) || parseFloat(value) <= 0) {
                    error = 'Fee must be a valid positive number';
                }
                break;
            case 'about':
                if (!value.trim()) {
                    error = 'About section is required';
                } else if (value.trim().length < 20) {
                    error = 'About section must be at least 20 characters';
                }
                break;
            default:
                break;
        }
        return error;
    };

    const validateExperience = (exp, index) => {
        const expErrors = {};
        if (!exp.hospital.trim()) {
            expErrors.hospital = 'Hospital name is required';
        }
        if (!exp.role.trim()) {
            expErrors.role = 'Role is required';
        }
        if (!exp.start) {
            expErrors.start = 'Start date is required';
        }
        if (!exp.end.trim()) {
            expErrors.end = 'End date is required';
        }
        return expErrors;
    };

    const validateFaq = (faq, index) => {
        const faqErrors = {};
        if (!faq.question.trim()) {
            faqErrors.question = 'Question is required';
        }
        if (!faq.answer.trim()) {
            faqErrors.answer = 'Answer is required';
        }
        return faqErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setformdata({ ...formdata, [name]: value });
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

    const addExperience = (e) => {
        setExperience([...experience, { hospital: '', role: '', start: '', end: '' }]);
        setExperienceErrors([...experienceErrors, {}]);
    };

    const removeExperience = (index) => {
        if (experience.length > 1) {
            const updated = experience.filter((_, i) => i !== index);
            const updatedErrors = experienceErrors.filter((_, i) => i !== index);
            setExperience(updated);
            setExperienceErrors(updatedErrors);
        }
    };

    const handleExperienceChange = (index, e) => {
        const updated = [...experience];
        updated[index][e.target.name] = e.target.value;
        setExperience(updated);
        
        if (experienceErrors[index] && experienceErrors[index][e.target.name]) {
            const updatedErrors = [...experienceErrors];
            const expErrors = validateExperience(updated[index], index);
            updatedErrors[index] = { ...updatedErrors[index], [e.target.name]: expErrors[e.target.name] || '' };
            setExperienceErrors(updatedErrors);
        }
    };

    const handleExperienceBlur = (index, field) => {
        const updatedErrors = [...experienceErrors];
        const expErrors = validateExperience(experience[index], index);
        updatedErrors[index] = { ...updatedErrors[index], ...expErrors };
        setExperienceErrors(updatedErrors);
    };

    const handleFaqChange = (index, e) => {
        const updated = [...faqs];
        updated[index][e.target.name] = e.target.value;
        setFaqs(updated);
        
        if (faqErrors[index] && faqErrors[index][e.target.name]) {
            const updatedErrors = [...faqErrors];
            const faqErrs = validateFaq(updated[index], index);
            updatedErrors[index] = { ...updatedErrors[index], [e.target.name]: faqErrs[e.target.name] || '' };
            setFaqErrors(updatedErrors);
        }
    };

    const handleFaqBlur = (index, field) => {
        const updatedErrors = [...faqErrors];
        const faqErrs = validateFaq(faqs[index], index);
        updatedErrors[index] = { ...updatedErrors[index], ...faqErrs };
        setFaqErrors(updatedErrors);
    };

    const addFaq = (e) => {
        setFaqs([...faqs, { question: '', answer: '' }]);
        setFaqErrors([...faqErrors, {}]);
    };

    const removeFaq = (index) => {
        if (faqs.length > 1) {
            const updated = faqs.filter((_, i) => i !== index);
            const updatedErrors = faqErrors.filter((_, i) => i !== index);
            setFaqs(updated);
            setFaqErrors(updatedErrors);
        }
    };

    const validateAllFields = () => {
        const newErrors = {};
        const newTouched = {};
        
        // Validate main form fields
        Object.keys(formdata).forEach((name) => {
            newTouched[name] = true;
            const error = validateField(name, formdata[name]);
            if (error) {
                newErrors[name] = error;
            }
        });

        // Validate experience
        const newExpErrors = experience.map((exp, index) => validateExperience(exp, index));
        
        // Validate FAQs
        const newFaqErrs = faqs.map((faq, index) => validateFaq(faq, index));

        setErrors(newErrors);
        setTouched(newTouched);
        setExperienceErrors(newExpErrors);
        setFaqErrors(newFaqErrs);

        const hasErrors = Object.keys(newErrors).length > 0 ||
            newExpErrors.some(err => Object.keys(err).length > 0) ||
            newFaqErrs.some(err => Object.keys(err).length > 0);

        return !hasErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateAllFields()) {
            return;
        }

        // Filter out empty experience entries before sending
        const filteredExperience = experience.filter(exp => 
            exp.hospital && exp.role && exp.start && exp.end
        );

        // Filter out empty FAQ entries before sending
        const filteredFaqs = faqs.filter(faq => 
            faq.question && faq.answer
        );

        const payload = {
            user_id: user.id,
            fees: formdata.fees,
            about: formdata.about,
            experience: filteredExperience.length > 0 ? filteredExperience : [],
            faqs: filteredFaqs.length > 0 ? filteredFaqs : []
        };

        console.log("Submitting profile settings:", payload);

        try {
            // Use PUT if updating existing settings, POST if creating new
            const method = hasExistingSettings ? 'PUT' : 'POST';
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profilesettings`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json().catch(() => ({}));

            if (response.ok) {
                console.log("Profile saved successfully:", responseData);
                setShowSuccessPopup(true);
                setHasExistingSettings(true); // Mark as existing for future updates
                setTimeout(() => {
                    setShowSuccessPopup(false);
                    navigate('/');
                }, 2000);
            } else {
                console.error("Error response:", responseData);
                const errorMessage = responseData.message || responseData.error || "Failed to save profile.";
                alert(errorMessage);
            }
        } catch (err) {
            console.error("Network or parsing error:", err);
            alert("An error occurred. Please check the console for details and try again.");
        }
    };


    if (isLoading) {
        return (
            <div className={styles.pageContainer}>
                <Navbar user={user} />
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Loading profile settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <Navbar user={user} />

            <form className={styles.form} onSubmit={handleSubmit}>
                <h2>Profile Settings</h2>

                <div className={styles.fieldContainer}>
                    <input
                        type="number"
                        name="fees"
                        placeholder="Enter consultation fee"
                        value={formdata.fees}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`${styles.input} ${errors.fees && touched.fees ? styles.inputError : ''}`}
                        min="0"
                    />
                    {errors.fees && touched.fees && <span className={styles.errorMessage}>{errors.fees}</span>}
                </div>

                <div className={styles.fieldContainer}>
                    <textarea
                        name="about"
                        rows="4"
                        placeholder="Write about yourself (minimum 20 characters)"
                        value={formdata.about}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`${styles.textarea} ${errors.about && touched.about ? styles.inputError : ''}`}
                    />
                    {errors.about && touched.about && <span className={styles.errorMessage}>{errors.about}</span>}
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Experience</h3>
                    {experience.map((exp, index) => (
                        <div key={index} className={styles.experienceCard}>
                            {experience.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeExperience(index)}
                                    className={styles.removeButton}
                                    title="Remove this experience"
                                >
                                    ×
                                </button>
                            )}
                            <div className={styles.fieldContainer}>
                                <input
                                    type="text"
                                    name="hospital"
                                    placeholder="Hospital/Institute Name"
                                    value={exp.hospital}
                                    onChange={(e) => handleExperienceChange(index, e)}
                                    onBlur={() => handleExperienceBlur(index, 'hospital')}
                                    className={`${styles.input} ${experienceErrors[index]?.hospital ? styles.inputError : ''}`}
                                />
                                {experienceErrors[index]?.hospital && <span className={styles.errorMessage}>{experienceErrors[index].hospital}</span>}
                            </div>
                            <div className={styles.fieldContainer}>
                                <input
                                    type="text"
                                    name="role"
                                    placeholder="Position/Role"
                                    value={exp.role}
                                    onChange={(e) => handleExperienceChange(index, e)}
                                    onBlur={() => handleExperienceBlur(index, 'role')}
                                    className={`${styles.input} ${experienceErrors[index]?.role ? styles.inputError : ''}`}
                                />
                                {experienceErrors[index]?.role && <span className={styles.errorMessage}>{experienceErrors[index].role}</span>}
                            </div>
                            <div className={styles.dateRow}>
                                <div className={styles.fieldContainer}>
                                    <input
                                        type="date"
                                        name="start"
                                        placeholder="Start date"
                                        value={exp.start}
                                        onChange={(e) => handleExperienceChange(index, e)}
                                        onBlur={() => handleExperienceBlur(index, 'start')}
                                        className={`${styles.input} ${experienceErrors[index]?.start ? styles.inputError : ''}`}
                                    />
                                    {experienceErrors[index]?.start && <span className={styles.errorMessage}>{experienceErrors[index].start}</span>}
                                </div>
                                <div className={styles.fieldContainer}>
                                    <input
                                        type="text"
                                        name="end"
                                        placeholder="End Date or 'Present'"
                                        value={exp.end}
                                        onChange={(e) => handleExperienceChange(index, e)}
                                        onBlur={() => handleExperienceBlur(index, 'end')}
                                        className={`${styles.input} ${experienceErrors[index]?.end ? styles.inputError : ''}`}
                                    />
                                    {experienceErrors[index]?.end && <span className={styles.errorMessage}>{experienceErrors[index].end}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addExperience} className={styles.addButton}>+ Add Experience</button>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Frequently Asked Questions</h3>
                    {faqs.map((faq, index) => (
                        <div key={index} className={styles.faqCard}>
                            {faqs.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeFaq(index)}
                                    className={styles.removeButton}
                                    title="Remove this FAQ"
                                >
                                    ×
                                </button>
                            )}
                            <div className={styles.fieldContainer}>
                                <input
                                    type="text"
                                    name="question"
                                    placeholder="Enter question"
                                    value={faq.question}
                                    onChange={(e) => handleFaqChange(index, e)}
                                    onBlur={() => handleFaqBlur(index, 'question')}
                                    className={`${styles.input} ${faqErrors[index]?.question ? styles.inputError : ''}`}
                                />
                                {faqErrors[index]?.question && <span className={styles.errorMessage}>{faqErrors[index].question}</span>}
                            </div>
                            <div className={styles.fieldContainer}>
                                <textarea
                                    name="answer"
                                    rows="3"
                                    placeholder="Enter answer"
                                    value={faq.answer}
                                    onChange={(e) => handleFaqChange(index, e)}
                                    onBlur={() => handleFaqBlur(index, 'answer')}
                                    className={`${styles.textarea} ${faqErrors[index]?.answer ? styles.inputError : ''}`}
                                />
                                {faqErrors[index]?.answer && <span className={styles.errorMessage}>{faqErrors[index].answer}</span>}
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addFaq} className={styles.addButton}>+ Add FAQ</button>
                    <button type="button" onClick={() => navigate('/Doctoravailability')} className={styles.availabilityButton}>+ Add Availability Slots</button>
                </div>
                
                <div className={styles.submitButtonContainer}>
                    <button type="submit" className={styles.submitButton}>Save Profile</button>
                </div>
            </form>

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className={styles.alertOverlay}>
                    <div className={styles.successPopup}>
                        <div className={styles.successIcon}>✓</div>
                        <h3 className={styles.alertTitle}>Profile Saved Successfully!</h3>
                        <p className={styles.alertMessage}>Your profile has been saved. Redirecting to home page...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileSetting;
