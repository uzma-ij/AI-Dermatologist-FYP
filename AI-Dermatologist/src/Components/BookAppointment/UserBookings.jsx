import React, { useEffect, useState } from "react";
import styles from "./Userbookings.module.css";
import Navbar from "../Homepage/Navbar";
import Footer from "../Homepage/Footer";
import { Link } from "react-router-dom";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useData } from '../../contexts/DataContext';


function UserBooking({ user }) {
    const { appointments, appointmentsLoading, removeAppointment, updateAppointment, refreshAppointments } = useData();
    const [Appointments, setAppointments] = useState([]);
    const { userId } = useParams();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [appointmentToComplete, setAppointmentToComplete] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Sync local state with context data
    useEffect(() => {
        setAppointments(appointments);
    }, [appointments]);

    // Refresh appointments when component mounts (in case cache is stale)
    useEffect(() => {
        if (user?.id) {
            refreshAppointments();
        }
    }, [user?.id, refreshAppointments]);

    const handleCompleteClick = (appointmentId) => {
        setAppointmentToComplete(appointmentId);
        setShowCompleteModal(true);
    };

    const handleCompleteConfirm = async () => {
        if (!appointmentToComplete) return;

        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/completeappointment/${appointmentToComplete}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          });
      
          if (!res.ok) {
            throw new Error('Failed to update status');
          }
      
          const data = await res.json();
          console.log('Updated:', data);
      
          // ✅ update UI state in context
          updateAppointment(appointmentToComplete, { status: "completed" });

          setShowCompleteModal(false);
          setAppointmentToComplete(null);
          
          // Show success message
          setSuccessMessage("Appointment marked as completed successfully.");
          setShowSuccessModal(true);
        } catch (err) {
          console.error(err);
          setShowCompleteModal(false);
          setAppointmentToComplete(null);
          setSuccessMessage("Failed to complete appointment.");
          setShowSuccessModal(true);
        }
    };

    const handleCompleteModalClose = () => {
        setShowCompleteModal(false);
        setAppointmentToComplete(null);
    };
      

    const handleCancelClick = (appointmentId) => {
        setAppointmentToCancel(appointmentId);
        setShowCancelModal(true);
    };

    const handleCancelConfirm = async () => {
        if (!appointmentToCancel) return;

        try {
            // Send who is cancelling (patient or doctor) in the request body
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/deleteappointment/${appointmentToCancel}`, {
                data: {
                    cancelledBy: user?.role || 'patient' // 'patient' or 'doctor'
                }
            });
            // Remove from context cache
            removeAppointment(appointmentToCancel);
            setShowCancelModal(false);
            setAppointmentToCancel(null);
            
            // Show custom success modal
            setSuccessMessage("Appointment canceled successfully.");
            setShowSuccessModal(true);

        } catch (err) {
            console.error("Error canceling appointment:", err);
            setShowCancelModal(false);
            setAppointmentToCancel(null);
            setSuccessMessage("Failed to cancel appointment.");
            setShowSuccessModal(true);
        }
    };

    const handleCancelModalClose = () => {
        setShowCancelModal(false);
        setAppointmentToCancel(null);
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        setSuccessMessage('');
    };


    return (
        <div className={styles.pageContainer}>
          <Navbar user={user} />
          <div className={styles.bookingspage}>
            {/* Hero Section */}
            <div className={styles.heroSection}>
              <h1 className={styles.mainTitle}>
                Your <span className={styles.gradientText}>Bookings</span>
              </h1>
              <p className={styles.description}>
                Manage your appointments, view upcoming consultations, and track your appointment history all in one place.
              </p>
            </div>

            {/* Appointments Section */}
            <div className={styles.appointmentsSection}>
              {appointmentsLoading && Appointments.length === 0 ? (
                <div className={styles.loaderBox}>
                  <div className={styles.loader}></div>
                  <p>Loading Appointments...</p>
                </div>
              ) : (
                <>
                  {Appointments.length > 0 ? (
                    <>
                      {/* New Appointments Section (Status: booked) */}
                      {Appointments.filter(appoint => appoint.appointments.status === "booked").length > 0 && (
                        <div className={styles.appointmentSectionGroup}>
                          <h2 className={styles.sectionTitle}>New Appointments</h2>
                          <div className={styles.appointmentsGrid}>
                            {Appointments.filter(appoint => appoint.appointments.status === "booked").map((appoint, index) => (
                              <div key={index} className={styles.appointmentCard}>
                                <div className={styles.cardHeader}>
                                  <div className={styles.profileSection}>
                                    {user.role === "doctor" ? (
                                      <div className={styles.avatarPlaceholder}>
                                        <span>{appoint.profile.name.charAt(0).toUpperCase()}</span>
                                      </div>
                                    ) : (
                                      <img
                                        src={appoint.profile.photoUrl}
                                        alt={appoint.profile.name}
                                        className={styles.profileImage}
                                      />
                                    )}
                                    <div className={styles.profileInfo}>
                                      <h3 className={styles.profileName}>{appoint.profile.name}</h3>
                                      <p className={styles.profileContact}>
                                        {user.role === "doctor" ? appoint.profile.email : appoint.profile.phone}
                                      </p>
                                    </div>
                                  </div>
                                  <div className={`${styles.statusBadge} ${styles.statusPending}`}>
                                    {appoint.appointments.status}
                                  </div>
                                </div>

                                <div className={styles.cardDetails}>
                                  <div className={styles.detailItem}>
                                    <span className={styles.detailIcon}>📅</span>
                                    <div className={styles.detailContent}>
                                      <span className={styles.detailLabel}>Date</span>
                                      <span className={styles.detailValue}>{appoint.appointments.appointment_date}</span>
                                    </div>
                                  </div>
                                  <div className={styles.detailItem}>
                                    <span className={styles.detailIcon}>🕐</span>
                                    <div className={styles.detailContent}>
                                      <span className={styles.detailLabel}>Time</span>
                                      <span className={styles.detailValue}>{appoint.appointments.appointment_time}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className={styles.cardActions}>
                                  <button
                                    className={styles.cancelBtn}
                                    onClick={() =>
                                      handleCancelClick(appoint.appointments.id)
                                    }
                                  >
                                    Cancel
                                  </button>

                                  {/* Complete button - doctor only */}
                                  {user.role === "doctor" && (
                                    <button
                                      className={styles.completeBtn}
                                      onClick={() =>
                                        handleCompleteClick(appoint.appointments.id)
                                      }
                                    >
                                      Complete
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Completed Appointments Section (Status: completed) */}
                      {Appointments.filter(appoint => appoint.appointments.status === "completed").length > 0 && (
                        <div className={styles.appointmentSectionGroup}>
                          <h2 className={styles.sectionTitle}>Completed Appointments</h2>
                          <div className={styles.appointmentsGrid}>
                            {Appointments.filter(appoint => appoint.appointments.status === "completed").map((appoint, index) => (
                              <div key={index} className={styles.appointmentCard}>
                                <div className={styles.cardHeader}>
                                  <div className={styles.profileSection}>
                                    {user.role === "doctor" ? (
                                      <div className={styles.avatarPlaceholder}>
                                        <span>{appoint.profile.name.charAt(0).toUpperCase()}</span>
                                      </div>
                                    ) : (
                                      <img
                                        src={appoint.profile.photoUrl}
                                        alt={appoint.profile.name}
                                        className={styles.profileImage}
                                      />
                                    )}
                                    <div className={styles.profileInfo}>
                                      <h3 className={styles.profileName}>{appoint.profile.name}</h3>
                                      <p className={styles.profileContact}>
                                        {user.role === "doctor" ? appoint.profile.email : appoint.profile.phone}
                                      </p>
                                    </div>
                                  </div>
                                  <div className={`${styles.statusBadge} ${styles.statusCompleted}`}>
                                    {appoint.appointments.status}
                                  </div>
                                </div>

                                <div className={styles.cardDetails}>
                                  <div className={styles.detailItem}>
                                    <span className={styles.detailIcon}>📅</span>
                                    <div className={styles.detailContent}>
                                      <span className={styles.detailLabel}>Date</span>
                                      <span className={styles.detailValue}>{appoint.appointments.appointment_date}</span>
                                    </div>
                                  </div>
                                  <div className={styles.detailItem}>
                                    <span className={styles.detailIcon}>🕐</span>
                                    <div className={styles.detailContent}>
                                      <span className={styles.detailLabel}>Time</span>
                                      <span className={styles.detailValue}>{appoint.appointments.appointment_time}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className={styles.cardActions}>
                                  <button
                                    className={styles.completedBtn}
                                    disabled
                                  >
                                    Completed
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Show empty state if no booked or completed appointments */}
                      {Appointments.filter(appoint => 
                        appoint.appointments.status === "booked" || 
                        appoint.appointments.status === "completed"
                      ).length === 0 && (
                        <div className={styles.emptyState}>
                          <div className={styles.emptyIcon}>📋</div>
                          <h3 className={styles.emptyTitle}>No Bookings Found</h3>
                          <p className={styles.emptyMessage}>
                            You don't have any appointments yet. Book an appointment to get started!
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>📋</div>
                      <h3 className={styles.emptyTitle}>No Bookings Found</h3>
                      <p className={styles.emptyMessage}>
                        You don't have any appointments yet. Book an appointment to get started!
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Custom Cancel Confirmation Modal */}
          {showCancelModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>Confirm Cancellation</h3>
                <p className={styles.modalMessage}>
                  Are you sure you want to cancel this appointment?
                </p>
                <div className={styles.modalButtons}>
                  <button 
                    className={styles.cancelModalBtn}
                    onClick={handleCancelModalClose}
                  >
                    NO
                  </button>
                  <button 
                    className={styles.confirmModalBtn}
                    onClick={handleCancelConfirm}
                  >
                    YES
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Complete Confirmation Modal */}
          {showCompleteModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>Confirm Completion</h3>
                <p className={styles.modalMessage}>
                  Are you sure you want to mark this appointment as completed?
                </p>
                <div className={styles.modalButtons}>
                  <button 
                    className={styles.cancelModalBtn}
                    onClick={handleCompleteModalClose}
                  >
                    NO
                  </button>
                  <button 
                    className={styles.confirmModalBtn}
                    onClick={handleCompleteConfirm}
                  >
                    YES
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Success Modal */}
          {showSuccessModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.successModalContent}>
                <h3 className={styles.successModalTitle}>
                  {successMessage.includes('successfully') ? 'Success!' : 'Error'}
                </h3>
                <p className={styles.successModalMessage}>
                  {successMessage}
                </p>
                <div className={styles.successModalButtons}>
                  <button 
                    className={styles.okModalBtn}
                    onClick={handleSuccessModalClose}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <Footer />
        </div>
      );
    






    // return (
    //     <div>
    //         <Navbar user={user} />
    //         <div className={styles.bookingspage}>
    //             <h1>Your Bookings</h1>

    //             <div className={styles.tableContainer}>
    //                 <table className={styles.table}>
    //                     <thead>
    //                         <tr>
    //                             <th>{user.role === "doctor" ? "Patient" : "Doctor"}</th>
    //                             <th>Contact</th>
    //                             <th>Appointment Time</th>
    //                             <th>Date</th>
    //                             <th>Status</th>
    //                             <th>Action</th>
    //                         </tr>
    //                     </thead>
    //                     <tbody>
    //                         {appointmentsLoading && Appointments.length === 0 ? (
    //                             <div className={styles.loaderBox}>
    //                                 <div className={styles.loader}></div>
    //                                 <p>Loading Appointments...</p>
    //                             </div>
    //                         ) : (
    //                             <>
    //                                 {Appointments.length > 0 ? (
    //                                     Appointments.map((appoint, index) => (
    //                                         <tr key={index}>
    //                                             <td>
    //                                                 {user.role === "doctor" ? (

    //                                                     <span className={styles.doctorName}>
    //                                                         {appoint.profile.name}
    //                                                     </span>
    //                                                 ) : (
    //                                                     //  For patients: show doctor image + name
    //                                                     <div className={styles.doctorInfo}>
    //                                                         <img
    //                                                             src={appoint.profile.photoUrl}
    //                                                             alt={appoint.profile.name}
    //                                                             className={styles.doctorImage}
    //                                                         />
    //                                                         <span className={styles.doctorName}>
    //                                                             {appoint.profile.name}
    //                                                         </span>
    //                                                     </div>
    //                                                 )}

    //                                             </td>
    //                                             <td>
    //                                                 {user.role === "doctor" ? (
    //                                                     <span>{appoint.profile.email}</span>

    //                                                 ) : (
    //                                                     <span>{appoint.profile.phone}</span>
    //                                                 )}

    //                                             </td>
    //                                             <td>{appoint.appointments.appointment_time}</td>
    //                                             <td>{appoint.appointments.appointment_date}</td>
    //                                             <td>{appoint.appointments.status}</td>
    //                                             <td>
    //                                                 {appoint.appointments.status !== "cancelled" && (
    //                                                     <button
    //                                                         className={styles.cancelBtn}
    //                                                         onClick={() => handleCancel(appoint.appointments.id)}
    //                                                     >
    //                                                         Cancel
    //                                                     </button>
    //                                                 )}
    //                                             </td>
    //                                         </tr>
    //                                     ))
    //                                 ) : (
    //                                     <tr>
    //                                         <td colSpan="6" className={styles.empty}>
    //                                             No bookings found
    //                                         </td>
    //                                     </tr>
    //                                 )}
    //                             </>
    //                         )}
    //                     </tbody>
    //                 </table>
    //             </div>
    //         </div>
    //         <Footer />
    //     </div>
    // );
}

export default UserBooking;
