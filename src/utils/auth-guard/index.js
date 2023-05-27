import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthGuard = ({ children, id }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      return navigate("/login");
    }
  }, [id]);
  
  return id ? { ...children } : null;
};

export default AuthGuard;
