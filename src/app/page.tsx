'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import Image from 'next/image';

export default function Home() {
  const [roomImages, setRoomImages] = useState<File[]>([]);
  const [furnitureImages, setFurnitureImages] = useState<File[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (roomImages.length === 0 || furnitureImages.length === 0) {
      alert("Please upload at least one room image and one furniture image.");
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('room', roomImages[0]); // Using the first room image

      furnitureImages.forEach((file, index) => {
        formData.append(`furniture_${index}`, file);
      });
      formData.append('furniture_count', furnitureImages.length.toString());
      formData.append('prompt', prompt);

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }

      const data = await response.json();
      setResultImage(data.imageUrl);
    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message}. Ensure GOOGLE_API_KEY is set.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#080808] text-black dark:text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Glow Effect */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center px-12 border-b border-gray-100 dark:border-white/[0.05] bg-white/80 dark:bg-black/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-xs text-white font-black tracking-tighter">F</span>
          </div>
          <h1 className="text-sm font-bold tracking-[0.2em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-black dark:from-white to-gray-500">
            Furnish.AI
          </h1>
        </div>
      </header>

      <div className="pt-32 pb-40 px-12 max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-20">
        {/* Input Section */}
        <div className="xl:col-span-5 space-y-12">
          <div className="space-y-6">
            <h2 className="text-6xl font-bold tracking-tight leading-[1.1]">
              Your space, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">redefined.</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-lg">
              Upload multiple furniture pieces and watch them merge into your room with flawless perspective and lighting.
            </p>
          </div>

          <div className="space-y-10">
            <div className="space-y-8">
              <ImageUpload
                id="room-upload"
                label="Step 1: The Room"
                onImagesSelect={setRoomImages}
              />
              <ImageUpload
                id="furniture-upload"
                label="Step 2: The Furniture"
                onImagesSelect={setFurnitureImages}
                multiple
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Step 3: Placement Instructions
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Place the primary sofa against the windows, and the coffee table in front of it..."
                className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.08] rounded-2xl p-6 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all min-h-[120px] resize-none shadow-inner"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || roomImages.length === 0 || furnitureImages.length === 0}
              className="group relative w-full h-16 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center justify-center gap-3">
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Processing Vision...</span>
                  </>
                ) : (
                  <>
                    <span className="group-hover:text-white transition-colors">Start Rendering</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="xl:col-span-7">
          <div className="sticky top-32 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />
            <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.08] flex items-center justify-center shadow-2xl transition-all duration-700 group-hover:border-indigo-500/30">
              {resultImage ? (
                <Image
                  src={resultImage}
                  alt="Generated Space"
                  fill
                  className="object-cover animate-in fade-in duration-1000"
                />
              ) : (
                <div className="text-center space-y-6">
                  <div className="mx-auto w-24 h-24 bg-white dark:bg-white/[0.03] rounded-3xl flex items-center justify-center shadow-xl border border-gray-100 dark:border-white/[0.05]">
                    <svg className="w-10 h-10 text-indigo-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-500/50">
                      Studio Canvas
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">
                      Your redefined space will appear here
                    </p>
                  </div>
                </div>
              )}

              {isGenerating && (
                <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center gap-6">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-sm font-bold tracking-widest uppercase">Rendering Scene</p>
                    <p className="text-xs text-indigo-500 font-medium animate-pulse">Analyzing lighting & materials...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
