"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"
import UserManagement from "@/components/user-management"
import ExamAnalytics from "@/components/exam-analytics"
import { useSearchParams, useRouter } from "next/navigation"

export default function PrincipalDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["overview", "teachers", "students", "exams"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/dashboard/principal?tab=${value}`, { scroll: false })
  }

  return (
    <DashboardLayout role="principal">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Principal Dashboard</h1>
        <p className="text-muted-foreground">Manage teachers, students, and oversee all exams and results</p>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">245</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">32</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Exams</CardTitle>
                  <CardDescription>Recently created or completed exams</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { name: "Class 10 Mathematics - Chapter 3", date: "Today", status: "Active" },
                      { name: "Class 8 Science - Final Exam", date: "Yesterday", status: "Completed" },
                      { name: "Class 9 English - Grammar Test", date: "2 days ago", status: "Active" },
                      { name: "Class 7 History - Chapter 5", date: "3 days ago", status: "Completed" },
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
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Average scores across classes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { class: "Class 10", score: 78 },
                      { class: "Class 9", score: 82 },
                      { class: "Class 8", score: 75 },
                      { class: "Class 7", score: 80 },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{item.class}</p>
                          <p className="text-sm font-medium">{item.score}%</p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-slate-700" style={{ width: `${item.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="teachers" className="pt-4">
            <UserManagement userType="teacher" />
          </TabsContent>

          <TabsContent value="students" className="pt-4">
            <UserManagement userType="student" />
          </TabsContent>

          <TabsContent value="exams" className="pt-4">
            <ExamAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
