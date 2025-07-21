import OpenAI from "openai";

// API Key จาก .env (สำหรับ Google Gemini หรือ OpenAI)
// ใช้งานจริง: สร้างไฟล์ .env และใส่ VITE_GOOGLE_API_KEY=your_key หรือ VITE_OPENAI_API_KEY=your_key
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// เลือกใช้ model: "openai" เป็นค่าเริ่มต้น
// สามารถใช้ "gemini" หรือ "mock" ได้ถ้าต้องการ
const AI_MODEL = "openai";

// สร้าง OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // อนุญาตให้ใช้งานใน browser environment
});

export async function sendMessageToAI(message, history = []) {
  try {
    switch (AI_MODEL) {
      case "gemini":
        return await callGemini(message);
      case "openai":
        return await callOpenAI(message, history);
      default:
        return mockAIResponse(message);
    }
  } catch (error) {
    console.error("AI Error:", error);
    return "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ AI กรุณาลองใหม่อีกครั้ง";
  }
}

// OpenAI API ใช้ SDK ใหม่
async function callOpenAI(message, history = []) {
  // สร้างข้อความสนทนา
  const messages = [
    {
      role: "system",
      content: "คุณเป็นผู้ช่วยอัจฉริยะสำหรับแอพจับคู่กิจกรรมและห้อง ชื่อ AI Assistant ที่ให้คำแนะนำเกี่ยวกับการใช้งานแอพ การหาเพื่อนที่มีความสนใจคล้ายกัน และแนะนำกิจกรรมที่น่าสนใจ ตอบเป็นภาษาไทย"
    }
  ];

  // เพิ่มประวัติการสนทนา
  if (history && history.length > 0) {
    messages.push(...history);
  }

  // เพิ่มข้อความปัจจุบัน
  messages.push({
    role: "user",
    content: message
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // ใช้โมเดลรุ่นใหม่ที่ดีและราคาถูก
    messages: messages,
    temperature: 0.7,
    max_tokens: 1000,
    store: true,  // เก็บประวัติการสนทนาบน OpenAI server
  });

  return completion.choices[0].message.content;
}

// Google Gemini API
async function callGemini(message) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`;
  const headers = {
    "Content-Type": "application/json",
  };
  const data = {
    contents: [
      {
        role: "user",
        parts: [
          { text: message }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        { text: "คุณเป็นผู้ช่วยอัจฉริยะสำหรับแอพจับคู่กิจกรรมและห้อง ชื่อ AI Assistant ที่ให้คำแนะนำเกี่ยวกับการใช้งานแอพ การหาเพื่อนที่มีความสนใจคล้ายกัน และแนะนำกิจกรรมที่น่าสนใจ" }
      ]
    }
  };
  
  const response = await axios.post(endpoint, data, { headers });
  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Mock AI สำหรับใช้งานโดยไม่ต้องใช้ API
function mockAIResponse(message) {
  if (message.toLowerCase().includes("สวัสดี") || message.toLowerCase().includes("หวัดดี")) {
    return "สวัสดีค่ะ! ฉันคือ AI Assistant พร้อมช่วยเหลือคุณเกี่ยวกับการใช้งานแอพ มีอะไรให้ฉันช่วยไหมคะ?";
  }
  
  if (message.toLowerCase().includes("กิจกรรม") || message.toLowerCase().includes("activity")) {
    return "ในแอพของเรามีกิจกรรมหลากหลาย เช่น กีฬา การท่องเที่ยว งานอดิเรก และการเรียนรู้ คุณสามารถค้นหาและกรองกิจกรรมตามความสนใจของคุณได้ที่หน้า Home ค่ะ";
  }
  
  if (message.toLowerCase().includes("ห้อง") || message.toLowerCase().includes("room") || message.toLowerCase().includes("กลุ่ม")) {
    return "คุณสามารถสร้างหรือเข้าร่วมห้องเพื่อพูดคุยกับผู้ที่มีความสนใจคล้ายกันได้ เพียงไปที่แท็บ Community แล้วกด + เพื่อสร้างห้องใหม่ หรือค้นหาห้องที่น่าสนใจได้เลยค่ะ";
  }
  
  if (message.toLowerCase().includes("จับคู่") || message.toLowerCase().includes("match")) {
    return "ฟีเจอร์การจับคู่ของเราจะแนะนำกิจกรรมและเพื่อนใหม่ที่มีความสนใจคล้ายกับคุณ โดยอิงจากข้อมูลความสนใจที่คุณระบุไว้ในโปรไฟล์ค่ะ";
  }

  return "ขออภัยค่ะ ฉันไม่เข้าใจคำถามนี้ คุณสามารถถามเกี่ยวกับวิธีการใช้งานแอพ การค้นหากิจกรรม การสร้างห้อง หรือการจับคู่ได้ค่ะ";
}
