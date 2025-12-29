import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}`; // your Express server URL

export async function chatWithAI(userMessage) {
  const response = await axios.post(`${API_URL}/chat-bot`, { message: userMessage });
  return response.data.reply;
}
