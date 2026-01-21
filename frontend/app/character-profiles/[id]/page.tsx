'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { characterProfilesApi } from '@/lib/api';
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
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

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
              {isNew ? 'Create Character Profile' : 'Edit Character Profile'}
            </h2>
            <p className="text-muted-foreground">
              {isNew
                ? 'Create a new AI character profile for video generation'
                : 'Update your character profile settings'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>
              Configure the character appearance and generation parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Elegant Woman"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="character_prompt">Character Prompt</Label>
                <Textarea
                  id="character_prompt"
                  value={formData.character_prompt}
                  onChange={(e) => setFormData({ ...formData, character_prompt: e.target.value })}
                  placeholder="Describe the character appearance, features, etc. (max 500 characters)"
                  className="min-h-[120px]"
                  required
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.character_prompt.length}/500 characters
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <Select
                    value={formData.style}
                    onValueChange={(value) => setFormData({ ...formData, style: value as any })}
                  >
                    <SelectTrigger id="style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dancing">Dancing</SelectItem>
                      <SelectItem value="sexy">Sexy</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="elegant">Elegant</SelectItem>
                      <SelectItem value="cute">Cute</SelectItem>
                      <SelectItem value="sporty">Sporty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seed">Seed (optional)</Label>
                  <Input
                    id="seed"
                    type="number"
                    value={formData.seed}
                    onChange={(e) => setFormData({ ...formData, seed: e.target.value })}
                    placeholder="Leave empty for random"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use the same seed for consistent character appearance
                  </p>
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
                      Save Profile
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
      </div>
    </DashboardLayout>
  );
}
