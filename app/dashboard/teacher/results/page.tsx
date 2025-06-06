"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import DashboardLayout from "@/components/dashboard-layout"
import { Search, Download, Eye, Printer, Mail, MessageSquare, Loader2 } from "lucide-react"
import { resultService } from "@/lib/services/result-service"
import { authService } from "@/lib/services/auth"
import { useToast } from "@/hooks/use-toast"

export default function TeacherResults() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedExam, setSelectedExam] = useState("all")
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

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

  // Fetch results data
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const user = authService.getCurrentUser()
        if (!user || user.role !== "teacher") {
          setError("You must be logged in as a teacher to view this page")
          return
        }

        // Fetch all results
        const resultsData = await resultService.getResults()

        // Transform data for display
        const transformedResults = resultsData.map((result: any) => {
          // Extract teacher name
          const teacherName = result.studentId && typeof result.studentId === 'object'
            ? result.studentId.name
            : 'Unknown Teacher'

          // Extract exam details
          const examTitle = result.examId && typeof result.examId === 'object'
            ? result.examId.title
            : 'Unknown Exam'

          const examSubject = result.examId && typeof result.examId === 'object'
            ? result.examId.subject
            : ''

          // Class is already handled by getClassNameFromExam function

          // Calculate score and status
          const score = result.marks || 0
          const totalMarks = 100 // Default if not available
          const status = result.percentage >= 50 ? "Passed" : "Failed"

          // Format date - try different date fields
          let date = 'Unknown Date';

          // Try different date fields in order of preference
          if (result.examId && typeof result.examId === 'object' && result.examId.startDate) {
            date = new Date(result.examId.startDate).toLocaleDateString();
          } else if (result.examId && typeof result.examId === 'object' && result.examId.createdAt) {
            date = new Date(result.examId.createdAt).toLocaleDateString();
          } else if (result.createdAt) {
            date = new Date(result.createdAt).toLocaleDateString();
          }

          return {
            id: result._id,
            teacher: teacherName,
            class: getClassNameFromExam(result.examId),
            exam: examTitle,
            subject: examSubject,
            score: score,
            totalMarks: totalMarks,
            date: date,
            status: status,
            attempts: result.attemptNumber || 1,
            maxAttempts: result.examId && result.examId.attempts ? result.examId.attempts.max : 5,
            percentage: result.percentage || 0,
            grade: result.grade || '',
            feedback: result.feedback || '',
            rawData: result // Keep the raw data for detailed view
          }
        })

        setResults(transformedResults)
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

  // Filter results based on search query, class, and exam
  const filteredResults = results.filter(
    (result) =>
      result.exam.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedClass === "all" || result.class === selectedClass) &&
      (selectedExam === "all" || result.exam === selectedExam),
  )

  // Get unique classes and exams for filters
  const classes = Array.from(new Set(results.map((result) => result.class)))
  const exams = Array.from(new Set(results.map((result) => result.exam)))

  const handleViewResult = (teacher: any) => {
    setSelectedTeacher(teacher)
    setShowResultDialog(true)
  }

  return (
    <DashboardLayout role="teacher">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Exam Results</h1>
            <p className="text-muted-foreground">View and analyze exam performance</p>
          </div>
          <Button
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
            onClick={() => {}}
          >
            <Download className="h-4 w-4 mr-2" />
            Download All Results
          </Button>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>View and analyze teacher results</CardDescription>
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
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Exams</option>
                  {exams.map((exam) => (
                    <option key={exam} value={exam}>
                      {exam}
                    </option>
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
                    <TableHead>Teacher</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
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
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.teacher}</TableCell>
                        <TableCell>{result.exam}</TableCell>
                        <TableCell>{result.class}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {result.score}/{result.totalMarks}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({Math.round((result.score / result.totalMarks) * 100)}%)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={result.status === "Passed" ? "bg-green-500" : "bg-red-500"}>
                            {result.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{result.date}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewResult(result)}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Teacher Performance</CardTitle>
              <CardDescription>Average scores by Teacher</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classes.map((cls) => {
                  const classResults = results.filter((result) => result.class === cls)
                  const avgScore = Math.round(
                    classResults.reduce((sum, result) => sum + result.score, 0) / classResults.length,
                  )
                  return (
                    <div key={cls} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{cls}</p>
                        <p className="font-medium">{avgScore}%</p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full ${
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
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Exam Performance</CardTitle>
              <CardDescription>Average scores by exam</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exams.map((exam) => {
                  const examResults = results.filter((result) => result.exam === exam)
                  const avgScore = Math.round(
                    examResults.reduce((sum, result) => sum + result.score, 0) / examResults.length,
                  )
                  const passRate = Math.round(
                    (examResults.filter((result) => result.status === "Passed").length / examResults.length) * 100,
                  )
                  return (
                    <div key={exam} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate max-w-[200px]" title={exam}>
                          {exam}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{avgScore}%</p>
                          <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                            {passRate}% Pass
                          </Badge>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full ${
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Exam Result</DialogTitle>
            <DialogDescription>Detailed result for {selectedTeacher?.exam}</DialogDescription>
          </DialogHeader>

          {selectedTeacher && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 rounded-lg">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTeacher.exam}</h2>
                    <p className="text-indigo-100">
                      {selectedTeacher.class} • {new Date(selectedTeacher.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <div className="text-4xl font-bold">
                      {selectedTeacher.score}/{selectedTeacher.totalMarks}
                    </div>
                    <p className="text-indigo-100">
                      {Math.round((selectedTeacher.score / selectedTeacher.totalMarks) * 100)}% •{" "}
                      {selectedTeacher.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Exam Information</h3>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Exam</p>
                        <p className="font-medium">{selectedTeacher.exam}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Class</p>
                        <p>{selectedTeacher.class}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p>{selectedTeacher.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Attempts</p>
                        <p>{selectedTeacher.attempts}/5</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium">Performance Summary</h3>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium">Overall Score</p>
                        <p className="text-sm font-medium">
                          {Math.round((selectedTeacher.score / selectedTeacher.totalMarks) * 100)}%
                        </p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200">
                        <div
                          className={`h-2 rounded-full ${
                            selectedTeacher.score >= 85
                              ? "bg-green-500"
                              : selectedTeacher.score >= 70
                                ? "bg-blue-500"
                                : selectedTeacher.score >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.round((selectedTeacher.score / selectedTeacher.totalMarks) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Correct Answers</p>
                        <p className="font-medium text-green-600">8/10</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Incorrect Answers</p>
                        <p className="font-medium text-red-600">2/10</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Time Taken</p>
                        <p>42:15 / 60:00</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rank in Class</p>
                        <p>2/32</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Category Breakdown</h3>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium">Algebra</p>
                        <p className="text-sm font-medium">75%</p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: "75%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium">Geometry</p>
                        <p className="text-sm font-medium">100%</p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-green-500" style={{ width: "100%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium">Arithmetic</p>
                        <p className="text-sm font-medium">67%</p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-yellow-500" style={{ width: "67%" }} />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium">Comparison with Class Average</h3>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="h-40 flex items-end justify-around">
                      <div className="flex flex-col items-center">
                        <div className="w-16 bg-indigo-500 rounded-t-md" style={{ height: "120px" }}></div>
                        <p className="mt-2 text-sm font-medium">Teacher</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((selectedTeacher.score / selectedTeacher.totalMarks) * 100)}%
                        </p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-16 bg-gray-300 rounded-t-md" style={{ height: "100px" }}></div>
                        <p className="mt-2 text-sm font-medium">Class Avg</p>
                        <p className="text-xs text-muted-foreground">76%</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-16 bg-gray-300 rounded-t-md" style={{ height: "130px" }}></div>
                        <p className="mt-2 text-sm font-medium">Top Score</p>
                        <p className="text-xs text-muted-foreground">92%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Question Analysis</h3>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Q#</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Time Spent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>1</TableCell>
                        <TableCell>Algebra</TableCell>
                        <TableCell>Easy</TableCell>
                        <TableCell>10</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">Correct</Badge>
                        </TableCell>
                        <TableCell>1:20</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2</TableCell>
                        <TableCell>Geometry</TableCell>
                        <TableCell>Medium</TableCell>
                        <TableCell>10</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">Correct</Badge>
                        </TableCell>
                        <TableCell>2:05</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>3</TableCell>
                        <TableCell>Algebra</TableCell>
                        <TableCell>Medium</TableCell>
                        <TableCell>10</TableCell>
                        <TableCell>
                          <Badge className="bg-red-500">Incorrect</Badge>
                        </TableCell>
                        <TableCell>3:15</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>4</TableCell>
                        <TableCell>Arithmetic</TableCell>
                        <TableCell>Easy</TableCell>
                        <TableCell>10</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">Correct</Badge>
                        </TableCell>
                        <TableCell>1:50</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>5</TableCell>
                        <TableCell>Geometry</TableCell>
                        <TableCell>Hard</TableCell>
                        <TableCell>10</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">Correct</Badge>
                        </TableCell>
                        <TableCell>4:10</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Teacher's Feedback</h3>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p>
                    Alex has shown good understanding of the concepts, especially in geometry. However, there's room for
                    improvement in algebra. I recommend focusing on equation solving and algebraic expressions for
                    better results in future exams.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-indigo-500 text-indigo-700 bg-indigo-50">
                      Good in Geometry
                    </Badge>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">
                      Needs Work on Algebra
                    </Badge>
                    <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                      Above Class Average
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setShowResultDialog(false)}>
                Close
              </Button>
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Email to Parent
              </Button>
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                SMS to Parent
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
