const express = require('express');
const router = express.Router();
const { supabase } = require('./Supabaseclient');

// Get all reviews of a doctor
router.get("/api/reviews/:id", async (req, res) => {
  const { id } = req.params; // doctor_id

  try {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(`
        id,
        review,
        rating,
        created_at,
        patient_id,
        users:patient_id ( name )
      `)
      .eq("doctor_id", id);

    if (error) throw error;

    // Return empty array if no reviews
    res.json(reviews || []);
  } catch (err) {
    console.error(" Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});


//  Add a new review
router.post("/api/reviews", async (req, res) => {
  const { appointment_id, doctor_id, patient_id, review, rating } = req.body;

  if (!appointment_id || !doctor_id || !patient_id || !review) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data, error } = await supabase
      .from("reviews")
      .insert([{ appointment_id, doctor_id, patient_id, review, rating }])
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (err) {
    console.error(" Error adding review:", err);
    res.status(500).json({ error: "Failed to add review" });
  }
});



router.get("/api/check-appointment/:doctorId/:patientId", async (req, res) => {
  const { doctorId, patientId } = req.params;

  // 1. Check completed appointment
  const { data: appointments } = await supabase
    .from("appointments")
    .select("id")
    .eq("doctor_id", doctorId)
    .eq("patient_id", patientId)
    .eq("status", "completed");

  if (!appointments || appointments.length === 0) {
    return res.json({ canReview: false, appointment_id: null });
  }

  const appointment_id = appointments[0].id;

  // 2. Check if review already exists for this appointment
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("appointment_id", appointment_id)
    .eq("patient_id", patientId)
    .maybeSingle();

  if (existingReview) {
    return res.json({ canReview: false, appointment_id });
  }

  return res.json({ canReview: true, appointment_id });
});

module.exports = router;
