import React, { useState, useEffect } from "react";
import API from "../services/api";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Monitor,
  ShieldAlert,
  CheckCheck,
  RefreshCw,
  Plus,
} from "lucide-react";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State for Creating Alert
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [alertType, setAlertType] = useState("Screen Offline");
  const [severity, setSeverity] = useState("High");
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [alertRes, devRes] = await Promise.all([
        API.get("/alerts").catch(() => ({ data: { alerts: [] } })),
        API.get("/devices").catch(() => ({ data: { devices: [] } })),
      ]);

      setAlerts(alertRes.data.alerts || []);
      setDevices(devRes.data.devices || []);
      setError(null);
    } catch (err) {
      console.error("[Fetch Alerts Data Error]:", err);
      setError("Failed to load telemetry data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!deviceId || !alertType || !message.trim()) {
      alert("Please fill in all required alert fields.");
      return;
    }

    try {
      const payload = {
        deviceId,
        alertType,
        severity,
        message: message.trim(),
      };

      await API.post("/alerts/create", payload);
      alert("Telemetry alert triggered successfully!");
      setIsModalOpen(false);
      setDeviceId("");
      setAlertType("Screen Offline");
      setSeverity("High");
      setMessage("");
      fetchData();
    } catch (err) {
      console.error("[Create Alert Error]:", err);
      alert(err.response?.data?.message || "Failed to create alert.");
    }
  };

  const handleResolve = async (id) => {
    try {
      await API.put(`/alerts/resolve/${id}`);
      setAlerts(
        alerts.map((alt) =>
          alt._id === id ? { ...alt, isResolved: true } : alt,
        ),
      );
    } catch (err) {
      alert("Failed to resolve alert.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this alert log?"))
      return;
    try {
      await API.delete(`/alerts/${id}`);
      setAlerts(alerts.filter((alt) => alt._id !== id));
    } catch (err) {
      alert("Failed to delete alert.");
    }
  };

  const handleResolveAll = async () => {
    try {
      const unresolved = alerts.filter((a) => !a.isResolved);
      await Promise.all(
        unresolved.map((a) => API.put(`/alerts/resolve/${a._id}`)),
      );
      fetchData();
    } catch (err) {
      alert("Failed to resolve all alerts.");
    }
  };

  const unresolvedCount = alerts.filter((a) => !a.isResolved).length;
  const criticalCount = alerts.filter(
    (a) =>
      (a.severity === "Critical" || a.severity === "High") && !a.isResolved,
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            System & Telemetry Alerts
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Real-time hardware failure notifications, offline warnings, and
            custom diagnostic logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-orange-600/20 cursor-pointer"
          >
            <Plus size={16} /> Trigger New Alert
          </button>
          <button
            onClick={handleResolveAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#111827] hover:bg-[#1f2937] text-gray-200 border border-[#1f2937] rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <CheckCheck size={16} className="text-emerald-400" /> Mark All
            Resolved
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 bg-[#111827] hover:bg-[#1f2937] text-gray-400 hover:text-white border border-[#1f2937] rounded-xl transition cursor-pointer"
            title="Refresh Alerts"
          >
            <RefreshCw size={16} />
          </button>
        </div>
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
              Active Unresolved Alerts
            </p>
            <h3 className="text-2xl font-bold text-red-400 mt-1">
              {loading ? "..." : unresolvedCount}
            </h3>
          </div>
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
            <Bell size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Critical Hardware Issues
            </p>
            <h3 className="text-2xl font-bold text-orange-400 mt-1">
              {loading ? "..." : criticalCount}
            </h3>
          </div>
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
            <ShieldAlert size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Total Event Logs
            </p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {loading ? "..." : alerts.length}
            </h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Alerts List Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden shadow-md">
        <div className="p-5 border-b border-[#1f2937]">
          <h3 className="text-sm font-bold text-white">
            Live Notification Feed
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-[#1f2937] bg-[#0b0f19]/40">
                <th className="py-3.5 px-5 font-semibold">ALERT TYPE & ID</th>
                <th className="py-3.5 px-5 font-semibold">
                  TARGET SCREEN (REF)
                </th>
                <th className="py-3.5 px-5 font-semibold">
                  DIAGNOSTIC MESSAGE
                </th>
                <th className="py-3.5 px-5 font-semibold">SEVERITY</th>
                <th className="py-3.5 px-5 font-semibold">TIMESTAMP</th>
                <th className="py-3.5 px-5 font-semibold text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">
                    Loading live telemetry alerts...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">
                    No active alerts. All systems running smoothly!
                  </td>
                </tr>
              ) : (
                alerts.map((alt) => (
                  <tr
                    key={alt._id}
                    className={`hover:bg-[#1f2937]/30 transition ${!alt.isResolved ? "bg-orange-500/[0.02]" : ""}`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        {!alt.isResolved && (
                          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                        )}
                        {alt.alertType}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {alt._id}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-gray-200">
                        {alt.deviceId?.deviceName || "Unassigned Screen"}
                      </div>
                      <div className="text-[10px] text-orange-400 font-mono">
                        {alt.deviceId?.location ||
                          alt.deviceId?.city ||
                          "Remote Node"}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-300 max-w-sm">
                      {alt.message}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          alt.severity === "Critical" || alt.severity === "High"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : alt.severity === "Medium"
                              ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {alt.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-gray-400 font-mono">
                      {new Date(alt.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!alt.isResolved && (
                          <button
                            onClick={() => handleResolve(alt._id)}
                            title="Mark as Resolved"
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition cursor-pointer"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(alt._id)}
                          title="Delete Alert"
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trigger Alert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert size={18} className="text-orange-500" /> Trigger
                Manual Telemetry Alert
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Select Target Screen Node (*)
                </label>
                <select
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="">Choose Screen Node</option>
                  {devices.map((dev) => (
                    <option key={dev._id} value={dev._id}>
                      {dev.deviceName} ({dev.location || dev.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Alert Type (*)
                </label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer font-semibold text-orange-400"
                >
                  <option value="Screen Offline">Screen Offline</option>
                  <option value="Overheating">Overheating</option>
                  <option value="Playback Error">Playback Error</option>
                  <option value="Power Failure">Power Failure</option>
                  <option value="Sync Error">Sync Error</option>
                  <option value="Storage Alert">Storage Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer font-bold text-red-400"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Diagnostic Message (*)
                </label>
                <textarea
                  placeholder="e.g. Temperature reached 85°C near display unit."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={3}
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 resize-none"
                />
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
                  Trigger Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
