"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import DashboardLayout from "@/components/dashboard-layout"
import { Search, Plus, Edit, Trash, Eye, Clock, Calendar, FileText, Settings } from "lucide-react"

export default function ExamManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")

  // Mock data
  const exams = [
    {
      id: 1,
      title: "Mathematics - Chapter 3 Quiz",
      subject: "Mathematics",
      class: "Class 8A",
      chapter: "Algebra Basics",
      duration: 60,
      totalQuestions: 10,
      maxAttempts: 5,
      startDate: "2025-05-01",
      endDate: "2025-05-10",
      status: "active",
      createdAt: "2025-04-20",
    },
    {
      id: 2,
      title: "Science - Quiz 4",
      subject: "Science",
      class: "Class 8B",
      chapter: "Forces and Motion",
      duration: 45,
      totalQuestions: 15,
      maxAttempts: 5,
      startDate: "2025-05-05",
      endDate: "2025-05-15",
      status: "scheduled",
      createdAt: "2025-04-22",
    },
    {
      id: 3,
      title: "English - Grammar Test",
      subject: "English",
      class: "Class 9A",
      chapter: "Tenses",
      duration: 30,
      totalQuestions: 20,
      maxAttempts: 5,
      startDate: "2025-04-25",
      endDate: "2025-05-05",
      status: "completed",
      createdAt: "2025-04-15",
    },
    {
      id: 4,
      title: "History - Chapter 4 Quiz",
      subject: "History",
      class: "Class 9B",
      chapter: "World War II",
      duration: 40,
      totalQuestions: 12,
      maxAttempts: 5,
      startDate: "2025-05-10",
      endDate: "2025-05-20",
      status: "draft",
      createdAt: "2025-04-25",
    },
    {
      id: 5,
      title: "Mathematics - Final Exam",
      subject: "Mathematics",
      class: "Class 10A",
      chapter: "All Chapters",
      duration: 90,
      totalQuestions: 30,
      maxAttempts: 5,
      startDate: "2025-05-15",
      endDate: "2025-05-16",
      status: "scheduled",
      createdAt: "2025-04-28",
    },
  ]

  // Filter exams based on search query, status, class, and subject
  const filteredExams = exams.filter(
    (exam) =>
      (exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.class.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedStatus === "all" || exam.status === selectedStatus) &&
      (selectedClass === "all" || exam.class === selectedClass) &&
      (selectedSubject === "all" || exam.subject === selectedSubject),
  )

  // Get unique classes and subjects for filters
  const classes = Array.from(new Set(exams.map((exam) => exam.class)))
  const subjects = Array.from(new Set(exams.map((exam) => exam.subject)))

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "scheduled":
        return "bg-blue-500"
      case "completed":
        return "bg-gray-500"
      case "draft":
        return "bg-yellow-500"
      default:
        return "bg-slate-500"
    }
  }

  return (
    <DashboardLayout role="teacher">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Exam Management</h1>
            <p className="text-muted-foreground">Create, edit, and manage your exams</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800">
                <Plus className="h-4 w-4 mr-2" />
                Create New Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create New Exam</DialogTitle>
                <DialogDescription>Fill in the details to create a new exam</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Exam Title</Label>
                  <Input id="title" placeholder="e.g., Mathematics - Chapter 3 Quiz" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class8a">Class 8A</SelectItem>
                      <SelectItem value="class8b">Class 8B</SelectItem>
                      <SelectItem value="class9a">Class 9A</SelectItem>
                      <SelectItem value="class9b">Class 9B</SelectItem>
                      <SelectItem value="class10a">Class 10A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chapter">Chapter</Label>
                  <Input id="chapter" placeholder="e.g., Algebra Basics" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input id="duration" type="number" min="1" placeholder="60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalQuestions">Total Questions</Label>
                  <Input id="totalQuestions" type="number" min="1" placeholder="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                  <Input id="maxAttempts" type="number" min="1" max="5" placeholder="5" />
                  <p className="text-xs text-muted-foreground">Students can attempt this exam up to 5 times</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultMCQTime">Default MCQ Time (seconds)</Label>
                  <Input id="defaultMCQTime" type="number" min="5" defaultValue="30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultSCQTime">Default SCQ Time (seconds)</Label>
                  <Input id="defaultSCQTime" type="number" min="5" defaultValue="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea id="description" placeholder="Enter exam description or instructions" />
                </div>
                <div className="flex items-center space-x-2 md:col-span-2">
                  <Checkbox id="randomize" />
                  <Label htmlFor="randomize">Randomize questions for each attempt</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800">
                  Create Exam
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all-exams" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all-exams" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">All Exams</span>
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Scheduled</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all-exams" className="space-y-4 pt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>All Exams</CardTitle>
                <CardDescription>View and manage all your exams</CardDescription>
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
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="draft">Draft</option>
                    </select>
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

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam Title</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Questions</TableHead>
                        <TableHead>Max Attempts</TableHead>
                        <TableHead>Date Range</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExams.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No exams found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredExams.map((exam) => (
                          <TableRow key={exam.id}>
                            <TableCell className="font-medium">{exam.title}</TableCell>
                            <TableCell>{exam.class}</TableCell>
                            <TableCell>{exam.subject}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-slate-500" />
                                <span>{exam.duration} min</span>
                              </div>
                            </TableCell>
                            <TableCell>{exam.totalQuestions}</TableCell>
                            <TableCell>{exam.maxAttempts}</TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <div>{new Date(exam.startDate).toLocaleDateString()}</div>
                                <div className="text-muted-foreground">to</div>
                                <div>{new Date(exam.endDate).toLocaleDateString()}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(exam.status)}>
                                {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 text-indigo-500" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4 text-indigo-500" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4 pt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Scheduled Exams</CardTitle>
                <CardDescription>View upcoming and active exams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exams
                    .filter((exam) => exam.status === "scheduled" || exam.status === "active")
                    .map((exam) => (
                      <Card key={exam.id} className="border shadow-sm">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{exam.title}</CardTitle>
                            <Badge className={getStatusColor(exam.status)}>
                              {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                            </Badge>
                          </div>
                          <CardDescription>
                            {exam.class} • {exam.subject}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p className="font-medium">{exam.duration} minutes</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Questions</p>
                              <p className="font-medium">{exam.totalQuestions}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Start Date</p>
                              <p className="font-medium">{new Date(exam.startDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">End Date</p>
                              <p className="font-medium">{new Date(exam.endDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 pt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Exam Settings</CardTitle>
                <CardDescription>Configure default settings for your exams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="default-duration">Default Exam Duration (minutes)</Label>
                    <Input id="default-duration" type="number" min="1" defaultValue="60" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-attempts">Default Maximum Attempts</Label>
                    <Input id="default-attempts" type="number" min="1" max="5" defaultValue="5" />
                    <p className="text-xs text-muted-foreground">
                      Students can attempt each exam up to this many times by default
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-passing">Default Passing Score (%)</Label>
                    <Input id="default-passing" type="number" min="1" max="100" defaultValue="60" />
                  </div>
                  <div className="space-y-3">
                    <Label>Default Question Types</Label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="mcq" defaultChecked />
                        <Label htmlFor="mcq">Multiple Choice Questions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="fillup" defaultChecked />
                        <Label htmlFor="fillup">Fill in the Blanks</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="truefalse" defaultChecked />
                        <Label htmlFor="truefalse">True/False</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="shortanswer" />
                        <Label htmlFor="shortanswer">Short Answer</Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Default Exam Settings</Label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="randomize-default" defaultChecked />
                        <Label htmlFor="randomize-default">Randomize questions for each attempt</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="show-results" defaultChecked />
                        <Label htmlFor="show-results">Show results immediately after submission</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="show-answers" />
                        <Label htmlFor="show-answers">Show correct answers after submission</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="time-limit" defaultChecked />
                        <Label htmlFor="time-limit">Enforce time limit</Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Question Timer Settings</Label>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="mcq-time">Default MCQ Time</Label>
                          <Input id="mcq-time" type="number" min="5" defaultValue="30" />
                          <p className="text-xs text-muted-foreground">Time in seconds</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="scq-time">Default SCQ Time</Label>
                          <Input id="scq-time" type="number" min="5" defaultValue="10" />
                          <p className="text-xs text-muted-foreground">Time in seconds</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="adaptive-timing" defaultChecked />
                        <Label htmlFor="adaptive-timing">Enable adaptive timing for SCQ</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="prevent-back" defaultChecked />
                        <Label htmlFor="prevent-back">Prevent going back to previous questions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="force-answer" defaultChecked />
                        <Label htmlFor="force-answer">Force answer or skip before proceeding</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" className="mr-2">
                  Reset to Defaults
                </Button>
                <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800">
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
