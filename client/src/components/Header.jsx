import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  Bell,
  Calendar,
  ChevronDown,
  LogOut,
  User,
  CheckCircle2,
  X,
  Filter,
} from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import API from "../services/api";

export default function Header({ onToggleSidebar, user: propUser, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false); // ⚡ Calendar Modal State

  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Calendar Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const storeUser = useAuthStore((state) => state.user);
  const logoutStore = useAuthStore((state) => state.logout);

  const currentUser = propUser || storeUser;

  // Fetch live alerts from backend
  const fetchAlerts = async () => {
    try {
      const res = await API.get("/alerts");
      const fetchedAlerts = res.data.alerts || [];
      setAlerts(fetchedAlerts);
      const unresolved = fetchedAlerts.filter((a) => !a.isResolved).length;
      setUnreadCount(unresolved);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResolveAlert = async (id) => {
    try {
      await API.put(`/alerts/resolve/${id}`);
      fetchAlerts();
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  const handleApplyDateFilter = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    alert(
      `Filtering system telemetry & schedules from ${startDate} to ${endDate}`,
    );
    setCalendarModalOpen(false);
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logoutStore();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="h-20 border-b border-[#1f2937] flex items-center justify-between px-8 bg-[#0b0f19] sticky top-0 z-20 shrink-0">
      {/* Left side: Hamburger Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="text-gray-400 hover:text-white transition p-2 rounded-xl hover:bg-[#1f2937]/60 cursor-pointer"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Right side: Notifications, Calendar, & User Profile */}
      <div className="flex items-center gap-4">
        {/* Live Notification Bell & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2.5 text-gray-300 hover:text-white bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] rounded-xl relative transition shadow-sm cursor-pointer"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl py-3 z-50">
              <div className="px-4 pb-2 border-b border-[#1f2937] flex justify-between items-center">
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  System Alerts
                </p>
                <span className="text-[10px] text-orange-400 font-semibold">
                  {unreadCount} Unread
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#1f2937]/50">
                {alerts.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No notifications found.
                  </p>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert._id}
                      className={`p-3 text-xs transition ${alert.isResolved ? "opacity-50 bg-[#0b0f19]/30" : "hover:bg-[#1f2937]/40"}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span
                          className={`font-bold ${alert.severity === "Critical" ? "text-red-400" : "text-orange-400"}`}
                        >
                          {alert.alertType}
                        </span>
                        {!alert.isResolved ? (
                          <button
                            onClick={() => handleResolveAlert(alert._id)}
                            className="text-[10px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 size={10} /> Resolve
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-500 font-medium">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 mt-1">{alert.message}</p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {new Date(alert.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ⚡ Calendar Icon Button with Click Handler */}
        <button
          onClick={() => setCalendarModalOpen(true)}
          className="p-2.5 text-gray-300 hover:text-white bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] rounded-xl transition shadow-sm cursor-pointer"
          title="Filter by Schedule Date Range"
        >
          <Calendar size={18} />
        </button>

        {/* User Profile & Dropdown Menu */}
        <div
          className="relative pl-4 border-l border-[#1f2937]"
          ref={dropdownRef}
        >
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 cursor-pointer group py-1"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-md ring-2 ring-orange-500/20">
              {currentUser?.name ? (
                currentUser.name.charAt(0)
              ) : (
                <User size={20} />
              )}
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-white tracking-tight group-hover:text-orange-400 transition">
                  {currentUser?.name || "Admin User"}
                </p>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                {currentUser?.role || "Super Admin"}
              </p>
            </div>
          </div>

          {/* Dropdown Box for Logout */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-[#1f2937] mb-1">
                <p className="text-xs font-semibold text-white">
                  {currentUser?.name || "Admin User"}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {currentUser?.email || "admin@theadbook.com"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition cursor-pointer"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ⚡ Calendar Date Range Modal */}
      {calendarModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar size={18} className="text-orange-500" /> Filter
                Schedules & Logs
              </h3>
              <button
                onClick={() => setCalendarModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyDateFilter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Start Date (*)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  End Date (*)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCalendarModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#0b0f19] text-gray-300 border border-[#1f2937] rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-orange-600/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Filter size={14} /> Apply Filter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
