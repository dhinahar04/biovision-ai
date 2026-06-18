"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderUp, UploadCloud, CheckCircle, Database, HelpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DatasetPage() {
  const router = useRouter();
  const [bloodGroup, setBloodGroup] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setSuccess(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!bloodGroup || !selectedFile) return;

    setUploading(true);
    setSuccess(false);

    const formData = new FormData();
    formData.append("blood_group", bloodGroup);
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://localhost:8000/api/dataset-upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Dataset upload failed");

      setSuccess(true);
      setSelectedFile(null);
      // Reset input element
      document.getElementById("dataset-file-input").value = "";
    } catch (err) {
      alert("Failed to upload dataset sample. Ensure backend is running.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 flex flex-col gap-8 text-left">
      
      {/* Back to Dashboard */}
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-neonCyan transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono text-cyberPurple font-bold uppercase tracking-widest">Dataset Expansion</span>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-2">
          <Database className="w-8 h-8 text-cyberPurple" /> Expand Dataset
        </h1>
        <p className="text-sm text-gray-400">Append new training samples to class directories to improve convolutional neural network accuracy.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <form onSubmit={handleUpload} className="flex flex-col gap-6">
          
          {/* Target Blood Group Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Class Folder</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="bg-gray-950 border border-gray-800 text-sm rounded-lg p-2.5 focus:border-neonCyan outline-none text-white font-medium"
              required
            >
              <option value="">Select blood group directory...</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          {/* File Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fingerprint Image File</label>
            <label
              htmlFor="dataset-file-input"
              className="border border-dashed border-gray-800 rounded-lg p-6 bg-gray-950/20 flex flex-col items-center gap-3 cursor-pointer"
            >
              <UploadCloud className="w-8 h-8 text-cyberPurple animate-pulse" />
              <input
                type="file"
                id="dataset-file-input"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                required
              />
              <span className="text-xs font-bold text-neonCyan hover:underline">
                Choose Print Image
              </span>
              {selectedFile && (
                <span className="text-xs text-gray-300 font-mono bg-gray-900 px-2 py-1 rounded border border-gray-800 max-w-xs truncate">
                  {selectedFile.name}
                </span>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={uploading || !bloodGroup || !selectedFile}
            className="w-full py-3 bg-gradient-to-r from-cyberPurple to-neonCyan hover:brightness-110 text-gray-900 font-extrabold text-sm uppercase tracking-wider rounded-lg shadow-glowCyan disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            {uploading ? (
              "Uploading sample..."
            ) : (
              <>
                <FolderUp className="w-4 h-4" /> Save to class folder
              </>
            )}
          </button>

          {success && (
            <div className="flex items-center gap-2 text-xs font-medium text-neonGreen justify-center mt-2">
              <CheckCircle className="w-4 h-4" /> Image successfully uploaded to training dataset!
            </div>
          )}
        </form>
      </div>

      <div className="flex gap-3 p-4 bg-gray-950/45 border border-gray-800 rounded-xl text-xs text-gray-400 items-start leading-relaxed">
        <HelpCircle className="w-4 h-4 text-neonCyan shrink-0 mt-0.5" />
        <p>
          Uploaded files are stored inside the local <code className="text-neonCyan font-mono bg-gray-950 px-1 py-0.5 rounded">dataset/&lt;class&gt;/</code> folders. During the next training session, the PyTorch engine will automatically include these samples in its epochs.
        </p>
      </div>

    </div>
  );
}
