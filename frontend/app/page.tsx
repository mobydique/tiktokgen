'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { videoGenerationApi } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await videoGenerationApi.getAll();
      const videos = response.data;
      
      setStats({
        total: videos.length,
        completed: videos.filter((v: any) => v.status === 'completed').length,
        processing: videos.filter((v: any) => v.status === 'processing' || v.status === 'pending').length,
        failed: videos.filter((v: any) => v.status === 'failed').length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">TikTok Video Generator</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm mb-2">Total Videos</h3>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm mb-2">Processing</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm mb-2">Failed</h3>
            <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/character-profiles" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">Character Profiles</h2>
            <p className="text-gray-600">Manage AI character profiles for consistent video generation</p>
          </Link>

          <Link href="/text-templates" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">Text Templates</h2>
            <p className="text-gray-600">Create and manage text overlay templates</p>
          </Link>

          <Link href="/videos/generate" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">Generate Video</h2>
            <p className="text-gray-600">Create a new video with AI</p>
          </Link>
        </div>

        <div className="mt-8">
          <Link href="/videos" className="text-blue-600 hover:underline">
            View all generated videos →
          </Link>
        </div>
      </div>
    </div>
  );
}
