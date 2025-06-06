"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"
import { Download, Eye, BarChart2, Clock, Loader2, AlertTriangle } from "lucide-react"
import { resultService } from "@/lib/services/result-service"
import { authService } from "@/lib/services/auth"
import { useToast } from "@/hooks/use-toast"
import { Result } from "@/lib/types"

// Extended result interface for our UI needs
interface ExtendedResult {
  _id: string;
  exam: string;
  subject: string;
  date: string;
  score: number;
  totalMarks: number;
  attempts: number;
  maxAttempts: number;
  rating: string;
  status: string;
  timeSpent: string;
  isBestScore: boolean;
  attemptDetails: Array<{
    _id: string;
    attemptNumber: number;
    marks: number;
    createdAt: string;
  }>;
}

export default function StudentResults() {
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [examResults, setExamResults] = useState<ExtendedResult[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        const user = authService.getCurrentUser()

        if (!user || user.role !== "student") {
          toast({
            title: "Error",
            description: "You must be logged in as a student to view this page",
            variant: "destructive"
          })
          return
        }

        // Fetch student results
        const results = await resultService.getStudentResults(user._id)

        // Transform the API results to our UI format
        const transformedResults: ExtendedResult[] = results.map(result => {
          // Calculate rating based on score
          const score = result.score || result.marks || 0
          let rating = result.rating || "Needs Improvement"
          if (!result.rating) {
            if (score >= 90) rating = "Excellent"
            else if (score >= 75) rating = "Good"
            else if (score >= 60) rating = "Satisfactory"
          }

          // Format date
          const date = result.submittedAt || result.endTime || result.createdAt
          const formattedDate = date ? new Date(date).toLocaleDateString() : "N/A"

          // Get exam details
          const examTitle = typeof result.examId === 'string'
            ? "Exam"
            : (result.examId as any)?.title || "Exam"

          const examSubject = typeof result.examId === 'string'
            ? "Subject"
            : (result.examId as any)?.subject || "Subject"

          const maxAttempts = typeof result.examId === 'string'
            ? 1
            : (result.examId as any)?.attempts?.max || 1

          // Calculate time spent
          let timeSpent = "N/A"
          if (result.timeSpent) {
            // If timeSpent is in seconds, convert to minutes:seconds format
            const minutes = Math.floor(result.timeSpent / 60)
            const seconds = result.timeSpent % 60
            timeSpent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`
          } else if (result.startedAt && result.submittedAt) {
            // Calculate from timestamps
            const start = new Date(result.startedAt).getTime()
            const end = new Date(result.submittedAt).getTime()
            const diffMs = end - start
            const diffMinutes = Math.floor(diffMs / 60000)
            const diffSeconds = Math.floor((diffMs % 60000) / 1000)
            timeSpent = `${diffMinutes}:${diffSeconds < 10 ? '0' + diffSeconds : diffSeconds}`
          } else if (result.startTime && result.endTime) {
            // Calculate from timestamps (ExamAttempt format)
            const start = new Date(result.startTime).getTime()
            const end = new Date(result.endTime).getTime()
            const diffMs = end - start
            const diffMinutes = Math.floor(diffMs / 60000)
            const diffSeconds = Math.floor((diffMs % 60000) / 1000)
            timeSpent = `${diffMinutes}:${diffSeconds < 10 ? '0' + diffSeconds : diffSeconds}`
          }

          // Calculate total marks
          const totalMarks = result.answers && result.answers.length > 0
            ? result.answers.reduce((sum, a) => sum + (a.points || 10), 0)
            : 100 // Default to 100 if no answers available

          // Get total attempts information
          const totalAttempts = result.totalAttempts || result.attemptNumber || 1
          const attemptDetails = result.attemptDetails || []

          // If this is the best score, add a flag
          const isBestScore = true // Since the backend now returns only the best scores

          return {
            _id: result._id,
            exam: examTitle,
            subject: examSubject,
            date: formattedDate,
            score: score,
            totalMarks: totalMarks,
            attempts: totalAttempts, // Use the total attempts count
            maxAttempts: maxAttempts,
            rating: rating,
            status: result.status || "Completed",
            timeSpent: timeSpent,
            isBestScore: isBestScore,
            attemptDetails: attemptDetails
          }
        })

        setExamResults(transformedResults)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching results:", error)
        setError("Failed to load results. Please try again later.")
        setLoading(false)
        toast({
          title: "Error",
          description: "Failed to load results. Please try again later.",
          variant: "destructive"
        })
      }
    }

    fetchResults()
  }, [toast])

  // Filter results based on selected subject
  const filteredResults =
    selectedSubject === "all" ? examResults : examResults.filter((result) => result.subject === selectedSubject)

  // Get unique subjects for filter
  const subjects = Array.from(new Set(examResults.map((result) => result.subject)))

  // Calculate overall performance
  const averageScore = examResults.length > 0
    ? Math.round(examResults.reduce((sum, result) => sum + result.score, 0) / examResults.length)
    : 0

  // Get rating color
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Excellent":
        return "bg-green-500"
      case "Good":
        return "bg-blue-500"
      case "Satisfactory":
        return "bg-yellow-500"
      default:
        return "bg-red-500"
    }
  }

  return (
    <DashboardLayout role="student">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Results</h1>
            <p className="text-muted-foreground">View and analyze your exam performance</p>
          </div>
          <Button
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
            onClick={() => {}}
          >
            <Download className="h-4 w-4 mr-2" />
            Download All Results
          </Button>
        </div>

        <Tabs defaultValue="all-results" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all-results" className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">All Results</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">Performance Analysis</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all-results" className="space-y-4 pt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Exam Results</CardTitle>
                <CardDescription>View your performance in all exams</CardDescription>
              </CardHeader>
              <CardContent>
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
                ) : (
                  <>
                    <div className="flex justify-end mb-4">
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="all">All Subjects</option>
                        {subjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Exam</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Attempts</TableHead>
                          <TableHead>Time Spent</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResults.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No results found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredResults.map((result) => (
                            <TableRow key={result._id}>
                              <TableCell className="font-medium">{result.exam}</TableCell>
                              <TableCell>{result.subject}</TableCell>
                              <TableCell>{result.date}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {result.score}/{result.totalMarks}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    ({Math.round((result.score / result.totalMarks) * 100)}%)
                                  </span>
                                  {result.isBestScore && result.attempts > 1 && (
                                    <Badge className="bg-green-500 ml-1">Best Score</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getRatingColor(result.rating)}>{result.rating}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <span>{result.attempts}/{result.maxAttempts}</span>
                                  {result.attempts > 1 && (
                                    <span className="text-xs text-muted-foreground ml-1">(Best shown)</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1 text-slate-500" />
                                  <span>{result.timeSpent}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link
                                    href={`/result/${result._id}?score=${Math.round((result.score / result.totalMarks) * 100)}&correct=${result.score / 10}&total=${result.totalMarks / 10}`}
                                  >
                                    <Eye className="h-4 w-4 text-indigo-500" />
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4 text-indigo-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4 pt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
                <CardDescription>Overview of your academic performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-lg font-medium mb-2">Overall Performance</h3>
                    <div className="flex items-center justify-center">
                      <div className="relative h-32 w-32">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl font-bold">{averageScore}%</div>
                          </div>
                        </div>
                        <svg className="h-full w-full" viewBox="0 0 100 100">
                          <circle
                            className="text-slate-100"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className={`${
                              averageScore >= 90
                                ? "text-green-500"
                                : averageScore >= 75
                                  ? "text-blue-500"
                                  : averageScore >= 60
                                    ? "text-yellow-500"
                                    : "text-red-500"
                            } transition-all duration-1000 ease-in-out`}
                            strokeWidth="10"
                            strokeDasharray={`${averageScore * 2.51} 251`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                            style={{
                              transformOrigin: "center",
                              transform: "rotate(-90deg)",
                            }}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-lg font-medium mb-2">Subject Performance</h3>
                    <div className="space-y-3">
                      {subjects.map((subject) => {
                        const subjectResults = examResults.filter((result) => result.subject === subject)
                        const avgScore = Math.round(
                          subjectResults.reduce((sum, result) => sum + result.score, 0) / subjectResults.length,
                        )
                        return (
                          <div key={subject} className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">{subject}</span>
                              <span className="text-sm font-medium">{avgScore}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-100">
                              <div
                                className={`h-2 rounded-full ${
                                  avgScore >= 90
                                    ? "bg-green-500"
                                    : avgScore >= 75
                                      ? "bg-blue-500"
                                      : avgScore >= 60
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                }`}
                                style={{ width: `${avgScore}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-lg font-medium mb-2">Attempts Analysis</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Exams Taken</p>
                        <p className="text-2xl font-bold">{examResults.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Average Attempts per Exam</p>
                        <p className="text-2xl font-bold">
                          {(examResults.reduce((sum, result) => sum + result.attempts, 0) / examResults.length).toFixed(
                            1,
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Best Performance</p>
                        <div className="flex items-center">
                          <Badge className="bg-green-500 mr-2">
                            {Math.max(...examResults.map((result) => result.score))}%
                          </Badge>
                          <span className="text-sm">
                            {
                              examResults.find(
                                (result) => result.score === Math.max(...examResults.map((r) => r.score)),
                              )?.exam
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                  <h3 className="text-lg font-medium mb-4">Performance Over Time</h3>
                  <div className="h-64 flex items-end">
                    <div className="w-full h-full flex flex-col">
                      <div className="flex-1 border-b border-slate-200 relative">
                        {[100, 80, 60, 40, 20].map((mark, i) => (
                          <div
                            key={i}
                            className="absolute left-0 right-0 border-t border-slate-100 text-xs text-slate-400"
                            style={{ bottom: `${mark}%`, transform: "translateY(50%)" }}
                          >
                            <span className="absolute -left-6">{mark}%</span>
                          </div>
                        ))}

                        <div className="absolute inset-0 flex items-end">
                          <div className="w-full flex items-end justify-around">
                            {examResults.map((result, i, arr) => (
                              <div key={i} className="flex flex-col items-center relative group">
                                <div
                                  className="w-12 bg-indigo-500 rounded-t-md"
                                  style={{ height: `${result.score * 0.6}%` }}
                                ></div>
                                {i > 0 && (
                                  <div
                                    className="absolute h-1 bg-slate-300 -z-10"
                                    style={{
                                      width: "100%",
                                      bottom: `${arr[i - 1].score * 0.6}%`,
                                      left: "-50%",
                                      transform: `rotate(${Math.atan2(
                                        (result.score - arr[i - 1].score) * 0.6,
                                        100,
                                      )}rad)`,
                                      transformOrigin: "left bottom",
                                    }}
                                  ></div>
                                )}
                                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs rounded px-2 py-1">
                                  {result.score}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="h-6 flex justify-around items-center">
                        {examResults.map((result, i) => (
                          <div key={i} className="text-xs font-medium text-center w-12 truncate" title={result.exam}>
                            {result.subject.substring(0, 4)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
