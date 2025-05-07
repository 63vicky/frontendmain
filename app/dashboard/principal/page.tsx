"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"
import UserManagement from "@/components/user-management"
import ExamAnalytics from "@/components/exam-analytics"
import { useSearchParams, useRouter } from "next/navigation"
import { dashboardService } from "@/lib/services/dashboard"
import { useToast } from "@/hooks/use-toast"
import type { DashboardStats, RecentExam, ClassPerformance } from "@/lib/types"

export default function PrincipalDashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrincipalDashboardContent />
    </Suspense>
  )
}

function PrincipalDashboardContent() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats>({})
  const [recentExams, setRecentExams] = useState<RecentExam[]>([])
  const [classPerformance, setClassPerformance] = useState<ClassPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["overview", "teachers", "students", "exams"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true)
        const [statsData, examsData, performanceData] = await Promise.all([
          dashboardService.getPrincipalDashboardStats(),
          dashboardService.getPrincipalRecentExams(),
          dashboardService.getPrincipalClassPerformance()
        ])
        setStats(statsData)
        setRecentExams(examsData)
        setClassPerformance(performanceData)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (activeTab === "overview") {
      fetchDashboardData()
    }
  }, [activeTab])

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
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalTeachers || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalStudents || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeExams || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.completedExams || 0}</div>
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
                        {recentExams.map((exam) => (
                          <div key={exam.id} className="flex items-center justify-between border-b pb-2">
                            <div>
                              <p className="font-medium">{exam.name}</p>
                              <p className="text-sm text-muted-foreground">{exam.date}</p>
                            </div>
                            <span className={`text-sm ${
                              exam.status === "Active" ? "text-green-600" : 
                              exam.status === "Completed" ? "text-blue-600" : "text-yellow-600"
                            }`}>
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
                        {classPerformance.map((item) => (
                          <div key={item.class} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{item.class}</p>
                              <p className="text-sm font-medium">{item.score}%</p>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-100">
                              <div className={`h-2 rounded-full ${item.score >= 85 ? "bg-green-500" : item.score >= 70 ? "bg-blue-500" : item.score >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${item.score}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
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
