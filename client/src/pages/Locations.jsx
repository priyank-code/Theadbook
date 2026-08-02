import React, { useState, useEffect } from "react";
import API from "../services/api";
import {
  MapPin,
  Plus,
  Monitor,
  Building2,
  Trash2,
  Search,
  Activity,
  Eye,
  RefreshCw,
} from "lucide-react";

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Form States matching backend requirements (locationName, city, address, zone, coordinates)
  const [locationName, setLocationName] = useState("");
  const [cityName, setCityName] = useState("");
  const [address, setAddress] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Locations from Backend API
  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await API.get("/locations");
      setLocations(res.data.locations || []);
      setError(null);
    } catch (err) {
      console.error("[Fetch Locations Error]:", err);
      setError("Failed to load location hubs from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Handle Add New Location Hub (hits POST /locations/create)
  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!locationName || !cityName || !address) return;

    try {
      const payload = {
        locationName: locationName.trim(),
        city: cityName.trim(),
        address: address.trim(),
        zone: zoneName.trim() || "Main Commercial Zone",
        coordinates: { lat: 0, lng: 0 }, // Default coordinates structure
      };

      await API.post("/locations/create", payload);
      alert("Location hub created successfully!");

      // Reset form fields & close modal
      setLocationName("");
      setCityName("");
      setAddress("");
      setZoneName("");
      setIsModalOpen(false);
      fetchLocations(); // Refresh list dynamically
    } catch (err) {
      console.error("[Add Location Error]:", err);
      alert(err.response?.data?.message || "Failed to create location hub.");
    }
  };

  // Handle Delete Location
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location hub?"))
      return;
    try {
      await API.delete(`/locations/${id}`);
      setLocations(locations.filter((l) => l._id !== id));
      alert("Location deleted successfully.");
    } catch (err) {
      console.error("[Delete Location Error]:", err);
      alert(err.response?.data?.message || "Failed to delete location.");
    }
  };

  // Search filter across venue name, city, zone, or address
  const filteredLocations = locations.filter(
    (loc) =>
      loc.locationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.address?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Advanced Location Hubs & Venues
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Commercial properties, screen clustering, and regional health
            monitoring
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-orange-600/20 cursor-pointer"
        >
          <Plus size={16} /> Add Location Hub
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Total Commercial Venues
            </p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {loading ? "..." : locations.length} Hubs
            </h3>
          </div>
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
            <Building2 size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Network Coverage
            </p>
            <h3 className="text-2xl font-bold text-blue-400 mt-1">
              Multi-City
            </h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Monitor size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Hub Network Health
            </p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
              98.2% Optimal
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Activity size={22} />
          </div>
        </div>
      </div>

      {/* Search Bar & Refresh */}
      <div className="flex items-center justify-between gap-4 bg-[#111827] border border-[#1f2937] p-4 rounded-2xl shadow-md">
        <div className="flex items-center gap-3 bg-[#0b0f19] border border-[#1f2937] px-3.5 py-2 rounded-xl w-full max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search venue, city, zone or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-white outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLocations}
            className="p-2 bg-[#0b0f19] hover:bg-[#1f2937] text-gray-400 hover:text-white rounded-xl border border-[#1f2937] transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={14} />
          </button>
          <div className="text-xs text-gray-400 font-medium">
            Showing:{" "}
            <span className="text-white font-bold">
              {filteredLocations.length}
            </span>{" "}
            entries
          </div>
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-[#1f2937] bg-[#0b0f19]/40">
                <th className="py-3.5 px-5 font-semibold">
                  LOCATION ID & VENUE
                </th>
                <th className="py-3.5 px-5 font-semibold">CITY & ZONE</th>
                <th className="py-3.5 px-5 font-semibold">ADDRESS</th>
                <th className="py-3.5 px-5 font-semibold">STATUS</th>
                <th className="py-3.5 px-5 font-semibold text-right">
                  ADVANCED ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-400">
                    Loading locations from server...
                  </td>
                </tr>
              ) : filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-400">
                    No location hubs found. Click "Add Location Hub" to create
                    one.
                  </td>
                </tr>
              ) : (
                filteredLocations.map((loc) => (
                  <tr
                    key={loc._id}
                    className="hover:bg-[#1f2937]/30 transition"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <Building2 size={15} className="text-orange-500" />{" "}
                        {loc.locationName}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {loc._id}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-300">
                      <div className="font-medium text-white">{loc.city}</div>
                      <div className="text-[10px] text-gray-400">
                        {loc.zone || "Main Zone"}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-300 truncate max-w-xs">
                      {loc.address}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedLocation(loc)}
                          title="View Hub Analytics"
                          className="p-1.5 bg-[#0b0f19] hover:bg-[#1f2937] text-blue-400 rounded-lg border border-[#1f2937] transition cursor-pointer"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(loc._id)}
                          title="Delete Location"
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

      {/* Hub Analytics Modal */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 size={18} className="text-orange-500" /> Hub
                Analytics: {selectedLocation.locationName}
              </h3>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-300 bg-[#0b0f19] p-4 rounded-xl border border-[#1f2937]">
              <div className="flex justify-between">
                <span>City / Zone:</span>{" "}
                <strong className="text-white">
                  {selectedLocation.city} ({selectedLocation.zone || "N/A"})
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Full Address:</span>{" "}
                <strong className="text-gray-200">
                  {selectedLocation.address}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Database Reference ID:</span>{" "}
                <strong className="text-orange-400 font-mono">
                  {selectedLocation._id}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Hub Status:</span>{" "}
                <strong className="text-emerald-400">
                  Active & Operational
                </strong>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedLocation(null)}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition cursor-pointer"
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin size={18} className="text-orange-500" /> Register
                Location Hub
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Venue Name (*)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Orion Mall Atrium"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  City (*)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ahmedabad"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Full Address (*)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SG Highway, Near Vastrapur Lake"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Zone / Commercial Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. West Zone"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
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
                  Save Hub Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
