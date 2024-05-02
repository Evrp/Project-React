import requests
from line_notify import LineNotify

# ตั้งค่าโทเค็น Line Notify ของคุณ
line_notify_token = "YOUR_LINE_NOTIFY_TOKEN"

# ตั้งค่าเกณฑ์สินค้าใกล้หมด
stock_threshold = 10  # แจ้งเตือนเมื่อสินค้าเหลือต่ำกว่า 10 ชิ้น

# ดึงข้อมูลสินค้า
def get_product_data():
  # แทนที่ด้วยโค้ดของคุณเองเพื่อดึงข้อมูลสินค้าจริง
  # ตัวอย่าง: ดึงข้อมูลจากฐานข้อมูลหรือ API
  product_data = {
    "name": "สินค้าตัวอย่าง",
    "stock": 5,  # สินค้าคงคลังปัจจุบัน
  }
  return product_data

# ส่งสัญญาณเตือน
def send_alert(product_data):
  if product_data["stock"] <= stock_threshold:
    message = f"สินค้า {product_data['name']} ใกล้หมด เหลือเพียง {product_data['stock']} ชิ้น"
    line_notify = LineNotify(line_notify_token)
    line_notify.notify(message)

# เรียกใช้ฟังก์ชัน
product_data = get_product_data()
send_alert(product_data)
