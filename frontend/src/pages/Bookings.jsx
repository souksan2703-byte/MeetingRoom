
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  Search,
  RefreshCw,
  Clock,
  DoorOpen,
  Users,
  FileText
} from "lucide-react";
import api from "../services/api";
import "./Bookings.css";

function Bookings() {
  const { i18n } = useTranslation();
  const language = i18n.language;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ດຶງລາຍການຈອງຈາກ Backend
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/bookings");

      if (response.data.success) {
        const data = response.data.data;
        setBookings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Bookings error:", err);

      setError(
        err.response?.data?.message ||
          (language === "lo"
            ? "ບໍ່ສາມາດດຶງລາຍການຈອງໄດ້"
            : "Unable to load bookings")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ຈັດຮູບແບບວັນທີ
  const formatDate = (date) => {
    if (!date) return "-";

    const dateText = String(date).slice(0, 10);
    const [year, month, day] = dateText.split("-");

    return year && month && day
      ? `${day}/${month}/${year}`
      : "-";
  };

  // ຈັດຮູບແບບເວລາ
  const formatTime = (time) => {
    if (!time) return "-";

    const timeText = String(time);

    if (timeText.includes("T")) {
      return timeText.substring(11, 16);
    }

    return timeText.substring(0, 5);
  };

  // ຊື່ສະຖານະ
  const getStatusName = (status) => {
    const names = {
      Pending: language === "lo" ? "ລໍຖ້າອະນຸມັດ" : "Pending",
      Approved: language === "lo" ? "ອະນຸມັດແລ້ວ" : "Approved",
      Rejected: language === "lo" ? "ຖືກປະຕິເສດ" : "Rejected"
    };

    return names[status] || status;
  };

  // ຄົ້ນຫາ ແລະ ກັ່ນຕອງ
  const filteredBookings = bookings.filter((booking) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      String(booking.meeting_title || "").toLowerCase().includes(keyword) ||
      String(booking.room_name || "").toLowerCase().includes(keyword) ||
      String(booking.booker_name || "").toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "All" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bookings-page">
      <div className="bookings-heading">
        <div>
          <h1>
            {language === "lo" ? "ຈັດການການຈອງຫ້ອງ" : "Manage Bookings"}
          </h1>
          <p>
            {language === "lo"
              ? "ກວດສອບ ແລະ ຕິດຕາມລາຍການຈອງຫ້ອງປະຊຸມ"
              : "View and manage meeting room bookings"}
          </p>
        </div>

        <button className="bookings-refresh" onClick={fetchBookings}>
          <RefreshCw size={18} />
          {language === "lo" ? "ໂຫຼດຂໍ້ມູນໃໝ່" : "Refresh"}
        </button>
      </div>

      <div className="bookings-summary">
        <div className="booking-summary-card">
          <CalendarDays size={23} />
          <div>
            <span>{language === "lo" ? "ການຈອງທັງໝົດ" : "Total Bookings"}</span>
            <strong>{bookings.length}</strong>
          </div>
        </div>

        <div className="booking-summary-card">
          <Clock size={23} />
          <div>
            <span>{language === "lo" ? "ລໍຖ້າອະນຸມັດ" : "Pending"}</span>
            <strong>{bookings.filter((b) => b.status === "Pending").length}</strong>
          </div>
        </div>

        <div className="booking-summary-card">
          <FileText size={23} />
          <div>
            <span>{language === "lo" ? "ອະນຸມັດແລ້ວ" : "Approved"}</span>
            <strong>{bookings.filter((b) => b.status === "Approved").length}</strong>
          </div>
        </div>

        <div className="booking-summary-card">
          <Users size={23} />
          <div>
            <span>{language === "lo" ? "ຖືກປະຕິເສດ" : "Rejected"}</span>
            <strong>{bookings.filter((b) => b.status === "Rejected").length}</strong>
          </div>
        </div>
      </div>

      <div className="bookings-toolbar">
        <div className="bookings-search">
          <Search size={19} />
          <input
            type="text"
            placeholder={
              language === "lo"
                ? "ຄົ້ນຫາຫົວຂໍ້ ຫຼື ຊື່ຫ້ອງ..."
                : "Search title or room..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">{language === "lo" ? "ທຸກສະຖານະ" : "All Status"}</option>
          <option value="Pending">{language === "lo" ? "ລໍຖ້າອະນຸມັດ" : "Pending"}</option>
          <option value="Approved">{language === "lo" ? "ອະນຸມັດແລ້ວ" : "Approved"}</option>
          <option value="Rejected">{language === "lo" ? "ຖືກປະຕິເສດ" : "Rejected"}</option>
        </select>
      </div>

      <div className="bookings-table-container">
        {loading ? (
          <div className="bookings-message">
            {language === "lo" ? "ກຳລັງໂຫຼດ..." : "Loading..."}
          </div>
        ) : error ? (
          <div className="bookings-message bookings-error">{error}</div>
        ) : filteredBookings.length === 0 ? (
          <div className="bookings-message">
            {language === "lo" ? "ບໍ່ພົບລາຍການຈອງ" : "No bookings found"}
          </div>
        ) : (
          <table className="bookings-table">
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
              {filteredBookings.map((booking) => (
                <tr key={booking.booking_id}>
                  <td>{booking.meeting_title}</td>
                  <td>
                    <span className="booking-room">
                      <DoorOpen size={16} />
                      {booking.room_name || "-"}
                    </span>
                  </td>
                  <td>{formatDate(booking.booking_date)}</td>
                  <td>
                    {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                  </td>
                  <td>
                    <span className={`booking-status ${String(booking.status).toLowerCase()}`}>
                      {getStatusName(booking.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Bookings;
