# คู่มือการตั้งค่า CI/CD และ Unit Test

## ภาพรวม

โปรเจกต์นี้ใช้:
- **Jest** สำหรับการทดสอบหน่วย (Unit Testing)
- **GitHub Actions** สำหรับ CI/CD
- **Vercel** หรือ **Firebase** สำหรับการ deploy

## การเริ่มต้นใช้งาน

### การรันเทสต์แบบ Local

```bash
# รันเทสต์ทั้งหมด
npm test

# รันเทสต์แบบ watch mode (รันอัตโนมัติเมื่อไฟล์เปลี่ยนแปลง)
npm run test:watch

# รันเทสต์พร้อมรายงานความครอบคลุม (coverage)
npm run test:coverage
```

### โครงสร้างการทดสอบ

ไฟล์ทดสอบจะอยู่ใน:
- `src/**/tests/` หรือ `src/**/__tests__/` สำหรับ frontend components
- `routes/__tests__/` สำหรับ API routes
- `src/model/__tests__/` สำหรับ database models

## การตั้งค่า GitHub Actions Secrets

คุณจำเป็นต้องตั้งค่า GitHub Secrets ต่อไปนี้ในโปรเจกต์:

### สำหรับ Code Coverage:
- `CODECOV_TOKEN`: โทเคนจาก Codecov.io

### สำหรับ Vercel Deployment:
- `VERCEL_TOKEN`: API Token จาก Vercel
- `VERCEL_ORG_ID`: Organization ID จาก Vercel
- `VERCEL_PROJECT_ID`: Project ID จาก Vercel

### สำหรับ Firebase Deployment:
- `FIREBASE_SERVICE_ACCOUNT`: Service Account JSON
- `FIREBASE_PROJECT_ID`: Project ID จาก Firebase

## วิธีการใช้งานและปรับแต่ง CI/CD

### การเพิ่ม/แก้ไขการทดสอบ

1. สร้างหรือแก้ไขไฟล์ในโฟลเดอร์ `__tests__` หรือตั้งชื่อไฟล์เป็น `*.test.js` หรือ `*.spec.js`
2. เขียนการทดสอบตามรูปแบบของ Jest:

```javascript
describe('ชื่อกลุ่มการทดสอบ', () => {
  test('คำอธิบายสิ่งที่ทดสอบ', () => {
    // โค้ดการทดสอบ
    expect(result).toBe(expectedValue);
  });
});
```

### การปรับแต่งเกณฑ์การทดสอบ

สามารถปรับแต่งได้ใน `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    statements: 70, // ปรับเป็น % ที่ต้องการ
    branches: 70,
    functions: 70,
    lines: 70
  }
}
```

### การเพิ่มขั้นตอนใน CI/CD

แก้ไขไฟล์ `.github/workflows/test.yml` หรือ `.github/workflows/deploy.yml` เพื่อเพิ่มขั้นตอนการทำงาน

## คำแนะนำเพิ่มเติม

### การทดสอบ API

ใช้ `supertest` สำหรับการทดสอบ API endpoints โดยการสร้าง mock request และตรวจสอบผลลัพธ์

### การทดสอบ React Components

ใช้ `@testing-library/react` สำหรับการเรนเดอร์และทดสอบ components โดยเน้นที่พฤติกรรมที่ผู้ใช้จะเห็น ไม่ใช่โครงสร้างภายใน

### การ Mock Dependencies

ใช้ `jest.mock()` เพื่อจำลองการทำงานของโมดูลหรือฟังก์ชันที่เรียกใช้ เช่น axios, socket.io-client เป็นต้น

## การแก้ไขปัญหาที่พบบ่อย

### เทสต์ไม่ผ่านเนื่องจาก ES Modules

เพิ่มตัวเลือก `--experimental-vm-modules` ในคำสั่งรันเทสต์ (มีในไฟล์ package.json แล้ว)

### ปัญหาเรื่อง CSS หรือไฟล์รูปภาพใน Jest

เรามี mocks สำหรับไฟล์ CSS และรูปภาพในโฟลเดอร์ `__mocks__` และตั้งค่าใน `jest.config.js` แล้ว

### Timeout ใน GitHub Actions

ปรับค่า timeout ในไฟล์ test ด้วย `jest.setTimeout(30000)` หรือระบุ timeout ในแต่ละเทสต์ `test('description', async () => {...}, 10000)`
