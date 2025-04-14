import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";

const interests = ["ดนตรี", "กีฬา", "ศิลปะ", "เทคโนโลยี"];

export default function InterestForm() {
  const [formData, setFormData] = useState({
    interest: "",
    location: "",
    date: "",
    budget: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // ส่งข้อมูลไปยัง Webhook ของ Make.com
    const webhookUrl = "https://hook.eu2.make.com/u94lu8f6qjsum5qqtq5nb884d8cnf2pa"; // แทนที่ด้วย URL จาก Make.com
  
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // ส่งข้อมูล formData ไปยัง Make.com
      });
  
      const webhookText = await webhookResponse.text(); // รับข้อมูลเป็นข้อความธรรมดาก่อน
      console.log("ข้อมูลที่ตอบกลับจาก Make.com:", webhookText);
  
      // ตรวจสอบว่าคำตอบเป็น JSON หรือไม่
      if (webhookText === "Accepted") {
        console.log("ข้อมูลได้รับการยอมรับจาก Make.com");
      } else {
        // หากคำตอบเป็น JSON ให้แปลงเป็นอ็อบเจ็กต์
        try {
          const webhookData = JSON.parse(webhookText);
          console.log("ข้อมูลที่แปลงเป็น JSON:", webhookData);
        } catch (jsonError) {
          console.error("เกิดข้อผิดพลาดในการแปลงข้อมูลเป็น JSON:", jsonError);
        }
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการส่งข้อมูลไปยัง Make.com:", error);
    }
  };
  

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">ค้นหากิจกรรมที่คุณสนใจ</h2>
      <form onSubmit={handleSubmit}>
        <Select name="interest" onChange={handleChange} required>
          <option value="">เลือกความสนใจ</option>
          {interests.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Input
          name="location"
          placeholder="จังหวัด"
          onChange={handleChange}
          required
        />
        <Input type="date" name="date" onChange={handleChange} required />
        <Input
          name="budget"
          type="number"
          placeholder="งบประมาณ"
          onChange={handleChange}
          required
        />
        <Button type="submit" className="mt-4 w-full">
          ค้นหากิจกรรม
        </Button>
      </form>
    </div>
  );
}
