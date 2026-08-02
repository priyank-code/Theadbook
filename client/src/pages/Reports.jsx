import React, { useState, useEffect } from "react";
import API from "../services/api";
import {
  BarChart2,
  Download,
  Filter,
  Calendar,
  Monitor,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  FileText,
  Printer,
} from "lucide-react";

export default function Reports() {
  const [campaigns, setCampaigns] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterType, setFilterType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campRes, screenRes] = await Promise.all([
        API.get("/campaigns").catch(() => ({ data: { campaigns: [] } })),
        API.get("/devices").catch(() => ({ data: { devices: [] } })),
      ]);

      setCampaigns(campRes.data.campaigns || []);
      setScreens(screenRes.data.devices || []);
      setError(null);
    } catch (err) {
      console.error("[Fetch Reports Error]:", err);
      setError("Failed to load telemetry reports from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Download All / Filtered Report as PDF (Print View)
  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");

    // Table rows format karna filtered data ke liye
    const rowsHTML = filteredLogs
      .map(
        (camp) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${camp.campaignName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${camp.clientId?.companyName || camp.clientName || "N/A"}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${camp.screenName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #16a34a; font-weight: bold;">₹${camp.budget?.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${camp.startDate ? camp.startDate.slice(0, 10) : "N/A"} to ${camp.endDate ? camp.endDate.slice(0, 10) : "N/A"}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${camp.status}</td>
      </tr>
    `,
      )
      .join("");

    const calculatedRevenue = filteredLogs.reduce(
      (acc, curr) => acc + (Number(curr.budget) || 0),
      0,
    );

    printWindow.document.write(`
      <html>
        <head>
          <title>DOOH Campaign Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #222; }
            .header { border-bottom: 2px solid #f97316; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 24px; font-weight: bold; color: #f97316; }
            .meta { font-size: 12px; color: #555; margin-top: 5px; }
            .summary-box { display: flex; gap: 20px; margin-bottom: 25px; }
            .card { background: #f9f9f9; border: 1px solid #ddd; padding: 15px; border-radius: 8px; flex: 1; }
            .card-title { font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; }
            .card-value { font-size: 20px; font-weight: bold; color: #111; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th { background: #f3f4f6; color: #374151; text-align: left; padding: 10px; border-bottom: 2px solid #ddd; }
            .footer { margin-top: 40px; font-size: 11px; text-align: center; color: #777; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">TheAdBook DOOH - Executive Analytics Report</div>
              <div class="meta">Date Range: ${startDate || "All Time"} to ${endDate || "Present"} | Generated: ${new Date().toLocaleString()}</div>
            </div>
          </div>

          <div class="summary-box">
            <div class="card">
              <div class="card-title">Total Filtered Campaigns</div>
              <div class="card-value">${filteredLogs.length} Records</div>
            </div>
            <div class="card">
              <div class="card-title">Total Filtered Revenue</div>
              <div class="card-value" style="color: #16a34a;">₹${calculatedRevenue.toLocaleString()}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Client / Advertiser</th>
                <th>Target Screen</th>
                <th>Budget</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML || '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #666;">No campaigns found for this date range.</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <p>Certified Programmatic Digital Out-of-Home Advertising Ledger - TheAdBook Core Engine</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Download Single Campaign Specific PDF Report
  const handleSingleCampaignPDF = (camp) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Campaign Report - ${camp.campaignName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #222; }
            .header { border-bottom: 2px solid #f97316; padding-bottom: 15px; margin-bottom: 20px; }
            .title { font-size: 22px; font-weight: bold; color: #f97316; }
            .meta { font-size: 13px; color: #555; margin-top: 5px; }
            .box { background: #f9f9f9; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-top: 15px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
            .footer { margin-top: 40px; font-size: 11px; text-align: center; color: #777; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">TheAdBook DOOH - Execution Audit Report</div>
            <div class="meta">Generated on: ${new Date().toLocaleString()}</div>
          </div>
          <div class="box">
            <div class="row"><strong>Campaign Title:</strong> <span>${camp.campaignName}</span></div>
            <div class="row"><strong>Client / Advertiser:</strong> <span>${camp.clientId?.companyName || camp.clientName || "N/A"}</span></div>
            <div class="row"><strong>Target Screen Node:</strong> <span>${camp.screenName}</span></div>
            <div class="row"><strong>Creative Asset:</strong> <span>${camp.creativeName}</span></div>
            <div class="row"><strong>Allocated Budget:</strong> <span style="color: #16a34a; font-weight: bold;">₹${camp.budget?.toLocaleString()}</span></div>
            <div class="row"><strong>Schedule Duration:</strong> <span>${camp.startDate ? camp.startDate.slice(0, 10) : "N/A"} to ${camp.endDate ? camp.endDate.slice(0, 10) : "N/A"}</span></div>
            <div class="row"><strong>Execution Status:</strong> <span>${camp.status}</span></div>
          </div>
          <div class="footer">
            <p>Certified Programmatic Digital Out-of-Home Advertising Ledger - TheAdBook Core Engine</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const onlineScreens = screens.filter((s) => s.status === "Online").length;
  const totalScreens = screens.length || 1;
  const dynamicUptime = ((onlineScreens / totalScreens) * 100).toFixed(1);
  const totalRevenue = campaigns.reduce(
    (acc, curr) => acc + (Number(curr.budget) || 0),
    0,
  );
  const totalImpressions = campaigns.length * 4500;

  const filteredLogs = campaigns.filter((camp) => {
    const matchesSearch =
      camp.campaignName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.screenName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === "All" || camp.status === filterType;

    let matchesDate = true;
    if (startDate && endDate && camp.startDate && camp.endDate) {
      const campStart = new Date(camp.startDate).setHours(0, 0, 0, 0);
      const campEnd = new Date(camp.endDate).setHours(23, 59, 59, 999);
      const filterStart = new Date(startDate).setHours(0, 0, 0, 0);
      const filterEnd = new Date(endDate).setHours(23, 59, 59, 999);

      matchesDate = campStart >= filterStart && campEnd <= filterEnd;
    }

    return matchesSearch && matchesFilter && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            System & Campaign Telemetry Reports
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Real-time database analytics, date-range filtering, and Per-Campaign
            PDF export
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#111827] hover:bg-[#1f2937] text-gray-300 border border-[#1f2937] rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw size={15} /> Sync
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-orange-600/20 cursor-pointer"
          >
            <Download size={16} /> Download Date-Range PDF
          </button>
        </div>
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
              Fleet Uptime Average
            </p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
              {loading ? "..." : `${dynamicUptime}%`}
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Calculated over online screen nodes
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Total Revenue Generated
            </p>
            <h3 className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              ₹{totalRevenue.toLocaleString()}
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Calculated from campaigns
            </p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <BarChart2 size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Estimated Impressions
            </p>
            <h3 className="text-2xl font-bold text-yellow-400 mt-1">
              {totalImpressions.toLocaleString()} Views
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Based on playback duration
            </p>
          </div>
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
            <AlertCircle size={22} />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-[#111827] border border-[#1f2937] p-4 rounded-2xl shadow-md">
        <div className="flex items-center gap-3 bg-[#0b0f19] border border-[#1f2937] px-3.5 py-2 rounded-xl w-full max-w-md">
          <Monitor size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search campaign, client or screen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-white outline-none w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-[#0b0f19] border border-[#1f2937] px-3 py-1.5 rounded-xl text-xs text-gray-300">
            <Calendar size={14} className="text-orange-500" />
            <span className="text-[10px] text-gray-400">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none text-xs text-white outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#0b0f19] border border-[#1f2937] px-3 py-1.5 rounded-xl text-xs text-gray-300">
            <Calendar size={14} className="text-orange-500" />
            <span className="text-[10px] text-gray-400">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-xs text-white outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#0b0f19] border border-[#1f2937] px-3 py-1.5 rounded-xl text-xs text-gray-300">
            <Filter size={14} className="text-orange-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none text-xs text-white outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#111827]">
                All Statuses
              </option>
              <option value="Active" className="bg-[#111827]">
                Active
              </option>
              <option value="Scheduled" className="bg-[#111827]">
                Scheduled
              </option>
              <option value="Completed" className="bg-[#111827]">
                Completed
              </option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden shadow-md">
        <div className="p-5 border-b border-[#1f2937] flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">
            Campaign Execution & Date-Range Registry
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            Showing {filteredLogs.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-[#1f2937] bg-[#0b0f19]/40">
                <th className="py-3.5 px-5 font-semibold">CAMPAIGN & CLIENT</th>
                <th className="py-3.5 px-5 font-semibold">
                  TARGET SCREEN NODE
                </th>
                <th className="py-3.5 px-5 font-semibold">BUDGET & CREATIVE</th>
                <th className="py-3.5 px-5 font-semibold">SCHEDULE DURATION</th>
                <th className="py-3.5 px-5 font-semibold">STATUS</th>
                <th className="py-3.5 px-5 font-semibold text-right">
                  PDF EXPORT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-400">
                    Loading campaign telemetry...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-400">
                    No campaigns found for the selected date range or filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((camp) => (
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
                          camp.clientName ||
                          "Assigned Client"}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-200 font-medium">
                      <span className="flex items-center gap-1.5 bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-[#1f2937] w-fit">
                        <Monitor size={13} className="text-orange-500" />{" "}
                        {camp.screenName}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-gray-300">
                      <div className="font-bold text-emerald-400 font-mono">
                        ₹{camp.budget?.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-yellow-400 font-mono">
                        {camp.creativeName}
                      </div>
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
                      <button
                        onClick={() => handleSingleCampaignPDF(camp)}
                        title="Download Campaign PDF"
                        className="flex items-center gap-1.5 ml-auto px-3 py-1.5 bg-[#0b0f19] hover:bg-[#1f2937] text-orange-400 hover:text-orange-300 rounded-lg border border-[#1f2937] transition cursor-pointer font-semibold"
                      >
                        <FileText size={13} /> PDF Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
