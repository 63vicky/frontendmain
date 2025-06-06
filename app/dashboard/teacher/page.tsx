"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/components/dashboard-layout"
import ExamManagement from "@/components/exam-management"
import AvailableExams from "@/components/available-exams"
import { QuestionDialog } from "@/components/question-dialog"
import { useSearchParams, useRouter } from "next/navigation"
import { dashboardService } from "@/lib/services/dashboard"
import { authService } from "@/lib/services/auth"
import { DashboardStats, RecentExam, Exam, Class } from "@/lib/types"
import { Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function TeacherDashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeacherDashboardContent />
    </Suspense>
  )
}

function TeacherDashboardContent() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentExams, setRecentExams] = useState<RecentExam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const user = authService.getCurrentUser()
      if (!user || user.role !== "teacher") {
        router.push("/login")
        return
      }

      const [statsData, recentExamsData] = await Promise.all([
        dashboardService.getTeacherDashboardStats(user.id),
        dashboardService.getTeacherRecentExams(user.id)
      ])

      setStats(statsData)
      setRecentExams(recentExamsData)
    } catch (err) {
      console.error('Dashboard data fetch error:', err)
      setError("Failed to load dashboard data")
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["overview", "exams", "create", "available-exams"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/dashboard/teacher?tab=${value}`, { scroll: false })
  }

  const handleAddQuestion = (exam: Exam) => {
    setSelectedExam(exam)
    setIsQuestionDialogOpen(true)
  }

  const handleQuestionSuccess = () => {
    fetchDashboardData()
  }

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      setIsQuestionDialogOpen(false)
      setSelectedExam(null)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="teacher">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Create exams, manage classes, and analyze performance</p>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="exams">My Exams</TabsTrigger>
            <TabsTrigger value="create">Create Exam</TabsTrigger>
            <TabsTrigger value="available-exams">Take Exams</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalClasses || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeExams || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.completedExams || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.averageScore || 0}%</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>My Recent Exams</CardTitle>
                  <CardDescription>Recently created or completed exams</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentExams && recentExams.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">No recent exams found</div>
                    ) : (
                      recentExams && recentExams.map((exam) => (
                        <div key={exam.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">{exam.name}</p>
                            <p className="text-sm text-muted-foreground">{exam.date}</p>
                          </div>
                          <span className={`text-sm ${
                            exam.status === "Active"
                              ? "text-green-600"
                              : exam.status === "Completed"
                                ? "text-blue-600"
                                : "text-yellow-600"
                          }`}>
                            {exam.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/dashboard/teacher?tab=exams">View All Exams</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Teacher Performance</CardTitle>
                  <CardDescription>Your exam performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center">
                          A+
                        </div>
                        <p className="font-medium">Active Exams</p>
                      </div>
                      <p className="font-medium">{stats?.activeExams || 0}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                          B+
                        </div>
                        <p className="font-medium">Completed Exams</p>
                      </div>
                      <p className="font-medium">{stats?.completedExams || 0}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center">
                          C+
                        </div>
                        <p className="font-medium">Avg. Exam Score</p>
                      </div>
                      <p className="font-medium">{stats?.averageScore || 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="exams" className="pt-4">
            <ExamManagement onAddQuestion={handleAddQuestion} />
          </TabsContent>

          <TabsContent value="create" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Exam</CardTitle>
                <CardDescription>Set up a new exam with customized questions</CardDescription>
              </CardHeader>
              <CardContent>
                <CreateExamForm />
              </CardContent>
            </Card>
          </TabsContent>



          <TabsContent value="available-exams" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Exams</CardTitle>
                <CardDescription>Take exams that are available for teachers</CardDescription>
              </CardHeader>
              <CardContent>
                <AvailableExams userRole="teacher" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Question Dialog */}
        <QuestionDialog
          exam={selectedExam}
          open={isQuestionDialogOpen}
          onOpenChange={handleDialogClose}
          onSuccess={handleQuestionSuccess}
          initialTab="existing"
          userRole="teacher" // Explicitly set the role to teacher
        />
      </div>
    </DashboardLayout>
  )
}

const CreateExamForm: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    class: "",
    chapter: "",
    duration: 60,
    startDate: "",
    endDate: "",
    attempts: 5,
  })
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    // Fetch classes when component mounts
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
        console.error('Error fetching classes:', err);
        toast({
          title: "Error",
          description: "Failed to load classes. Please try again.",
          variant: "destructive"
        });
      }
    };

    fetchClasses();
  }, [API_URL, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.title || !formData.subject || !formData.class || !formData.chapter) {
      setError("All fields are required")
      return false
    }

    if (formData.duration < 5 || formData.duration > 180) {
      setError("Duration must be between 5 and 180 minutes")
      return false
    }

    if (formData.attempts < 1 || formData.attempts > 5) {
      setError("Maximum attempts must be between 1 and 5")
      return false
    }

    if (!formData.startDate || !formData.endDate) {
      setError("Start and end dates are required")
      return false
    }

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)

    if (endDate <= startDate) {
      setError("End date must be after start date")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/exams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create exam')
      }

      toast({
        title: "Success",
        description: "Exam created successfully",
      })

      // Reset form
      setFormData({
        title: "",
        subject: "",
        class: "",
        chapter: "",
        duration: 60,
        startDate: "",
        endDate: "",
        attempts: 5,
      })

      // Redirect to exams tab
      router.push('/dashboard/teacher?tab=exams')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exam')
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to create exam',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Exam Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Mathematics Chapter 2 Test"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="e.g., Mathematics"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="class">Class</Label>
          <Select
            name="class"
            value={formData.class}
            onValueChange={(value) => handleSelectChange("class", value)}
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
          <Label htmlFor="chapter">Chapter/Topic</Label>
          <Input
            id="chapter"
            name="chapter"
            value={formData.chapter}
            onChange={handleChange}
            placeholder="e.g., Chapter 2: Algebra"
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
            value={formData.duration}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="attempts">Max Attempts</Label>
          <Input
            id="attempts"
            name="attempts"
            type="number"
            value="5"
            readOnly
            className="bg-slate-50"
          />
          <p className="text-xs text-muted-foreground">Students are limited to 5 attempts per exam. The best score will be displayed in results.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" className="mr-2" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Exam'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/dashboard/teacher?tab=exams')}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
