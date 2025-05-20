// components/RequireLogin.jsx
import { Button } from "@/components/ui";
import { useNavigate } from "react-router-dom";

const RequireLogin = ({ children }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const userPhoto = localStorage.getItem("userPhoto");

  if (!userName || !userPhoto) {
    return (
      <div className="container-profile">
        <div className="text-center mt-10 w-full">
          <h2 className="text-xl font-semibold">
            กรุณาเข้าสู่ระบบก่อนเข้าใช้งาน
          </h2>
          <Button className="mt-4" onClick={() => navigate("/login")}>
            ไปหน้าเข้าสู่ระบบ
          </Button>
        </div>
      </div>
    );
  }

  return children;
};

export default RequireLogin;
