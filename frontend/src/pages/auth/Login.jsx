
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import {
  CalendarDays,
  LockKeyhole,
  User,
  Eye,
  EyeOff,
  Languages,
} from "lucide-react";
import "./Login.css";

function Login() {
  const { t, i18n } = useTranslation();
  const { login, loading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ປ່ຽນພາສາ
  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  // ຈັດການການ Login
  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!username.trim() || !password) {
      setErrorMessage(
        i18n.language === "lo"
          ? "ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານ"
          : "Please enter username and password"
      );
      return;
    }

    const result = await login(username.trim(), password);

    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-language">
        <Languages size={18} />
        <button
          className={i18n.language === "lo" ? "active" : ""}
          onClick={() => changeLanguage("lo")}
          type="button"
        >
          ລາວ
        </button>
        <button
          className={i18n.language === "en" ? "active" : ""}
          onClick={() => changeLanguage("en")}
          type="button"
        >
          EN
        </button>
      </div>

      <div className="login-card">
        <div className="login-logo">
          <CalendarDays size={38} />
        </div>

        <h1>{t("appName")}</h1>
        <p className="login-welcome">{t("welcome")}</p>
        <p className="login-description">
          {i18n.language === "lo"
            ? "ກະລຸນາເຂົ້າລະບົບເພື່ອໃຊ້ງານ"
            : "Please sign in to continue"}
        </p>

        <form onSubmit={handleLogin}>
          <label>{t("username")}</label>
          <div className="login-input">
            <User size={19} />
            <input
              type="text"
              placeholder={t("username")}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </div>

          <label>{t("password")}</label>
          <div className="login-input">
            <LockKeyhole size={19} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("password")}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="show-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Show or hide password"
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          {errorMessage && (
            <div className="login-error">{errorMessage}</div>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading
              ? (i18n.language === "lo" ? "ກຳລັງເຂົ້າ..." : "Signing in...")
              : t("login")}
          </button>
        </form>

        <div className="login-footer">
          © 2026 Meeting Room Management System
        </div>
      </div>
    </div>
  );
}

export default Login;
