"use client"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"
import UserManagement from "@/components/user-management"
import ExamManagement from "@/components/exam-management"
import { useSearchParams, useRouter } from "next/navigation"

export default function TeacherDashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeacherDashboardContent />
    </Suspense>
  )
}

function TeacherDashboardContent() {
  const [activeTab, setActiveTab] = useState("overview")
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["overview", "exams", "create", "students"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/dashboard/teacher?tab=${value}`, { scroll: false })
  }

  return (
    <DashboardLayout role="teacher">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Create exams, manage students, and analyze performance</p>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="exams">My Exams</TabsTrigger>
            <TabsTrigger value="create">Create Exam</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">86</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">76%</div>
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
                    {[
                      { name: "Class 8 Mathematics - Chapter 2", date: "Today", status: "Active" },
                      { name: "Class 8 Science - Quiz 3", date: "Yesterday", status: "Completed" },
                      { name: "Class 8 English - Grammar Test", date: "3 days ago", status: "Active" },
                      { name: "Class 8 History - Chapter 4", date: "5 days ago", status: "Completed" },
                    ].map((exam, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{exam.name}</p>
                          <p className="text-sm text-muted-foreground">{exam.date}</p>
                        </div>
                        <span className={`text-sm ${exam.status === "Active" ? "text-green-600" : "text-blue-600"}`}>
                          {exam.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Exams
                  </Button>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Student Performance</CardTitle>
                  <CardDescription>Top performing students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Alex Johnson", score: 92 },
                      { name: "Maria Garcia", score: 88 },
                      { name: "James Wilson", score: 85 },
                      { name: "Sarah Chen", score: 82 },
                    ].map((student, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                            {student.name.charAt(0)}
                          </div>
                          <p className="font-medium">{student.name}</p>
                        </div>
                        <p className="font-medium">{student.score}%</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Students
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="exams" className="pt-4">
            <ExamManagement />
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

          <TabsContent value="students" className="pt-4">
            <UserManagement userType="student" teacherView={true} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function CreateExamForm() {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
    // In a real app, you would save this to your database
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <Input
            id="class"
            name="class"
            value={formData.class}
            onChange={handleChange}
            placeholder="e.g., Class 8"
            required
          />
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
            min="1"
            max="5"
            value={formData.attempts}
            onChange={handleChange}
            required
          />
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
          <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" className="mr-2">
          Continue to Add Questions
        </Button>
        <Button type="button" variant="outline">
          Save as Draft
        </Button>
      </div>
    </form>
  )
}
