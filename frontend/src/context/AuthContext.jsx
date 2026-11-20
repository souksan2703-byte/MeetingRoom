
import { createContext, useContext, useState } from "react";
import api from "../services/api";

// ສ້າງ Context ສຳລັບຈັດການຜູ້ໃຊ້
const AuthContext = createContext(null);

// ສ້າງ Provider ເພື່ອໃຫ້ທຸກໜ້າໃຊ້ຂໍ້ມູນ Login ຮ່ວມກັນ
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  // ຟັງຊັນເຂົ້າລະບົບ
  const login = async (username, password) => {
    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        username,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "ບໍ່ສາມາດເຂົ້າລະບົບໄດ້",
      };
    } finally {
      setLoading(false);
    }
  };

  // ຟັງຊັນອອກຈາກລະບົບ
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ຟັງຊັນເອີ້ນໃຊ້ຂໍ້ມູນ Authentication
export function useAuth() {
  return useContext(AuthContext);
}
