'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { textTemplatesApi } from '@/lib/api';

export default function TextTemplateEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';

  const [formData, setFormData] = useState({
    title: '',
    text_content: '',
    telegram_username: '',
    telegram_link: '',
    position: 'bottom' as const,
    font_size: 24,
    font_color: '#FFFFFF',
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    try {
      const response = await textTemplatesApi.getById(id);
      const template = response.data;
      setFormData({
        title: template.title,
        text_content: template.text_content,
        telegram_username: template.telegram_username || '',
        telegram_link: template.telegram_link || '',
        position: template.position,
        font_size: template.font_size,
        font_color: template.font_color,
      });
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Failed to load template');
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
        telegram_username: formData.telegram_username || undefined,
        telegram_link: formData.telegram_link || undefined,
      };

      if (isNew) {
        await textTemplatesApi.create(data);
      } else {
        await textTemplatesApi.update(id, data);
      }

      router.push('/text-templates');
    } catch (error: any) {
      console.error('Error saving template:', error);
      alert(error.response?.data?.error || 'Failed to save template');
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
          {isNew ? 'Create Text Template' : 'Edit Text Template'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Text Content</label>
            <textarea
              value={formData.text_content}
              onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
              className="w-full border rounded px-3 py-2 h-24"
              placeholder="Text to display on video"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Position</label>
            <select
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="top">Top</option>
              <option value="center">Center</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Font Size</label>
              <input
                type="number"
                value={formData.font_size}
                onChange={(e) => setFormData({ ...formData, font_size: parseInt(e.target.value) })}
                className="w-full border rounded px-3 py-2"
                min="12"
                max="72"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Font Color</label>
              <input
                type="color"
                value={formData.font_color}
                onChange={(e) => setFormData({ ...formData, font_color: e.target.value })}
                className="w-full border rounded px-3 py-2 h-10"
              />
            </div>
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

          <div>
            <label className="block text-sm font-medium mb-1">Telegram Link (optional)</label>
            <input
              type="url"
              value={formData.telegram_link}
              onChange={(e) => setFormData({ ...formData, telegram_link: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="https://t.me/..."
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
