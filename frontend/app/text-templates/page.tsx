'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { textTemplatesApi } from '@/lib/api';

export default function TextTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await textTemplatesApi.getAll();
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await textTemplatesApi.delete(id);
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Text Templates</h1>
          <Link
            href="/text-templates/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create New Template
          </Link>
        </div>

        {templates.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-4">No text templates yet.</p>
            <Link href="/text-templates/new" className="text-blue-600 hover:underline">
              Create your first template →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2">{template.title}</h3>
                <p className="text-gray-600 mb-4">{template.text_content}</p>
                <div className="flex gap-2 mb-4">
                  <span className="bg-gray-100 px-2 py-1 rounded text-sm">{template.position}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded text-sm">Size: {template.font_size}px</span>
                </div>
                {template.telegram_username && (
                  <p className="text-sm text-gray-500 mb-4">@{template.telegram_username}</p>
                )}
                <div className="flex gap-2">
                  <Link
                    href={`/text-templates/${template.id}`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(template.id)}
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
