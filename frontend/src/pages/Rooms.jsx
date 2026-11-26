
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  DoorOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  MapPin,
  Wrench,
  X,
  RefreshCw
} from "lucide-react";
import api from "../services/api";
import "./Rooms.css";

function Rooms() {
  const { user } = useAuth();
  const { i18n } = useTranslation();

  const language = i18n.language;
  const isAdmin = (user?.role || user?.Role) === "Admin";

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    roomName: "",
    capacity: "",
    location: "",
    description: "",
    equipment: "",
    status: "Available"
  };

  const [form, setForm] = useState(emptyForm);

  // ດຶງລາຍການຫ້ອງປະຊຸມ
  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/rooms");

      if (response.data.success) {
        setRooms(response.data.data || []);
      }
    } catch (err) {
      console.error("Rooms error:", err);
      setError(
        err.response?.data?.message ||
        (language === "lo"
          ? "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຫ້ອງໄດ້"
          : "Unable to load rooms")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // ເປີດຟອມເພີ່ມຫ້ອງ
  const openAddModal = () => {
    setEditingRoom(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  // ເປີດຟອມແກ້ໄຂຫ້ອງ
  const openEditModal = (room) => {
    setEditingRoom(room);

    setForm({
      roomName: room.room_name || "",
      capacity: room.capacity || "",
      location: room.location || "",
      description: room.description || "",
      equipment: room.equipment || "",
      status: room.status || "Available"
    });

    setShowModal(true);
  };

  // ປ່ຽນຄ່າໃນຟອມ
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // ບັນທຶກຫ້ອງ
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.roomName.trim() || !form.capacity || Number(form.capacity) <= 0) {
      alert(
        language === "lo"
          ? "ກະລຸນາປ້ອນຊື່ຫ້ອງ ແລະ ຈຳນວນຄົນໃຫ້ຖືກຕ້ອງ"
          : "Please enter a room name and valid capacity"
      );
      return;
    }

    const roomData = {
      ...form,
      capacity: Number(form.capacity)
    };

    try {
      setSaving(true);

      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.room_id}`, roomData);
      } else {
        await api.post("/rooms", roomData);
      }

      setShowModal(false);
      setForm(emptyForm);
      setEditingRoom(null);

      await fetchRooms();

      alert(
        language === "lo"
          ? "ບັນທຶກຂໍ້ມູນສຳເລັດ"
          : "Room saved successfully"
      );
    } catch (err) {
      console.error("Save room error:", err);

      alert(
        err.response?.data?.message ||
        (language === "lo"
          ? "ບັນທຶກບໍ່ສຳເລັດ"
          : "Unable to save room")
      );
    } finally {
      setSaving(false);
    }
  };

  // ລຶບຫ້ອງ
  const handleDelete = async (room) => {
    const confirmed = window.confirm(
      language === "lo"
        ? `ທ່ານຕ້ອງການລຶບຫ້ອງ "${room.room_name}" ຫຼືບໍ່?`
        : `Are you sure you want to delete "${room.room_name}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/rooms/${room.room_id}`);
      await fetchRooms();

      alert(
        language === "lo"
          ? "ລຶບຫ້ອງສຳເລັດ"
          : "Room deleted successfully"
      );
    } catch (err) {
      console.error("Delete room error:", err);

      alert(
        err.response?.data?.message ||
        (language === "lo"
          ? "ລຶບຫ້ອງບໍ່ສຳເລັດ"
          : "Unable to delete room")
      );
    }
  };

  // ຄົ້ນຫາຫ້ອງ
  const filteredRooms = rooms.filter((room) => {
    const keyword = search.toLowerCase();

    return (
      String(room.room_name || "").toLowerCase().includes(keyword) ||
      String(room.location || "").toLowerCase().includes(keyword)
    );
  });

  // ຊື່ສະຖານະ
  const getStatusName = (status) => {
    const names = {
      Available: language === "lo" ? "ພ້ອມໃຊ້ງານ" : "Available",
      Maintenance: language === "lo" ? "ກຳລັງບຳລຸງຮັກສາ" : "Maintenance",
      Inactive: language === "lo" ? "ປິດໃຊ້ງານ" : "Inactive"
    };

    return names[status] || status;
  };

  return (
    <div className="rooms-page">

      {/* ຫົວຂໍ້ */}
      <div className="rooms-header">
        <div>
          <h1>
            {language === "lo" ? "ຈັດການຫ້ອງປະຊຸມ" : "Meeting Rooms"}
          </h1>
          <p>
            {language === "lo"
              ? "ຈັດການຂໍ້ມູນ ແລະ ສະຖານະຫ້ອງປະຊຸມ"
              : "Manage meeting rooms and their availability"}
          </p>
        </div>

        {isAdmin && (
          <button className="rooms-add-button" onClick={openAddModal}>
            <Plus size={19} />
            {language === "lo" ? "ເພີ່ມຫ້ອງ" : "Add Room"}
          </button>
        )}
      </div>

      {/* ສະຫຼຸບຈຳນວນຫ້ອງ */}
      <div className="rooms-summary">
        <div className="rooms-summary-card">
          <DoorOpen size={24} />
          <div>
            <span>{language === "lo" ? "ຫ້ອງທັງໝົດ" : "Total Rooms"}</span>
            <strong>{rooms.length}</strong>
          </div>
        </div>

        <div className="rooms-summary-card available">
          <DoorOpen size={24} />
          <div>
            <span>{language === "lo" ? "ພ້ອມໃຊ້ງານ" : "Available"}</span>
            <strong>{rooms.filter((r) => r.status === "Available").length}</strong>
          </div>
        </div>

        <div className="rooms-summary-card maintenance">
          <Wrench size={24} />
          <div>
            <span>{language === "lo" ? "ບຳລຸງຮັກສາ" : "Maintenance"}</span>
            <strong>{rooms.filter((r) => r.status === "Maintenance").length}</strong>
          </div>
        </div>

        <div className="rooms-summary-card inactive">
          <DoorOpen size={24} />
          <div>
            <span>{language === "lo" ? "ປິດໃຊ້ງານ" : "Inactive"}</span>
            <strong>{rooms.filter((r) => r.status === "Inactive").length}</strong>
          </div>
        </div>
      </div>

      {/* ຄົ້ນຫາ ແລະ Refresh */}
      <div className="rooms-toolbar">
        <div className="rooms-search">
          <Search size={19} />
          <input
            type="text"
            placeholder={
              language === "lo"
                ? "ຄົ້ນຫາຊື່ຫ້ອງ ຫຼື ສະຖານທີ່..."
                : "Search room name or location..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="rooms-refresh-button" onClick={fetchRooms}>
          <RefreshCw size={17} />
          {language === "lo" ? "ໂຫຼດຄືນ" : "Refresh"}
        </button>
      </div>

      {/* ລາຍການຫ້ອງ */}
      {loading ? (
        <div className="rooms-message">
          {language === "lo" ? "ກຳລັງໂຫຼດ..." : "Loading..."}
        </div>
      ) : error ? (
        <div className="rooms-message error">{error}</div>
      ) : filteredRooms.length === 0 ? (
        <div className="rooms-message">
          <DoorOpen size={42} />
          <p>
            {language === "lo"
              ? "ບໍ່ພົບຂໍ້ມູນຫ້ອງປະຊຸມ"
              : "No meeting rooms found"}
          </p>
        </div>
      ) : (
        <div className="rooms-grid">
          {filteredRooms.map((room) => (
            <div className="room-card" key={room.room_id}>
              <div className="room-card-top">
                <div className="room-card-icon">
                  <DoorOpen size={25} />
                </div>

                <span className={`room-status ${String(room.status).toLowerCase()}`}>
                  {getStatusName(room.status)}
                </span>
              </div>

              <h3>{room.room_name}</h3>

              <div className="room-detail">
                <Users size={17} />
                <span>
                  {room.capacity} {language === "lo" ? "ຄົນ" : "People"}
                </span>
              </div>

              <div className="room-detail">
                <MapPin size={17} />
                <span>{room.location || "-"}</span>
              </div>

              {room.description && (
                <p className="room-description">{room.description}</p>
              )}

              {room.equipment && (
                <div className="room-equipment">
                  <strong>
                    {language === "lo" ? "ອຸປະກອນ:" : "Equipment:"}
                  </strong>
                  <span>{room.equipment}</span>
                </div>
              )}

              {isAdmin && (
                <div className="room-card-actions">
                  <button
                    className="room-edit-button"
                    onClick={() => openEditModal(room)}
                  >
                    <Pencil size={16} />
                    {language === "lo" ? "ແກ້ໄຂ" : "Edit"}
                  </button>

                  <button
                    className="room-delete-button"
                    onClick={() => handleDelete(room)}
                  >
                    <Trash2 size={16} />
                    {language === "lo" ? "ລຶບ" : "Delete"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ຟອມເພີ່ມ / ແກ້ໄຂ */}
      {showModal && (
        <div className="rooms-modal-overlay">
          <div className="rooms-modal">
            <div className="rooms-modal-header">
              <h2>
                {editingRoom
                  ? language === "lo" ? "ແກ້ໄຂຫ້ອງປະຊຸມ" : "Edit Room"
                  : language === "lo" ? "ເພີ່ມຫ້ອງປະຊຸມ" : "Add Room"}
              </h2>

              <button
                type="button"
                className="rooms-modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="rooms-form-group">
                <label>{language === "lo" ? "ຊື່ຫ້ອງ *" : "Room Name *"}</label>
                <input
                  name="roomName"
                  value={form.roomName}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  placeholder={language === "lo" ? "ປ້ອນຊື່ຫ້ອງ" : "Enter room name"}
                />
              </div>

              <div className="rooms-form-group">
                <label>{language === "lo" ? "ຈຳນວນຄົນ *" : "Capacity *"}</label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  required
                  min="1"
                  step="1"
                  placeholder={language === "lo" ? "ຈຳນວນຄົນ" : "Number of people"}
                />
              </div>

              <div className="rooms-form-group">
                <label>{language === "lo" ? "ສະຖານທີ່" : "Location"}</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  maxLength={255}
                  placeholder={language === "lo" ? "ປ້ອນສະຖານທີ່" : "Enter location"}
                />
              </div>

              <div className="rooms-form-group">
                <label>{language === "lo" ? "ລາຍລະອຽດ" : "Description"}</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={500}
                  rows="3"
                />
              </div>

              <div className="rooms-form-group">
                <label>{language === "lo" ? "ອຸປະກອນ" : "Equipment"}</label>
                <textarea
                  name="equipment"
                  value={form.equipment}
                  onChange={handleChange}
                  maxLength={500}
                  rows="3"
                />
              </div>

              {editingRoom && (
                <div className="rooms-form-group">
                  <label>{language === "lo" ? "ສະຖານະ" : "Status"}</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="Available">
                      {language === "lo" ? "ພ້ອມໃຊ້ງານ" : "Available"}
                    </option>
                    <option value="Maintenance">
                      {language === "lo" ? "ກຳລັງບຳລຸງຮັກສາ" : "Maintenance"}
                    </option>
                    <option value="Inactive">
                      {language === "lo" ? "ປິດໃຊ້ງານ" : "Inactive"}
                    </option>
                  </select>
                </div>
              )}

              <div className="rooms-modal-actions">
                <button
                  type="button"
                  className="rooms-cancel-button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  {language === "lo" ? "ຍົກເລີກ" : "Cancel"}
                </button>

                <button
                  type="submit"
                  className="rooms-save-button"
                  disabled={saving}
                >
                  {saving
                    ? language === "lo" ? "ກຳລັງບັນທຶກ..." : "Saving..."
                    : language === "lo" ? "ບັນທຶກ" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rooms;
