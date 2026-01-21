'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { characterProfilesApi } from '@/lib/api';
import { DashboardLayout } from '../dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Sparkles,
  Hash,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
    try {
      await characterProfilesApi.delete(id);
      loadProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Failed to delete profile');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Character Profiles</h2>
            <p className="text-muted-foreground">
              Manage AI character profiles for consistent video generation
            </p>
          </div>
          <Button asChild>
            <Link href="/character-profiles/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Profile
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No character profiles yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Create your first character profile to start generating consistent AI videos
              </p>
              <Button asChild>
                <Link href="/character-profiles/new">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Your First Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{profile.name}</CardTitle>
                    <Badge variant="secondary">{profile.style}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2 mt-2">
                    {profile.character_prompt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.seed && (
                      <Badge variant="outline" className="gap-1">
                        <Hash className="h-3 w-3" />
                        Seed: {profile.seed}
                      </Badge>
                    )}
                    {profile.telegram_username && (
                      <Badge variant="outline">@{profile.telegram_username}</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/character-profiles/${profile.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex-1">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the character profile "{profile.name}".
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(profile.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
