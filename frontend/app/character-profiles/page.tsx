'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { characterProfilesApi } from '@/lib/api';

export default function CharacterProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const response = await characterProfilesApi.getAll();
      setProfiles(response.data);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;

    try {
      await characterProfilesApi.delete(id);
      loadProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Failed to delete profile');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Character Profiles</h1>
          <Link
            href="/character-profiles/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create New Profile
          </Link>
        </div>

        {profiles.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-4">No character profiles yet.</p>
            <Link href="/character-profiles/new" className="text-blue-600 hover:underline">
              Create your first profile →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div key={profile.id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2">{profile.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{profile.character_prompt}</p>
                <div className="flex gap-2 mb-4">
                  <span className="bg-gray-100 px-2 py-1 rounded text-sm">{profile.style}</span>
                  {profile.seed && (
                    <span className="bg-gray-100 px-2 py-1 rounded text-sm">Seed: {profile.seed}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/character-profiles/${profile.id}`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(profile.id)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
