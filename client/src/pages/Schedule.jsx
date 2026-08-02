import React, { useState, useEffect } from "react";
import API from "../services/api";
import {
  Calendar,
  Plus,
  Clock,
  Monitor,
  Building2,
  Trash2,
  Layers,
  CheckCircle2,
  RefreshCw,
  FileText,
  Edit3,
} from "lucide-react";

export default function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [devices, setDevices] = useState([]);
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & Edit States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentScheduleId, setCurrentScheduleId] = useState(null);

  // Form States
  const [scheduleName, setScheduleName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [creativeName, setCreativeName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [status, setStatus] = useState("Active");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schRes, devRes, mediaRes] = await Promise.all([
        API.get("/schedules").catch(() => ({ data: { schedules: [] } })),
        API.get("/devices").catch(() => ({ data: { devices: [] } })),
        API.get("/media").catch(() => ({ data: { mediaFiles: [] } })),
      ]);

      setSchedules(schRes.data.schedules || []);
      setDevices(devRes.data.devices || []);
      setCreatives(mediaRes.data.mediaFiles || []);
      setError(null);
    } catch (err) {
      console.error("[Fetch Schedule Data Error]:", err);
      setError("Failed to load scheduling data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEdit = (sch) => {
    setIsEditMode(true);
    setCurrentScheduleId(sch._id);
    setScheduleName(sch.scheduleName || "");
    setDeviceId(sch.deviceId?._id || sch.deviceId || "");
    setCreativeName(sch.creativeName || "");
    setStartDate(sch.startDate ? sch.startDate.slice(0, 10) : "");
    setEndDate(sch.endDate ? sch.endDate.slice(0, 10) : "");
    setStartTime(sch.startTime || "09:00");
    setEndTime(sch.endTime || "18:00");
    setStatus(sch.status || "Active");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentScheduleId(null);
    setScheduleName("");
    setDeviceId("");
    setCreativeName("");
    setStartDate("");
    setEndDate("");
    setStartTime("09:00");
    setEndTime("18:00");
    setStatus("Active");
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (
      !scheduleName ||
      !deviceId ||
      !creativeName ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        scheduleName: scheduleName.trim(),
        deviceId,
        creativeName,
        startDate,
        endDate,
        startTime,
        endTime,
        status,
      };

      if (isEditMode && currentScheduleId) {
        await API.put(`/schedules/${currentScheduleId}`, payload);
        alert("Schedule rule updated successfully!");
      } else {
        await API.post("/schedules/create", payload);
        alert("Schedule rule created successfully!");
      }

      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error("[Schedule Save Error]:", err);
      alert(
        err.response?.data?.message || "Failed to process schedule action.",
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule rule?"))
      return;
    try {
      await API.delete(`/schedules/${id}`);
      setSchedules(schedules.filter((s) => s._id !== id));
      alert("Schedule deleted successfully.");
    } catch (err) {
      alert("Failed to delete schedule.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Scheduling & Time-Grid Engine
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Time-based triggers and direct creative media assignments
          </p>
        </div>

        <button
          onClick={() => {
            handleCloseModal();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-orange-600/20 cursor-pointer"
        >
          <Plus size={16} /> Create Schedule Rule
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Active Rules
            </p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {loading ? "..." : schedules.length} Rules
            </h3>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <Calendar size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Conflict Resolution
            </p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
              Time Grid Sync
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Automated backend validation
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Offline Fallback
            </p>
            <h3 className="text-2xl font-bold text-blue-400 mt-1">
              Cached Loop
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Last-known local schedule
            </p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Clock size={22} />
          </div>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden shadow-md">
        <div className="p-5 border-b border-[#1f2937] flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">
            Active Time-Grid Playback Rules
          </h3>
          <button
            onClick={fetchData}
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
                <th className="py-3.5 px-5 font-semibold">
                  SCHEDULE NAME & ID
                </th>
                <th className="py-3.5 px-5 font-semibold">
                  TARGET SCREEN NODE
                </th>
                <th className="py-3.5 px-5 font-semibold">CREATIVE ASSET</th>
                <th className="py-3.5 px-5 font-semibold">
                  DATE & TIME WINDOW
                </th>
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
                    Loading schedules...
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-400">
                    No schedules found. Click "Create Schedule Rule".
                  </td>
                </tr>
              ) : (
                schedules.map((sch) => (
                  <tr
                    key={sch._id}
                    className="hover:bg-[#1f2937]/30 transition"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Layers size={14} className="text-orange-500" />{" "}
                        {sch.scheduleName}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {sch._id}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-300 font-medium">
                      <div className="flex items-center gap-1">
                        <Building2 size={13} className="text-blue-400" />{" "}
                        {sch.deviceId?.deviceName || "Assigned Screen"}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {sch.deviceId?.location || sch.deviceId?.city}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-yellow-400">
                      <span className="flex items-center gap-1.5 bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-[#1f2937] w-fit">
                        <FileText size={13} /> {sch.creativeName}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-gray-300 font-mono">
                      <div className="text-[10px] text-gray-400">
                        {sch.startDate?.slice(0, 10)} to{" "}
                        {sch.endDate?.slice(0, 10)}
                      </div>
                      <div className="font-semibold text-white mt-0.5 flex items-center gap-1">
                        <Clock size={11} className="text-orange-500" />{" "}
                        {sch.startTime} - {sch.endTime}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          sch.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}
                      >
                        {sch.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(sch)}
                          title="Edit Schedule"
                          className="p-1.5 bg-[#0b0f19] hover:bg-[#1f2937] text-blue-400 rounded-lg border border-[#1f2937] transition cursor-pointer"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(sch._id)}
                          title="Delete Schedule"
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar size={18} className="text-orange-500" />{" "}
                {isEditMode
                  ? "Edit Time-Grid Schedule"
                  : "Create Time-Grid Schedule"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Schedule Rule Name (*)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning Retail Loop"
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Target Screen Node (*)
                </label>
                <select
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="">Select Screen Node</option>
                  {devices.map((dev) => (
                    <option key={dev._id} value={dev._id}>
                      {dev.deviceName} ({dev.location || dev.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Creative Media Asset (From Vault) (*)
                </label>
                <select
                  value={creativeName}
                  onChange={(e) => setCreativeName(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer font-mono text-yellow-400"
                >
                  <option value="">Select Creative Asset</option>
                  {creatives.map((media) => (
                    <option
                      key={media._id}
                      value={media.title || media.fileName}
                    >
                      {media.title} ({media.fileName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Start Time (*)
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    End Time (*)
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Rule Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer font-bold text-emerald-400"
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 bg-[#0b0f19] text-gray-300 border border-[#1f2937] rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-orange-600/20 cursor-pointer"
                >
                  {isEditMode ? "Update Schedule Rule" : "Save Schedule Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
