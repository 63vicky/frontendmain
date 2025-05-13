"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/dashboard-layout"
import { Search, Download, Eye, BarChart3, FileText, Loader2, X } from "lucide-react"
import { resultService } from "@/lib/services/result-service"
import { authService } from "@/lib/services/auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

// Helper function to extract class name from exam
const getClassNameFromExam = (examData: any): string => {
  if (!examData) return 'Unknown Class';

  // If class is a string, use it directly
  if (typeof examData.class === 'string') {
    return examData.class;
  }

  // If class is an object (reference to Class document), use the name property
  if (examData.class && typeof examData.class === 'object') {
    return examData.class.name
      ? `${examData.class.name} ${examData.class.section || ''}`
      : 'Unknown Class';
  }

  return 'Unknown Class';
};

// Helper function to extract teacher name from exam
const getTeacherNameFromExam = (examData: any): string => {
  if (!examData) return 'Unknown Teacher';

  // If createdBy is an object, use the name property
  if (examData.createdBy && typeof examData.createdBy === 'object') {
    return examData.createdBy.name || 'Unknown Teacher';
  }

  return 'Unknown Teacher';
};

export default function ResultsManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [examResults, setExamResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedExam, setSelectedExam] = useState<any>(null)
  const [examTeacherResults, setExamTeacherResults] = useState<any[]>([])
  const [loadingTeacherResults, setLoadingTeacherResults] = useState(false)
  const { toast } = useToast()

  // Fetch results data
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const user = authService.getCurrentUser()
        if (!user || user.role !== "principal") {
          setError("You must be logged in as a principal to view this page")
          return
        }

        // Fetch all results
        const resultsData = await resultService.getResults()

        // Group results by exam to calculate statistics
        const examMap = new Map()

        // Process each result
        resultsData.forEach((result: any) => {
          // Skip if no valid exam data
          if (!result.examId || typeof result.examId !== 'object') return

          const examId = result.examId._id

          // If this is the first result for this exam, initialize the exam data
          if (!examMap.has(examId)) {
            examMap.set(examId, {
              id: examId,
              name: result.examId.title || 'Unknown Exam',
              class: getClassNameFromExam(result.examId),
              subject: result.examId.subject || 'Unknown Subject',
              date: result.examId.startDate
                ? new Date(result.examId.startDate).toLocaleDateString()
                : (result.examId.createdAt
                  ? new Date(result.examId.createdAt).toLocaleDateString()
                  : 'Unknown Date'),
              teacher: getTeacherNameFromExam(result.examId),
              students: 0,
              scores: [],
              totalMarks: 0
            })
          }

          // Update exam statistics
          const examData = examMap.get(examId)
          examData.students++
          examData.scores.push(result.marks || 0)
          examData.totalMarks = Math.max(examData.totalMarks, result.marks || 0)
        })

        // Calculate statistics for each exam
        const processedExams = Array.from(examMap.values()).map(exam => {
          const scores = exam.scores
          const avgScore = scores.length > 0
            ? Math.round(scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length)
            : 0
          const highestScore = scores.length > 0 ? Math.max(...scores) : 0
          const lowestScore = scores.length > 0 ? Math.min(...scores) : 0

          return {
            ...exam,
            avgScore,
            highestScore,
            lowestScore,
            scores: undefined // Remove the scores array from the final object
          }
        })

        setExamResults(processedExams)
      } catch (error) {
        console.error("Error fetching results:", error)
        setError("Failed to load results. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load results. Please try again later.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [toast])

  // Filter results based on search query, class, and subject
  const filteredResults = examResults.filter(
    (result) =>
      (result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.teacher.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedClass === "all" || result.class === selectedClass) &&
      (selectedSubject === "all" || result.subject === selectedSubject),
  )

  // Function to handle viewing exam results
  const handleViewExamResults = async (exam: any) => {
    try {
      setSelectedExam(exam);
      setLoadingTeacherResults(true);

      // Fetch all results for this exam
      const examId = exam.id;
      console.log("Fetching results for exam ID:", examId);
      const results = await resultService.getExamResults(examId);
      console.log("Results fetched:", results);

      // Process results for display
      const processedResults = results.map((result: any) => {
        // Get teacher name
        const teacherName = result.studentId && typeof result.studentId === 'object'
          ? result.studentId.name || 'Unknown Teacher'
          : 'Unknown Teacher';

        // Calculate score
        const score = result.marks || 0;
        const totalMarks = result.totalMarks || 100;
        const percentage = Math.round((score / totalMarks) * 100);

        // Determine status
        let status = 'Failed';
        if (percentage >= 40) {
          status = 'Passed';
        }

        return {
          id: result._id,
          teacherId: typeof result.studentId === 'object' ? result.studentId._id : result.studentId,
          teacher: teacherName,
          score,
          totalMarks,
          percentage,
          status,
          submittedAt: result.submittedAt || result.endTime || result.createdAt,
          date: result.submittedAt || result.endTime || result.createdAt
            ? new Date(result.submittedAt || result.endTime || result.createdAt).toLocaleDateString()
            : 'Unknown Date'
        };
      });

      setExamTeacherResults(processedResults);
    } catch (error) {
      console.error("Error fetching exam results:", error);
      toast({
        title: "Error",
        description: "Failed to load teacher results for this exam.",
        variant: "destructive"
      });
    } finally {
      setLoadingTeacherResults(false);
    }
  };

  // Group results by class
  const resultsByClass = examResults.reduce(
    (acc, result) => {
      if (!acc[result.class]) {
        acc[result.class] = []
      }
      acc[result.class].push(result)
      return acc
    },
    {} as Record<string, typeof examResults>,
  )

  // Calculate class averages
  const classAverages = Object.entries(resultsByClass).map(([className, results]) => {
    const resultsArray = results as any[];
    const avgScore = Math.round(resultsArray.reduce((sum: number, result: any) => sum + result.avgScore, 0) / resultsArray.length)
    return { class: className, avgScore }
  })

  return (
    <DashboardLayout role="principal">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Results Management</h1>
            <p className="text-muted-foreground">View and analyze exam results across classes and subjects</p>
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all-results" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">All Results</span>
            </TabsTrigger>
            <TabsTrigger value="class-wise" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Class-wise Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="subject-wise" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Subject-wise Analysis</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all-results" className="space-y-4 pt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>All Exam Results</CardTitle>
                <CardDescription>View and download results for all exams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search exams..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-full"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="all">All Classes</option>
                      {Array.from(new Set(examResults.map(result => result.class))).map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="all">All Subjects</option>
                      {Array.from(new Set(examResults.map(result => result.subject))).map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <span className="ml-2 text-muted-foreground">Loading results...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    <p>{error}</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Teachers</TableHead>
                        <TableHead>Avg. Score</TableHead>
                        <TableHead>Highest</TableHead>
                        <TableHead>Lowest</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                            No results found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell className="font-medium">{result.name}</TableCell>
                            <TableCell>{result.class}</TableCell>
                            <TableCell>{result.subject}</TableCell>
                            <TableCell>{result.date}</TableCell>
                            <TableCell>{result.students}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  result.avgScore >= 85
                                    ? "border-green-500 text-green-700 bg-green-50"
                                    : result.avgScore >= 70
                                      ? "border-blue-500 text-blue-700 bg-blue-50"
                                      : result.avgScore >= 50
                                        ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                                        : "border-red-500 text-red-700 bg-red-50"
                                }
                              >
                                {result.avgScore}%
                              </Badge>
                            </TableCell>
                            <TableCell>{result.highestScore}%</TableCell>
                            <TableCell>{result.lowestScore}%</TableCell>
                            <TableCell>{result.teacher}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewExamResults(result)}
                              >
                                <Eye className="h-4 w-4 text-indigo-500" />
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="class-wise" className="space-y-4 pt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Class-wise Performance Analysis</CardTitle>
                <CardDescription>Compare performance across different classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-medium mb-4">Average Scores by Class</h3>
                    <div className="space-y-4">
                      {classAverages.map((item, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{item.class}</p>
                            <p className="font-medium">{item.avgScore}%</p>
                          </div>
                          <div className="h-3 w-full rounded-full bg-slate-100">
                            <div
                              className={`h-3 rounded-full ${
                                item.avgScore >= 85
                                  ? "bg-green-500"
                                  : item.avgScore >= 70
                                    ? "bg-blue-500"
                                    : item.avgScore >= 50
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                              }`}
                              style={{ width: `${item.avgScore}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-medium mb-4">Class Performance Comparison</h3>
                    <div className="h-64 flex items-end justify-around">
                      {classAverages.map((item, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div
                            className={`w-16 ${
                              item.avgScore >= 85
                                ? "bg-green-500"
                                : item.avgScore >= 70
                                  ? "bg-blue-500"
                                  : item.avgScore >= 50
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                            } rounded-t-md`}
                            style={{ height: `${(item.avgScore / 100) * 200}px` }}
                          ></div>
                          <p className="mt-2 text-sm font-medium">{item.class}</p>
                          <p className="text-xs text-muted-foreground">{item.avgScore}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Detailed Class Performance</h3>
                  {Object.entries(resultsByClass).map(([className, results]) => (
                    <div key={className} className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-md font-medium">{className}</h4>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download Report
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Exam Name</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Teachers</TableHead>
                            <TableHead>Avg. Score</TableHead>
                            <TableHead>Highest</TableHead>
                            <TableHead>Lowest</TableHead>
                            <TableHead>Teacher</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(results as any[]).map((result: any) => (
                            <TableRow key={result.id}>
                              <TableCell className="font-medium">{result.name}</TableCell>
                              <TableCell>{result.subject}</TableCell>
                              <TableCell>{result.date}</TableCell>
                              <TableCell>{result.students}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    result.avgScore >= 85
                                      ? "border-green-500 text-green-700 bg-green-50"
                                      : result.avgScore >= 70
                                        ? "border-blue-500 text-blue-700 bg-blue-50"
                                        : result.avgScore >= 50
                                          ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                                          : "border-red-500 text-red-700 bg-red-50"
                                  }
                                >
                                  {result.avgScore}%
                                </Badge>
                              </TableCell>
                              <TableCell>{result.highestScore}%</TableCell>
                              <TableCell>{result.lowestScore}%</TableCell>
                              <TableCell>{result.teacher}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subject-wise" className="space-y-4 pt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Subject-wise Performance Analysis</CardTitle>
                <CardDescription>Compare performance across different subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-medium mb-4">Average Scores by Subject</h3>
                    <div className="space-y-4">
                      {["Mathematics", "Science", "English", "History"].map((subject, i) => {
                        const subjectResults = examResults.filter((result) => result.subject === subject)
                        const avgScore = Math.round(
                          subjectResults.reduce((sum, result) => sum + result.avgScore, 0) /
                            (subjectResults.length || 1),
                        )
                        return (
                          <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{subject}</p>
                              <p className="font-medium">{avgScore}%</p>
                            </div>
                            <div className="h-3 w-full rounded-full bg-slate-100">
                              <div
                                className={`h-3 rounded-full ${
                                  avgScore >= 85
                                    ? "bg-green-500"
                                    : avgScore >= 70
                                      ? "bg-blue-500"
                                      : avgScore >= 50
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

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-medium mb-4">Subject Performance by Class</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Class 7</TableHead>
                          <TableHead>Class 8</TableHead>
                          <TableHead>Class 9</TableHead>
                          <TableHead>Class 10</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {["Mathematics", "Science", "English", "History"].map((subject, i) => {
                          return (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{subject}</TableCell>
                              {["Class 7", "Class 8", "Class 9", "Class 10"].map((className, j) => {
                                const classSubjectResults = examResults.filter(
                                  (result) => result.subject === subject && result.class === className,
                                )
                                const avgScore = classSubjectResults.length
                                  ? Math.round(
                                      classSubjectResults.reduce((sum, result) => sum + result.avgScore, 0) /
                                        classSubjectResults.length,
                                    )
                                  : "-"
                                return (
                                  <TableCell key={j}>
                                    {avgScore !== "-" ? (
                                      <Badge
                                        variant="outline"
                                        className={
                                          avgScore >= 85
                                            ? "border-green-500 text-green-700 bg-green-50"
                                            : avgScore >= 70
                                              ? "border-blue-500 text-blue-700 bg-blue-50"
                                              : avgScore >= 50
                                                ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                                                : "border-red-500 text-red-700 bg-red-50"
                                        }
                                      >
                                        {avgScore}%
                                      </Badge>
                                    ) : (
                                      "-"
                                    )}
                                  </TableCell>
                                )
                              })}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Subject Performance Trends</h3>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex justify-between mb-4">
                      <h4 className="font-medium">Performance Comparison</h4>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Total Exams</TableHead>
                            <TableHead>Total Students</TableHead>
                            <TableHead>Avg. Score</TableHead>
                            <TableHead>Highest Score</TableHead>
                            <TableHead>Lowest Score</TableHead>
                            <TableHead>Pass Rate</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {["Mathematics", "Science", "English", "History"].map((subject, i) => {
                            const subjectResults = examResults.filter((result) => result.subject === subject)
                            const totalExams = subjectResults.length
                            const totalStudents = subjectResults.reduce((sum, result) => sum + result.students, 0)
                            const avgScore = Math.round(
                              subjectResults.reduce((sum, result) => sum + result.avgScore, 0) / (totalExams || 1),
                            )
                            const highestScore = Math.max(...subjectResults.map((result) => result.highestScore))
                            const lowestScore = Math.min(...subjectResults.map((result) => result.lowestScore))
                            const passRate = Math.round((avgScore / 100) * 100)

                            return (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{subject}</TableCell>
                                <TableCell>{totalExams}</TableCell>
                                <TableCell>{totalStudents}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      avgScore >= 85
                                        ? "border-green-500 text-green-700 bg-green-50"
                                        : avgScore >= 70
                                          ? "border-blue-500 text-blue-700 bg-blue-50"
                                          : avgScore >= 50
                                            ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                                            : "border-red-500 text-red-700 bg-red-50"
                                    }
                                  >
                                    {avgScore}%
                                  </Badge>
                                </TableCell>
                                <TableCell>{highestScore}%</TableCell>
                                <TableCell>{lowestScore}%</TableCell>
                                <TableCell>{passRate}%</TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Exam Results Dialog */}
      <Dialog open={selectedExam !== null} onOpenChange={(open) => !open && setSelectedExam(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">

          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl">
                {selectedExam?.name} - Results
              </DialogTitle>
            </div>
            <DialogDescription>
              {selectedExam?.class} | {selectedExam?.subject} | {selectedExam?.date}
            </DialogDescription>
          </DialogHeader>

          {loadingTeacherResults ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <span className="ml-2 text-muted-foreground">Loading teacher results...</span>
            </div>
          ) : examTeacherResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No teacher results found for this exam
            </div>
          ) : (
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examTeacherResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {result.teacher}
                      </TableCell>
                      <TableCell>
                        {result.score}/{result.totalMarks}
                      </TableCell>
                      <TableCell>{result.percentage}%</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            result.status === "Passed"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }
                        >
                          {result.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{result.date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/result/${result.id}`}>
                            <Eye className="h-4 w-4 text-indigo-500" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
