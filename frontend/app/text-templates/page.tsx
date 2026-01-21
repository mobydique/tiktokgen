'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { textTemplatesApi } from '@/lib/api';
import { DashboardLayout } from '../dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
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
    try {
      await textTemplatesApi.delete(id);
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'top':
        return <ArrowUp className="h-3 w-3" />;
      case 'bottom':
        return <ArrowDown className="h-3 w-3" />;
      case 'center':
        return <Minus className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Text Templates</h2>
            <p className="text-muted-foreground">
              Create and manage text overlay templates for your videos
            </p>
          </div>
          <Button asChild>
            <Link href="/text-templates/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
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
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-6 mb-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No text templates yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Create your first text template to add promotional text overlays to your videos
              </p>
              <Button asChild>
                <Link href="/text-templates/new">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Your First Template
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{template.title}</CardTitle>
                    <Badge variant="secondary" className="gap-1">
                      {getPositionIcon(template.position)}
                      {template.position}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-3 mb-4 min-h-[60px] flex items-center">
                    <p className="text-sm font-medium" style={{ fontSize: `${template.font_size}px`, color: template.font_color }}>
                      {template.text_content}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">Size: {template.font_size}px</Badge>
                    {template.telegram_username && (
                      <Badge variant="outline">@{template.telegram_username}</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/text-templates/${template.id}`}>
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
                            This will permanently delete the text template "{template.title}".
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(template.id)}
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
