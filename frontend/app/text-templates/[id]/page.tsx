'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { textTemplatesApi } from '@/lib/api';
import { DashboardLayout } from '../../dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Loader2, ArrowUp, ArrowDown, Minus } from 'lucide-react';

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

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'top':
        return <ArrowUp className="h-4 w-4" />;
      case 'bottom':
        return <ArrowDown className="h-4 w-4" />;
      case 'center':
        return <Minus className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {isNew ? 'Create Text Template' : 'Edit Text Template'}
            </h2>
            <p className="text-muted-foreground">
              {isNew
                ? 'Create a new text overlay template for your videos'
                : 'Update your text template settings'}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>
                Configure the text content and display settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Telegram Promotion"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text_content">Text Content</Label>
                  <Textarea
                    id="text_content"
                    value={formData.text_content}
                    onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                    placeholder="Text to display on video"
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => setFormData({ ...formData, position: value as any })}
                    >
                      <SelectTrigger id="position">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">
                          <div className="flex items-center gap-2">
                            <ArrowUp className="h-4 w-4" />
                            Top
                          </div>
                        </SelectItem>
                        <SelectItem value="center">
                          <div className="flex items-center gap-2">
                            <Minus className="h-4 w-4" />
                            Center
                          </div>
                        </SelectItem>
                        <SelectItem value="bottom">
                          <div className="flex items-center gap-2">
                            <ArrowDown className="h-4 w-4" />
                            Bottom
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font_size">Font Size</Label>
                    <Input
                      id="font_size"
                      type="number"
                      value={formData.font_size}
                      onChange={(e) => setFormData({ ...formData, font_size: parseInt(e.target.value) })}
                      min="12"
                      max="72"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font_color">Font Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="font_color"
                      type="color"
                      value={formData.font_color}
                      onChange={(e) => setFormData({ ...formData, font_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.font_color}
                      onChange={(e) => setFormData({ ...formData, font_color: e.target.value })}
                      placeholder="#FFFFFF"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram_username">Telegram Username (optional)</Label>
                  <Input
                    id="telegram_username"
                    value={formData.telegram_username}
                    onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
                    placeholder="@username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram_link">Telegram Link (optional)</Label>
                  <Input
                    id="telegram_link"
                    type="url"
                    value={formData.telegram_link}
                    onChange={(e) => setFormData({ ...formData, telegram_link: e.target.value })}
                    placeholder="https://t.me/..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Template
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>See how your text will appear on the video</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-lg aspect-[9/16] flex items-center justify-center overflow-hidden">
                <div
                  className="absolute text-center px-4 font-bold"
                  style={{
                    fontSize: `${formData.font_size}px`,
                    color: formData.font_color,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    ...(formData.position === 'top' && { top: '50px' }),
                    ...(formData.position === 'center' && { top: '50%', transform: 'translateY(-50%)' }),
                    ...(formData.position === 'bottom' && { bottom: '50px' }),
                  }}
                >
                  {formData.text_content || 'Your text will appear here'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
