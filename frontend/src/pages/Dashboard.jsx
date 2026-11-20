
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  DoorOpen,
  Users,
  Bell
} from "lucide-react";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const { user } = useAuth();
  const { i18n } = useTranslation();

  const language = i18n.language;
  const role = user?.role || user?.Role || "User";
  const isAdmin = role === "Admin";

  // ເກັບຂໍ້ມູນ Dashboard
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ດຶງຂໍ້ມູນຈາກ Backend
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/dashboard");

        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.response?.data?.message || "LOAD_ERROR");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ປ່ຽນຮູບແບບວັນທີ
  const formatDate = (date) => {
    if (!date) return "-";

    const dateText = String(date).slice(0, 10);
    const [year, month, day] = dateText.split("-");

    if (!year || !month || !day) return "-";

    return `${day}/${month}/${year}`;
  };

  // ປ່ຽນຮູບແບບເວລາ
  const formatTime = (time) => {
    if (!time) return "-";

    const timeText = String(time);

    if (timeText.includes("T")) {
      return timeText.substring(11, 16);
    }

    return timeText.substring(0, 5);
  };

  // ປ່ຽນຊື່ສະຖານະ
  const getStatusName = (status) => {
    const statuses = {
      Pending: language === "lo" ? "ລໍຖ້າອະນຸມັດ" : "Pending",
      Approved: language === "lo" ? "ອະນຸມັດແລ້ວ" : "Approved",
      Rejected: language === "lo" ? "ຖືກປະຕິເສດ" : "Rejected"
    };

    return statuses[status] || status;
  };

  // ຂໍ້ມູນສະຖິຕິ
  const stats = dashboardData
    ? [
        {
          icon: DoorOpen,
          color: "blue",
          label: language === "lo" ? "ຫ້ອງປະຊຸມທັງໝົດ" : "Total Rooms",
          value: dashboardData.totalRooms ?? 0
        },
        {
          icon: CalendarDays,
          color: "green",
          label: language === "lo" ? "ການຈອງທັງໝົດ" : "Total Bookings",
          value: dashboardData.totalBookings ?? 0
        },
        {
          icon: Bell,
          color: "orange",
          label: language === "lo" ? "ລໍຖ້າອະນຸມັດ" : "Pending Bookings",
          value: dashboardData.pendingBookings ?? 0
        },
        isAdmin
          ? {
              icon: Users,
              color: "purple",
              label: language === "lo" ? "ຜູ້ໃຊ້ລະບົບ" : "Total Users",
              value: dashboardData.totalUsers ?? 0
            }
          : {
              icon: CalendarDays,
              color: "purple",
              label: language === "lo" ? "ອະນຸມັດແລ້ວ" : "Approved Bookings",
              value: dashboardData.approvedBookings ?? 0
            }
      ]
    : [];

  return (
    <div className="dashboard-content">

      {/* ສ່ວນຕ້ອນຮັບ */}
      <div className="dashboard-page-heading">
        <div>
          <h1>{language === "lo" ? "ໜ້າຫຼັກ" : "Dashboard"}</h1>
          <p>
            {language === "lo"
              ? "ພາບລວມລະບົບຈັດການຫ້ອງປະຊຸມ"
              : "Meeting Room Management Overview"}
          </p>
        </div>
      </div>

      <div className="dashboard-welcome">
        <div>
          <h2>{language === "lo" ? "ຍິນດີຕ້ອນຮັບ" : "Welcome"}</h2>
          <p>
            {language === "lo"
              ? "ຂໍໃຫ້ທ່ານໃຊ້ງານລະບົບຢ່າງສະດວກ"
              : "Welcome to Meeting Room Management System"}
          </p>
        </div>
        <CalendarDays size={48} />
      </div>

      <div className="dashboard-section-heading">
        <h2>{language === "lo" ? "ພາບລວມຂໍ້ມູນ" : "Overview"}</h2>
      </div>

      {loading ? (
        <div className="dashboard-empty">
          <p>
            {language === "lo"
              ? "ກຳລັງໂຫຼດຂໍ້ມູນ..."
              : "Loading data..."}
          </p>
        </div>
      ) : error ? (
        <div className="dashboard-empty">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="dashboard-stat-grid">
            {stats.map((item, index) => {
              const Icon = item.icon;

              return (
                <div className="dashboard-stat-card" key={index}>
                  <div className={`stat-icon ${item.color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="dashboard-section-heading">
            <h2>
              {language === "lo"
                ? "ການຈອງຫ້ອງລ່າສຸດ"
                : "Recent Bookings"}
            </h2>
          </div>

          {dashboardData?.recentBookings?.length > 0 ? (
            <div className="dashboard-recent">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>{language === "lo" ? "ຫົວຂໍ້ປະຊຸມ" : "Meeting Title"}</th>
                    <th>{language === "lo" ? "ຫ້ອງປະຊຸມ" : "Room"}</th>
                    <th>{language === "lo" ? "ວັນທີ" : "Date"}</th>
                    <th>{language === "lo" ? "ເວລາ" : "Time"}</th>
                    <th>{language === "lo" ? "ສະຖານະ" : "Status"}</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboardData.recentBookings.map((booking) => (
                    <tr key={booking.booking_id}>
                      <td>{booking.meeting_title}</td>
                      <td>{booking.room_name}</td>
                      <td>{formatDate(booking.booking_date)}</td>
                      <td>
                        {formatTime(booking.start_time)} -{" "}
                        {formatTime(booking.end_time)}
                      </td>
                      <td>
                        <span
                          className={`booking-status ${String(
                            booking.status
                          ).toLowerCase()}`}
                        >
                          {getStatusName(booking.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dashboard-empty">
              <CalendarDays size={42} />
              <h3>
                {language === "lo"
                  ? "ຍັງບໍ່ມີລາຍການຈອງ"
                  : "No bookings yet"}
              </h3>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
