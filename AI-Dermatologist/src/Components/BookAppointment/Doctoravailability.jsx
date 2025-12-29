// import React from 'react';
// import styles from './availability.module.css';
// import Navbar from '../Homepage/Navbar';
// import Footer from '../Homepage/Footer';
// import { useState } from 'react';
// import axios from 'axios';
// import { Navigate } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';

// function Doctoravailability({ user }) {

//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [availability, setAvailability] = useState({});
//   const navigate = useNavigate();


//   const handleConfirm = async () => {
//     try {
//       const res = await axios.post('http://localhost:5000/api/save-availability', {
//         doctor_id: user.id,
//         availability: availability,  // example: { Monday: ["10:00 AM", "12:00 PM"], Tuesday: [...] }

//       });

//       alert('Availability saved!');
//       navigate('/confirmation' ); 
//     } catch (err) {
//       console.error('Error saving availability:', err);
//     }
//   };


//   const handleSlotClick = (weekday, slot) => {
//     setAvailability(prev => {
//       const selectedSlots = prev[weekday] || [];

//       let updatedSlots;

//       if (selectedSlots.includes(slot)) {
//         // If already selected, remove it
//         updatedSlots = selectedSlots.filter(time => time !== slot);
//       } else {
//         // If not selected, add it
//         updatedSlots = [...selectedSlots, slot];
//       }
//       return { ...prev, [weekday]: updatedSlots };
//     });
//   };


//   const generateWeekDays = () => {
//     const days = [];

//     for (let i = 0; i < 7; i++) {
//       const date = new Date();
//       date.setDate(date.getDate() + i);

//       const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); // Fri, Sat
//       const dayNumber = date.getDate(); // 12, 13

//       days.push({ date, dayName, dayNumber });
//     }
//     return days;

//   };

//   const weekDays = generateWeekDays();



//   const timeSlots = [

//     "12:00 PM", "01:00 PM", "02:00 PM",
//     "03:00 PM", "04:00 PM", "05:00 PM"
//   ];
//   const currentMonth = new Date().toLocaleString('default', { month: 'long' });

//   return (
//     <div>
//       <Navbar user={user} />
//       <div className={styles.appointmentpage}>
//         <h1>
//           Set Your Availability
//         </h1>

//         <div className={styles.slotselector}>
//           <h2>{currentMonth}</h2>
//           <div className={styles.datetabs}>

//             <div className={styles.tabs}>
//               {weekDays.map((day, index) => {
//                 const isSelected = day.date.toDateString() === selectedDate.toDateString();
//                 return (
//                   <div
//                     key={index}
//                     className={`${styles.tab} ${isSelected ? styles.tabactive : ''}`}
//                     onClick={() => setSelectedDate(day.date)}
//                   >
//                     <div>{day.dayName}</div>
//                     <div>{day.dayNumber}</div>
//                   </div>
//                 );
//               })}

//             </div>

//           </div>

//           <div className={styles.slots}>
//             <h4>Available Slots</h4>
//             <div className={styles.slotgrid}>
//               {timeSlots.map((slot, index) => (
//                 <div
//                   key={index}
//                   className={`${styles.slot} ${(availability[selectedDate.toLocaleDateString('en-US', { weekday: 'long' })]||[]).includes(slot)
//                     ? styles.slotactive
//                     : ''
//                     }`}
//                   onClick={() =>
//                     handleSlotClick(
//                       selectedDate.toLocaleDateString('en-US', { weekday: 'long' }),
//                       slot
//                     )
//                   }
//                 >
//                   {slot}
//                 </div>
//               ))}

//             </div>

//           </div>
//         </div>

//         <button onClick={handleConfirm} className={styles.btn}>Confirm</button>

//       </div>
//       <Footer />
//     </div>
//   );
// }

// export default Doctoravailability;

import React, { useState, useEffect } from 'react';
import styles from './availability.module.css';
import Navbar from '../Homepage/Navbar';
import Footer from '../Homepage/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Doctoravailability({ user }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availability, setAvailability] = useState({});
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch existing availability when component mounts
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/get-availability/${user.id}`);
        if (res.data && res.data.availability) {
          setAvailability(res.data.availability);
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
        // If no availability exists or error occurs, start with empty object
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [user?.id]);

  const handleConfirm = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/save-availability`, {
        doctor_id: user.id,
        availability: availability,
      });

      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        navigate('/ProfileSetting');
      }, 2000);
    } catch (err) {
      console.error('Error saving availability:', err);
      alert('Failed to save availability. Please try again.');
    }
  };

  const handleSlotClick = (weekday, slot) => {
    setAvailability(prev => {
      const selectedSlots = prev[weekday] || [];
      let updatedSlots;

      if (selectedSlots.includes(slot)) {
        // remove if already selected
        updatedSlots = selectedSlots.filter(time => time !== slot);
      } else {
        // add if not selected
        updatedSlots = [...selectedSlots, slot];
      }
      return { ...prev, [weekday]: updatedSlots };
    });
  };

  const generateWeekDays = () => {
    const days = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      // Get the current day of week (0 = Sunday, 1 = Monday, etc.)
      const currentDay = date.getDay();
      // Calculate offset to get Monday as first day
      const offset = currentDay === 0 ? 6 : currentDay - 1;
      date.setDate(date.getDate() - offset + i);
      
      const dayName = dayNames[i];
      const shortDayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      days.push({ date, dayName, shortDayName });
    }
    return days;
  };

  const handleAddSlot = () => {
    if (!startTime) {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      return;
    }
  
    const weekday = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
  
    setAvailability(prev => {
      const selectedSlots = prev[weekday] || [];
  
      // Avoid duplicates
      if (selectedSlots.includes(startTime)) {
        return prev;
      }
  
      return { ...prev, [weekday]: [...selectedSlots, startTime] };
    });
  
    setStartTime('');
  };
  

  const weekDays = generateWeekDays();
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)' }}>
        <Navbar user={user} />
        <div className={styles.appointmentpage} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #e5e7eb', 
              borderTop: '4px solid #667eea', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <p style={{ color: '#475467', fontSize: '16px' }}>Loading availability...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)' }}>
      <Navbar user={user} />
      <div className={styles.appointmentpage}>
        <h1>Set Your Availability</h1>
        <p className={styles.description}>
          Select your available time slots for each day of the week. Patients will be able to book appointments during these times.
        </p>

        <div className={styles.slotselector}>
          <h2>{currentMonth}</h2>

          {/* Day Tabs */}
          <div className={styles.datetabs}>
            <div className={styles.tabs}>
              {weekDays.map((day, index) => {
                const isSelected = day.date.toDateString() === selectedDate.toDateString();
                return (
                  <div
                    key={index}
                    className={`${styles.tab} ${isSelected ? styles.tabactive : ''}`}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    {day.shortDayName}
                  </div>
                );
              })}
            </div>
          </div>
         
          {/* Custom Slot Picker */}
          <div className={styles.addSlotContainer}>
            <h4>Add Custom Slot</h4>
            <p className={styles.helperText}>Select a time and click "Add" to add it to the selected day's availability.</p>
            <div className={styles.slotInputRow}>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className={styles.timeInput}
              />
              <button onClick={handleAddSlot} className={styles.addSlotBtn}>
                Add
              </button>
            </div>
          </div>


          {/* Display Selected Slots */}
          <div className={styles.slots}>
            <h4>Selected Slots</h4>
            <p className={styles.helperText}>
              Click on any slot to remove it from your availability. Selected slots are highlighted in purple.
            </p>
            <div className={styles.slotgrid}>
              {(availability[
                selectedDate.toLocaleDateString('en-US', { weekday: 'long' })
              ] || []).map((slot, index) => (
                <div
                  key={index}
                  className={`${styles.slot} ${styles.slotactive}`}
                  onClick={() =>
                    handleSlotClick(
                      selectedDate.toLocaleDateString('en-US', { weekday: 'long' }),
                      slot
                    )
                  }
                >
                  {slot}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleConfirm} className={styles.btn}>
          Confirm
        </button>
      </div>

      {/* Alert Popup */}
      {showAlert && (
        <div className={styles.alertOverlay}>
          <div className={styles.alertPopup}>
            <div className={styles.alertIcon}>⚠️</div>
            <h3 className={styles.alertTitle}>Please Select a Slot First</h3>
            <p className={styles.alertMessage}>You need to select a time before adding it to your availability.</p>
            <button className={styles.alertButton} onClick={() => setShowAlert(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className={styles.alertOverlay}>
          <div className={styles.successPopup}>
            <div className={styles.successIcon}>✓</div>
            <h3 className={styles.alertTitle}>Availability Saved Successfully!</h3>
            <p className={styles.alertMessage}>Your availability has been saved. Redirecting to profile settings...</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Doctoravailability;
