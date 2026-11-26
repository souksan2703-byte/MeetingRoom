import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Users as UsersIcon,
  Search,
  RefreshCw,
  UserPlus,
  ShieldCheck,
  Stethoscope,
  UserRound,
  CheckCircle,
  XCircle,
  X,
  Save,
  Pencil,
} from "lucide-react";
import api from "../services/api";
import "./Users.css";

function Users() {
  const { i18n } = useTranslation();
  const isLao = i18n.language === "lo";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // ສະຖານະ Form ເພີ່ມຜູ້ໃຊ້
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // ກວດສອບວ່າກຳລັງເພີ່ມ ຫຼື ແກ້ໄຂ User
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    role: "Doctor",
  });

  // ດຶງລາຍຊື່ Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");

      setUsers(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      console.error("Fetch users error:", err);

      setError(
        err.response?.data?.message ||
          (isLao ? "ບໍ່ສາມາດດຶງລາຍຊື່ຜູ້ໃຊ້ໄດ້" : "Unable to load users"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ຈັດການການປ່ຽນແປງຂໍ້ມູນ Form
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ເປີດ Form
  const openModal = () => {
    setEditingUser(null);

    setFormData({
      fullName: "",
      username: "",
      email: "",
      password: "",
      phone: "",
      department: "",
      role: "Doctor",
    });

    setFormError("");
    setSuccessMessage("");
    setShowModal(true);
  };
  // ເປີດ Form ແກ້ໄຂ User
  const openEditModal = (user) => {
    setEditingUser(user);

    setFormData({
      fullName: user.full_name || "",
      username: user.username || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      department: user.department || "",
      role: user.role || "Doctor",
    });

    setFormError("");
    setSuccessMessage("");
    setShowModal(true);
  };

  // ປິດ Form
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setFormError("");
  };

  // ບັນທຶກຜູ້ໃຊ້ໃໝ່
  const handleAddUser = async (e) => {
    e.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (
      !formData.fullName.trim() ||
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      setFormError(
        isLao
          ? "ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຄົບ"
          : "Please fill in all required fields",
      );
      return;
    }

    if (formData.password.length < 8) {
      setFormError(
        isLao
          ? "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ"
          : "Password must be at least 8 characters",
      );
      return;
    }

    try {
      setSaving(true);

      const response = await api.post("/users", {
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        department: formData.department.trim(),
        role: formData.role,
      });

      if (response.data.success) {
        setShowModal(false);

        setFormData({
          fullName: "",
          username: "",
          email: "",
          password: "",
          phone: "",
          department: "",
          role: "Doctor",
        });

        setSuccessMessage(
          isLao ? "ເພີ່ມຜູ້ໃຊ້ສຳເລັດແລ້ວ" : "User added successfully",
        );

        await fetchUsers();
      } else {
        setFormError(
          response.data.message ||
            (isLao ? "ເພີ່ມຜູ້ໃຊ້ບໍ່ສຳເລັດ" : "Unable to add user"),
        );
      }
    } catch (err) {
      console.error("Add user error:", err);

      setFormError(
        err.response?.data?.message ||
          (isLao
            ? "ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່"
            : "Something went wrong. Please try again."),
      );
    } finally {
      setSaving(false);
    }
  };

  // ບັນທຶກການແກ້ໄຂ User
  const handleUpdateUser = async (e) => {
    e.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (
      !formData.fullName.trim() ||
      !formData.username.trim() ||
      !formData.email.trim()
    ) {
      setFormError(
        isLao
          ? "ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຄົບ"
          : "Please fill in all required fields",
      );
      return;
    }

    if (formData.password && formData.password.length < 8) {
      setFormError(
        isLao
          ? "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ"
          : "Password must be at least 8 characters",
      );
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(`/users/${editingUser.user_id}`, {
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        department: formData.department.trim(),
        role: formData.role,
      });

      if (response.data.success) {
        setShowModal(false);
        setEditingUser(null);

        setSuccessMessage(
          isLao ? "ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດແລ້ວ" : "User updated successfully",
        );

        await fetchUsers();
      } else {
        setFormError(
          response.data.message ||
            (isLao ? "ແກ້ໄຂຜູ້ໃຊ້ບໍ່ສຳເລັດ" : "Unable to update user"),
        );
      }
    } catch (err) {
      console.error("Update user error:", err);

      setFormError(
        err.response?.data?.message ||
          (isLao
            ? "ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່"
            : "Something went wrong. Please try again."),
      );
    } finally {
      setSaving(false);
    }
  };

  // ຄົ້ນຫາ ແລະ Filter
  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      (user.full_name || "").toLowerCase().includes(keyword) ||
      (user.username || "").toLowerCase().includes(keyword) ||
      (user.email || "").toLowerCase().includes(keyword) ||
      (user.department || "").toLowerCase().includes(keyword);

    const matchesRole = roleFilter === "All" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.is_active).length;
  const inactiveUsers = totalUsers - activeUsers;

  const roleIcon = (role) => {
    if (role === "Admin") return <ShieldCheck size={18} />;
    if (role === "Doctor") return <Stethoscope size={18} />;
    return <UserRound size={18} />;
  };

  const roleLabel = (role) => {
    if (isLao) {
      if (role === "Admin") return "ຜູ້ດູແລລະບົບ";
      if (role === "Doctor") return "ທ່ານໝໍ";
      if (role === "Staff") return "ພະນັກງານ";
    }

    return role;
  };

  return (
    <div className="users-page">
      <div className="users-page-header">
        <div>
          <h1>{isLao ? "ຈັດການຜູ້ໃຊ້" : "Users Management"}</h1>
          <p>
            {isLao
              ? "ຈັດການບັນຊີ ແລະ ສິດການເຂົ້າໃຊ້ງານ"
              : "Manage user accounts and access permissions"}
          </p>
        </div>

        <button className="users-primary-btn" type="button" onClick={openModal}>
          <UserPlus size={18} />
          {isLao ? "ເພີ່ມຜູ້ໃຊ້" : "Add User"}
        </button>
      </div>

      {successMessage && (
        <div className="users-success">
          <CheckCircle size={18} />
          {successMessage}
        </div>
      )}

      <div className="users-summary">
        <div className="users-summary-card">
          <div className="users-summary-icon total">
            <UsersIcon size={22} />
          </div>
          <div>
            <span>{isLao ? "ຜູ້ໃຊ້ທັງໝົດ" : "Total Users"}</span>
            <strong>{totalUsers}</strong>
          </div>
        </div>

        <div className="users-summary-card">
          <div className="users-summary-icon active">
            <CheckCircle size={22} />
          </div>
          <div>
            <span>{isLao ? "ກຳລັງໃຊ້ງານ" : "Active Users"}</span>
            <strong>{activeUsers}</strong>
          </div>
        </div>

        <div className="users-summary-card">
          <div className="users-summary-icon inactive">
            <XCircle size={22} />
          </div>
          <div>
            <span>{isLao ? "ປິດໃຊ້ງານ" : "Inactive Users"}</span>
            <strong>{inactiveUsers}</strong>
          </div>
        </div>
      </div>

      <div className="users-toolbar">
        <div className="users-search">
          <Search size={18} />
          <input
            type="text"
            placeholder={
              isLao
                ? "ຄົ້ນຫາຊື່, Username, Email..."
                : "Search name, username, email..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="All">{isLao ? "ທຸກສິດ" : "All Roles"}</option>
          <option value="Admin">Admin</option>
          <option value="Doctor">Doctor</option>
          <option value="Staff">Staff</option>
        </select>

        <button
          className="users-refresh-btn"
          type="button"
          onClick={fetchUsers}
          title={isLao ? "ໂຫຼດໃໝ່" : "Refresh"}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {error && <div className="users-error">{error}</div>}

      <div className="users-table-card">
        <div className="users-table-header">
          <h3>{isLao ? "ລາຍຊື່ຜູ້ໃຊ້" : "User List"}</h3>
          <span>
            {filteredUsers.length} {isLao ? "ບັນຊີ" : "users"}
          </span>
        </div>

        {loading ? (
          <div className="users-loading">
            {isLao ? "ກຳລັງໂຫຼດ..." : "Loading..."}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="users-empty">
            {isLao ? "ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້" : "No users found"}
          </div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>{isLao ? "ຊື່-ນາມສະກຸນ" : "Full Name"}</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>{isLao ? "ພະແນກ" : "Department"}</th>
                  <th>{isLao ? "ສິດ" : "Role"}</th>
                  <th>{isLao ? "ສະຖານະ" : "Status"}</th>
                  <th>{isLao ? "ຈັດການ" : "Actions"}</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td className="users-name-cell">{user.full_name}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.department || "-"}</td>
                    <td>
                      <span
                        className={`users-role-badge ${user.role?.toLowerCase()}`}
                      >
                        {roleIcon(user.role)}
                        {roleLabel(user.role)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`users-status-badge ${user.is_active ? "active" : "inactive"}`}
                      >
                        {user.is_active
                          ? isLao
                            ? "ໃຊ້ງານ"
                            : "Active"
                          : isLao
                            ? "ປິດໃຊ້ງານ"
                            : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {user.role !== "Admin" && (
                        <button
                          type="button"
                          className="users-edit-btn"
                          onClick={() => openEditModal(user)}
                          title={isLao ? "ແກ້ໄຂ" : "Edit"}
                        >
                          <Pencil size={16} />
                          {isLao ? "ແກ້ໄຂ" : "Edit"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal ເພີ່ມຜູ້ໃຊ້ */}
      {showModal && (
        <div className="users-modal-overlay">
          <div className="users-modal">
            <div className="users-modal-header">
              <div>
                <h2>
                  {editingUser
                    ? isLao
                      ? "ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້"
                      : "Edit User"
                    : isLao
                      ? "ເພີ່ມຜູ້ໃຊ້ໃໝ່"
                      : "Add New User"}
                </h2>

                <p>
                  {editingUser
                    ? isLao
                      ? "ປັບປຸງຂໍ້ມູນບັນຊີຜູ້ໃຊ້"
                      : "Update user account information"
                    : isLao
                      ? "ກະລຸນາປ້ອນຂໍ້ມູນບັນຊີ"
                      : "Enter the new user account information"}
                </p>
              </div>

              <button
                type="button"
                className="users-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={editingUser ? handleUpdateUser : handleAddUser}>
              <div className="users-modal-body">
                {formError && <div className="users-error">{formError}</div>}

                <div className="users-form-grid">
                  <div className="users-form-group">
                    <label>{isLao ? "ຊື່-ນາມສະກຸນ" : "Full Name"} *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      placeholder={
                        isLao ? "ປ້ອນຊື່-ນາມສະກຸນ" : "Enter full name"
                      }
                      required
                    />
                  </div>

                  <div className="users-form-group">
                    <label>Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleFormChange}
                      placeholder="Enter username"
                      required
                    />
                  </div>

                  <div className="users-form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="example@email.com"
                      required
                    />
                  </div>

                  <div className="users-form-group">
                    <label>
                      {isLao ? "ລະຫັດຜ່ານໃໝ່" : "New Password"}
                      {editingUser ? "" : " *"}
                    </label>

                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder={
                        editingUser
                          ? isLao
                            ? "ປ່ອຍຫວ່າງຖ້າບໍ່ປ່ຽນ"
                            : "Leave blank to keep current password"
                          : isLao
                            ? "ປ້ອນລະຫັດຜ່ານ"
                            : "Enter password"
                      }
                      minLength={8}
                      required={!editingUser}
                    />
                  </div>

                  <div className="users-form-group">
                    <label>{isLao ? "ເບີໂທລະສັບ" : "Phone"}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="020XXXXXXXX"
                    />
                  </div>

                  <div className="users-form-group">
                    <label>{isLao ? "ພະແນກ" : "Department"}</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleFormChange}
                      placeholder={isLao ? "ປ້ອນຊື່ພະແນກ" : "Enter department"}
                    />
                  </div>

                  <div className="users-form-group full-width">
                    <label>{isLao ? "ສິດການໃຊ້ງານ" : "User Role"} *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="Doctor">
                        {isLao ? "ທ່ານໝໍ (Doctor)" : "Doctor"}
                      </option>
                      <option value="Staff">
                        {isLao ? "ພະນັກງານ (Staff)" : "Staff"}
                      </option>
                    </select>
                  </div>
                </div>

                <p className="users-form-note">
                  * {isLao ? "ຂໍ້ມູນທີ່ຈຳເປັນຕ້ອງປ້ອນ" : "Required fields"}
                </p>
              </div>

              <div className="users-modal-footer">
                <button
                  type="button"
                  className="users-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  {isLao ? "ຍົກເລີກ" : "Cancel"}
                </button>

                <button
                  type="submit"
                  className="users-save-btn"
                  disabled={saving}
                >
                  <Save size={17} />
                  {saving
                    ? isLao
                      ? "ກຳລັງບັນທຶກ..."
                      : "Saving..."
                    : editingUser
                      ? isLao
                        ? "ບັນທຶກການແກ້ໄຂ"
                        : "Save Changes"
                      : isLao
                        ? "ບັນທຶກ"
                        : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
