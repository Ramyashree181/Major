import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(Boolean(token));
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setIsChecking(false);
        setIsAuthorized(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/customer/status",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Session verification failed"
          );
        }

        let storedUser = {};

        try {
          storedUser = JSON.parse(
            localStorage.getItem("user") || "{}"
          );
        } catch (error) {
          storedUser = {};
        }

        const refreshedUser = {
          ...storedUser,
          ...result.user,
          isBankCustomer: Boolean(result.isBankCustomer)
        };

        localStorage.setItem(
          "user",
          JSON.stringify(refreshedUser)
        );

        setIsAuthorized(true);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthorized(false);
      } finally {
        setIsChecking(false);
      }
    };

    verifySession();
  }, [token]);

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (isChecking) {
    return <div>Verifying session...</div>;
  }

  if (!isAuthorized) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;