
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  CalendarDays,
  DoorOpen,
  Users,
  Bell,
  FileText,
  Settings,
  LogOut,
  Languages
} from "lucide-react";
import { NavLink } from "react-router-dom";
import "./MainLayout.css";

function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();

  const language = i18n.language;
  const role = user?.role || user?.Role || "User";
  const isAdmin = role === "Admin";

  const menuItems = [
    { path: "/", icon: LayoutDashboard, lo: "ໜ້າຫຼັກ", en: "Dashboard" },
    { path: "/bookings", icon: CalendarDays, lo: "ການຈອງຫ້ອງ", en: "Bookings" },
    { path: "/rooms", icon: DoorOpen, lo: "ຫ້ອງປະຊຸມ", en: "Meeting Rooms" },
    ...(isAdmin
      ? [{ path: "/users", icon: Users, lo: "ຈັດການຜູ້ໃຊ້", en: "Users" }]
      : []),
    { path: "/notifications", icon: Bell, lo: "ການແຈ້ງເຕືອນ", en: "Notifications" },
    ...(isAdmin
      ? [{ path: "/reports", icon: FileText, lo: "ລາຍງານ", en: "Reports" }]
      : []),
    { path: "/settings", icon: Settings, lo: "ຕັ້ງຄ່າ", en: "Settings" }
  ];

  const getRoleName = () => {
    if (role === "Admin") return language === "lo" ? "ຜູ້ດູແລລະບົບ" : "Administrator";
    if (role === "Doctor") return language === "lo" ? "ທ່ານໝໍ" : "Doctor";
    if (role === "Staff") return language === "lo" ? "ເຈົ້າໜ້າທີ່" : "Staff";
    return role;
  };

  return (
    <div className="main-layout">
      <aside className="main-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <CalendarDays size={25} />
          </div>
          <div>
            <h2>Meeting Room</h2>
            <span>Management System</span>
          </div>
        </div>

        <div className="sidebar-menu-title">
          {language === "lo" ? "ເມນູຫຼັກ" : "MAIN MENU"}
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `sidebar-menu-item ${isActive ? "selected" : ""}`
                }
              >
                <Icon size={20} />
                <span>{language === "lo" ? item.lo : item.en}</span>
              </NavLink>
            );
          })}
        </nav>

        <button className="sidebar-logout" onClick={logout}>
          <LogOut size={19} />
          <span>{language === "lo" ? "ອອກຈາກລະບົບ" : "Logout"}</span>
        </button>
      </aside>

      <div className="main-layout-content">
        <header className="main-header">
          <div className="main-header-user">
            <div className="user-avatar">
              {(user?.fullName || user?.name || user?.username || "U")
                .charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <strong>{user?.fullName || user?.name || user?.username || "User"}</strong>
              <span>{getRoleName()}</span>
            </div>
          </div>

          <div className="dashboard-language">
            <Languages size={18} />
            <button
              type="button"
              className={language === "lo" ? "active" : ""}
              onClick={() => i18n.changeLanguage("lo")}
            >
              ລາວ
            </button>
            <button
              type="button"
              className={language === "en" ? "active" : ""}
              onClick={() => i18n.changeLanguage("en")}
            >
              EN
            </button>
          </div>
        </header>

        <main className="main-page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
