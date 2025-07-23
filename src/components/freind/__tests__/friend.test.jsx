import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import Friend from '../../components/freind/friend';
import { ThemeProvider } from '../../context/themecontext';

// Mock axios
jest.mock('axios');

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const emit = jest.fn();
  const on = jest.fn();
  const off = jest.fn();
  
  return jest.fn(() => ({
    emit,
    on,
    off,
    connect: jest.fn(),
    connected: true,
    id: 'test-socket-id'
  }));
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

describe('Friend Component', () => {
  const mockUsers = [
    { 
      email: 'user1@example.com',
      displayName: 'User One',
      photoURL: 'https://example.com/user1.jpg',
      isOnline: true
    },
    { 
      email: 'user2@example.com',
      displayName: 'User Two',
      photoURL: 'https://example.com/user2.jpg',
      isOnline: false
    }
  ];
  
  const mockCurrentUser = {
    email: 'current@example.com',
    displayName: 'Current User',
    photoURL: 'https://example.com/current.jpg',
    friends: [
      { email: 'user1@example.com', roomId: 'room123' }
    ]
  };
  
  const mockFriendRequests = {
    requests: [
      {
        requestId: 'req123',
        from: {
          email: 'user2@example.com',
          displayName: 'User Two',
          photoURL: 'https://example.com/user2.jpg'
        },
        to: 'current@example.com',
        timestamp: new Date().toISOString(),
        status: 'pending',
        read: false
      }
    ]
  };

  beforeEach(() => {
    // Setup mocks
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'userEmail') return 'current@example.com';
      if (key === 'userName') return 'Current User';
      if (key === 'userPhoto') return 'https://example.com/current.jpg';
      return null;
    });
    
    // Mock axios responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/users/current@example.com')) {
        return Promise.resolve({ data: mockCurrentUser });
      }
      if (url.includes('/api/users')) {
        return Promise.resolve({ data: mockUsers });
      }
      if (url.includes('/api/friend-requests/current@example.com')) {
        return Promise.resolve({ data: mockFriendRequests });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    axios.post.mockResolvedValue({ data: { success: true, message: 'Success' } });
    axios.delete.mockResolvedValue({ data: { success: true, message: 'Success' } });
    
    // Reset mock calls
    jest.clearAllMocks();
  });

  test('แสดงรายการเพื่อนและผู้ใช้อื่นๆ', async () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <Friend />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // รอให้โหลดข้อมูลเสร็จ
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(3);
    });
    
    // ตรวจสอบว่าแสดงชื่อของเพื่อนและผู้ใช้อื่นๆ
    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });
  });

  test('การกดปุ่ม "เพิ่มเพื่อน" ควรเรียกใช้ API สำหรับส่งคำขอเพื่อน', async () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <Friend />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // รอให้โหลดข้อมูลเสร็จ
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(3);
    });
    
    // หาปุ่ม "เพิ่มเพื่อน" และคลิก
    const addFriendButtons = await screen.findAllByText(/เพิ่มเพื่อน/i);
    fireEvent.click(addFriendButtons[0]);
    
    // ตรวจสอบว่ามีการเรียกใช้ API สำหรับส่งคำขอเพื่อน
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/friend-request'),
        expect.objectContaining({
          from: expect.objectContaining({
            email: 'current@example.com'
          })
        }),
        expect.anything()
      );
    });
  });

  test('การกดปุ่ม "ลบเพื่อน" ควรเรียกใช้ API สำหรับลบเพื่อน', async () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <Friend />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // รอให้โหลดข้อมูลเสร็จ
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(3);
    });
    
    // ค้นหาและคลิกปุ่มตัวเลือก (ซึ่งจะเปิดเมนูที่มีปุ่ม "ลบเพื่อน")
    const optionsButtons = await screen.findAllByLabelText(/ตัวเลือก/i);
    fireEvent.click(optionsButtons[0]);
    
    // หาปุ่ม "ลบเพื่อน" และคลิก
    const removeFriendButton = await screen.findByText(/ลบเพื่อน/i);
    
    // Mock confirm
    global.confirm = jest.fn(() => true);
    
    fireEvent.click(removeFriendButton);
    
    // ตรวจสอบว่ามีการเรียกใช้ API สำหรับลบเพื่อน
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/current@example.com/friends/'),
        expect.anything()
      );
    });
  });
});
