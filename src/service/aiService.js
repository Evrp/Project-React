import axios from "axios";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; // ใส่ใน .env

export async function sendMessageToAI(message, history = []) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`;
  const headers = {
    "Content-Type": "application/json",
  };
  const data = {
    contents: [
      {
        parts: [
          { text: message }
        ]
      }
    ]
  };
  const response = await axios.post(endpoint, data, { headers });
  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}
