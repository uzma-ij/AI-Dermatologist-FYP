const express = require('express');
const router = express.Router();
const { supabase } = require('./Supabaseclient');


router.get('/api/Profile/:id', async (req, res) => {

    const {id}  = req.params;
  try {
    const {data: setting,error: error1 } = await supabase
      .from("doctor_settings")
      .select("*")
      .eq("doctor_id", id)
      .maybeSingle();
  
    if (error1) throw error1;
     

      const { data:approval, error:error2 } = await supabase
        .from("ProfileforApproval")
        .select('*')
        .eq("id", id)
        .maybeSingle();

    
      if (error2) throw error2;
    

    res.json({approval,setting});
  } catch (err) {
   
    console.error('Error fetching doctors:', err.message);
    res.status(500).json({ error: 'Failed to fetch doctors data' });
  }
});

module.exports = router;
