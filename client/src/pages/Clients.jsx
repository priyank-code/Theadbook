import React, { useState, useEffect } from "react";
import API from "../services/api";
import {
  Users,
  Plus,
  Building2,
  Mail,
  Phone,
  Trash2,
  Search,
  Briefcase,
  CreditCard,
  Eye,
  RefreshCw,
  Edit3,
} from "lucide-react";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentClientId, setCurrentClientId] = useState(null);
  const [selectedClientPortfolio, setSelectedClientPortfolio] = useState(null);

  // Form States matching Client model exactly[cite: 9]
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Active");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientRes, campRes] = await Promise.all([
        API.get("/clients").catch(() => ({ data: { clients: [] } })),
        API.get("/campaigns").catch(() => ({ data: { campaigns: [] } })),
      ]);

      setClients(clientRes.data.clients || []);
      setCampaigns(campRes.data.campaigns || []);
      setError(null);
    } catch (err) {
      console.error("[Fetch Data Error]:", err);
      setError("Failed to load client accounts from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitClient = async (e) => {
    e.preventDefault();
    if (!clientName || !companyName || !email || !phone) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        clientName: clientName.trim(),
        companyName: companyName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        status,
      };

      if (isEditMode && currentClientId) {
        await API.put(`/clients/${currentClientId}`, payload);
        alert("Client account updated successfully!");
      } else {
        await API.post("/clients/add", payload); // Using /clients/add as per backend route[cite: 10]
        alert("Client account registered successfully!");
      }

      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error("[Client Save Error]:", err);
      alert(err.response?.data?.message || "Failed to process client action.");
    }
  };

  const handleOpenEdit = (client) => {
    setIsEditMode(true);
    setCurrentClientId(client._id);
    setClientName(client.clientName || "");
    setCompanyName(client.companyName || "");
    setEmail(client.email || "");
    setPhone(client.phone || "");
    setStatus(client.status || "Active");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentClientId(null);
    setClientName("");
    setCompanyName("");
    setEmail("");
    setPhone("");
    setStatus("Active");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client account?"))
      return;
    try {
      await API.delete(`/clients/${id}`);
      setClients(clients.filter((c) => c._id !== id));
      alert("Client deleted successfully.");
    } catch (err) {
      alert("Failed to delete client account.");
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Helper function to calculate individual client stats based on relational campaigns data
  const getClientStats = (clientId, companyName) => {
    const clientCampaigns = campaigns.filter((camp) => {
      // Check matching by ObjectId reference or matching company name text
      const campClientId = camp.clientId?._id || camp.clientId;
      return (
        campClientId === clientId ||
        camp.client?.toLowerCase() === companyName?.toLowerCase()
      );
    });

    const activeCount = clientCampaigns.filter(
      (c) => c.status === "Active",
    ).length;
    const totalSpent = clientCampaigns.reduce(
      (acc, curr) => acc + (Number(curr.budget) || 0),
      0,
    );

    return { activeCount, totalSpent, clientCampaigns };
  };

  const totalAdvertisers = clients.length;
  const activePartners = clients.filter((c) => c.status === "Active").length;
  const overallCumulativeSpend = campaigns.reduce(
    (acc, curr) => acc + (Number(curr.budget) || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Advanced Clients & Brand Accounts
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Enterprise advertiser accounts with relational ad spend analytics
          </p>
        </div>

        <button
          onClick={() => {
            handleCloseModal();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-orange-600/20 cursor-pointer"
        >
          <Plus size={16} /> Register Client Account
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Total Advertisers
            </p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {loading ? "..." : totalAdvertisers} Accounts
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Active Brand Partners
            </p>
            <h3 className="text-2xl font-bold text-blue-400 mt-1">
              {loading ? "..." : activePartners} Active
            </h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Briefcase size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Cumulative Ad Spend
            </p>
            <h3 className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              ₹{overallCumulativeSpend.toLocaleString()}
            </h3>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <CreditCard size={22} />
          </div>
        </div>
      </div>

      {/* Search Bar & Refresh */}
      <div className="flex items-center justify-between gap-4 bg-[#111827] border border-[#1f2937] p-4 rounded-2xl shadow-md">
        <div className="flex items-center gap-3 bg-[#0b0f19] border border-[#1f2937] px-3.5 py-2 rounded-xl w-full max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search client name, company or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-white outline-none w-full"
          />
        </div>
        <button
          onClick={fetchData}
          className="p-2 bg-[#0b0f19] hover:bg-[#1f2937] text-gray-400 hover:text-white rounded-xl border border-[#1f2937] transition cursor-pointer"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Clients Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-[#1f2937] bg-[#0b0f19]/40">
                <th className="py-3.5 px-5 font-semibold">CLIENT & COMPANY</th>
                <th className="py-3.5 px-5 font-semibold">
                  CONTACT CREDENTIALS
                </th>
                <th className="py-3.5 px-5 font-semibold">ACTIVE CAMPAIGNS</th>
                <th className="py-3.5 px-5 font-semibold">TOTAL AD SPEND</th>
                <th className="py-3.5 px-5 font-semibold">STATUS</th>
                <th className="py-3.5 px-5 font-semibold text-right">
                  ADVANCED ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-400">
                    Loading client accounts...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-400">
                    No client accounts found. Click "Register Client Account".
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const stats = getClientStats(client._id, client.companyName);
                  return (
                    <tr
                      key={client._id}
                      className="hover:bg-[#1f2937]/30 transition"
                    >
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <Building2 size={15} className="text-orange-500" />{" "}
                          {client.clientName}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium">
                          {client.companyName}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} className="text-gray-400" />{" "}
                          {client.email}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Phone size={12} className="text-gray-400" />{" "}
                          {client.phone}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 bg-[#0b0f19] text-white rounded-lg border border-[#1f2937] font-semibold">
                          {stats.activeCount} Running
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-emerald-400 font-bold font-mono">
                        ₹{stats.totalSpent.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            client.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() =>
                              setSelectedClientPortfolio({ client, stats })
                            }
                            title="View Portfolio"
                            className="p-1.5 bg-[#0b0f19] hover:bg-[#1f2937] text-blue-400 rounded-lg border border-[#1f2937] transition cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(client)}
                            title="Edit Client"
                            className="p-1.5 bg-[#0b0f19] hover:bg-[#1f2937] text-yellow-400 rounded-lg border border-[#1f2937] transition cursor-pointer"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(client._id)}
                            title="Delete Client"
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-[#1f2937] transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Portfolio Modal */}
      {selectedClientPortfolio && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-orange-500" /> Client
                Portfolio: {selectedClientPortfolio.client.clientName}
              </h3>
              <button
                onClick={() => setSelectedClientPortfolio(null)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-300 bg-[#0b0f19] p-4 rounded-xl border border-[#1f2937]">
              <div className="flex justify-between">
                <span>Company Name:</span>{" "}
                <strong className="text-white">
                  {selectedClientPortfolio.client.companyName}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Official Email:</span>{" "}
                <strong className="text-white">
                  {selectedClientPortfolio.client.email}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Phone Number:</span>{" "}
                <strong className="text-white">
                  {selectedClientPortfolio.client.phone}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Account Status:</span>{" "}
                <strong className="text-emerald-400">
                  {selectedClientPortfolio.client.status}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Calculated Total Spend:</span>{" "}
                <strong className="text-emerald-400 font-mono">
                  ₹{selectedClientPortfolio.stats.totalSpent.toLocaleString()}
                </strong>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-bold text-white mb-2">
                Linked Campaigns (
                {selectedClientPortfolio.stats.clientCampaigns.length})
              </h4>
              <div className="max-h-36 overflow-y-auto space-y-2">
                {selectedClientPortfolio.stats.clientCampaigns.length === 0 ? (
                  <p className="text-[11px] text-gray-500">
                    No campaigns linked to this client yet.
                  </p>
                ) : (
                  selectedClientPortfolio.stats.clientCampaigns.map((camp) => (
                    <div
                      key={camp._id}
                      className="bg-[#0b0f19] p-2.5 rounded-xl border border-[#1f2937] flex justify-between items-center text-[11px]"
                    >
                      <div>
                        <span className="font-semibold text-white">
                          {camp.campaignName}
                        </span>
                        <span className="text-gray-400 block text-[10px]">
                          Screen: {camp.screenName}
                        </span>
                      </div>
                      <span className="text-emerald-400 font-mono font-bold">
                        ₹{camp.budget?.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedClientPortfolio(null)}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition cursor-pointer"
              >
                Close Portfolio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-orange-500" />{" "}
                {isEditMode
                  ? "Edit Client Account"
                  : "Register Advertiser Account"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Client Contact Name (*)
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Company / Brand Name (*)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tata Motors"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Official Email (*)
                </label>
                <input
                  type="email"
                  placeholder="e.g. marketing@tatamotors.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Phone Number (*)
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 91234 56789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Account Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer font-bold text-emerald-400"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
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
                  {isEditMode ? "Update Account" : "Save Account Master"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
