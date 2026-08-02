import React, { useState, useEffect } from "react";
import API from "../services/api";
import {
  FileText,
  Upload,
  Trash2,
  Image as ImageIcon,
  Search,
  CheckCircle2,
  HardDrive,
  Eye,
  RefreshCw,
  Edit3,
} from "lucide-react";

export default function Creatives() {
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMediaId, setCurrentMediaId] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);

  // Form States
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [duration, setDuration] = useState("10");
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchMediaLibrary = async () => {
    try {
      setLoading(true);
      const res = await API.get("/media");
      setCreatives(res.data.mediaFiles || []);
      setError(null);
    } catch (err) {
      console.error("[Fetch Media Error]:", err);
      setError("Failed to load media vault from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaLibrary();
  }, []);

  // Handle Upload or Edit Submission
  const handleSubmitMedia = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);

      if (isEditMode && currentMediaId) {
        // Edit Mode (Update Title / Duration)
        const payload = { title: title.trim(), duration: Number(duration) };
        await API.put(`/media/${currentMediaId}`, payload);
        alert("Media asset updated successfully!");
      } else {
        // Upload Mode (Multipart Form Data -> ImgBB)
        if (!selectedFile) {
          alert("Please select an image file.");
          setUploading(false);
          return;
        }

        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("title", title.trim() || selectedFile.name);
        formData.append("duration", duration);

        await API.post("/media/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        alert("Image uploaded to ImgBB cloud & saved successfully!");
      }

      handleCloseModal();
      fetchMediaLibrary();
    } catch (err) {
      console.error("[Media Action Error]:", err);
      alert(err.response?.data?.message || "Failed to process media action.");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenEdit = (item) => {
    setIsEditMode(true);
    setCurrentMediaId(item._id);
    setTitle(item.title || "");
    setDuration(item.duration || 10);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentMediaId(null);
    setTitle("");
    setSelectedFile(null);
    setDuration("10");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this media asset?"))
      return;
    try {
      await API.delete(`/media/${id}`);
      setCreatives(creatives.filter((c) => c._id !== id));
      alert("Asset deleted successfully.");
    } catch (err) {
      alert("Failed to delete media asset.");
    }
  };

  const filteredCreatives = creatives.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fileName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalSizeMB =
    creatives.reduce((acc, curr) => acc + (curr.fileSize || 0), 0) /
    (1024 * 1024);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Advanced Creatives & Media Vault
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Cloud asset repository with direct ImgBB file upload & management
          </p>
        </div>

        <button
          onClick={() => {
            handleCloseModal();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-orange-600/20 cursor-pointer"
        >
          <Upload size={16} /> Upload Media Asset
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
              Total Vault Assets
            </p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {loading ? "..." : creatives.length} Files
            </h3>
          </div>
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
            <FileText size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              Cloud Storage Used
            </p>
            <h3 className="text-2xl font-bold text-blue-400 mt-1">
              {totalSizeMB.toFixed(2)} MB
            </h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <HardDrive size={22} />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">
              ImgBB Cloud Sync
            </p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
              Operational
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 bg-[#111827] border border-[#1f2937] p-4 rounded-2xl shadow-md">
        <div className="flex items-center gap-3 bg-[#0b0f19] border border-[#1f2937] px-3.5 py-2 rounded-xl w-full max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search assets by title or filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-white outline-none w-full"
          />
        </div>
        <button
          onClick={fetchMediaLibrary}
          className="p-2 bg-[#0b0f19] hover:bg-[#1f2937] text-gray-400 hover:text-white rounded-xl border border-[#1f2937] transition cursor-pointer"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-[#1f2937] bg-[#0b0f19]/40">
                <th className="py-3.5 px-5 font-semibold">ASSET TITLE & ID</th>
                <th className="py-3.5 px-5 font-semibold">FILENAME</th>
                <th className="py-3.5 px-5 font-semibold">LOOP DURATION</th>
                <th className="py-3.5 px-5 font-semibold">CLOUD CDN URL</th>
                <th className="py-3.5 px-5 font-semibold text-right">
                  ADVANCED ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-400">
                    Loading media library...
                  </td>
                </tr>
              ) : filteredCreatives.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-400">
                    No media assets found. Click "Upload Media Asset".
                  </td>
                </tr>
              ) : (
                filteredCreatives.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-[#1f2937]/30 transition"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <ImageIcon size={15} className="text-orange-400" />{" "}
                        {item.title}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {item._id}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-300 font-mono">
                      {item.fileName}
                    </td>
                    <td className="py-3.5 px-5 text-gray-300 font-mono">
                      {item.duration}s
                    </td>
                    <td className="py-3.5 px-5 text-orange-400 font-mono truncate max-w-xs">
                      {item.fileUrl}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewMedia(item)}
                          title="Preview"
                          className="p-1.5 bg-[#0b0f19] hover:bg-[#1f2937] text-blue-400 rounded-lg border border-[#1f2937] transition cursor-pointer"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Edit"
                          className="p-1.5 bg-[#0b0f19] hover:bg-[#1f2937] text-yellow-400 rounded-lg border border-[#1f2937] transition cursor-pointer"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          title="Delete"
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-[#1f2937] transition cursor-pointer"
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

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-orange-500" /> Preview:{" "}
                {previewMedia.title}
              </h3>
              <button
                onClick={() => setPreviewMedia(null)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl h-64 flex items-center justify-center overflow-hidden">
              <img
                src={previewMedia.fileUrl}
                alt={previewMedia.title}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="mt-4 pt-3 border-t border-[#1f2937] flex justify-end">
              <button
                onClick={() => setPreviewMedia(null)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload size={18} className="text-orange-500" />{" "}
                {isEditMode ? "Edit Media Asset" : "Upload to ImgBB Cloud"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitMedia} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Asset Title (*)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Summer Mega Banner"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              {!isEditMode && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Select Image File (*)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    required
                    className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2 text-xs text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Display Duration (Seconds)
                </label>
                <input
                  type="number"
                  placeholder="10"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono focus:border-orange-500"
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
                  disabled={uploading}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-orange-600/20 cursor-pointer disabled:opacity-50"
                >
                  {uploading
                    ? "Uploading to Cloud..."
                    : isEditMode
                      ? "Update Asset"
                      : "Upload & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
