'use client';

import { useEffect, useState } from 'react';

export default function VideoTestPage() {
  const [apiUrl, setApiUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoError, setVideoError] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    setApiUrl(url);
    setVideoUrl(`${url}/background-video.mp4`);
  }, []);

  const testDirectAccess = () => {
    window.open(videoUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Video Test Page</h1>
        
        {/* URL Info */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Configuration</h2>
          <div className="space-y-2 text-gray-300">
            <p><strong>API Base URL:</strong> {apiUrl}</p>
            <p><strong>Video URL:</strong> {videoUrl}</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          </div>
          <button 
            onClick={testDirectAccess}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Test Direct Access
          </button>
        </div>

        {/* Video Test */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Video Preview Test</h2>
          
          {videoUrl && (
            <div className="space-y-4">
              {/* Large Video */}
              <div className="w-full max-w-md mx-auto">
                <video
                  src={videoUrl}
                  className="w-full h-auto border border-gray-600 rounded"
                  controls
                  muted
                  playsInline
                  onLoadStart={() => console.log('Video loading started')}
                  onLoadedData={() => {
                    console.log('Video loaded successfully');
                    setVideoLoaded(true);
                  }}
                  onError={(e) => {
                    console.error('Video error:', e);
                    setVideoError(`Failed to load video: ${videoUrl}`);
                  }}
                />
              </div>

              {/* Small Preview */}
              <div className="w-24 h-16 mx-auto border border-gray-600 rounded overflow-hidden bg-gray-700">
                <video
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                  onError={(e) => console.error('Small video error:', e)}
                />
              </div>

              {/* Status */}
              <div className="text-center space-y-2">
                {videoLoaded && <p className="text-green-400">✓ Video loaded successfully</p>}
                {videoError && <p className="text-red-400">✗ {videoError}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Fetch Test */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Network Test</h2>
          <button 
            onClick={async () => {
              try {
                const response = await fetch(videoUrl);
                console.log('Fetch response:', response);
                if (response.ok) {
                  alert('✓ Video URL is accessible via fetch');
                } else {
                  alert(`✗ Fetch failed: ${response.status} ${response.statusText}`);
                }
              } catch (error) {
                console.error('Fetch error:', error);
                alert(`✗ Fetch error: ${error}`);
              }
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Test Network Access
          </button>
        </div>
      </div>
    </div>
  );
}
