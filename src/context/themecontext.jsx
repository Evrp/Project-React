import React, { createContext, useContext, useEffect, useState } from "react";

// สร้าง context
const ThemeContext = createContext();

// สร้าง provider
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// hook เรียกใช้ theme ได้ง่าย ๆ
export const useTheme = () => useContext(ThemeContext);
