import React, { useState, useEffect } from "react";
import API from "../services/api";
import {
  Users,
  Plus,
  Shield,
  Mail,
  Trash2,
  UserCheck,
  RefreshCw,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Editor");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users");
      setUsers(res.data.users || []);
      setError(null);
    } catch (err) {
      console.error("[Fetch Users Error]:", err);
      setError("Failed to load user list from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert("Please fill in all required fields including password.");
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        status: "Active",
      };

      await API.post("/users/add", payload);
      alert("User account created successfully!");
      setIsModalOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("Editor");
      fetchUsers();
    } catch (err) {
      console.error("[Add User Error]:", err);
      alert(err.response?.data?.message || "Failed to create user account.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
      alert("User deleted successfully.");
    } catch (err) {
      alert("Failed to delete user account.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Users & Role Access Control (RBAC)
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage system accounts, staff permissions, and security credentials
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-orange-600/20 cursor-pointer"
        >
          <Plus size={16} /> Add New User
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Total Accounts
            </p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {loading ? "..." : users.length}
            </h3>
          </div>
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Super Admins / Admins
            </p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
              {
                users.filter(
                  (u) => u.role === "Super Admin" || u.role === "Admin",
                ).length
              }
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Shield size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Editors & Viewers
            </p>
            <h3 className="text-2xl font-bold text-blue-400 mt-1">
              {
                users.filter(
                  (u) =>
                    u.role === "Editor" ||
                    u.role === "Viewer" ||
                    u.role === "Operations",
                ).length
              }
            </h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <UserCheck size={22} />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden shadow-md">
        <div className="p-5 border-b border-[#1f2937] flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">
            System User Profiles & Permissions
          </h3>
          <button
            onClick={fetchUsers}
            className="p-2 bg-[#0b0f19] hover:bg-[#1f2937] text-gray-400 hover:text-white rounded-xl border border-[#1f2937] transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-[#1f2937] bg-[#0b0f19]/40">
                <th className="py-3.5 px-5 font-semibold">USER ID & NAME</th>
                <th className="py-3.5 px-5 font-semibold">EMAIL ADDRESS</th>
                <th className="py-3.5 px-5 font-semibold">
                  ACCESS ROLE (RBAC)
                </th>
                <th className="py-3.5 px-5 font-semibold">LAST LOGIN</th>
                <th className="py-3.5 px-5 font-semibold">STATUS</th>
                <th className="py-3.5 px-5 font-semibold text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-400">
                    No users found. Click "Add New User".
                  </td>
                </tr>
              ) : (
                users.map((usr) => (
                  <tr
                    key={usr._id}
                    className="hover:bg-[#1f2937]/30 transition"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-white">{usr.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {usr._id}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-300 flex items-center gap-1.5 pt-4">
                      <Mail size={12} className="text-gray-400" /> {usr.email}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          usr.role === "Super Admin"
                            ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                            : usr.role === "Admin"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-gray-400 font-mono">
                      {usr.lastLogin
                        ? new Date(usr.lastLogin).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          usr.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {usr.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleDelete(usr._id)}
                        title="Delete User"
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition cursor-pointer inline-block"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-orange-500" /> Create System
                User
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Full Name (*)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Email Address (*)
                </label>
                <input
                  type="email"
                  placeholder="e.g. rahul@theadbook.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Password (*)
                </label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Assign Role (RBAC)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="Super Admin">
                    Super Admin (Full Control)
                  </option>
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor (Upload & Schedule)</option>
                  <option value="Viewer">Viewer (Reports Only)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#0b0f19] text-gray-300 border border-[#1f2937] rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-orange-600/20 cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
