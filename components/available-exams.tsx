'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Clock, Calendar, BookOpen, Users, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Exam } from '@/lib/types';

interface AvailableExamsProps {
  userRole: 'teacher' | 'student';
}

export default function AvailableExams({ userRole }: AvailableExamsProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  const { toast } = useToast();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);

      // For teachers, we'll fetch all active exams
      // For students, we'll fetch exams for their class
      const endpoint = userRole === 'teacher' 
        ? `${API_URL}/exams` 
        : `${API_URL}/exams/class/${localStorage.getItem('userClass')}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }

      const data = await response.json();
      setExams(data.data || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('Failed to load exams. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load exams. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (examId: string) => {
    router.push(`/exam/${examId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTimeRemaining = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown';
    }
  };

  const activeExams = exams.filter(exam => exam.status === 'active');
  const scheduledExams = exams.filter(exam => exam.status === 'scheduled');
  const completedExams = exams.filter(exam => exam.status === 'completed');

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="border shadow-sm">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Failed to load exams</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchExams}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>Active ({activeExams.length})</span>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Scheduled ({scheduledExams.length})</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Completed ({completedExams.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="pt-4">
          {activeExams.length === 0 ? (
            <Card className="border shadow-sm">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No active exams available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeExams.map(exam => (
                <Card key={exam._id} className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <Badge className={getStatusColor(exam.status)}>
                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>
                      {exam.subject} - {exam.chapter}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{exam.duration} mins</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Ends {formatTimeRemaining(exam.endDate)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created by: {exam.createdBy?.name || 'Unknown'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => handleStartExam(exam._id)}>
                      Start Exam
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="pt-4">
          {scheduledExams.length === 0 ? (
            <Card className="border shadow-sm">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No scheduled exams available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduledExams.map(exam => (
                <Card key={exam._id} className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <Badge className={getStatusColor(exam.status)}>
                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>
                      {exam.subject} - {exam.chapter}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{exam.duration} mins</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Starts {formatTimeRemaining(exam.startDate)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created by: {exam.createdBy?.name || 'Unknown'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button disabled>
                      Not Available Yet
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="pt-4">
          {completedExams.length === 0 ? (
            <Card className="border shadow-sm">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No completed exams available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedExams.map(exam => (
                <Card key={exam._id} className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <Badge className={getStatusColor(exam.status)}>
                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>
                      {exam.subject} - {exam.chapter}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{exam.duration} mins</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Ended {formatTimeRemaining(exam.endDate)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created by: {exam.createdBy?.name || 'Unknown'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" disabled>
                      Exam Closed
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
