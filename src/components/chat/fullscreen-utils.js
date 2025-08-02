// Fullscreen utilities for Chat components
// ฟังก์ชันสำหรับจัดการการแสดงผลแบบเต็มจอ

/**
 * Toggle fullscreen mode for any container
 * @param {string} containerId - ID of the container element
 * @param {string} containerClass - Class name of the container (user-container, chat-container, chat-container-ai)
 */
export const toggleFullscreen = (containerId, containerClass) => {
  const container = document.getElementById(containerId);
  const body = document.body;
  
  if (!container) {
    console.error(`Container with ID ${containerId} not found`);
    return;
  }
  
  const isFullscreen = container.classList.contains('fullscreen');
  
  if (isFullscreen) {
    // Exit fullscreen
    container.classList.remove('fullscreen');
    body.classList.remove('fullscreen-open');
    removeFullscreenHeader(container);
    removeBackdrop();
  } else {
    // Enter fullscreen
    container.classList.add('fullscreen');
    body.classList.add('fullscreen-open');
    addFullscreenHeader(container, containerClass);
    addBackdrop(() => toggleFullscreen(containerId, containerClass));
  }
};

/**
 * Add fullscreen header with close button
 * @param {HTMLElement} container - Container element
 * @param {string} containerType - Type of container
 */
const addFullscreenHeader = (container, containerType) => {
  // Remove existing header if any
  removeFullscreenHeader(container);
  
  const header = document.createElement('div');
  header.className = 'fullscreen-header';
  
  const title = document.createElement('h2');
  title.className = 'fullscreen-title';
  
  // Set title based on container type
  switch (containerType) {
    case 'user-container':
      title.textContent = 'รายชื่อผู้ใช้';
      break;
    case 'chat-container':
      title.textContent = 'แชท';
      break;
    case 'chat-container-ai':
      title.textContent = 'แชท AI';
      break;
    default:
      title.textContent = 'แชท';
  }
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'fullscreen-close-btn';
  closeBtn.innerHTML = '×';
  closeBtn.onclick = () => {
    const containerId = container.id;
    toggleFullscreen(containerId, containerType);
  };
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  container.insertBefore(header, container.firstChild);
};

/**
 * Remove fullscreen header
 * @param {HTMLElement} container - Container element
 */
const removeFullscreenHeader = (container) => {
  const existingHeader = container.querySelector('.fullscreen-header');
  if (existingHeader) {
    existingHeader.remove();
  }
};

/**
 * Add backdrop for fullscreen mode
 * @param {Function} closeCallback - Function to call when backdrop is clicked
 */
const addBackdrop = (closeCallback) => {
  // Remove existing backdrop if any
  removeBackdrop();
  
  const backdrop = document.createElement('div');
  backdrop.className = 'fullscreen-backdrop active';
  backdrop.onclick = closeCallback;
  
  document.body.appendChild(backdrop);
};

/**
 * Remove backdrop
 */
const removeBackdrop = () => {
  const existingBackdrop = document.querySelector('.fullscreen-backdrop');
  if (existingBackdrop) {
    existingBackdrop.classList.remove('active');
    setTimeout(() => {
      existingBackdrop.remove();
    }, 300);
  }
};

/**
 * Auto-enter fullscreen on mobile devices
 * @param {string} containerId - ID of the container element
 * @param {string} containerClass - Class name of the container
 */
export const autoFullscreenOnMobile = (containerId, containerClass) => {
  if (window.innerWidth <= 768) {
    toggleFullscreen(containerId, containerClass);
  }
};

/**
 * Initialize fullscreen click handlers
 * ใช้ฟังก์ชันนี้เพื่อเพิ่ม event listener ให้กับ container
 */
export const initializeFullscreenHandlers = () => {
  // User container click handler
  const userContainer = document.querySelector('.user-container');
  if (userContainer) {
    userContainer.addEventListener('click', (e) => {
      // Prevent triggering when clicking on specific elements
      if (!e.target.closest('.search-con') && !e.target.closest('.user-item')) {
        toggleFullscreen(userContainer.id || 'user-container', 'user-container');
      }
    });
  }
  
  // Chat container click handler
  const chatContainer = document.querySelector('.chat-container');
  if (chatContainer) {
    chatContainer.addEventListener('click', (e) => {
      // Prevent triggering when clicking on input or messages
      if (!e.target.closest('.chat-input-container') && !e.target.closest('.chat-box')) {
        toggleFullscreen(chatContainer.id || 'chat-container', 'chat-container');
      }
    });
  }
  
  // Chat AI container click handler
  const chatAIContainer = document.querySelector('.chat-container-ai');
  if (chatAIContainer) {
    chatAIContainer.addEventListener('click', (e) => {
      // Prevent triggering when clicking on input or messages
      if (!e.target.closest('.chat-input-container') && !e.target.closest('.chat-box-ai')) {
        toggleFullscreen(chatAIContainer.id || 'chat-container-ai', 'chat-container-ai');
      }
    });
  }
};

/**
 * React Hook for fullscreen functionality
 * สำหรับใช้ใน React components
 */
export const useFullscreen = (containerRef, containerType) => {
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const isFullscreen = container.classList.contains('fullscreen');
    
    if (isFullscreen) {
      container.classList.remove('fullscreen');
      document.body.classList.remove('fullscreen-open');
      removeFullscreenHeader(container);
      removeBackdrop();
    } else {
      container.classList.add('fullscreen');
      document.body.classList.add('fullscreen-open');
      addFullscreenHeader(container, containerType);
      addBackdrop(() => toggleFullscreen());
    }
  };
  
  return {
    toggleFullscreen,
    isFullscreen: containerRef.current?.classList.contains('fullscreen') || false
  };
};

// Export default object with all utilities
export default {
  toggleFullscreen,
  autoFullscreenOnMobile,
  initializeFullscreenHandlers,
  useFullscreen
};
