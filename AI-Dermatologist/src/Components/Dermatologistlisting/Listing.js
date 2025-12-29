import styles from './Listing.module.css';
import Navbar from '../Homepage/Navbar';
import Footer from '../Homepage/Footer';
import doctor from '../../assets/doctorlist.png';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useCallback } from 'react';
import Pagination from './Pagination';
import Filters from "./Filters";
import { useData } from '../../contexts/DataContext';



function Listing({ user }) {

    const navigate = useNavigate();
    const { doctors, doctorsLoading } = useData();
    const [filter, setFilter] = useState("all");

    // Memoize filtered and sorted doctors to prevent recalculation on every render
    const filteredDoctors = useMemo(() => {
        let result = [...doctors];

    if (filter === "female") {
            result = doctors.filter((doc) => doc.approval.gender === "female");
    } else if (filter === "male") {
            result = doctors.filter((doc) => doc.approval.gender === "male");
    } else if (filter === "lowestFees") {
            result = [...doctors].sort((a, b) => (a.setting?.fees || 0) - (b.setting?.fees || 0));
    }

        return result;
    }, [doctors, filter]);




    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(4);
    
    // Memoize paginated doctors
    const currentDoctor = useMemo(() => {
    const lastdoctorindex = currentPage * itemsPerPage;
    const firstdoctorindx = lastdoctorindex - itemsPerPage;
        return filteredDoctors.slice(firstdoctorindx, lastdoctorindex);
    }, [filteredDoctors, currentPage, itemsPerPage]);

    // Memoize navigation handlers
    const handleViewProfile = useCallback((doctorId) => {
        navigate(`/profile/${doctorId}`);
    }, [navigate]);

    const handleBookAppointment = useCallback((doctorId) => {
        if (user && String(user.id) === String(doctorId)) {
            return;
        }
        if (user?.role === 'doctor') {
            return;
        }
        navigate(`/BookAppointment/${doctorId}`);
    }, [navigate, user]);
 
    return (
        <div>
            <Navbar user={user} />
            <div className={styles.container}>
                <h1>Best Dermatologists in Pakistan</h1>
                <Filters filter={filter} setFilter={setFilter} />

                {doctorsLoading && doctors.length === 0 ? (
                    <div className={styles.loaderBox}>
                        <div className={styles.loader}></div>
                        <p>Loading doctors...</p>
                    </div>
                ) : (
                    <>
                        {currentDoctor.map((doc, index) => (
                            <div key={index} className={styles.card}>
                                <div className={styles.info}>
                                    <div className={styles.info}>
                                        <img src={doc.approval.photoUrl} alt={doc.approval.name} className={styles.avatar} />
                                        <div>
                                            {/* name, title, etc. */}
                                        </div>
                                    </div>

                                    {/* <div className={styles.avatar}></div> */}
                                    <div>
                                        <h3><strong>{doc.approval.name} </strong><span className={styles.verified}> (PMDC Verified)</span></h3>
                                        <p>{doc.approval.specialization}</p>
                                        <div className={styles.meta}>
                                            <div className={styles.metaBlock}>
                                                <p>Reviews</p>
                                                <strong>{doc.reviewCount || 0}</strong>
                                            </div>
                                            <div className={styles.metaBlock}>
                                                <p>Experience</p>
                                                <strong>{doc.approval.experience} year(s)</strong>
                                            </div>
                                            <div className={styles.metaBlock}>
                                                <p>Consultation Fee</p>
                                                <strong className={styles.feesAmount}>Rs. {doc.setting.fees}</strong>
                                            </div>
                                        </div>


                                    </div>
                                </div>
                                <div className={styles.actions}>
                                    {/* <button className={styles.book} onClick={() => navigate('/Doctoravailability')}>Book Appointment</button> */}

                                    <button className={styles.view} onClick={() => handleViewProfile(doc.setting.doctor_id)}>View Profile</button>
                                    <button 
                                        className={styles.book} 
                                        onClick={() => handleBookAppointment(doc.setting.doctor_id)}
                                        disabled={user && (String(user.id) === String(doc.setting.doctor_id) || user?.role === 'doctor')}
                                        title={user?.role === 'doctor' ? "Doctors cannot book appointments for themselves. Please log in as a patient to book an appointment." : (user && String(user.id) === String(doc.setting.doctor_id) ? "You cannot book an appointment with yourself." : "")}
                                    >
                                        Book Appointment
                                    </button>

                                </div>
                            </div>
                        ))}
                        {/* <button className={styles.loadMore}>Load More</button> */}
                        <Pagination
                            totalPosts={filteredDoctors.length}
                            postPerPage={itemsPerPage}
                            setCurrentPage={setCurrentPage}
                            currentPage={currentPage}

                        />
                    </>
                )}
            </div>
            <Footer />
        </div>
    )
}

export default Listing;