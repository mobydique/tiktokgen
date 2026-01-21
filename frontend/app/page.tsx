'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { videoGenerationApi } from '@/lib/api';
import { DashboardLayout } from './dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Video,
  CheckCircle2,
  Loader2,
  XCircle,
  Users,
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Videos',
      value: stats.total,
      icon: Video,
      description: 'All generated videos',
      color: 'text-muted-foreground',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      description: 'Ready to download',
      color: 'text-green-600',
    },
    {
      title: 'Processing',
      value: stats.processing,
      icon: Loader2,
      description: 'In progress',
      color: 'text-blue-600',
    },
    {
      title: 'Failed',
      value: stats.failed,
      icon: XCircle,
      description: 'Need attention',
      color: 'text-red-600',
    },
  ];

  const quickActions = [
    {
      title: 'Character Profiles',
      description: 'Manage AI character profiles for consistent video generation',
      href: '/character-profiles',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Text Templates',
      description: 'Create and manage text overlay templates',
      href: '/text-templates',
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      title: 'Generate Video',
      description: 'Create a new video with AI',
      href: '/videos/generate',
      icon: Sparkles,
      color: 'bg-gradient-to-br from-pink-500 to-orange-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your video generation activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-2`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest generated videos</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href="/videos">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.total === 0 ? (
              <div className="text-center py-8">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No videos generated yet</p>
                <Button asChild>
                  <Link href="/videos/generate">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Your First Video
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {stats.completed > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{stats.completed} video{stats.completed > 1 ? 's' : ''} ready to download</span>
                  </div>
                )}
                {stats.processing > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                    <span>{stats.processing} video{stats.processing > 1 ? 's' : ''} being processed</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
