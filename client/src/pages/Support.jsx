import React, { useState, useEffect } from "react";
import API from "../services/api";
import {
  HelpCircle,
  Plus,
  MessageSquare,
  LifeBuoy,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  Building2,
  Edit3,
} from "lucide-react";

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & Edit States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTicketId, setCurrentTicketId] = useState(null);

  const [clientId, setClientId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Hardware / Display");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Open");
  const [raisedBy, setRaisedBy] = useState("Admin Operator");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tktRes, clientRes] = await Promise.all([
        API.get("/support").catch(() => ({ data: { tickets: [] } })),
        API.get("/clients").catch(() => ({ data: { clients: [] } })),
      ]);

      setTickets(tktRes.data.tickets || []);
      setClients(clientRes.data.clients || []);
      setError(null);
    } catch (err) {
      console.error("[Fetch Support Data Error]:", err);
      setError("Failed to load helpdesk records from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEdit = (tkt) => {
    setIsEditMode(true);
    setCurrentTicketId(tkt._id);
    setClientId(tkt.clientId?._id || tkt.clientId || "");
    setSubject(tkt.subject || "");
    setDescription(tkt.description || "");
    setCategory(tkt.category || "Hardware / Display");
    setPriority(tkt.priority || "Medium");
    setStatus(tkt.status || "Open");
    setRaisedBy(tkt.raisedBy || "Admin Operator");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentTicketId(null);
    setClientId("");
    setSubject("");
    setDescription("");
    setCategory("Hardware / Display");
    setPriority("Medium");
    setStatus("Open");
    setRaisedBy("Admin Operator");
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    if (!subject || !description || !raisedBy) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    try {
      const payload = {
        clientId: clientId || undefined,
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
        status,
        raisedBy: raisedBy.trim(),
      };

      if (isEditMode && currentTicketId) {
        await API.put(`/support/${currentTicketId}`, payload);
        alert("Support ticket updated successfully!");
      } else {
        await API.post("/support/create", payload);
        alert("Support ticket raised successfully!");
      }

      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error("[Ticket Save Error]:", err);
      alert(
        err.response?.data?.message ||
          "Failed to process support ticket action.",
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await API.delete(`/support/${id}`);
      setTickets(tickets.filter((t) => t._id !== id));
      alert("Ticket deleted successfully.");
    } catch (err) {
      alert("Failed to delete support ticket.");
    }
  };

  const activeCount = tickets.filter(
    (t) => t.status !== "Resolved" && t.status !== "Closed",
  ).length;
  const inProgressCount = tickets.filter(
    (t) => t.status === "In Progress",
  ).length;
  const resolvedCount = tickets.filter(
    (t) => t.status === "Resolved" || t.status === "Closed",
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Support & Helpdesk Management
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Submit technical tickets, hardware maintenance logs, and feature
            requests
          </p>
        </div>

        <button
          onClick={() => {
            handleCloseModal();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-orange-600/20 cursor-pointer"
        >
          <Plus size={16} /> Raise Support Ticket
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
              Active Tickets
            </p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {loading ? "..." : activeCount}
            </h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <LifeBuoy size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              In Progress
            </p>
            <h3 className="text-2xl font-bold text-yellow-400 mt-1">
              {loading ? "..." : inProgressCount}
            </h3>
          </div>
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Resolved & Closed
            </p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
              {loading ? "..." : resolvedCount}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden shadow-md">
        <div className="p-5 border-b border-[#1f2937] flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">
            Helpdesk Ticket History
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
                <th className="py-3.5 px-5 font-semibold">SUBJECT & CLIENT</th>
                <th className="py-3.5 px-5 font-semibold">CATEGORY</th>
                <th className="py-3.5 px-5 font-semibold">PRIORITY</th>
                <th className="py-3.5 px-5 font-semibold">RAISED BY</th>
                <th className="py-3.5 px-5 font-semibold">STATUS</th>
                <th className="py-3.5 px-5 font-semibold text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">
                    Loading support tickets...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">
                    No support tickets found. Click "Raise Support Ticket".
                  </td>
                </tr>
              ) : (
                tickets.map((tkt) => (
                  <tr
                    key={tkt._id}
                    className="hover:bg-[#1f2937]/30 transition"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <MessageSquare size={14} className="text-orange-500" />{" "}
                        {tkt.subject}
                      </div>
                      <div className="text-[10px] text-orange-400 font-medium mt-0.5 flex items-center gap-1">
                        <Building2 size={10} />{" "}
                        {tkt.clientId?.companyName ||
                          "General / Internal Ticket"}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-300 font-medium">
                      {tkt.category || "General"}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          tkt.priority === "High" || tkt.priority === "Urgent"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : tkt.priority === "Medium"
                              ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {tkt.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-gray-400 font-mono">
                      {tkt.raisedBy}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          tkt.status === "Resolved" || tkt.status === "Closed"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : tkt.status === "In Progress"
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {tkt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(tkt)}
                          title="Edit Ticket"
                          className="p-1.5 bg-[#0b0f19] hover:bg-[#1f2937] text-blue-400 rounded-lg border border-[#1f2937] transition cursor-pointer"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(tkt._id)}
                          title="Delete Ticket"
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition cursor-pointer inline-block"
                        >
                          <Trash2 size={13} />
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LifeBuoy size={18} className="text-orange-500" />{" "}
                {isEditMode ? "Edit Support Ticket" : "Raise Support Ticket"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Issue Subject (*)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Screen not syncing new playlist schedule"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Link Client / Advertiser (Optional)
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer font-mono text-yellow-400"
                >
                  <option value="">No Client (Internal Ticket)</option>
                  {clients.map((cli) => (
                    <option key={cli._id} value={cli._id}>
                      {cli.companyName} ({cli.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="Hardware / Display">
                      Hardware / Display
                    </option>
                    <option value="Backend / Storage">Backend / Storage</option>
                    <option value="Scheduling Engine">Scheduling Engine</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer font-bold text-emerald-400"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Raised By (*)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Priyank Vaghani"
                    value={raisedBy}
                    onChange={(e) => setRaisedBy(e.target.value)}
                    required
                    className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Detailed Description (*)
                </label>
                <textarea
                  placeholder="Explain the technical issue or requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 resize-none"
                />
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
                  {isEditMode ? "Update Ticket" : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
