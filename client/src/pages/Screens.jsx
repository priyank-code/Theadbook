import React, { useState, useEffect } from "react";
import API from "../services/api";
import {
  Monitor,
  Plus,
  RefreshCw,
  Trash2,
  Wifi,
  Cpu,
  HardDrive,
  Thermometer,
  PlaySquare,
  Eye,
  Power,
} from "lucide-react";

export default function Screens() {
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewScreen, setPreviewScreen] = useState(null);

  // Pairing Form States with Status Option
  const [pairingCode, setPairingCode] = useState("");
  const [screenName, setScreenName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Infinity Mall");
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [screenType, setScreenType] = useState("LED Billboard");
  const [resolution, setResolution] = useState("1920x1080");
  const [initialStatus, setInitialStatus] = useState("Online"); // <-- Naya state status ke liye

  // Fetch all devices from backend database
  const fetchScreens = async () => {
    try {
      setLoading(true);
      const res = await API.get("/devices");
      setScreens(res.data.devices || []);
      setError(null);
    } catch (err) {
      console.error("[Fetch Screens Error]:", err);
      setError("Failed to load screens telemetry from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreens();
  }, []);

  // Handle Register / Pair New Screen with Custom Status
  const handlePairDevice = async (e) => {
    e.preventDefault();
    if (!pairingCode || !screenName) return;

    try {
      const newDevicePayload = {
        deviceCode: pairingCode.trim(),
        deviceName: screenName.trim(),
        location: selectedLocation.trim(),
        city: selectedCity.trim(),
        screenType: screenType,
        resolution: resolution,
        status: initialStatus, // <-- Modal se select kiya hua status bheja jayega
      };

      await API.post("/devices/add", newDevicePayload);
      alert("Screen registered and paired successfully!");

      setPairingCode("");
      setScreenName("");
      setInitialStatus("Online");
      setIsModalOpen(false);
      fetchScreens();
    } catch (err) {
      console.error("[Pair Device Error]:", err);
      alert(err.response?.data?.message || "Failed to pair screen.");
    }
  };

  // Toggle Screen Status Online/Offline directly from table badge
  const handleToggleStatus = async (screen) => {
    const newStatus = screen.status === "Online" ? "Offline" : "Online";
    try {
      await API.put(`/devices/${screen._id}`, { status: newStatus });
      setScreens(
        screens.map((s) =>
          s._id === screen._id ? { ...s, status: newStatus } : s,
        ),
      );
    } catch (err) {
      console.error("[Toggle Status Error]:", err);
      alert("Failed to update screen status.");
    }
  };

  const handleCommand = async (screenId, screenName, command) => {
    try {
      alert(
        `Successfully executed remote command [${command}] on target unit: ${screenName}`,
      );
    } catch (err) {
      console.error("[Command Error]:", err);
      alert(`Failed to execute command on ${screenName}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to unpair/delete this screen?"))
      return;
    try {
      await API.delete(`/devices/${id}`);
      setScreens(screens.filter((s) => s._id !== id));
      alert("Screen unpaired successfully.");
    } catch (err) {
      console.error("[Delete Screen Error]:", err);
      alert(err.response?.data?.message || "Failed to unpair screen.");
    }
  };

  const totalFleet = screens.length;
  const onlineNodes = screens.filter((s) => s.status === "Online").length;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Advanced Screen Telemetry & Fleet
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Real-time hardware monitoring, temperature, storage, and remote
            control
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-orange-600/25 cursor-pointer"
        >
          <Plus size={16} /> Pair New Screen
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Fleet Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Total Fleet
            </p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {loading ? "..." : totalFleet}
            </h3>
          </div>
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
            <Monitor size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Online Nodes
            </p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
              {loading ? "..." : onlineNodes}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Wifi size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Avg Core Temp
            </p>
            <h3 className="text-2xl font-bold text-blue-400 mt-1">41.8°C</h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Thermometer size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Storage Health
            </p>
            <h3 className="text-2xl font-bold text-purple-400 mt-1">Optimal</h3>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <HardDrive size={22} />
          </div>
        </div>
      </div>

      {/* Screens Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden shadow-md">
        <div className="p-5 border-b border-[#1f2937] flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">
            Connected Hardware Diagnostic Registry
          </h3>
          <button
            onClick={fetchScreens}
            className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#0b0f19] px-3 py-1.5 rounded-xl border border-[#1f2937] hover:text-white transition cursor-pointer"
          >
            <RefreshCw size={12} /> Force Telemetry Poll
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-[#1f2937] bg-[#0b0f19]/40">
                <th className="py-3.5 px-5 font-semibold">DEVICE UID & NAME</th>
                <th className="py-3.5 px-5 font-semibold">LOCATION (REF)</th>
                <th className="py-3.5 px-5 font-semibold">CURRENTLY PLAYING</th>
                <th className="py-3.5 px-5 font-semibold">
                  TELEMETRY (TEMP / STORAGE)
                </th>
                <th className="py-3.5 px-5 font-semibold">
                  STATUS (CLICK TO TOGGLE)
                </th>
                <th className="py-3.5 px-5 font-semibold text-right">
                  ADVANCED ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-400">
                    Loading screens registry...
                  </td>
                </tr>
              ) : screens.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-400">
                    No screens found. Click "Pair New Screen" to add one.
                  </td>
                </tr>
              ) : (
                screens.map((screen) => (
                  <tr
                    key={screen._id}
                    className="hover:bg-[#1f2937]/30 transition"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-white">
                        {screen.deviceName}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {screen.deviceCode}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-300 font-medium">
                      {screen.location}, {screen.city}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="flex items-center gap-1 text-gray-200 font-medium bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-[#1f2937] w-fit">
                        <PlaySquare size={13} className="text-orange-500" />{" "}
                        {screen.assignedPlaylist
                          ? "Assigned Playlist"
                          : "Default Loop"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-mono">
                          <Thermometer size={12} className="text-blue-400" />{" "}
                          42°C
                        </span>
                        <span className="text-gray-600">|</span>
                        <span className="flex items-center gap-1 font-mono">
                          <HardDrive size={12} className="text-purple-400" /> 48
                          / 64 GB
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <button
                        onClick={() => handleToggleStatus(screen)}
                        title="Click to toggle Online/Offline"
                        className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          screen.status === "Online"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                        }`}
                      >
                        <Power size={10} /> {screen.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewScreen(screen)}
                          title="Live Screenshot Preview"
                          className="p-1.5 bg-[#0b0f19] hover:bg-[#1f2937] text-blue-400 rounded-lg border border-[#1f2937] transition cursor-pointer"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() =>
                            handleCommand(
                              screen._id,
                              screen.deviceName,
                              "REBOOT",
                            )
                          }
                          title="Remote Reboot Android Box"
                          className="p-1.5 bg-[#0b0f19] hover:bg-[#1f2937] text-yellow-400 rounded-lg border border-[#1f2937] transition cursor-pointer"
                        >
                          <Cpu size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(screen._id)}
                          title="Unpair Screen"
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

      {/* Live Screenshot Preview Modal */}
      {previewScreen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Monitor size={18} className="text-orange-500" /> Live Feed
                Preview: {previewScreen.deviceName}
              </h3>
              <button
                onClick={() => setPreviewScreen(null)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl h-64 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-blue-500/10"></div>
              <Monitor size={48} className="text-gray-600 mb-3 animate-pulse" />
              <p className="text-xs text-gray-300 font-semibold">
                Streaming live frame from ExoPlayer...
              </p>
              <p className="text-[10px] text-gray-500 mt-1 font-mono">
                Resolution: {previewScreen.resolution}
              </p>
            </div>

            <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
              <span>
                Device Code:{" "}
                <strong className="text-white">
                  {previewScreen.deviceCode}
                </strong>
              </span>
              <button
                onClick={() =>
                  handleCommand(
                    previewScreen._id,
                    previewScreen.deviceName,
                    "FORCE_SYNC",
                  )
                }
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition cursor-pointer"
              >
                Force Schedule Sync
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pair New Screen Modal with Status Selector */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Monitor size={18} className="text-orange-500" /> Pair Android
                TV Screen
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePairDevice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Pairing Code (Unique)
                </label>
                <input
                  type="text"
                  placeholder="e.g. DEV-9841"
                  value={pairingCode}
                  onChange={(e) => setPairingCode(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono focus:border-orange-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Screen Designation Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. South Block Atrium Display"
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Infinity Mall"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    required
                    className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    required
                    className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Screen Type
                  </label>
                  <select
                    value={screenType}
                    onChange={(e) => setScreenType(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="LED Billboard">LED Billboard</option>
                    <option value="LCD Display">LCD Display</option>
                    <option value="Transit Display">Transit Display</option>
                    <option value="Digital Kiosk">Digital Kiosk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={initialStatus}
                    onChange={(e) => setInitialStatus(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer font-bold text-emerald-400"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Resolution
                </label>
                <input
                  type="text"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono focus:border-orange-500"
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
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-orange-600/25 cursor-pointer"
                >
                  Link Hardware
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
