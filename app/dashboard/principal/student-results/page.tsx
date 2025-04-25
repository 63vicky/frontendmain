"use client"

import { useState } from "react"
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
import { Search, Download, Eye, Printer, Mail, MessageSquare } from "lucide-react"

export default function PrincipalStudentResults() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  // Mock data
  const results = [
    {
      id: 1,
      student: "Alex Johnson",
      class: "Class 8A",
      exam: "Mathematics - Chapter 3 Quiz",
      subject: "Mathematics",
      score: 85,
      totalMarks: 100,
      date: "2025-05-01",
      status: "Passed",
      attempts: 1,
      maxAttempts: 5,
      rating: "Good",
      teacher: "John Smith",
    },
    {
      id: 2,
      student: "Maria Garcia",
      class: "Class 8A",
      exam: "Mathematics - Chapter 3 Quiz",
      subject: "Mathematics",
      score: 92,
      totalMarks: 100,
      date: "2025-05-01",
      status: "Passed",
      attempts: 1,
      maxAttempts: 5,
      rating: "Excellent",
      teacher: "John Smith",
    },
    {
      id: 3,
      student: "James Wilson",
      class: "Class 8B",
      exam: "Science - Quiz 4",
      subject: "Science",
      score: 78,
      totalMarks: 100,
      date: "2025-05-02",
      status: "Passed",
      attempts: 2,
      maxAttempts: 5,
      rating: "Good",
      teacher: "Sarah Johnson",
    },
    {
      id: 4,
      student: "Sarah Chen",
      class: "Class 8B",
      exam: "Science - Quiz 4",
      subject: "Science",
      score: 88,
      totalMarks: 100,
      date: "2025-05-02",
      status: "Passed",
      attempts: 1,
      maxAttempts: 5,
      rating: "Good",
      teacher: "Sarah Johnson",
    },
    {
      id: 5,
      student: "Raj Patel",
      class: "Class 9A",
      exam: "History - Chapter 4 Quiz",
      subject: "History",
      score: 65,
      totalMarks: 100,
      date: "2025-05-03",
      status: "Passed",
      attempts: 3,
      maxAttempts: 5,
      rating: "Satisfactory",
      teacher: "Emily Davis",
    },
    {
      id: 6,
      student: "Emma Thompson",
      class: "Class 9A",
      exam: "History - Chapter 4 Quiz",
      subject: "History",
      score: 45,
      totalMarks: 100,
      date: "2025-05-03",
      status: "Failed",
      attempts: 2,
      maxAttempts: 5,
      rating: "Needs Improvement",
      teacher: "Emily Davis",
    },
    {
      id: 7,
      student: "Mohammed Ali",
      class: "Class 9B",
      exam: "Geography - Map Quiz",
      subject: "Geography",
      score: 72,
      totalMarks: 100,
      date: "2025-05-04",
      status: "Passed",
      attempts: 1,
      maxAttempts: 5,
      rating: "Satisfactory",
      teacher: "Michael Brown",
    },
    {
      id: 8,
      student: "Sofia Rodriguez",
      class: "Class 9B",
      exam: "Geography - Map Quiz",
      subject: "Geography",
      score: 68,
      totalMarks: 100,
      date: "2025-05-04",
      status: "Passed",
      attempts: 2,
      maxAttempts: 5,
      rating: "Satisfactory",
      teacher: "Michael Brown",
    },
  ]

  // Filter results based on search query, class, and subject
  const filteredResults = results.filter(
    (result) =>
      (result.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.exam.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedClass === "all" || result.class === selectedClass) &&
      (selectedSubject === "all" || result.subject === selectedSubject),
  )

  // Get unique classes and subjects for filters
  const classes = Array.from(new Set(results.map((result) => result.class)))
  const subjects = Array.from(new Set(results.map((result) => result.subject)))

  const handleViewResult = (student: any) => {
    setSelectedStudent(student)
    setShowResultDialog(true)
  }

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
    <DashboardLayout role="principal">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Student Results</h1>
            <p className="text-muted-foreground">View and analyze student performance across all classes</p>
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
            <CardDescription>View and analyze student results across all classes and subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
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
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.student}</TableCell>
                      <TableCell>{result.class}</TableCell>
                      <TableCell>{result.exam}</TableCell>
                      <TableCell>{result.subject}</TableCell>
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
                        <Badge className={getRatingColor(result.rating)}>{result.rating}</Badge>
                      </TableCell>
                      <TableCell>
                        {result.attempts}/{result.maxAttempts}
                      </TableCell>
                      <TableCell>{result.teacher}</TableCell>
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
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Class Performance</CardTitle>
              <CardDescription>Average scores by class</CardDescription>
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
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Average scores by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjects.map((subject) => {
                  const subjectResults = results.filter((result) => result.subject === subject)
                  const avgScore = Math.round(
                    subjectResults.reduce((sum, result) => sum + result.score, 0) / subjectResults.length,
                  )
                  const passRate = Math.round(
                    (subjectResults.filter((result) => result.status === "Passed").length / subjectResults.length) *
                      100,
                  )
                  return (
                    <div key={subject} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate max-w-[200px]" title={subject}>
                          {subject}
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Student Result</DialogTitle>
            <DialogDescription>Detailed result for {selectedStudent?.student}</DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 rounded-lg">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStudent.exam}</h2>
                    <p className="text-indigo-100">
                      {selectedStudent.class} • {selectedStudent.subject} •{" "}
                      {new Date(selectedStudent.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <div className="text-4xl font-bold">
                      {selectedStudent.score}/{selectedStudent.totalMarks}
                    </div>
                    <p className="text-indigo-100">
                      {Math.round((selectedStudent.score / selectedStudent.totalMarks) * 100)}% •{" "}
                      {selectedStudent.rating}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Student Information</h3>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedStudent.student}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Class</p>
                        <p>{selectedStudent.class}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Roll Number</p>
                        <p>8A01</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Teacher</p>
                        <p>{selectedStudent.teacher}</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium">Attempt Information</h3>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Attempt</p>
                        <p className="font-medium">
                          {selectedStudent.attempts} of {selectedStudent.maxAttempts}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Highest Score</p>
                        <p className="font-medium">
                          {Math.round((selectedStudent.score / selectedStudent.totalMarks) * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Remaining Attempts</p>
                        <p className="font-medium">{selectedStudent.maxAttempts - selectedStudent.attempts}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className={selectedStudent.status === "Passed" ? "bg-green-500" : "bg-red-500"}>
                          {selectedStudent.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium">Performance Summary</h3>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium">Overall Score</p>
                        <p className="text-sm font-medium">
                          {Math.round((selectedStudent.score / selectedStudent.totalMarks) * 100)}%
                        </p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200">
                        <div
                          className={`h-2 rounded-full ${
                            selectedStudent.score >= 85
                              ? "bg-green-500"
                              : selectedStudent.score >= 70
                                ? "bg-blue-500"
                                : selectedStudent.score >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.round((selectedStudent.score / selectedStudent.totalMarks) * 100)}%`,
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
                        <p className="mt-2 text-sm font-medium">Student</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((selectedStudent.score / selectedStudent.totalMarks) * 100)}%
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
                        <TableHead>Type</TableHead>
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
                        <TableCell>MCQ</TableCell>
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
                        <TableCell>MCQ</TableCell>
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
                        <TableCell>MCQ</TableCell>
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
                        <TableCell>Fill-up</TableCell>
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
                        <TableCell>True/False</TableCell>
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
                    {selectedStudent.student} has shown good understanding of the concepts, especially in geometry.
                    However, there's room for improvement in algebra. I recommend focusing on equation solving and
                    algebraic expressions for better results in future exams.
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
