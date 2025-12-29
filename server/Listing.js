const express = require('express');
const router = express.Router();
const { supabase } = require('./Supabaseclient');

 
router.get('/api/listing', async (req, res) => {
  try {
    // First, get all approved doctors from ProfileforApproval
    const { data: approvedProfiles, error: profileError } = await supabase
      .from("ProfileforApproval")
      .select('*')
      .eq('approvalStatus', 'Approved');

    if (profileError) throw profileError;

    if (!approvedProfiles || approvedProfiles.length === 0) {
      return res.json([]);
    }

    // Now get settings for approved doctors
    const doctors = [];

    for (let profile of approvedProfiles) {
      const { data: setting, error: settingError } = await supabase
        .from("doctor_settings")
        .select('*')
        .eq("doctor_id", profile.id)
        .maybeSingle();

      if (settingError) {
        console.error(`Error fetching settings for doctor ${profile.id}:`, settingError);
        continue; // Skip this doctor if settings fetch fails
      }

      // Only include doctors who have both approved profile AND settings
      if (setting) {
        // Get review count for this doctor
        let reviewCount = 0;
        try {
          // Ensure doctor_id is treated as string for comparison (Supabase stores UUIDs as strings)
          const doctorId = String(profile.id);
          
          const { count, error: reviewError } = await supabase
            .from("reviews")
            .select('id', { count: 'exact', head: true })
            .eq("doctor_id", doctorId);

          if (reviewError) {
            console.error(`Error fetching review count for doctor ${doctorId}:`, reviewError);
          } else {
            reviewCount = count || 0;
            console.log(`Doctor ${doctorId} (${profile.name}): ${reviewCount} reviews`);
          }
        } catch (err) {
          console.error(`Exception fetching review count for doctor ${profile.id}:`, err);
        }

        doctors.push({
          approval: profile,
          setting: setting,
          reviewCount: reviewCount
        });
      }
    }

    res.json(doctors);
  } catch (err) {
    console.error('Error in listing API:', err);
    res.status(500).json({ error: 'Failed to fetch doctors data' });
  }
});

module.exports = router;
