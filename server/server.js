const express = require('express');
const cors = require('cors');
const app = express();
const listingRoute = require('./Listing')
const { supabase } = require('./Supabaseclient');
const BookingsRoute = require('./Booking');
const ReviewsRoute = require('./Reviews');
const ProfileRoute = require('./Profile');
const AvailabilityRoute = require('./Availability');
const bookappointmentRoute = require('./Bookappointment');
const ChatRoute = require('./chat');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require("dotenv");
const { chatWithGemini } = require("./gemini.js");
const { sendApprovalEmail, sendRejectionEmail } = require("./emailService");

dotenv.config();




// Load environment variables from .env file
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
console.log('📁 Loading .env from:', path.join(__dirname, '.env'));
// Middleware
// app.use(cors());               // Allow cross-origin requests
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);


// Route: Get all requests
app.get('/api/profile-for-approval', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ProfileforApproval')
      .select('*');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Route: Update approval status (Approve/Reject)
app.put('/api/update-approval-status/:id', async (req, res) => {
  const { id } = req.params;
  const { approvalStatus } = req.body;

  console.log(`Updating ID: ${id} to status: ${approvalStatus}`);

  try {
    // First, fetch doctor's information before updating
    const { data: doctorProfile, error: fetchError } = await supabase
      .from('ProfileforApproval')
      .select('id, name')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching doctor profile:', fetchError);
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    // Fetch doctor's email from users table
    const { data: doctorData, error: doctorError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', id)
      .single();

    if (doctorError) {
      console.error('Error fetching doctor email:', doctorError);
    }

    // Update approval status
    const { data, error } = await supabase
      .from('ProfileforApproval')
      .update({ approvalStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return res.status(500).json({ error: 'Failed to update status' });
    }

    // Send email notification based on status
    if (doctorData && doctorData.email) {
      const doctorName = doctorData.name || doctorProfile?.name || 'Doctor';
      
      if (approvalStatus === 'Approved') {
        console.log('Sending approval email to doctor:', doctorData.email);
        const emailResult = await sendApprovalEmail(doctorData.email, doctorName);
        
        if (emailResult.success) {
          console.log('✅ Approval email sent successfully');
        } else {
          console.error('❌ Failed to send approval email:', emailResult.error);
        }
      } else if (approvalStatus === 'Rejected') {
        console.log('Sending rejection email to doctor:', doctorData.email);
        const emailResult = await sendRejectionEmail(doctorData.email, doctorName);
        
        if (emailResult.success) {
          console.log('✅ Rejection email sent successfully');
        } else {
          console.error('❌ Failed to send rejection email:', emailResult.error);
        }
      }
    } else {
      console.warn('⚠️ Doctor email not found. Skipping email notification.');
    }

    // Create notification if rejected
    if (approvalStatus === 'Rejected') {
      try {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            sender_id: id, // Using doctor's ID as sender for system notifications
            receiver_id: id,
            type: 'profile_rejection',
            title: 'Profile Rejection',
            message: 'Your profile could not be approved. Please resubmit your profile.',
            related_id: id,
            status: 'unread'
          }]);

        if (notificationError) {
          console.error('Notification creation error:', notificationError);
        } else {
          console.log('Rejection notification created successfully');
        }
      } catch (notificationError) {
        console.error('Notification creation error:', notificationError);
      }
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


//profile setting - POST for new, PUT for update
app.post("/api/profilesettings", async (req, res) => {
  try {
  const { user_id, fees, about, experience, faqs } = req.body;
   
    console.log("Received profile settings data:", { user_id, fees, about, experience, faqs });
    
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
 
  const { data: profile, error1 } = await supabase
    .from('ProfileforApproval')
    .select('id')
    .eq('id', user_id)
    .maybeSingle();

  if (error1) {
      console.error("Error fetching profile:", error1);
      return res.status(400).json({ message: 'Doctor profile not found', error: error1.message });
    }

    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
  }

  const doctorid = profile.id;

    // Filter out empty experience entries
    const filteredExperience = Array.isArray(experience) 
      ? experience.filter(exp => exp.hospital && exp.role && exp.start && exp.end)
      : [];

    // Filter out empty FAQ entries
    const filteredFaqs = Array.isArray(faqs)
      ? faqs.filter(faq => faq.question && faq.answer)
      : [];

    // Prepare data object - Supabase will handle JSON serialization for JSONB columns
    // Use empty arrays instead of null for JSONB columns if no data
    const settingsData = {
      doctor_id: doctorid,
      fees: fees ? parseFloat(fees) : null,
      about: about || null,
      experience: filteredExperience.length > 0 ? filteredExperience : [],
      faqs: filteredFaqs.length > 0 ? filteredFaqs : []
    };

    console.log("Settings data to save:", settingsData);

    // Check if settings already exist
    const { data: existingSettings } = await supabase
      .from("doctor_settings")
      .select('doctor_id')
      .eq('doctor_id', doctorid)
      .maybeSingle();

    let data, error;
    
    if (existingSettings) {
      // Update existing record
      console.log("Updating existing settings for doctor:", doctorid);
      const { data: updateData, error: updateError } = await supabase
        .from("doctor_settings")
        .update(settingsData)
        .eq('doctor_id', doctorid)
        .select()
        .single();
      
      data = updateData;
      error = updateError;
    } else {
      // Insert new record
      console.log("Inserting new settings for doctor:", doctorid);
      const { data: insertData, error: insertError } = await supabase
    .from("doctor_settings")
        .insert([settingsData])
        .select()
        .single();
      
      data = insertData;
      error = insertError;
    }

  if (error) {
    console.error("Error in saving profile:", error);
      return res.status(500).json({ message: "Failed to save profile", error: error.message });
    }
    
    console.log("Profile saved successfully:", data);
    return res.status(200).json({ message: "Profile saved successfully", data });
  } catch (err) {
    console.error("Unexpected error in profile settings:", err);
    return res.status(500).json({ message: "Failed to save profile", error: err.message });
  }
});

// PUT endpoint for updating profile settings
app.put("/api/profilesettings", async (req, res) => {
  try {
    const { user_id, fees, about, experience, faqs } = req.body;
   
    console.log("Received profile settings update:", { user_id, fees, about, experience, faqs });
    
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const { data: profile, error1 } = await supabase
      .from('ProfileforApproval')
      .select('id')
      .eq('id', user_id)
      .maybeSingle();

    if (error1) {
      console.error("Error fetching profile:", error1);
      return res.status(400).json({ message: 'Doctor profile not found', error: error1.message });
    }

    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const doctorid = profile.id;

    // Filter out empty experience entries
    const filteredExperience = Array.isArray(experience) 
      ? experience.filter(exp => exp.hospital && exp.role && exp.start && exp.end)
      : [];

    // Filter out empty FAQ entries
    const filteredFaqs = Array.isArray(faqs)
      ? faqs.filter(faq => faq.question && faq.answer)
      : [];

    // Prepare data object
    // Use empty arrays instead of null for JSONB columns if no data
    const settingsData = {
      fees: fees ? parseFloat(fees) : null,
      about: about || null,
      experience: filteredExperience.length > 0 ? filteredExperience : [],
      faqs: filteredFaqs.length > 0 ? filteredFaqs : []
    };

    console.log("Updating settings for doctor:", doctorid, "with data:", settingsData);

    // Update existing record
    const { data, error } = await supabase
      .from("doctor_settings")
      .update(settingsData)
      .eq('doctor_id', doctorid)
      .select()
      .single();

    if (error) {
      console.error("Error in updating profile:", error);
      return res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
    
    console.log("Profile updated successfully:", data);
    return res.status(200).json({ message: "Profile updated successfully", data });
  } catch (err) {
    console.error("Unexpected error in profile settings update:", err);
    return res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
});


//listing
app.use(listingRoute);

//Profile
app.use(ProfileRoute)

//Availability
app.use(AvailabilityRoute)

app.use(bookappointmentRoute)

app.use(BookingsRoute);
// Start the server
app.use(ReviewsRoute);
// chat

app.use(ChatRoute);



const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin:  process.env.CLIENT_URL, methods: ["GET", "POST"] },
});


// Socket logic
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("Registered user:", userId, "with socket:", socket.id);
    console.log("Current online users:", Array.from(onlineUsers.entries()));
  });

  socket.on("sendMessage", async ({ chat_id, sender_id, text }) => {
    console.log("=== SEND MESSAGE EVENT TRIGGERED ===");
    console.log("Chat ID:", chat_id);
    console.log("Sender ID:", sender_id);
    console.log("Text:", text);
    
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([{ chat_id, sender_id, text, status: "sent" }])
        .select(
          `id, text, sender_id, created_at, status,
           sender:sender_id(id, name, role)`
        )
        .single();

      if (error) {
        console.error("Message insertion error:", error);
        throw error;
      }
      
      console.log("Message inserted successfully:", data);

      await supabase
        .from("chats")
        .update({ last_message: text, updated_at: new Date() })
        .eq("id", chat_id);

      const { data: chat } = await supabase
        .from("chats")
        .select("user1, user2")
        .eq("id", chat_id)
        .single();

      const receiverId = chat.user1 === sender_id ? chat.user2 : chat.user1;

      // Create notification for the receiver
      try {
        console.log("Creating notification for receiver:", receiverId, "from sender:", sender_id);
        const { data: notificationData, error: notificationError } = await supabase
          .from("notifications")
          .insert([{
            sender_id: sender_id,
            receiver_id: receiverId,
            type: 'message',
            title: 'New Message',
            message: `${data.sender.name}: ${text}`,
            related_id: chat_id,
            status: 'unread'
          }])
          .select()
          .single();
        
        if (notificationError) {
          console.error("Notification creation error:", notificationError);
        } else {
          console.log("Notification created successfully:", notificationData);
          // Emit notification to receiver via socket
          const receiverSocket = onlineUsers.get(receiverId);
          if (receiverSocket) {
            io.to(receiverSocket).emit("notification", notificationData);
          }
        }
      } catch (notificationError) {
        console.error("Notification creation error:", notificationError);
      }

      // send to sender
      io.to(socket.id).emit("message", data);

      // send to receiver if online
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("message", data);
        await supabase.from("messages").update({ status: "delivered" }).eq("id", data.id);
      }
    } catch (err) {
      console.error("sendMessage error:", err);
    }
  });

  socket.on("markRead", async ({ chat_id, user_id }) => {
    try {
      await supabase
        .from("messages")
        .update({ status: "read" })
        .eq("chat_id", chat_id)
        .neq("sender_id", user_id);

      // Mark related notifications as read
      try {
        await supabase
          .from("notifications")
          .update({ 
            status: 'read',
            read_at: new Date().toISOString()
          })
          .eq("receiver_id", user_id)
          .eq("related_id", chat_id)
          .eq("type", "message")
          .eq("status", "unread");
      } catch (notificationError) {
        console.error("Notification mark read error:", notificationError);
      }
    } catch (err) {
      console.error("markRead error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const [userId, sId] of onlineUsers.entries()) {
      if (sId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});






///  chat bot

app.post("/chat-bot", async (req, res) => {
  try {
    const { message, disease, confidence } = req.body;
    console.log("👉 Received message:", message);

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    const reply = await chatWithGemini(message, disease, confidence);
    console.log("✅ Gemini reply:", reply);

    res.json({ reply });

  } catch (error) {
    console.error(" Error in /chat-bot:", error);

    res.status(500).json({
      error: "Something went wrong",
      details: error.message,  // extra info
    });
  }
});







// Start the server
server.listen(5000, () => {
  console.log("Server is listening at port 5000");
});


