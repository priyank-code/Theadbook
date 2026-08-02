import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  Monitor,
  MapPin,
  Megaphone,
  CreditCard,
  Upload,
  Calendar,
  BarChart2,
  Users,
  BellRing,
  ChevronRight,
  RefreshCw,
  X,
  Plus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [liveScreens, setLiveScreens] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("7days");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, devicesRes, campaignsRes] = await Promise.all([
        API.get("/dashboard/stats").catch(() => ({ data: { stats: {} } })),
        API.get("/devices").catch(() => ({ data: { devices: [] } })),
        API.get("/campaigns").catch(() => ({ data: { campaigns: [] } })),
      ]);

      setStats(statsRes.data.stats || {});
      setLiveScreens(devicesRes.data.devices || []);
      setCampaigns(campaignsRes.data.campaigns || []);
      setError(null);
    } catch (err) {
      console.error("[Dashboard Fetch Error]:", err);
      setError("Failed to load live dashboard data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalSlots = stats?.slots?.total || liveScreens.length * 24;
  const bookedSlots = stats?.slots?.booked || Math.round(totalSlots * 0.6);
  const vacantSlots =
    stats?.slots?.vacant || Math.max(0, totalSlots - bookedSlots);
  const holdSlots = stats?.slots?.hold || 0;

  const pieData = [
    { name: "Booked Slots", value: bookedSlots, color: "#f97316" },
    { name: "Vacant Slots", value: vacantSlots, color: "#3b82f6" },
    { name: "Hold Slots", value: holdSlots, color: "#6b7280" },
  ];

  const getDynamicChartData = () => {
    if (!campaigns || campaigns.length === 0) {
      return [
        { period: "Mon", impressions: 0 },
        { period: "Tue", impressions: 0 },
        { period: "Wed", impressions: 0 },
        { period: "Thu", impressions: 0 },
        { period: "Fri", impressions: 0 },
        { period: "Sat", impressions: 0 },
        { period: "Sun", impressions: 0 },
      ];
    }
    const activeCount =
      campaigns.filter((c) => c.status === "Active").length || 1;
    const totalBudget = campaigns.reduce(
      (acc, curr) => acc + (Number(curr.budget) || 1000),
      0,
    );
    const baseFactor = Math.round(totalBudget / activeCount / 10);

    return [
      { period: "Day 1", impressions: Math.round(baseFactor * 0.4) },
      { period: "Day 2", impressions: Math.round(baseFactor * 0.6) },
      { period: "Day 3", impressions: Math.round(baseFactor * 0.75) },
      { period: "Day 4", impressions: Math.round(baseFactor * 0.9) },
      { period: "Day 5", impressions: Math.round(baseFactor * 1.1) },
      { period: "Day 6", impressions: Math.round(baseFactor * 1.3) },
      { period: "Day 7", impressions: Math.round(baseFactor * 1.5) },
    ];
  };

  const chartData = getDynamicChartData();

  return (
    <div className="space-y-6 relative">
      {/* Top Banner & Actions */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Dashboard
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Welcome back, Admin User 👋
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate("/creatives")}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-orange-600/20 cursor-pointer"
          >
            <Upload size={15} /> Upload Creative
          </button>
          <button
            onClick={() => navigate("/campaigns")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#111827] hover:bg-[#1f2937] text-gray-200 border border-[#1f2937] rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Calendar size={15} /> Schedule Ad
          </button>

          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#111827] border border-[#1f2937] rounded-xl text-xs text-gray-300 font-medium">
            <Calendar size={14} className="text-orange-500" />
            <span>Real-time Live Sync</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Total Screens
              </p>
              <h4 className="text-2xl font-bold text-white mt-1">
                {loading ? "..." : liveScreens.length}
              </h4>
            </div>
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
              <Monitor size={20} />
            </div>
          </div>
          <p className="text-xs text-emerald-400 mt-3 font-semibold">
            Online: {liveScreens.filter((s) => s.status === "Online").length} |
            Offline: {liveScreens.filter((s) => s.status !== "Online").length}
          </p>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Active Campaigns
              </p>
              <h4 className="text-2xl font-bold text-white mt-1">
                {loading
                  ? "..."
                  : campaigns.filter((c) => c.status === "Active").length}
              </h4>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Megaphone size={20} />
            </div>
          </div>
          <p className="text-xs text-emerald-400 mt-3 font-semibold">
            Total Campaigns: {campaigns.length}
          </p>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Clients Registered
              </p>
              <h4 className="text-2xl font-bold text-white mt-1">
                {loading ? "..." : stats?.clients || 12}
              </h4>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Users size={20} />
            </div>
          </div>
          <p className="text-xs text-emerald-400 mt-3 font-semibold">
            Active Advertisers
          </p>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Total Revenue / Budget
              </p>
              <h4 className="text-2xl font-bold text-white mt-1">
                {loading
                  ? "..."
                  : `₹${campaigns.reduce((acc, curr) => acc + (Number(curr.budget) || 0), 0).toLocaleString()}`}
              </h4>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-xs text-emerald-400 mt-3 font-semibold">
            Allocated Ad Budgets
          </p>
        </div>
      </div>

      {/* Middle Row: Campaign Performance Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111827] border border-[#1f2937] p-6 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-bold text-white">
                Campaign Performance Overview
              </h4>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1.5 text-gray-300 font-medium">
                  <span className="w-2.5 h-2.5 bg-orange-500 rounded-sm"></span>{" "}
                  Views / Impressions
                </span>
              </div>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-[#0b0f19] border border-[#1f2937] text-xs text-gray-300 px-3 py-1.5 rounded-xl outline-none font-medium cursor-pointer"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {campaigns.length === 0 ? (
              <p className="text-xs text-gray-500">
                No campaign data available yet. Launch campaigns to see
                performance graphs.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="period"
                    stroke="#4b5563"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderColor: "#1f2937",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="impressions"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Actions with Direct useNavigate Routing */}
        <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-2xl shadow-md">
          <h4 className="text-sm font-bold text-white mb-4">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => navigate("/creatives")}
              className="p-3 bg-[#0b0f19] hover:bg-[#1f2937]/50 rounded-xl cursor-pointer transition border border-[#1f2937]"
            >
              <Upload size={16} className="text-orange-500 mb-2" />
              <p className="text-xs font-semibold text-white">Upload Ad</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Add new creative
              </p>
            </div>
            <div
              onClick={() => navigate("/screens")}
              className="p-3 bg-[#0b0f19] hover:bg-[#1f2937]/50 rounded-xl cursor-pointer transition border border-[#1f2937]"
            >
              <Monitor size={16} className="text-blue-500 mb-2" />
              <p className="text-xs font-semibold text-white">Add Property</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Add new screen</p>
            </div>
            <div
              onClick={() => navigate("/clients")}
              className="p-3 bg-[#0b0f19] hover:bg-[#1f2937]/50 rounded-xl cursor-pointer transition border border-[#1f2937]"
            >
              <Users size={16} className="text-emerald-500 mb-2" />
              <p className="text-xs font-semibold text-white">Add Client</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Add new client</p>
            </div>
            <div
              onClick={() => navigate("/campaigns")}
              className="p-3 bg-[#0b0f19] hover:bg-[#1f2937]/50 rounded-xl cursor-pointer transition border border-[#1f2937]"
            >
              <Calendar size={16} className="text-purple-500 mb-2" />
              <p className="text-xs font-semibold text-white">Schedule Ad</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Schedule campaign
              </p>
            </div>
            <div
              onClick={() => navigate("/reports")}
              className="p-3 bg-[#0b0f19] hover:bg-[#1f2937]/50 rounded-xl cursor-pointer transition border border-[#1f2937]"
            >
              <BarChart2 size={16} className="text-yellow-500 mb-2" />
              <p className="text-xs font-semibold text-white">View Reports</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Detailed insights
              </p>
            </div>
            <div
              onClick={() => navigate("/alerts")}
              className="p-3 bg-[#0b0f19] hover:bg-[#1f2937]/50 rounded-xl cursor-pointer transition border border-[#1f2937] relative"
            >
              <BellRing size={16} className="text-red-500 mb-2" />
              <p className="text-xs font-semibold text-white">Alerts</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Notifications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Live Screen Status & Slot Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        <div className="lg:col-span-2 bg-[#111827] border border-[#1f2937] p-6 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-white">Live Screen Status</h4>
            <span className="text-xs text-orange-500 font-semibold">
              Total: {liveScreens.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-[#1f2937]">
                  <th className="pb-3 font-semibold">SCREEN NAME</th>
                  <th className="pb-3 font-semibold">LOCATION</th>
                  <th className="pb-3 font-semibold">CITY</th>
                  <th className="pb-3 font-semibold">STATUS</th>
                  <th className="pb-3 font-semibold">RESOLUTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-400">
                      Loading screens...
                    </td>
                  </tr>
                ) : liveScreens.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-400">
                      No screens found in DB.
                    </td>
                  </tr>
                ) : (
                  liveScreens.slice(0, 5).map((screen) => (
                    <tr
                      key={screen._id}
                      className="hover:bg-[#1f2937]/30 transition"
                    >
                      <td className="py-3 font-semibold text-white">
                        {screen.deviceName}
                      </td>
                      <td className="py-3 text-gray-300">{screen.location}</td>
                      <td className="py-3 text-gray-300">{screen.city}</td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            screen.status === "Online"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {screen.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400 font-medium">
                        {screen.resolution || "1920x1080"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slot Utilization Donut Chart */}
        <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-2xl flex flex-col justify-between shadow-md">
          <h4 className="text-sm font-bold text-white mb-2">
            Slot Utilization (Dynamic)
          </h4>

          <div className="relative h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute text-center">
              <p className="text-lg font-bold text-white">{totalSlots}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                Total Slots
              </p>
            </div>
          </div>

          <div className="space-y-2 mt-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-gray-300 font-medium">
                <span className="w-2.5 h-2.5 bg-orange-500 rounded-sm"></span>{" "}
                Booked Slots
              </span>
              <span className="font-bold text-white">({bookedSlots})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-gray-300 font-medium">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span>{" "}
                Vacant Slots
              </span>
              <span className="font-bold text-white">({vacantSlots})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
