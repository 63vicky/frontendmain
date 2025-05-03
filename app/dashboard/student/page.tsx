"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/dashboard-layout"
import { BookOpen, Clock, CheckCircle, BarChart, Award, Calendar, AlertTriangle, Loader2 } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Exam, Result, DashboardStats, ExamAttempt } from "@/lib/types"

// Extended Result interface to include additional properties
interface ExtendedResult extends Result {
  rating?: string;
  attemptNumber?: number;
  marks?: number; // Add marks field for compatibility with Result model
  examId: {
    title: string;
    subject: string;
    attempts?: {
      current: number;
      max: number;
    };
  };
}

// Extended Exam interface to include student attempts
interface ExtendedExam extends Exam {
  studentAttempts?: number;
}

import { authService } from "@/lib/services/auth"
import { attemptService } from "@/lib/services/attempt"
import { useToast } from "@/hooks/use-toast"

export default function StudentDashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudentDashboardContent />
    </Suspense>
  )
}

function StudentDashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [availableExams, setAvailableExams] = useState<ExtendedExam[]>([])
  const [upcomingExams, setUpcomingExams] = useState<ExtendedExam[]>([])
  const [recentResults, setRecentResults] = useState<ExtendedResult[]>([])
  const [examAttempts, setExamAttempts] = useState<Record<string, ExamAttempt[]>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["overview", "exams", "results"].includes(tab)) {
      setActiveTab(tab)
    } else {
      setActiveTab("overview")
    }
  }, [searchParams])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const user = authService.getCurrentUser()

        if (!user || user.role !== "student") {
          toast({
            title: "Error",
            description: "You must be logged in as a student to view this page",
            variant: "destructive"
          })
          router.push("/login?role=student")
          return
        }

        // Fetch dashboard stats
        const statsResponse = await api.get<DashboardStats>('/dashboard/student/' + user.id + '/stats')
        if (statsResponse.data) {
          setDashboardStats(statsResponse.data)
        }

        // No need to fetch class information here as we have a dedicated classes page

        // Fetch available exams for the student's class
        if (!user.class) {
          console.log("Student doesn't have a class assigned")
          setAvailableExams([])
          setUpcomingExams([])
        } else {
          console.log("Fetching exams for class:", user.class)
          try {
            // Fetch exams
            const examsResponse = await api.get<{success: boolean, data: Exam[]}>(`/exams/class/${user.class}`)

            // Fetch student's attempts for all exams
            let attemptsData: Record<string, ExamAttempt[]> = {};
            try {
              console.log("Fetching student attempts...");
              attemptsData = await attemptService.getStudentAttempts();
              console.log("Attempts data received:", attemptsData);
              setExamAttempts(attemptsData);
            } catch (attemptError) {
              console.error("Error fetching student attempts:", attemptError);
              // Continue with empty attempts data
            }

            if (examsResponse.data && examsResponse.data.data) {
              const exams = examsResponse.data.data;
              console.log("Exams fetched:", exams);

              // Add student attempts to each exam
              const examsWithAttempts = exams.map(exam => {
                // Get the exam ID as string
                const examId = exam._id.toString();
                console.log(`Processing exam ${examId} (${exam.title})`);

                // Get attempts for this exam
                const examAttemptsList = attemptsData[examId] || [];
                console.log(`Found ${examAttemptsList.length} attempts for exam ${examId}`);

                // Log the exam attempts data for debugging
                console.log(`Exam ${examId} attempts data:`, {
                  examAttempts: examAttemptsList.length,
                  maxAttempts: exam.attempts?.max || 1,
                  attemptsField: exam.attempts
                });

                // If the exam has a current attempts value of 5 and max of 5,
                // this is likely a case where the backend is using the current field incorrectly
                // In this case, we should use the actual student attempts count instead

                return {
                  ...exam,
                  studentAttempts: examAttemptsList.length
                } as ExtendedExam;
              });

              // Filter exams by status
              const available = examsWithAttempts && examsWithAttempts.length > 0 && examsWithAttempts.filter(exam =>
                exam.status === 'active' &&
                new Date(exam.startDate) <= new Date() &&
                new Date(exam.endDate) >= new Date()
              )

              const upcoming = examsWithAttempts && examsWithAttempts.length > 0 && examsWithAttempts.filter(exam =>
                exam.status === 'scheduled' ||
                (exam.status === 'active' && new Date(exam.startDate) > new Date())
              ).slice(0, 3) // Get only 3 upcoming exams

              setAvailableExams(available || [])
              setUpcomingExams(upcoming || [])
            } else {
              console.log("No exams data in response")
              setAvailableExams([])
              setUpcomingExams([])
            }
          } catch (error) {
            console.error("Error fetching exams:", error)
            setAvailableExams([])
            setUpcomingExams([])
          }
        }

        // Fetch student's results
        const resultsResponse = await api.get<any>(`/results/student/${user._id}`)
        if (resultsResponse.data) {
          // Cast the results to our extended type
          setRecentResults(resultsResponse.data.slice(0, 4) as ExtendedResult[]) // Get only 4 recent results
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Failed to load dashboard data. Please try again later.")
        setLoading(false)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again later.",
          variant: "destructive"
        })
      }
    }

    fetchData()
  }, [toast, router])

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
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading dashboard data...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                <p className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {error}
                </p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/30 dark:to-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center text-slate-700 dark:text-slate-300">
                        <Calendar className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                        Upcoming Exams
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {dashboardStats?.upcomingExams || upcomingExams.length}
                      </div>
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
                      <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {dashboardStats?.completedExams || recentResults.length}
                      </div>
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
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                        {dashboardStats?.averageScore ? `${dashboardStats.averageScore}%` : 'N/A'}
                      </div>
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
                      <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                        {recentResults.length > 0
                          ? `${Math.max(...recentResults.map(r => r.score || r.marks || 0))}%`
                          : 'N/A'}
                      </div>
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
                      {upcomingExams.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground">
                          No upcoming exams scheduled
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                          {upcomingExams.map((exam) => {
                            const startDate = new Date(exam.startDate);
                            const today = new Date();
                            const diffTime = Math.abs(startDate.getTime() - today.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            const isUrgent = diffDays <= 2;

                            return (
                              <div
                                key={exam._id}
                                className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                              >
                                <div>
                                  <div className="flex items-center">
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{exam.title}</p>
                                    {isUrgent && (
                                      <Badge variant="destructive" className="ml-2 px-1.5 py-0">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Soon
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground dark:text-slate-400 flex items-center">
                                    <Clock className="h-3 w-3 mr-1 inline" />
                                    {startDate.toLocaleDateString()} {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </p>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-muted-foreground dark:text-slate-500">
                                      <span>Attempts: {exam.studentAttempts || 0}/{exam.attempts?.max || 1}</span>
                                      {exam.studentAttempts && exam.attempts?.max && (
                                        <span className={exam.studentAttempts >= exam.attempts.max ? "text-red-500 dark:text-red-400" :
                                          exam.studentAttempts >= Math.floor(exam.attempts.max * 0.75) ? "text-amber-500 dark:text-amber-400" :
                                          "text-green-500 dark:text-green-400"}>
                                          {exam.studentAttempts >= exam.attempts.max ? "Max reached" :
                                            `${exam.attempts.max - exam.studentAttempts} left`}
                                        </span>
                                      )}
                                    </div>
                                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div
                                        className={`h-1 rounded-full ${
                                          exam.studentAttempts && exam.attempts?.max && exam.studentAttempts >= exam.attempts.max
                                            ? "bg-red-500 dark:bg-red-600"
                                            : exam.studentAttempts && exam.attempts?.max && exam.studentAttempts >= Math.floor(exam.attempts.max * 0.75)
                                              ? "bg-amber-500 dark:bg-amber-600"
                                              : "bg-green-500 dark:bg-green-600"
                                        }`}
                                        style={{ width: `${exam.studentAttempts && exam.attempts?.max ?
                                          Math.min(100, (exam.studentAttempts / exam.attempts.max) * 100) : 0}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  asChild
                                  size="sm"
                                  disabled={startDate > today}
                                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                                >
                                  <Link href={`/exam/${exam._id}`}>
                                    {startDate > today ? "Not Available Yet" : "Take Exam"}
                                  </Link>
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
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
                      {recentResults.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground">
                          No exam results available
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                          {recentResults.map((result) => (
                            <div key={result._id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                  {result.examId.title || "Exam"}
                                </p>
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
                      )}
                      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
                        <Button variant="outline" className="w-full border-slate-200 dark:border-slate-600" asChild>
                          <Link href="/dashboard/student?tab=results">View All Results</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="exams" className="pt-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardTitle>Available Exams</CardTitle>
                <CardDescription className="text-blue-100">Exams you can take now or in the future</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading exams...</span>
                  </div>
                ) : error ? (
                  <div className="p-6 text-center">
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                      <p className="flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        {error}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                ) : availableExams.length === 0 && upcomingExams.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    No exams available at this time
                  </div>
                ) : (
                  <div className="divide-y">
                    {[...availableExams, ...upcomingExams].map((exam) => {
                      const startDate = new Date(exam.startDate);
                      const endDate = new Date(exam.endDate);
                      const today = new Date();

                      // Determine exam status
                      let status = "Upcoming";
                      if (exam.status === 'active' && startDate <= today && endDate >= today) {
                        status = "Available";
                      } else if (exam.status === 'completed' || endDate < today) {
                        status = "Completed";
                      }

                      return (
                        <div
                          key={exam._id}
                          className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-slate-50"
                        >
                          <div className="space-y-1 mb-4 md:mb-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-lg">{exam.title}</p>
                              <Badge
                                variant={status === "Available" ? "default" : "secondary"}
                                className={status === "Available" ? "bg-green-500" : ""}
                              >
                                {status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Subject: {exam.subject}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                Available: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                Duration: {exam.duration} min
                              </span>
                              <span className="flex items-center">
                                <Award className="h-3.5 w-3.5 mr-1" />
                                Points: {exam.questions && exam.questions.length ? exam.questions.length * 10 : 100}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Attempts: {exam.studentAttempts || 0}/{exam.attempts?.max || 1}</span>
                                {exam.studentAttempts && exam.attempts?.max && (
                                  <span className={exam.studentAttempts >= exam.attempts.max ? "text-red-500" :
                                    exam.studentAttempts >= Math.floor(exam.attempts.max * 0.75) ? "text-amber-500" : "text-green-500"}>
                                    {exam.studentAttempts >= exam.attempts.max ? "Max reached" :
                                      `${exam.attempts.max - exam.studentAttempts} left`}
                                  </span>
                                )}
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    exam.studentAttempts && exam.attempts?.max && exam.studentAttempts >= exam.attempts.max
                                      ? "bg-red-500 dark:bg-red-600"
                                      : exam.studentAttempts && exam.attempts?.max && exam.studentAttempts >= Math.floor(exam.attempts.max * 0.75)
                                        ? "bg-amber-500 dark:bg-amber-600"
                                        : "bg-green-500 dark:bg-green-600"
                                  }`}
                                  style={{ width: `${exam.studentAttempts && exam.attempts?.max ?
                                    Math.min(100, (exam.studentAttempts / exam.attempts.max) * 100) : 0}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <Button
                            disabled={status !== "Available" || (!!exam.studentAttempts && !!exam.attempts?.max && exam.studentAttempts >= exam.attempts.max)}
                            className={`w-full md:w-auto ${
                              status === "Available" && (!exam.studentAttempts || !exam.attempts?.max || exam.studentAttempts < exam.attempts.max)
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                : ""
                            }`}
                            asChild
                          >
                            <Link href={`/exam/${exam._id}`}>
                              {status !== "Available"
                                ? "Not Available Yet"
                                : !!exam.studentAttempts && !!exam.attempts?.max && exam.studentAttempts >= exam.attempts.max
                                  ? "Max Attempts Reached"
                                  : "Start Exam"}
                            </Link>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading results...</span>
                  </div>
                ) : error ? (
                  <div className="p-6 text-center">
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                      <p className="flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        {error}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                ) : recentResults.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    No exam results available
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentResults.map((result) => {
                      const completedDate = new Date(result.submittedAt || result.createdAt);

                      return (
                        <div
                          key={result._id}
                          className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-slate-50"
                        >
                          <div className="space-y-1 mb-4 md:mb-0">
                            <p className="font-medium text-lg">{result.examId?.title || "Exam"}</p>
                            <p className="text-sm text-muted-foreground">Subject: {result.examId?.subject || "N/A"}</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              Completed: {completedDate.toLocaleDateString()}
                            </p>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Attempt: {result.attemptNumber || 1} of {result.examId?.attempts?.max || 1}</span>
                                {result.attemptNumber && result.examId?.attempts?.max && (
                                  <span className={
                                    result.attemptNumber >= result.examId.attempts.max ? "text-blue-500" : "text-slate-500"
                                  }>
                                    {result.attemptNumber >= result.examId.attempts.max ?
                                      "Final attempt" :
                                      `${result.examId.attempts.max - result.attemptNumber} more available`}
                                  </span>
                                )}
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-1.5 rounded-full bg-blue-500 dark:bg-blue-600"
                                  style={{ width: `${result.attemptNumber && result.examId?.attempts?.max ?
                                    Math.min(100, (result.attemptNumber / result.examId.attempts.max) * 100) : 0}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="h-2 w-24 rounded-full bg-slate-100">
                                <div
                                  className={`h-2 rounded-full ${
                                    result.score >= 85
                                      ? "bg-green-500"
                                      : result.score >= 70
                                        ? "bg-blue-500"
                                        : result.score >= 50
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                  }`}
                                  style={{ width: `${result.score}%` }}
                                />
                              </div>
                              <p className="text-sm font-medium">Score: {result.score}%</p>
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
                            <Link href={`/result/${result._id}`}>View Details</Link>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
