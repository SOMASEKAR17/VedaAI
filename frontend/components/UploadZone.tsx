"use client";

import { useState, useRef } from "react";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import Image from 'next/image';

export default function UploadZone() {
  const [dragActive, setDragActive] = useState(false);
  const { fileName, setFile } = useAssignmentStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2 w-full select-none">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-[24px] p-8 flex flex-col items-center justify-center gap-3 text-center transition-all duration-300 ${
          dragActive
            ? "border-[#f06e30] bg-[#fdf5f2]"
            : "border-[#dcdcdc] bg-white hover:border-[#b0b0b0]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple={false}
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleChange}
        />

        <div className="w-12 h-12 rounded-full bg-[#dbdbdb] flex items-center justify-center text-[#f06e30] mb-1 shadow-sm">
          <Image 
          src={"upload.svg"}
          alt={"upload"}
          width={20}
          height={20}
          />
        </div>

        <span className="text-[#1c1c1c] font-bold text-sm tracking-tight">
          {fileName ? fileName : "Choose a file or drag & drop it here"}
        </span>

        <span className="text-[#7c7c7c] text-xs font-medium">
          JPEG, PNG, upto 10MB
        </span>

        <button
          type="button"
          onClick={onButtonClick}
          className="bg-white hover:bg-[#f5f5f5] text-[#1c1c1c] font-bold py-2.5 px-6 rounded-full text-xs transition-all duration-200 shadow-sm border border-[#e5e5e5] cursor-pointer mt-1"
        >
          Browse Files
        </button>
      </div>

      <p className="text-center text-xs text-[#7c7c7c] font-medium mt-1">
        Upload images of your preferred document/image
      </p>
    </div>
  );
}
