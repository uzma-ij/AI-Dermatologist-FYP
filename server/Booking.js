const express = require('express');
const router = express.Router();
const { supabase } = require('./Supabaseclient');
const { sendCancellationEmail } = require('./emailService');


router.get('/api/appointments/:id', async (req, res) => {

    const { id } = req.params;

    try {
        const { data: appointments, error: appointmentError } = await supabase
            .from("appointments")
            .select("*")
            .eq('patient_id', id);

        if (appointmentError) throw appointmentError;

        const bookingDetails = [];

        for (const appt of appointments) {

            const { data: Profile, error: profileError } = await supabase
                .from('ProfileforApproval')
                .select('*')
                .eq('id', appt.doctor_id)
                .maybeSingle();

            if (profileError) throw profileError;

            if (Profile) {
                bookingDetails.push({
                    appointments: appt,
                    profile: Profile
                });
            }
        }
        
        console.log("booking detials are",bookingDetails);
        res.json(bookingDetails);
    }

    catch (err) {
        res.status(500).json({ error: 'Failed to fetch appointments data' });
    }

});

router.get('/api/doctorappointments/:id', async (req, res) => {

    const { id } = req.params;

    try {
        const { data: appointments, error: appointmentError } = await supabase
            .from("appointments")
            .select("*")
            .eq('doctor_id', id);

        if (appointmentError) throw appointmentError;

        const bookingDetails = [];

        for (const appt of appointments) {

            const { data: Profile, error: profileError } = await supabase
      
            .from('users')
                .select('*')
                .eq('id', appt.patient_id)
                .maybeSingle();

            if (profileError) throw profileError;

            if (Profile) {
                bookingDetails.push({
                    appointments: appt,
                    profile: Profile
                });
            }
        }
        
        console.log("booking detials are",bookingDetails);
        res.json(bookingDetails);
    }

    catch (err) {
        res.status(500).json({ error: 'Failed to fetch appointments data' });
    }

});

router.delete('/api/deleteappointment/:id', async (req, res) => {
    const { id } = req.params;
    const { cancelledBy } = req.body; // 'patient' or 'doctor' - who is cancelling
  
    console.log('Cancellation request:', { appointmentId: id, cancelledBy: cancelledBy || 'not specified (defaulting to patient)' });
  
    try {
      // First, fetch appointment details before deletion
      const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('doctor_id, patient_id, appointment_date, appointment_time, day')
        .eq('id', id)
        .single();

      if (fetchError || !appointment) {
        console.error('Error fetching appointment:', fetchError);
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Fetch doctor's information
      const { data: doctorData, error: doctorError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', appointment.doctor_id)
        .single();

      if (doctorError) {
        console.error('Error fetching doctor data:', doctorError);
      }

      // Fetch patient's information
      const { data: patientData, error: patientError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', appointment.patient_id)
        .single();

      if (patientError) {
        console.error('Error fetching patient data:', patientError);
      }

      // Determine who cancelled and who should receive the email
      let recipientEmail = null;
      let recipientName = null;
      let cancelledByName = null;

      if (cancelledBy === 'patient' || !cancelledBy) {
        // Patient cancelled - send email to doctor
        cancelledByName = patientData?.name || 'Patient';
        recipientEmail = doctorData?.email;
        recipientName = doctorData?.name || 'Doctor';
      } else if (cancelledBy === 'doctor') {
        // Doctor cancelled - send email to patient
        cancelledByName = doctorData?.name || 'Doctor';
        recipientEmail = patientData?.email;
        recipientName = patientData?.name || 'Patient';
      }

      // Delete the appointment from DB
      const { data, error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
  
      if (error) {
        console.error('Error canceling appointment:', error);
        return res.status(500).json({ message: 'Failed to cancel appointment' });
      }

      // Send cancellation email to the other party
      if (recipientEmail && cancelledByName) {
        console.log('Sending cancellation email to:', recipientEmail);
        const emailResult = await sendCancellationEmail(
          recipientEmail,
          recipientName,
          cancelledByName,
          appointment.appointment_date,
          appointment.day,
          appointment.appointment_time
        );

        if (emailResult.success) {
          console.log('✅ Cancellation email sent successfully');
        } else {
          console.error('❌ Failed to send cancellation email:', emailResult.error);
        }
      } else {
        console.warn('⚠️ Could not send cancellation email - missing recipient email or cancelled by name');
      }
  
      res.status(200).json({ message: 'Appointment canceled successfully' });
    } catch (err) {
      console.error('Server error:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  // Update appointment status to completed
router.put('/api/completeappointment/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', id);
  
      if (error) {
        console.error('Update error:', error);
        return res.status(500).json({ error: 'Failed to update appointment status' });
      }
  
      res.json({ success: true, data });
    } catch (err) {
      console.error('Server error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });



module.exports = router;