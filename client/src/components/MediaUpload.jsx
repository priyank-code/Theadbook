import React, { useState } from "react";
import API from "../services/api";
import { Upload, Image as ImageIcon, CheckCircle, Loader2, AlertCircle } from "lucide-react";

export default function MediaUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const IMGBB_API_KEY = "f30d2c51e46ba318cc7b1a0d1e474ae8"; 

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image file first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Step 1: Convert file to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        const base64Data = reader.result.split(",")[1];

        const formData = new FormData();
        formData.append("image", base64Data);

        // Step 2: Upload to ImgBB API
        const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: "POST",
          body: formData,
        });
        const imgbbResult = await imgbbResponse.json();

        if (!imgbbResult.success) {
          throw new Error("Failed to upload image to ImgBB cloud.");
        }

        const directImageUrl = imgbbResult.data.url;

        // Step 3: Send the direct ImgBB URL to our Node/MongoDB backend
        const backendResponse = await API.post("/media/upload-imgbb", {
          title: title || file.name,
          fileUrl: directImageUrl,
          duration: 10,
        });

        setLoading(false);
        setSuccess("Image successfully uploaded to Cloud & Saved!");
        setTitle("");
        setFile(null);
        if (onUploadSuccess) onUploadSuccess(backendResponse.data.media);
      };
    } catch (err) {
      setLoading(false);
      setError(err.message || "Something went wrong during upload.");
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 text-white max-w-md">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
        <ImageIcon className="text-orange-500" size={18} /> Upload Image
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
          <AlertCircle size={15} /> <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400 flex items-center gap-2">
          <CheckCircle size={15} /> <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Image Title</label>
          <input
            type="text"
            placeholder="e.g., Summer Billboard Banner"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Select Image File</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-orange-600/20"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Uploading to Cloud...
            </>
          ) : (
            <>
              <Upload size={16} /> Upload to ImgBB & Save
            </>
          )}
        </button>
      </form>
    </div>
  );
}