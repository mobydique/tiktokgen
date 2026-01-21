'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { characterProfilesApi } from '@/lib/api';

export default function CharacterProfileEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';

  const [formData, setFormData] = useState({
    name: '',
    character_prompt: '',
    seed: '',
    style: 'dancing' as const,
    telegram_username: '',
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      loadProfile();
    }
  }, [id]);

  const loadProfile = async () => {
    try {
      const response = await characterProfilesApi.getById(id);
      const profile = response.data;
      setFormData({
        name: profile.name,
        character_prompt: profile.character_prompt,
        seed: profile.seed?.toString() || '',
        style: profile.style,
        telegram_username: profile.telegram_username || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        seed: formData.seed ? parseInt(formData.seed) : undefined,
        telegram_username: formData.telegram_username || undefined,
      };

      if (isNew) {
        await characterProfilesApi.create(data);
      } else {
        await characterProfilesApi.update(id, data);
      }

      router.push('/character-profiles');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert(error.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {isNew ? 'Create Character Profile' : 'Edit Character Profile'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Character Prompt</label>
            <textarea
              value={formData.character_prompt}
              onChange={(e) => setFormData({ ...formData, character_prompt: e.target.value })}
              className="w-full border rounded px-3 py-2 h-32"
              placeholder="Describe the character appearance, features, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Style</label>
            <select
              value={formData.style}
              onChange={(e) => setFormData({ ...formData, style: e.target.value as any })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="dancing">Dancing</option>
              <option value="sexy">Sexy</option>
              <option value="casual">Casual</option>
              <option value="elegant">Elegant</option>
              <option value="cute">Cute</option>
              <option value="sporty">Sporty</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Seed (optional)</label>
            <input
              type="number"
              value={formData.seed}
              onChange={(e) => setFormData({ ...formData, seed: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Leave empty for random"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telegram Username (optional)</label>
            <input
              type="text"
              value={formData.telegram_username}
              onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="@username"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
