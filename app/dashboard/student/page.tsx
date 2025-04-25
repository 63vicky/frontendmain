"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/dashboard-layout"
import { BookOpen, Clock, CheckCircle, BarChart, Award, Calendar, AlertTriangle } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

export default function TeacherDashboard() {
  return (
    <Suspense>
      <StudentDashboardConent />
    </Suspense>
  )
}

function StudentDashboardConent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["overview", "exams", "results"].includes(tab)) {
      setActiveTab(tab)
    } else {
      setActiveTab("overview")
    }
  }, [searchParams])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/dashboard/student?tab=${value}`, { scroll: false })
  }

  return (
    <DashboardLayout role="student">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Student Dashboard</h1>
            <p className="text-muted-foreground dark:text-slate-400">
              Take exams, view results, and track your progress
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
            >
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="exams"
              className="flex items-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Available Exams</span>
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="flex items-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">My Results</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/30 dark:to-slate-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center text-slate-700 dark:text-slate-300">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                    Upcoming Exams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">3</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-white dark:from-green-900/30 dark:to-slate-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 dark:text-green-400" />
                    Completed Exams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">8</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/30 dark:to-slate-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center text-slate-700 dark:text-slate-300">
                    <BarChart className="h-4 w-4 mr-2 text-purple-500 dark:text-purple-400" />
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">78%</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/30 dark:to-slate-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center text-slate-700 dark:text-slate-300">
                    <Award className="h-4 w-4 mr-2 text-amber-500 dark:text-amber-400" />
                    Best Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">92%</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1 border-0 shadow-md overflow-hidden bg-white dark:bg-slate-800">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Exams
                  </CardTitle>
                  <CardDescription className="text-blue-100">Exams scheduled in the next 7 days</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {[
                      {
                        name: "Mathematics - Chapter 3",
                        date: "Tomorrow, 10:00 AM",
                        attempts: 0,
                        maxAttempts: 5,
                        urgent: true,
                      },
                      { name: "Science - Quiz 4", date: "May 2, 2:00 PM", attempts: 0, maxAttempts: 5, urgent: false },
                      {
                        name: "English - Grammar Test",
                        date: "May 5, 9:30 AM",
                        attempts: 0,
                        maxAttempts: 5,
                        urgent: false,
                      },
                    ].map((exam, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium text-slate-900 dark:text-slate-100">{exam.name}</p>
                            {exam.urgent && (
                              <Badge variant="destructive" className="ml-2 px-1.5 py-0">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Soon
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground dark:text-slate-400 flex items-center">
                            <Clock className="h-3 w-3 mr-1 inline" />
                            {exam.date}
                          </p>
                          <p className="text-xs text-muted-foreground dark:text-slate-500">
                            Attempts: {exam.attempts}/{exam.maxAttempts}
                          </p>
                        </div>
                        <Button
                          asChild
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                        >
                          <Link href={`/exam/${i}`}>Take Exam</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 border-0 shadow-md overflow-hidden bg-white dark:bg-slate-800">
                <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white">
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Recent Results
                  </CardTitle>
                  <CardDescription className="text-green-100">Your latest exam scores</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {[
                      { name: "History - Chapter 4", score: 85, rating: "Excellent" },
                      { name: "Mathematics - Chapter 2", score: 72, rating: "Good" },
                      { name: "Science - Quiz 3", score: 90, rating: "Excellent" },
                      { name: "English - Vocabulary Test", score: 78, rating: "Good" },
                    ].map((result, i) => (
                      <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-slate-900 dark:text-slate-100">{result.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900 dark:text-slate-100">{result.score}%</p>
                            <Badge
                              variant={result.rating === "Excellent" ? "default" : "secondary"}
                              className={
                                result.rating === "Excellent"
                                  ? "bg-green-500 dark:bg-green-600"
                                  : "bg-blue-500 dark:bg-blue-600"
                              }
                            >
                              {result.rating}
                            </Badge>
                          </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700">
                          <div
                            className={`h-2 rounded-full ${
                              result.score >= 85
                                ? "bg-green-500 dark:bg-green-600"
                                : result.score >= 70
                                  ? "bg-blue-500 dark:bg-blue-600"
                                  : result.score >= 50
                                    ? "bg-yellow-500 dark:bg-yellow-600"
                                    : "bg-red-500 dark:bg-red-600"
                            }`}
                            style={{ width: `${result.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
                    <Button variant="outline" className="w-full border-slate-200 dark:border-slate-600" asChild>
                      <Link href="/dashboard/student?tab=results">View All Results</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="exams" className="pt-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardTitle>Available Exams</CardTitle>
                <CardDescription className="text-blue-100">Exams you can take now or in the future</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {[
                    {
                      name: "Mathematics - Chapter 3",
                      subject: "Mathematics",
                      date: "Apr 30 - May 7",
                      duration: "60 min",
                      attempts: 0,
                      maxAttempts: 5,
                      status: "Available",
                      points: 100,
                    },
                    {
                      name: "Science - Quiz 4",
                      subject: "Science",
                      date: "May 2 - May 9",
                      duration: "45 min",
                      attempts: 0,
                      maxAttempts: 5,
                      status: "Available",
                      points: 100,
                    },
                    {
                      name: "English - Grammar Test",
                      subject: "English",
                      date: "May 5 - May 12",
                      duration: "30 min",
                      attempts: 0,
                      maxAttempts: 5,
                      status: "Available",
                      points: 100,
                    },
                    {
                      name: "History - Final Exam",
                      subject: "History",
                      date: "May 15 - May 22",
                      duration: "90 min",
                      attempts: 0,
                      maxAttempts: 5,
                      status: "Upcoming",
                      points: 100,
                    },
                  ].map((exam, i) => (
                    <div
                      key={i}
                      className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-slate-50"
                    >
                      <div className="space-y-1 mb-4 md:mb-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-lg">{exam.name}</p>
                          <Badge
                            variant={exam.status === "Available" ? "default" : "secondary"}
                            className={exam.status === "Available" ? "bg-green-500" : ""}
                          >
                            {exam.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Subject: {exam.subject}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            Available: {exam.date}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            Duration: {exam.duration}
                          </span>
                          <span className="flex items-center">
                            <Award className="h-3.5 w-3.5 mr-1" />
                            Points: {exam.points}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Attempts: {exam.attempts}/{exam.maxAttempts}
                        </p>
                      </div>
                      <Button
                        disabled={exam.status !== "Available"}
                        className={`w-full md:w-auto ${
                          exam.status === "Available"
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                            : ""
                        }`}
                        asChild
                      >
                        <Link href={`/exam/${i}`}>
                          {exam.status === "Available" ? "Start Exam" : "Not Available Yet"}
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="pt-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <CardTitle>My Results</CardTitle>
                <CardDescription className="text-green-100">View your exam history and performance</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {[
                    {
                      name: "History - Chapter 4",
                      subject: "History",
                      date: "Apr 20, 2025",
                      attempts: 2,
                      maxAttempts: 5,
                      bestScore: 85,
                      rating: "Excellent",
                    },
                    {
                      name: "Mathematics - Chapter 2",
                      subject: "Mathematics",
                      date: "Apr 15, 2025",
                      attempts: 3,
                      maxAttempts: 5,
                      bestScore: 72,
                      rating: "Good",
                    },
                    {
                      name: "Science - Quiz 3",
                      subject: "Science",
                      date: "Apr 10, 2025",
                      attempts: 1,
                      maxAttempts: 5,
                      bestScore: 90,
                      rating: "Excellent",
                    },
                    {
                      name: "English - Vocabulary Test",
                      subject: "English",
                      date: "Apr 5, 2025",
                      attempts: 2,
                      maxAttempts: 5,
                      bestScore: 78,
                      rating: "Good",
                    },
                  ].map((result, i) => (
                    <div
                      key={i}
                      className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-slate-50"
                    >
                      <div className="space-y-1 mb-4 md:mb-0">
                        <p className="font-medium text-lg">{result.name}</p>
                        <p className="text-sm text-muted-foreground">Subject: {result.subject}</p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          Completed: {result.date}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Attempts: {result.attempts}/{result.maxAttempts}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-2 w-24 rounded-full bg-slate-100">
                            <div
                              className={`h-2 rounded-full ${
                                result.bestScore >= 85
                                  ? "bg-green-500"
                                  : result.bestScore >= 70
                                    ? "bg-blue-500"
                                    : result.bestScore >= 50
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                              }`}
                              style={{ width: `${result.bestScore}%` }}
                            />
                          </div>
                          <p className="text-sm font-medium">Best Score: {result.bestScore}%</p>
                          <Badge
                            variant={result.rating === "Excellent" ? "default" : "secondary"}
                            className={result.rating === "Excellent" ? "bg-green-500" : "bg-blue-500"}
                          >
                            {result.rating}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                        asChild
                      >
                        <Link href={`/result/${i}`}>View Details</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
