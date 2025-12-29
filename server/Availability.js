const express = require('express');
const router = express.Router();
const { supabase } = require('./Supabaseclient');


 
router.post("/api/save-availability", async (req, res) => {
    const { doctor_id, availability} = req.body;
  

    // Check for missing data
    if (!doctor_id || !availability) {
      return res.status(400).json({ message: "Missing doctor_id or availability" });
    }
          
    // Step 1: Confirm doctor exists
    const { data: profile, error: error1 } = await supabase
      .from("ProfileforApproval")
      .select("id")
      .eq("id", doctor_id)
      .maybeSingle();
  
    if (error1 || !profile) {
      return res.status(400).json({ message: "Doctor profile not found", error: error1 });
    }
        const  doctorid = profile.id;
    // Step 2: Delete previous slots
    await supabase
      .from("doctor_time_slots")
      .delete()
      .eq("doctor_id", doctor_id);
  
    // Step 3: Prepare new slot rows
    const rows = [];
    console.log("Rows to insert:", rows);

    for (const [day, slots] of Object.entries(availability)) {
      slots.forEach(time => {
        rows.push({ doctor_id: doctorid, day: day, time: time});
      });
    }
  
    // Step 4: Insert new availability
    const { data, error } = await supabase
      .from("doctor_time_slots")
      .insert(rows);
  
    if (error) {
      console.error("Error saving availability:", error);
      return res.status(500).json({ message: "Error saving availability", error });
    }
  
    return res.status(200).json({ message: "Availability saved successfully", data });
  });
  
  module.exports= router;
