"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Exam, Question } from "@/lib/types"
import { useFetch } from "@/hooks/use-fetch"
import { useMutation } from "@/hooks/use-mutation"
import { api } from "@/lib/api"
import { authService } from "@/lib/services/auth"
import { RefreshCw, AlertCircle, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { QuestionDialog } from "./question-dialog"

interface ExamManagementProps {
  onAddQuestion?: (exam: Exam) => void;
}

export default function ExamManagement({ onAddQuestion }: ExamManagementProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("active")
  const [retryCount, setRetryCount] = useState(0)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [userRole, setUserRole] = useState<string>("teacher")
  const { toast } = useToast()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

  // Get user role when component mounts
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role) {
          setUserRole(userData.role);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Fetch classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(`${API_URL}/classes`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }

        const data = await response.json();
        setClasses(data.data || []);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch classes",
          variant: "destructive"
        })
      }
    };

    fetchClasses();
  }, [API_URL, toast]);

  // Memoize fetch options
  const fetchOptions = useMemo(() => ({
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
    onError: (error: Error) => {
      if (error.message.includes('Too many requests')) {
        toast({
          title: 'Rate Limit Exceeded',
          description: 'Please wait a moment before trying again.',
          variant: 'destructive',
        });
      }
    },
  }), [toast]);

  // Fetch exams
  const { data: examsData, loading, error, refetch } = useFetch<{ success: boolean; data: Exam[] }>(
    `${API_URL}/exams`,
    fetchOptions
  );

  // Memoize the questions URL and fetch options
  const questionsFetchOptions = useMemo(() => ({
    ...fetchOptions,
    autoFetch: false, // Disable auto-fetch
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch questions',
        variant: 'destructive'
      });
    }
  }), [fetchOptions, toast]);

  const questionsUrl = useMemo(() => {
    if (!selectedExam?._id) return '';
    return `${API_URL}/questions/exam/${selectedExam._id}`;
  }, [selectedExam?._id, API_URL]);

  // Fetch questions only when URL changes and dialog is open
  const { data: questionsData, refetch: refetchQuestions } = useFetch<{ success: boolean; data: Question[] }>(
    questionsUrl,
    questionsFetchOptions
  );

  // Fetch questions when dialog opens or exam changes
  useEffect(() => {
    if (isQuestionDialogOpen && questionsUrl) {
      refetchQuestions();
    }
  }, [isQuestionDialogOpen, questionsUrl, refetchQuestions, selectedExam?._id]);


  // Create question mutation
  const { mutate: createQuestion, loading: creatingQuestion } = useMutation<Question>(
    `${API_URL}/questions`,
    'POST',
    {
      onSuccess: () => {
        refetch();
        setIsQuestionDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Question added successfully',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to add question',
          variant: 'destructive',
        });
      },
    }
  );

  // Update question mutation
  const { mutate: updateQuestion, loading: updatingQuestion } = useMutation<Question>(
    `${API_URL}/questions`,
    'PUT',
    {
      onSuccess: () => {
        refetch();
        toast({
          title: 'Success',
          description: 'Question updated successfully',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update question',
          variant: 'destructive',
        });
      },
    }
  );

  // Delete question mutation
  const { mutate: deleteQuestion, loading: deletingQuestion } = useMutation<Question>(
    `${API_URL}/questions`,
    'DELETE',
    {
      onSuccess: () => {
        refetch();
        toast({
          title: 'Success',
          description: 'Question deleted successfully',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete question',
          variant: 'destructive',
        });
      },
    }
  );

  // Handle manual refresh with retry logic
  const handleRefresh = useCallback(() => {
    if (retryCount < 3) {
      refetch();
      setRetryCount(prev => prev + 1);
    } else {
      toast({
        title: 'Too Many Retries',
        description: 'Please wait a moment before trying again.',
        variant: 'destructive',
      });
    }
  }, [refetch, retryCount, toast]);

  // Reset retry count after 1 minute
  useEffect(() => {
    if (retryCount > 0) {
      const timer = setTimeout(() => {
        setRetryCount(0);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [retryCount]);

  // Filter exams based on search query and tab
  const filteredExams = useMemo(() => {
    if (!examsData?.data) return [];
    return examsData.data.filter((exam) => {
      const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = activeTab === 'active'
        ? ['active', 'scheduled', 'draft'].includes(exam.status)
        : ['completed', 'archived'].includes(exam.status);

      return matchesSearch && matchesStatus;
    });
  }, [examsData?.data, searchQuery, activeTab]);

  // Handle add question
  const handleAddQuestion = useCallback((exam: Exam) => {
    if (onAddQuestion) {
      onAddQuestion(exam);
    } else {
      setSelectedExam(exam);
      setIsQuestionDialogOpen(true);
    }
  }, [onAddQuestion]);

  // Handle edit exam
  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setIsEditDialogOpen(true);
  };

  // Handle delete exam
  const handleDeleteExam = async (examId: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        const response = await fetch(`${API_URL}/exams/${examId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete exam');
        }

        toast({
          title: 'Success',
          description: 'Exam deleted successfully'
        });

        refetch();
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete exam',
          variant: 'destructive'
        });
      }
    }
  };

  // Handle question dialog success
  const handleQuestionSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle dialog close
  const handleDialogClose = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setIsQuestionDialogOpen(false);
      setSelectedExam(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={handleRefresh} disabled={retryCount >= 3}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Exam Management</CardTitle>
            <CardDescription>Manage your exams and questions</CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading || retryCount >= 3}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div className="relative w-64">
            <Input
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Button asChild>
            <Link href={`/dashboard/${userRole}?tab=create`}>Create New Exam</Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">Active Exams</TabsTrigger>
            <TabsTrigger value="completed">Completed Exams</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="space-y-4">
              {filteredExams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {activeTab} exams found
                </div>
              ) : (
                filteredExams.map((exam) => (
                  <Card key={exam._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{exam.title}</CardTitle>
                          <CardDescription>
                            {exam.subject} - {typeof exam.class === 'object' ? `${exam.class.name} ${exam.class.section}` : exam.class}
                            {typeof exam.createdBy === 'object' && exam.createdBy?.role === 'principal' && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                Created by Principal
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <Badge variant={exam.status === 'active' ? 'default' : 'secondary'}>
                          {exam.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            Duration: {exam.duration} minutes
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Max Attempts: {exam.attempts.max}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            Start: {new Date(exam.startDate).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            End: {new Date(exam.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddQuestion(exam)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditExam(exam)}
                            // Disable edit button for exams created by principals if the user is a teacher
                            disabled={typeof exam.createdBy === 'object' && exam.createdBy?.role === 'principal' && userRole === 'teacher'}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Exam
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteExam(exam._id)}
                            // Disable delete button for exams created by principals if the user is a teacher
                            disabled={typeof exam.createdBy === 'object' && exam.createdBy?.role === 'principal' && userRole === 'teacher'}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Question Dialog */}
      <QuestionDialog
        exam={selectedExam}
        open={isQuestionDialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={handleQuestionSuccess}
        existingQuestions={questionsData?.data || []}
        initialTab="existing"
        userRole={userRole as "teacher" | "principal"} // Pass the user role to restrict functionality
      />

      {/* Edit Exam Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
            <DialogDescription>
              Update exam details
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editingExam) return;

              const formData = new FormData(e.currentTarget);
              try {
                const response = await fetch(`${API_URL}/exams/${editingExam._id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify({
                    title: formData.get('title'),
                    subject: formData.get('subject'),
                    class: formData.get('class'),
                    chapter: formData.get('chapter'),
                    duration: parseInt(formData.get('duration') as string),
                    startDate: formData.get('startDate'),
                    endDate: formData.get('endDate'),
                    attempts: parseInt(formData.get('attempts') as string)
                  })
                });

                if (!response.ok) {
                  throw new Error('Failed to update exam');
                }

                toast({
                  title: 'Success',
                  description: 'Exam updated successfully'
                });

                setIsEditDialogOpen(false);
                refetch();
              } catch (error) {
                toast({
                  title: 'Error',
                  description: error instanceof Error ? error.message : 'Failed to update exam',
                  variant: 'destructive'
                });
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Exam Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingExam?.title}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  defaultValue={editingExam?.subject}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select
                  name="class"
                  defaultValue={typeof editingExam?.class === 'object' ? editingExam?.class._id : editingExam?.class}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls._id} value={cls._id}>
                        {cls.name} - {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapter">Chapter</Label>
                <Input
                  id="chapter"
                  name="chapter"
                  defaultValue={editingExam?.chapter}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="5"
                  max="180"
                  defaultValue={editingExam?.duration}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attempts">Max Attempts</Label>
                <Input
                  id="attempts"
                  name="attempts"
                  type="number"
                  min="1"
                  max="5"
                  defaultValue={editingExam?.attempts.max}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={editingExam?.startDate.split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  defaultValue={editingExam?.endDate.split('T')[0]}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Update Exam
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
