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
  const [events, setEvents] = useState([]); // ใช้เก็บข้อมูลกิจกรรมที่ดึงจาก web scraping

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // ✅ 📌 1️⃣ ดึงข้อมูลจาก Amazon + เก็บลง Database
      const amazonResponse = await fetch("http://localhost:8080/api/scrape-amazon");
      const amazonData = await amazonResponse.json();
  
      console.log("ข้อมูล Amazon:", amazonData);
  
      // ✅ 📌 2️⃣ รวมข้อมูล User + Amazon แล้วบันทึกลง Database + ส่งไป Make.com
      const payload = {
        userData: formData,
        amazonData: amazonData
      };
  
      const makeResponse = await fetch("http://localhost:8080/api/send-to-make-combined", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      console.log("ตอบกลับจาก Make.com:", await makeResponse.json());
  
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
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

      {/* แสดงรายการกิจกรรมที่ได้จาก Web Scraping */}
      {events.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold">กิจกรรมที่พบ:</h3>
          <ul className="mt-4">
            {events.map((event, index) => (
              <li key={index} className="mb-4">
                <h4 className="text-md font-bold">{event.title}</h4>
                <p>{event.location}</p>
                <p>{event.date}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
