// import { React, useState, useEffect } from 'react';
// import styles from './Book.module.css';
// import Navbar from '../Homepage/Navbar';
// import Footer from '../Homepage/Footer';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';


// function Bookappointment({ user }) {

//   const [Timeslots, setTimeslots] = useState([]);
//   const { doctorId } = useParams();
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [slotdate, setslotDate] = useState(null);
//   const navigate = useNavigate();

//   const handleselect = (slot, date) => {

//     setSelectedSlot(slot);
//     const isoDate = new Date(date).toISOString().split("T")[0];
//     setslotDate(isoDate);
//   }

//   const fetchedslots = {
//     Monday: [],
//     Tuesday: [],
//     Wednesday: [],
//     Thursday: [],
//     Friday: [],
//     Saturday: [],
//     Sunday: []
//   }

//   const [grouped, setGrouped] = useState(fetchedslots);

//   const Insertslots = (slots) => {

//     const updated = { ...fetchedslots };
//     for (const slot of slots) {
//       if (slot.day && slot.time && fetchedslots[slot.day]) {
//         updated[slot.day].push(slot);

//       }

//     }
//     return updated;
//   }

//   const generateWeekDays = () => {
//     const days = [];

//     for (let i = 0; i < 7; i++) {
//       const date = new Date();
//       date.setDate(date.getDate() + i);

//       const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }); // Friday
//       const formattedDate = date.toLocaleDateString("en-US");

//       days.push({ formattedDate, dayName });
//     }
//     return days;

//   };

//   useEffect(() => {
//     const fetchtimeslots = async () => {
//       try {
//         const res = await axios.get(`http://localhost:5000/api/bookappointment/${doctorId}`);
//         setTimeslots(res.data.data);
//       } catch (err) {
//         console.error('Error fetching time slots data:', err);
//       };
//     }
//     fetchtimeslots();
//   }, [doctorId]);

//   useEffect(() => {
//     setGrouped(Insertslots(Timeslots));
//   }, [Timeslots]);

//   const weekDays = generateWeekDays();
//   const currentMonth = new Date().toLocaleString('default', { month: 'long' });


//   const bookAppointment = async (e) => {
//     e.preventDefault();

//     if (!selectedSlot) {
//       alert("Please select a slot before booking.");
//       return;
//     }


//     const payload = {
//       doctorid: selectedSlot.doctor_id,
//       patient_id: user.id,
//       slotid: selectedSlot.id,
//       AppointmentDay: selectedSlot.day,
//       AppointmentTime: selectedSlot.time,
//       AppointmentDate: slotdate
//     }

//     console.log("Payload being sent:", payload);

//     const response = await fetch('http://localhost:5000/api/sendAppointment', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload),
//     });



//     if (response.ok) {
//       alert("Data sent successfully!");
//       navigate('/Confirmation');
//     } else {
//       alert("Failed to send data.");
//     }

//   }


//   return (
//     <div>
//       <Navbar user={user} />
//       <div className={styles.appointmentpage}>
//         <h1>
//           Book Your Appointment
//         </h1>
//         <table>
//           <thead>
//             <tr>
//               <th>Day/Date</th>
//               <th>Available slots</th>
//             </tr>
//           </thead>
//           <tbody>
//             {weekDays.map((day, index) => (
//               <tr key={index}>
//                 <td >
//                   {day.dayName}, {day.formattedDate}
//                 </td>
//                 <td>
//                   <div className={styles.slotgrid}>
//                     {grouped[day.dayName]?.length > 0 ? (
//                       grouped[day.dayName].map((slot, idx) => (
//                         slot.status === "available" ? (
//                           <button key={idx}
//                             className={selectedSlot === slot ? styles.selectedslot : styles.slot}
//                             title="available"
//                             onClick={() => handleselect(slot,day.formattedDate)}
//                           >
//                             {slot.time}
//                           </button>

//                         ) : (
//                           <button key={idx} className={styles.bookedslot}
//                             title="booked"
//                           >
//                             {slot.time}
//                           </button>
//                         )

//                       ))
//                     ) : (
//                       <span>No slots available</span>
//                     )}
//                   </div>
//                 </td>
//               </tr>

//             ))}

//           </tbody>
//         </table>
//         <button className={styles.bookappoint}
//           onClick={bookAppointment}>
//           Book Appointment</button>
//       </div>
//       <Footer />
//     </div>
//   );
// }

// export default Bookappointment;


import { React, useState, useEffect } from 'react';
import styles from './Book.module.css';
import Navbar from '../Homepage/Navbar';
import Footer from '../Homepage/Footer';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Bookappointment({ user }) {

  const [Timeslots, setTimeslots] = useState([]);
  const { doctorId } = useParams();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotdate, setslotDate] = useState(null);
  const navigate = useNavigate();
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const handleselect = (slot, date) => {

    setSelectedSlot(slot);
    // const isoDate = new Date(date).toISOString().split("T")[0];
    setslotDate(date);
  }

  const fetchedslots = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  }

  const [grouped, setGrouped] = useState(fetchedslots);

  const Insertslots = (slots) => {

    const updated = { ...fetchedslots };
    for (const slot of slots) {
      if (slot.day && slot.time && fetchedslots[slot.day]) {
        updated[slot.day].push(slot);

      }

    }
    return updated;
  }

  const [selectedDate, setSelectedDate] = useState(null);
  const [displayMonth, setDisplayMonth] = useState(new Date().getMonth());
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());

  const handlePreviousMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);
    
    const nextMonth = displayMonth === 11 ? 0 : displayMonth + 1;
    const nextYear = displayMonth === 11 ? displayYear + 1 : displayYear;
    
    // Check if next month is still within the 30-day range
    const nextMonthFirstDay = new Date(nextYear, nextMonth, 1);
    if (nextMonthFirstDay <= maxDate) {
      setDisplayMonth(nextMonth);
      setDisplayYear(nextYear);
    }
  };

  const getSlotsForSelectedDate = () => {
    if (!selectedDate) return [];
    
    const selectedDayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
    return grouped[selectedDayName] || [];
  };

  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);
    setSelectedSlot(null); // Reset slot selection when date changes
    
    // Update displayed month/year if selected date is in a different month
    const selectedDateObj = new Date(dateString);
    const selectedMonth = selectedDateObj.getMonth();
    const selectedYear = selectedDateObj.getFullYear();
    
    if (selectedMonth !== displayMonth || selectedYear !== displayYear) {
      setDisplayMonth(selectedMonth);
      setDisplayYear(selectedYear);
    }
  };

  useEffect(() => {
    const fetchtimeslots = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookappointment/${doctorId}`);
        const { slots, booked } = res.data.data;
        const updatedSlots = slots.map(slot => {
          
          return { ...slot };
        });

        setTimeslots(updatedSlots);
        setBookedAppointments(booked);

      } catch (err) {
        console.error('Error fetching time slots data:', err);
      };
    }
    fetchtimeslots();
  }, [doctorId]);

  useEffect(() => {
    setGrouped(Insertslots(Timeslots));
  }, [Timeslots]);

  const monthNames = ["January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"];
  
  const getCurrentMonthName = () => {
    return monthNames[displayMonth];
  };

  const availableSlotsForDate = getSlotsForSelectedDate();
  
  // Calculate if navigation buttons should be enabled
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30);
  
  const canGoPrevious = () => {
    const prevMonth = displayMonth === 0 ? 11 : displayMonth - 1;
    const prevYear = displayMonth === 0 ? displayYear - 1 : displayYear;
    const prevMonthFirstDay = new Date(prevYear, prevMonth, 1);
    return prevMonthFirstDay >= new Date(today.getFullYear(), today.getMonth(), 1);
  };
  
  const canGoNext = () => {
    const nextMonth = displayMonth === 11 ? 0 : displayMonth + 1;
    const nextYear = displayMonth === 11 ? displayYear + 1 : displayYear;
    const nextMonthFirstDay = new Date(nextYear, nextMonth, 1);
    return nextMonthFirstDay <= maxDate;
  };

  // Check if a time slot has passed for today
  const isSlotPassed = (slotTime, dateString) => {
    const today = new Date();
    const slotDate = new Date(dateString);
    
    // Check if the slot date is today
    const isToday = slotDate.toDateString() === today.toDateString();
    
    if (!isToday) {
      return false; // Not today, so it hasn't passed
    }
    
    // Parse the slot time (format: "HH:MM:SS" or "HH:MM")
    const timeParts = slotTime.split(':');
    const slotHours = parseInt(timeParts[0], 10);
    const slotMinutes = parseInt(timeParts[1], 10);
    
    // Get current time
    const currentHours = today.getHours();
    const currentMinutes = today.getMinutes();
    
    // Compare times
    if (slotHours < currentHours) {
      return true; // Slot time has passed
    } else if (slotHours === currentHours && slotMinutes <= currentMinutes) {
      return true; // Slot time has passed (same hour, but minutes have passed)
    }
    
    return false; // Slot time hasn't passed yet
  };

  const handleBookClick = (e) => {
    e.preventDefault();

    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }

    if (!selectedSlot) {
      alert("Please select a time slot before booking.");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmBooking = async () => {
    setIsBooking(true);

    const payload = {
      doctorid: selectedSlot.doctor_id,
      patient_id: user.id,
      slotid: selectedSlot.id,
      AppointmentDay: selectedSlot.day,
      AppointmentTime: selectedSlot.time,
      AppointmentDate: slotdate
    }

    console.log("Payload being sent:", payload);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sendAppointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Trigger immediate refresh of appointments
        window.dispatchEvent(new CustomEvent('appointmentBooked'));
        setShowConfirmModal(false);
        navigate('/Confirmation');
      } else {
        alert("Failed to send data.");
        setIsBooking(false);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert("An error occurred while booking. Please try again.");
      setIsBooking(false);
    }
  };

  const handleCancelBooking = () => {
    setShowConfirmModal(false);
  }


  return (
    <div className={styles.pageContainer}>
      <Navbar user={user} />
      <div className={styles.appointmentpage}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
         
          <h1 className={styles.mainTitle}>
            Book Your <span className={styles.gradientText}>Appointment</span>
          </h1>
          <p className={styles.description}>
            Select your preferred date and time slot from the available options below. 
            Choose a convenient time that works best for your schedule and confirm your appointment with just one click.
          </p>
        </div>

        {/* Appointment Calendar Section */}
        <div className={styles.calendarSection}>
          <div className={styles.calendarCard}>
            <div className={styles.calendarHeader}>
              <h2 className={styles.calendarTitle}>Available Time Slots</h2>
              <p className={styles.calendarSubtitle}>Select a date and time to book your appointment</p>
            </div>
            
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              {/* Calendar Section */}
              <div style={{ flex: '1', minWidth: '350px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <button
                      onClick={handlePreviousMonth}
                      disabled={!canGoPrevious()}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: canGoPrevious() ? 'pointer' : 'not-allowed',
                        color: canGoPrevious() ? '#333' : '#ccc',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (canGoPrevious()) {
                          e.target.style.backgroundColor = '#f0f0f0';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      ←
                    </button>
                    <h3 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
                      {getCurrentMonthName()}, {displayYear}
                    </h3>
                    <button
                      onClick={handleNextMonth}
                      disabled={!canGoNext()}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: canGoNext() ? 'pointer' : 'not-allowed',
                        color: canGoNext() ? '#333' : '#ccc',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (canGoNext()) {
                          e.target.style.backgroundColor = '#f0f0f0';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      →
                    </button>
                  </div>
                  <p style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>Pick a date for appointment</p>
                </div>
                
                {/* Calendar Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)', 
                  gap: '8px',
                  marginBottom: '20px'
                }}>
                  {/* Day Headers */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                    <div key={idx} style={{ 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      fontSize: '14px',
                      color: '#666',
                      padding: '8px'
                    }}>
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar Dates */}
                  {(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const maxDate = new Date();
                    maxDate.setDate(today.getDate() + 30);
                    maxDate.setHours(0, 0, 0, 0);
                    
                    // Get first day of displayed month
                    const firstDayOfDisplayMonth = new Date(displayYear, displayMonth, 1);
                    
                    // Calculate starting date (first Monday of the week containing the 1st)
                    const startDate = new Date(firstDayOfDisplayMonth);
                    const dayOfWeek = startDate.getDay();
                    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
                    startDate.setDate(startDate.getDate() - daysToSubtract);
                    
                    const cells = [];
                    const currentDate = new Date(startDate);
                    
                    // Generate 42 cells (6 weeks * 7 days)
                    for (let i = 0; i < 42; i++) {
                      const dateString = currentDate.toISOString().split('T')[0];
                      const dateObj = new Date(currentDate);
                      dateObj.setHours(0, 0, 0, 0);
                      
                      const isDisplayMonth = currentDate.getMonth() === displayMonth;
                      
                      // Check if date is within the next 30 days
                      const isInNext30Days = dateObj >= today && dateObj <= maxDate;
                      const isSelected = selectedDate === dateString;
                      
                      cells.push(
                        <button
                          key={i}
                          onClick={() => isInNext30Days && handleDateSelect(dateString)}
                          disabled={!isInNext30Days}
                          style={{
                            padding: '12px 8px',
                            border: isSelected ? '2px solid #667eea' : '1px solid #e0e0e0',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? '#667eea' : (isInNext30Days ? '#f8f9fa' : '#ffffff'),
                            color: isSelected ? '#fff' : (isInNext30Days && isDisplayMonth ? '#333' : '#ccc'),
                            cursor: isInNext30Days ? 'pointer' : 'default',
                            fontSize: '14px',
                            fontWeight: isSelected ? '600' : '400',
                            minHeight: '40px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (isInNext30Days && !isSelected) {
                              e.target.style.backgroundColor = '#e9ecef';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.target.style.backgroundColor = isInNext30Days ? '#f8f9fa' : '#ffffff';
                            }
                          }}
                        >
                          {currentDate.getDate()}
                        </button>
                      );
                      
                      currentDate.setDate(currentDate.getDate() + 1);
                    }
                    return cells;
                  })()}
                </div>
              </div>

              {/* Time Slots Section */}
              <div style={{ flex: '1', minWidth: '350px' }}>
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '10px' }}>Availability</h3>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    {selectedDate 
                      ? `Time slots for ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
                      : 'Select a date to see available time slots'}
                  </p>
                </div>
                
                {selectedDate ? (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '12px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '10px'
                  }}>
                    {availableSlotsForDate.length > 0 ? (
                      availableSlotsForDate.map((slot, idx) => {
                        const isoDate = selectedDate;
                        const isBooked = bookedAppointments.some(
                          b => b.slot_id === slot.id && b.appointment_date === isoDate
                        );
                        const isPassed = isSlotPassed(slot.time, selectedDate);
                        const isDisabled = isBooked || isPassed;

                        if (isBooked) {
                          return (
                            <button
                              key={idx}
                              className={styles.bookedslot}
                              title="booked"
                              disabled
                            >
                              {slot.time}
                            </button>
                          );
                        }

                        if (isPassed) {
                          return (
                            <button
                              key={idx}
                              className={styles.bookedslot}
                              title="This time slot has passed"
                              disabled
                            >
                              {slot.time}
                            </button>
                          );
                        }

                        return (
                          <button
                            key={idx}
                            className={
                              selectedSlot === slot && slotdate === selectedDate
                                ? styles.selectedslot
                                : styles.slot
                            }
                            title="available"
                            onClick={() => handleselect(slot, selectedDate)}
                          >
                            {slot.time}
                          </button>
                        );
                      })
                    ) : (
                      <div style={{ 
                        gridColumn: '1 / -1', 
                        textAlign: 'center', 
                        padding: '40px',
                        color: '#999'
                      }}>
                        No slots available for this day
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    color: '#999',
                    fontSize: '16px'
                  }}>
                    Please select a date to view available time slots
                  </div>
                )}
              </div>
            </div>

            {selectedSlot && slotdate && (
              <div className={styles.selectedInfo} style={{ marginTop: '30px', marginBottom: '20px' }}>
                <div className={styles.selectedIcon}>✓</div>
                <div className={styles.selectedText}>
                  <span className={styles.selectedLabel}>Selected:</span>
                  <span className={styles.selectedValue}>
                    {new Date(slotdate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedSlot.time}
                  </span>
                </div>
              </div>
            )}

            {!selectedDate && (
              <div style={{ 
                textAlign: 'center', 
                color: '#d92d20', 
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <span>⚠</span>
                <span>Pick a date and time.</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px' }}>
              <button 
                style={{
                  padding: '12px 24px',
                  border: '1px solid #d0d5dd',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  color: '#344054',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(-1)}
              >
                Back
              </button>
              <button 
                className={styles.bookappoint}
                onClick={handleBookClick}
                disabled={!selectedSlot || !selectedDate}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: (!selectedSlot || !selectedDate) ? 'not-allowed' : 'pointer',
                  opacity: (!selectedSlot || !selectedDate) ? 0.6 : 1
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className={styles.modalOverlay} onClick={handleCancelBooking}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>📅</div>
            <h3 className={styles.modalTitle}>Confirm Appointment</h3>
            <p className={styles.modalMessage}>
              Please confirm your appointment details:
            </p>
            <div className={styles.appointmentDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Date:</span>
                <span className={styles.detailValue}>
                  {slotdate && new Date(slotdate + 'T00:00:00').toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Time:</span>
                <span className={styles.detailValue}>{selectedSlot?.time}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Day:</span>
                <span className={styles.detailValue}>{selectedSlot?.day}</span>
              </div>
            </div>
            <div className={styles.modalButtons}>
              <button 
                className={styles.cancelModalBtn}
                onClick={handleCancelBooking}
                disabled={isBooking}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmModalBtn}
                onClick={handleConfirmBooking}
                disabled={isBooking}
              >
                {isBooking ? 'Booking...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Bookappointment;
