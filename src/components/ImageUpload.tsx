'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  label: string;
  onImagesSelect: (files: File[]) => void;
  id: string;
  multiple?: boolean;
}

export default function ImageUpload({ label, onImagesSelect, id, multiple = false }: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = multiple ? [...selectedFiles, ...files] : [files[0]];
      setSelectedFiles(newFiles);
      onImagesSelect(newFiles);

      const newPreviews: string[] = [];
      let loadedCount = 0;

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          loadedCount++;
          if (loadedCount === files.length) {
            setPreviews(multiple ? [...previews, ...newPreviews] : newPreviews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const updatedPreviews = previews.filter((_, i) => i !== index);
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
    setSelectedFiles(updatedFiles);
    onImagesSelect(updatedFiles);
  };

  const clearAll = () => {
    setPreviews([]);
    onImagesSelect([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {label}
        </label>
        {previews.length > 0 && (
          <button
            onClick={clearAll}
            className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div
        className={`relative group min-h-[180px] w-full border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-500 flex flex-wrap gap-3 p-4 items-center justify-center
          ${previews.length > 0 ? 'border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-500/5' : 'border-gray-200 dark:border-white/5 hover:border-indigo-500/50 hover:bg-gray-50 dark:hover:bg-white/[0.02]'}`}
      >
        {previews.length > 0 ? (
          <div className="flex flex-wrap gap-3 w-full animate-in fade-in zoom-in duration-500">
            {previews.map((preview, index) => (
              <div key={index} className="relative w-32 h-32 rounded-xl overflow-hidden shadow-lg border border-white/20 group/item">
                <Image
                  src={preview}
                  alt={`${label} ${index}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover/item:scale-110"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-black/50 backdrop-blur-md rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {multiple && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 border-2 border-dashed border-indigo-500/30 rounded-xl flex items-center justify-center hover:bg-indigo-500/10 transition-colors group/add"
              >
                <svg className="w-6 h-6 text-indigo-500/50 group-hover/add:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-3 transition-all duration-500 group-hover:scale-105"
          >
            <div className="p-5 bg-white dark:bg-white/5 shadow-xl rounded-2xl group-hover:shadow-indigo-500/10 transition-all">
              <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-5-8l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Upload {label}
            </span>
          </button>
        )}
        <input
          type="file"
          id={id}
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple={multiple}
          className="hidden"
        />
      </div>
    </div>
  );
}
