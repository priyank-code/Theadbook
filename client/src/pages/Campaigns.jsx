import React, { useState, useEffect } from "react";
import API from "../services/api";
import {
  Megaphone,
  Plus,
  Calendar,
  FileText,
  Trash2,
  PlayCircle,
  RefreshCw,
  Monitor,
  Edit3,
  TrendingUp,
} from "lucide-react";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [screens, setScreens] = useState([]);
  const [creatives, setCreatives] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCampaignId, setCurrentCampaignId] = useState(null);

  // Form States
  const [campaignName, setCampaignName] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedScreen, setSelectedScreen] = useState("");
  const [creativeName, setCreativeName] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("Active");

  // Fetch Campaigns, Screens, Creatives, and Clients from Backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const [campRes, screenRes, mediaRes, clientRes] = await Promise.all([
        API.get("/campaigns").catch(() => ({ data: { campaigns: [] } })),
        API.get("/devices").catch(() => ({ data: { devices: [] } })),
        API.get("/media").catch(() => ({ data: { mediaFiles: [] } })),
        API.get("/clients").catch(() => ({ data: { clients: [] } })),
      ]);

      setCampaigns(campRes.data.campaigns || []);
      setScreens(screenRes.data.devices || []);
      setCreatives(mediaRes.data.mediaFiles || []);
      setClients(clientRes.data.clients || []);
      setError(null);
    } catch (err) {
      console.error("[Fetch Data Error]:", err);
      setError("Failed to load production data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitCampaign = async (e) => {
    e.preventDefault();
    if (
      !campaignName ||
      !selectedClient ||
      !selectedScreen ||
      !creativeName ||
      !startDate ||
      !endDate
    ) {
      alert("Please fill in all mandatory fields including Client.");
      return;
    }

    try {
      const foundClient = clients.find((c) => c._id === selectedClient);

      const payload = {
        campaignName: campaignName.trim(),
        clientId: selectedClient,
        clientName: foundClient
          ? foundClient.companyName || foundClient.clientName
          : "Unknown Client",
        screenName: selectedScreen,
        creativeName: creativeName,
        budget: Number(budget) || 0,
        startDate,
        endDate,
        status,
      };

      if (isEditMode && currentCampaignId) {
        await API.put(`/campaigns/${currentCampaignId}`, payload);
        alert("Campaign updated successfully!");
      } else {
        await API.post("/campaigns/create", payload);
        alert("Campaign launched successfully!");
      }

      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error("[Campaign Save Error]:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to process campaign action.";
      alert(errorMsg);
    }
  };

  const handleOpenEdit = (camp) => {
    setIsEditMode(true);
    setCurrentCampaignId(camp._id);
    setCampaignName(camp.campaignName || "");
    setSelectedClient(camp.clientId?._id || camp.clientId || "");
    setSelectedScreen(camp.screenName || "");
    setCreativeName(camp.creativeName || "");
    setBudget(camp.budget || "");
    setStartDate(camp.startDate ? camp.startDate.slice(0, 10) : "");
    setEndDate(camp.endDate ? camp.endDate.slice(0, 10) : "");
    setStatus(camp.status || "Active");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentCampaignId(null);
    setCampaignName("");
    setSelectedClient("");
    setSelectedScreen("");
    setCreativeName("");
    setBudget("");
    setStartDate("");
    setEndDate("");
    setStatus("Active");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign rule?"))
      return;
    try {
      await API.delete(`/campaigns/${id}`);
      setCampaigns(campaigns.filter((c) => c._id !== id));
      alert("Campaign deleted successfully.");
    } catch (err) {
      alert("Failed to delete campaign.");
    }
  };

  // ⚡ STRICT FILTER: Only show active clients in the dropdown
  const activeClients = clients.filter((cli) => cli.status === "Active");

  const totalCampaigns = campaigns.length;
  const activeStreams = campaigns.filter((c) => c.status === "Active").length;
  const totalAllocatedBudget = campaigns.reduce(
    (acc, curr) => acc + (Number(curr.budget) || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Production DOOH Campaign Engine
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Real-time media routing, client budgeting, and programmatic pacing
          </p>
        </div>

        <button
          onClick={() => {
            handleCloseModal();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-orange-600/20 cursor-pointer"
        >
          <Plus size={16} /> Launch New Campaign
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
              Total Campaigns
            </p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {loading ? "..." : totalCampaigns} Rules
            </h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Megaphone size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Active Playback Streams
            </p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
              {loading ? "..." : activeStreams} Live
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <PlayCircle size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Total Ad Budget
            </p>
            <h3 className="text-2xl font-bold text-orange-400 font-mono mt-1">
              ₹{totalAllocatedBudget.toLocaleString()}
            </h3>
          </div>
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden shadow-md">
        <div className="p-5 border-b border-[#1f2937] flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">
            Live Programmatic Ad Registry
          </h3>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#0b0f19] px-3 py-1.5 rounded-xl border border-[#1f2937] hover:text-white transition cursor-pointer"
          >
            <RefreshCw size={12} /> Sync Registry
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-[#1f2937] bg-[#0b0f19]/40">
                <th className="py-3.5 px-5 font-semibold">CAMPAIGN & CLIENT</th>
                <th className="py-3.5 px-5 font-semibold">
                  TARGET SCREEN NODE
                </th>
                <th className="py-3.5 px-5 font-semibold">CREATIVE ASSET</th>
                <th className="py-3.5 px-5 font-semibold">BUDGET</th>
                <th className="py-3.5 px-5 font-semibold">DURATION</th>
                <th className="py-3.5 px-5 font-semibold">STATUS</th>
                <th className="py-3.5 px-5 font-semibold text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-400">
                    Loading campaign streams...
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-400">
                    No campaigns found. Click "Launch New Campaign".
                  </td>
                </tr>
              ) : (
                campaigns.map((camp) => (
                  <tr
                    key={camp._id}
                    className="hover:bg-[#1f2937]/30 transition"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-white">
                        {camp.campaignName}
                      </div>
                      <div className="text-[10px] text-orange-400 font-medium">
                        Client:{" "}
                        {camp.clientId?.companyName ||
                          camp.clientId?.clientName ||
                          camp.clientName ||
                          "Assigned Client"}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-200 font-medium">
                      <span className="flex items-center gap-1.5 bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-[#1f2937] w-fit">
                        <Monitor size={13} className="text-orange-500" />{" "}
                        {camp.screenName || "Unassigned"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-yellow-400">
                      <span className="flex items-center gap-1.5 bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-[#1f2937] w-fit">
                        <FileText size={13} />{" "}
                        {camp.creativeName || "default.jpg"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-emerald-400 font-bold font-mono">
                      ₹{camp.budget?.toLocaleString() || 0}
                    </td>
                    <td className="py-3.5 px-5 text-gray-400 font-mono">
                      <div>
                        {camp.startDate ? camp.startDate.slice(0, 10) : "N/A"}
                      </div>
                      <div className="text-[10px]">
                        to {camp.endDate ? camp.endDate.slice(0, 10) : "N/A"}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          camp.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        }`}
                      >
                        {camp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(camp)}
                          title="Edit"
                          className="p-1.5 bg-[#0b0f19] hover:bg-[#1f2937] text-blue-400 rounded-lg border border-[#1f2937] transition cursor-pointer"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(camp._id)}
                          title="Delete"
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/25 transition cursor-pointer"
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
                <Megaphone size={18} className="text-orange-500" />
                {isEditMode ? "Edit Campaign Rule" : "Launch Screen Campaign"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Campaign Title (*)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Summer Mega Sale"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              {/* Dynamic Active-Only Client Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Select Active Advertiser / Client (*)
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="">Choose Active Client</option>
                  {activeClients.map((cli) => (
                    <option key={cli._id} value={cli._id}>
                      {cli.companyName} ({cli.clientName})
                    </option>
                  ))}
                </select>
                {activeClients.length === 0 && (
                  <p className="text-[10px] text-orange-400 mt-1">
                    No active clients found. Please make sure a client status is
                    set to 'Active'.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Target Screen Node (*)
                </label>
                <select
                  value={selectedScreen}
                  onChange={(e) => setSelectedScreen(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="">Choose Screen Node</option>
                  {screens.map((scr) => (
                    <option key={scr._id} value={scr.deviceName}>
                      {scr.deviceName} [{scr.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Creative Media File (From Vault) (*)
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

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Budget / Allocation (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 35000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono focus:border-orange-500"
                />
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

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Execution Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer font-bold text-emerald-400"
                >
                  <option value="Active">Active Stream</option>
                  <option value="Scheduled">Scheduled Queue</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
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
                  {isEditMode ? "Update Campaign" : "Start Streaming"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
