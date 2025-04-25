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
import { Search, Eye, CheckCircle, XCircle, Clock, Calendar, User, FileText } from "lucide-react"

export default function ApproveQuizzes() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState("pending")

  // Mock data
  const quizzes = [
    {
      id: 1,
      name: "Mathematics - Chapter 3 Quiz",
      subject: "Mathematics",
      class: "Class 8",
      teacher: "John Smith",
      questions: 15,
      duration: 45,
      date: "2025-05-05",
      status: "Pending",
    },
    {
      id: 2,
      name: "Science - Quiz 4",
      subject: "Science",
      class: "Class 8",
      teacher: "Sarah Johnson",
      questions: 20,
      duration: 60,
      date: "2025-05-06",
      status: "Pending",
    },
    {
      id: 3,
      name: "English - Grammar Test",
      subject: "English",
      class: "Class 8",
      teacher: "Michael Brown",
      questions: 25,
      duration: 60,
      date: "2025-05-07",
      status: "Pending",
    },
    {
      id: 4,
      name: "History - Chapter 4 Quiz",
      subject: "History",
      class: "Class 9",
      teacher: "Emily Davis",
      questions: 15,
      duration: 45,
      date: "2025-05-05",
      status: "Approved",
    },
    {
      id: 5,
      name: "Geography - Map Quiz",
      subject: "Geography",
      class: "Class 9",
      teacher: "David Wilson",
      questions: 10,
      duration: 30,
      date: "2025-05-06",
      status: "Rejected",
      reason: "Questions need revision for clarity and difficulty level",
    },
    {
      id: 6,
      name: "Physics - Forces Quiz",
      subject: "Physics",
      class: "Class 10",
      teacher: "Robert Taylor",
      questions: 15,
      duration: 45,
      date: "2025-05-07",
      status: "Approved",
    },
  ]

  // Filter quizzes based on search query and status
  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      (quiz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.teacher.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === "all" || quiz.status.toLowerCase() === statusFilter.toLowerCase()),
  )

  const handleView = (quiz: any) => {
    setSelectedQuiz(quiz)
    setShowViewDialog(true)
  }

  const handleApprove = (quiz: any) => {
    // In a real app, you would call an API to update the quiz status
    console.log("Approving quiz:", quiz.id)
  }

  const handleReject = (quiz: any) => {
    // In a real app, you would show a dialog to enter rejection reason and call an API
    console.log("Rejecting quiz:", quiz.id)
  }

  return (
    <DashboardLayout role="principal">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Approve Quizzes</h1>
            <p className="text-muted-foreground">Review and approve quizzes created by teachers</p>
          </div>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Quiz Approval Queue</CardTitle>
            <CardDescription>Review and approve or reject quizzes created by teachers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quizzes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuizzes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No quizzes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQuizzes.map((quiz) => (
                      <TableRow key={quiz.id}>
                        <TableCell className="font-medium">{quiz.name}</TableCell>
                        <TableCell>{quiz.subject}</TableCell>
                        <TableCell>{quiz.class}</TableCell>
                        <TableCell>{quiz.teacher}</TableCell>
                        <TableCell>{quiz.questions}</TableCell>
                        <TableCell>{quiz.duration} min</TableCell>
                        <TableCell>{new Date(quiz.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              quiz.status === "Approved"
                                ? "bg-green-500"
                                : quiz.status === "Rejected"
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                            }
                          >
                            {quiz.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleView(quiz)}>
                            <Eye className="h-4 w-4 text-indigo-500" />
                          </Button>
                          {quiz.status === "Pending" && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleApprove(quiz)}>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleReject(quiz)}>
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Quiz Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Quiz Details</DialogTitle>
            <DialogDescription>Review quiz details before approval</DialogDescription>
          </DialogHeader>

          {selectedQuiz && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Quiz Information</h3>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <p className="font-medium">{selectedQuiz.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Subject:</p>
                        <p>{selectedQuiz.subject}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Class:</p>
                        <p>{selectedQuiz.class}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Questions:</p>
                        <p>{selectedQuiz.questions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration:</p>
                        <p>{selectedQuiz.duration} minutes</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Creator Information</h3>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-indigo-500" />
                      <p className="font-medium">{selectedQuiz.teacher}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Created On:</p>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <p>{new Date(selectedQuiz.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status:</p>
                        <Badge
                          className={
                            selectedQuiz.status === "Approved"
                              ? "bg-green-500"
                              : selectedQuiz.status === "Rejected"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                          }
                        >
                          {selectedQuiz.status}
                        </Badge>
                      </div>
                    </div>
                    {selectedQuiz.status === "Rejected" && (
                      <div>
                        <p className="text-muted-foreground">Rejection Reason:</p>
                        <p className="text-sm text-red-600">{selectedQuiz.reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Quiz Questions</h3>
                <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                  {/* Sample questions */}
                  <div className="border-b pb-3">
                    <div className="flex justify-between">
                      <p className="font-medium">Question 1</p>
                      <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                        MCQ
                      </Badge>
                    </div>
                    <p className="mt-1">What is the value of x in the equation 2x + 5 = 15?</p>
                    <div className="mt-2 pl-4 space-y-1 text-sm">
                      <p className="flex items-center gap-1">
                        <span className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                          ✓
                        </span>
                        A. 5
                      </p>
                      <p>B. 7.5</p>
                      <p>C. 10</p>
                      <p>D. 3</p>
                    </div>
                  </div>

                  <div className="border-b pb-3">
                    <div className="flex justify-between">
                      <p className="font-medium">Question 2</p>
                      <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                        MCQ
                      </Badge>
                    </div>
                    <p className="mt-1">If a triangle has sides of length 3, 4, and 5, what type of triangle is it?</p>
                    <div className="mt-2 pl-4 space-y-1 text-sm">
                      <p>A. Equilateral</p>
                      <p>B. Isosceles</p>
                      <p>C. Scalene</p>
                      <p className="flex items-center gap-1">
                        <span className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                          ✓
                        </span>
                        D. Right-angled
                      </p>
                    </div>
                  </div>

                  <div className="border-b pb-3">
                    <div className="flex justify-between">
                      <p className="font-medium">Question 3</p>
                      <Badge variant="outline" className="border-purple-500 text-purple-700 bg-purple-50">
                        Fill-up
                      </Badge>
                    </div>
                    <p className="mt-1">The formula for the area of a circle is _______.</p>
                    <div className="mt-2 pl-4 text-sm">
                      <p className="text-green-600 font-medium">Answer: πr²</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <p className="font-medium">Question 4</p>
                      <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                        True/False
                      </Badge>
                    </div>
                    <p className="mt-1">The Earth revolves around the Sun.</p>
                    <div className="mt-2 pl-4 text-sm">
                      <p className="text-green-600 font-medium">Answer: True</p>
                    </div>
                  </div>

                  <p className="text-center text-muted-foreground text-sm">
                    Showing 4 of {selectedQuiz.questions} questions
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Quiz Settings</h3>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Time Limit:</p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-indigo-500" />
                        <p>{selectedQuiz.duration} minutes</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Max Attempts:</p>
                      <p>5</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Randomize Questions:</p>
                      <p>Yes</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pass Percentage:</p>
                      <p>60%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedQuiz && selectedQuiz.status === "Pending" && (
              <>
                <Button variant="outline" onClick={() => handleReject(selectedQuiz)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                  onClick={() => handleApprove(selectedQuiz)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
            {selectedQuiz && selectedQuiz.status !== "Pending" && (
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
