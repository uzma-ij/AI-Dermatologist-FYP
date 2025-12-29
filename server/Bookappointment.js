const express = require('express');
const router = express.Router();
const { supabase } = require('./Supabaseclient');
const { sendAppointmentEmail } = require('./emailService');
const app = express();


router.get('/api/bookappointment/:id', async (req, res) => {

    const { id } = req.params;

    try {
        const { data:slots, error:slotsError } = await supabase
            .from("doctor_time_slots")
            .select("*")
            .eq("doctor_id", id);

        const today = new Date();
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);

        const { data: appointments, error: apptError } = await supabase
            .from('appointments')
            .select('*')
            .eq('doctor_id', id)
            .gte('appointment_date', today.toISOString().split('T')[0])
            .lte('appointment_date', next30Days.toISOString().split('T')[0]);

        if (apptError) throw apptError;

        const response = {
            slots: slots,
            booked: appointments
          };
        console.log();
        res.json({ data:response });


    } catch (error) {
        console.error('Error fetching time slots:', error.message);
        res.status(500).json({ error: 'Failed to fetch time slots data' });
    }
});


router.post('/api/sendAppointment/', async (req, res) => {

    try {
        const { doctorid,
            patient_id,
            slotid,
            AppointmentDay,
            AppointmentTime,
            AppointmentDate } = req.body;

        // Fetch doctor's email from users table
        const { data: doctorData, error: doctorError } = await supabase
            .from('users')
            .select('email')
            .eq('id', doctorid)
            .single();

        if (doctorError) {
            console.error('Error fetching doctor email:', doctorError);
        }

        // Fetch patient's name from users table
        const { data: patientData, error: patientError } = await supabase
            .from('users')
            .select('name')
            .eq('id', patient_id)
            .single();

        if (patientError) {
            console.error('Error fetching patient name:', patientError);
        }

        // Insert appointment into database
        const { data, error } = await supabase
            .from('appointments')
            .insert([{
                doctor_id: doctorid,
                patient_id: patient_id,
                slot_id: slotid,
                appointment_date: AppointmentDate,
                appointment_time: AppointmentTime,
                day: AppointmentDay,
                status: "booked"
            }]);

        if (error) {
            throw error;
        }

        // Send email to doctor if email is available
        if (doctorData && doctorData.email && patientData && patientData.name) {
            console.log('Sending email notification to doctor:', doctorData.email);
            const emailResult = await sendAppointmentEmail(
                doctorData.email,
                patientData.name,
                AppointmentDate,
                AppointmentDay,
                AppointmentTime
            );

            if (emailResult.success) {
                console.log('✅ Email sent successfully to doctor');
            } else {
                console.error('❌ Failed to send email:', emailResult.error);
            }
        } else {
            if (!doctorData || !doctorData.email) {
                console.warn('⚠️ Doctor email not found in database');
            }
            if (!patientData || !patientData.name) {
                console.warn('⚠️ Patient name not found in database');
            }
        }

        res.status(200).json({
            message: "Appointment saved successfully",
            appointment: data
        });
    }

    catch (err) {
        console.error("Server error:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }


});

// cancel appointment

module.exports = router;


