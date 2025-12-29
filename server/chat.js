// server/chat.js
const express = require("express");
const router = express.Router();
const { supabase } = require("./Supabaseclient");

// Create or fetch chat
router.post("/api/chats", async (req, res) => {
  const { user1, user2 } = req.body;

  try {
    // find existing chat in either order
    const { data: existingChat } = await supabase
      .from("chats")
      .select("*")
      .or(
        `and(user1.eq.${user1},user2.eq.${user2}),and(user1.eq.${user2},user2.eq.${user1})`
      )
      .maybeSingle();

    if (existingChat) return res.json(existingChat);

    const { data, error } = await supabase
      .from("chats")
      .insert([{ user1, user2 }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Chat creation error:", error);
    res.status(500).json({ error: "Failed to create chat" });
  }
});

// Fetch chats for a user
router.get("/api/chats/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const { data: chats, error } = await supabase
      .from("chats")
      .select("id, last_message, updated_at, user1, user2")
      .or(`user1.eq.${userId},user2.eq.${userId}`)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    if (!chats || chats.length === 0) return res.json([]);

    const enriched = await Promise.all(
      chats.map(async (chat) => {
        // fetch both users
        const { data: users } = await supabase
          .from("users")
          .select("id, name, role")
          .in("id", [chat.user1, chat.user2]);

        const usersWithPhoto = await Promise.all(
          users.map(async (u) => {
            if (u.role === "doctor") {
              const { data: profile } = await supabase
                .from("ProfileforApproval")
                .select("photoUrl")
                .eq("id", u.id)
                .maybeSingle();
              return { ...u, photoUrl: profile?.photoUrl || null };
            }
            return { ...u, photoUrl: null };
          })
        );

        // check if unread messages exist for current user
        const { count: unreadCount } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("chat_id", chat.id)
          .neq("sender_id", userId) // messages from others
          .neq("status", "read");   // not read yet

        return {
          ...chat,
          user1: usersWithPhoto.find((u) => u.id === chat.user1),
          user2: usersWithPhoto.find((u) => u.id === chat.user2),
          hasUnread: unreadCount > 0, // 👈 add this flag
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error("Fetch chats error:", err);
    res.json([]);
  }
});


// Fetch single chat detail by chatId
router.get("/api/chat/:chatId", async (req, res) => {
  const { chatId } = req.params;
  try {
    const { data: chat, error } = await supabase
      .from("chats")
      .select("id, last_message, updated_at, user1, user2")
      .eq("id", chatId)
      .maybeSingle();
    if (error) throw error;
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    const { data: users } = await supabase
      .from("users")
      .select("id, name, role")
      .in("id", [chat.user1, chat.user2]);

    const usersWithPhoto = await Promise.all(
      users.map(async (u) => {
        if (u.role === "doctor") {
          const { data: profile } = await supabase
            .from("ProfileforApproval")
            .select("photoUrl")
            .eq("id", u.id)
            .maybeSingle();
          return { ...u, photoUrl: profile?.photoUrl || null };
        }
        return { ...u, photoUrl: null };
      })
    );

    res.json({
      ...chat,
      user1: usersWithPhoto.find((u) => u.id === chat.user1),
      user2: usersWithPhoto.find((u) => u.id === chat.user2),
    });
  } catch (err) {
    console.error("Fetch chat detail error:", err);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

// Fetch messages
router.get("/api/messages/:chatId", async (req, res) => {
  const { chatId } = req.params;

  try {
    const { data, error } = await supabase
      .from("messages")
      .select(
        `id, text, sender_id, status, created_at,
         sender:sender_id (id, name, role)`
      )
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (!data) return res.json([]);

    const enriched = await Promise.all(
      data.map(async (msg) => {
        let photoUrl = null;
        if (msg.sender?.role === "doctor") {
          const { data: profile } = await supabase
            .from("ProfileforApproval")
            .select("photoUrl")
            .eq("id", msg.sender.id)
            .maybeSingle();
          photoUrl = profile?.photoUrl || null;
        }
        return { ...msg, sender_profile: { photoUrl } };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.json([]);
  }
});

module.exports = router;
