import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./firebase/Authcontext";
import { EventProvider } from "./context/eventcontext";
import { ThemeProvider } from "./context/themecontext";
// import App from './test/testtheconcert.jsx'
// import App from './test/test2.jsx'
import "./index.css";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <EventProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </EventProvider>
    </ThemeProvider>
  </React.StrictMode>
);
