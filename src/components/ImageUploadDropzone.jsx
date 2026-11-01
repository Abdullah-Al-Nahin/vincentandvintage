'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, Loader2, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

export default function ImageUploadDropzone({
  value,
  onChange,
  label = 'Upload Image',
  helper = 'PNG, JPG, WEBP or MP4 up to 50MB (auto-compressed on Cloudinary)',
  folder = 'vincent-and-vintage'
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      onChange(data.url);
    } catch (err) {
      setErrorMsg(err.message || 'Upload failed. Try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const isVideo = value && (value.endsWith('.mp4') || value.endsWith('.webm') || value.includes('/video/'));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-display uppercase tracking-wider font-bold text-[#3d2b1f]">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-[11px] font-display uppercase tracking-wider text-[#a8825b] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          {showManualInput ? 'Use File Upload' : 'Paste URL Manually'}
        </button>
      </div>

      {showManualInput ? (
        <input
          type="url"
          placeholder="https://res.cloudinary.com/..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-[#ddd8cf] rounded-xl p-3 text-sm focus:outline-none focus:border-[#a8825b] bg-white font-mono text-xs"
        />
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-4 transition-all text-center ${
            dragActive
              ? 'border-[#a8825b] bg-[#a8825b]/5'
              : 'border-[#e3ded3] bg-[#fcfbf7] hover:border-[#a8825b]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {isUploading ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-2 text-[#a8825b]">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-xs font-display uppercase tracking-widest font-bold">
                Compressing &amp; Uploading to Cloudinary CDN...
              </p>
              <p className="text-[11px] text-[#5a5d66]">Auto-converting to high-res WebP / AVIF</p>
            </div>
          ) : value ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 text-left p-1">
              <div className="relative w-24 h-24 sm:w-28 sm:h-24 rounded-lg overflow-hidden border border-[#e3ded3] bg-[#ede8dc] shrink-0 shadow-xs">
                {isVideo ? (
                  <video src={value} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                ) : (
                  <img src={value} alt="Uploaded Media" className="w-full h-full object-cover" />
                )}
                <span className="absolute top-1 right-1 bg-emerald-600 text-white p-0.5 rounded-full shadow">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-display uppercase tracking-wider font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Cloud CDN Ready</span>
                </div>
                <p className="text-[11px] font-mono text-[#858891] truncate">{value}</p>
                <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs bg-[#ede8dc] hover:bg-[#a8825b] hover:text-white text-[#3d2b1f] px-3 py-1 rounded-md font-display uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                  >
                    Change Media
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="text-xs text-red-600 hover:text-red-800 px-2 py-1 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="py-5 cursor-pointer flex flex-col items-center justify-center space-y-2 group"
            >
              <div className="h-10 w-10 rounded-full bg-[#ede8dc] text-[#a8825b] group-hover:bg-[#a8825b] group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-display uppercase tracking-wider font-bold text-[#3d2b1f] group-hover:text-[#a8825b] transition-colors">
                  Click to Browse or Drag &amp; Drop Photo / Video
                </p>
                <p className="text-[11px] text-[#858891] mt-0.5">{helper}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="mt-2 text-xs text-red-600 font-semibold">{errorMsg}</p>
          )}
        </div>
      )}
    </div>
  );
}

