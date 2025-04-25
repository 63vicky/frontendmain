"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ExamAnalytics() {
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")

  // Mock data
  const examData = [
    {
      id: 1,
      title: "Mathematics - Chapter 3",
      subject: "Mathematics",
      class: "Class 8",
      teacher: "John Smith",
      students: 20,
      avgScore: 76,
      highestScore: 95,
      lowestScore: 45,
      status: "Active",
    },
    {
      id: 2,
      title: "Science - Quiz 4",
      subject: "Science",
      class: "Class 8",
      teacher: "Sarah Johnson",
      students: 20,
      avgScore: 82,
      highestScore: 98,
      lowestScore: 60,
      status: "Active",
    },
    {
      id: 3,
      title: "English - Grammar Test",
      subject: "English",
      class: "Class 8",
      teacher: "Michael Brown",
      students: 20,
      avgScore: 0,
      highestScore: 0,
      lowestScore: 0,
      status: "Scheduled",
    },
    {
      id: 4,
      title: "Mathematics - Chapter 2",
      subject: "Mathematics",
      class: "Class 8",
      teacher: "John Smith",
      students: 20,
      avgScore: 76,
      highestScore: 92,
      lowestScore: 48,
      status: "Completed",
    },
    {
      id: 5,
      title: "Science - Quiz 3",
      subject: "Science",
      class: "Class 8",
      teacher: "Sarah Johnson",
      students: 20,
      avgScore: 82,
      highestScore: 96,
      lowestScore: 65,
      status: "Completed",
    },
    {
      id: 6,
      title: "English - Vocabulary Test",
      subject: "English",
      class: "Class 8",
      teacher: "Michael Brown",
      students: 20,
      avgScore: 79,
      highestScore: 94,
      lowestScore: 55,
      status: "Completed",
    },
    {
      id: 7,
      title: "Mathematics - Final Exam",
      subject: "Mathematics",
      class: "Class 9",
      teacher: "John Smith",
      students: 25,
      avgScore: 72,
      highestScore: 90,
      lowestScore: 42,
      status: "Completed",
    },
    {
      id: 8,
      title: "Science - Final Exam",
      subject: "Science",
      class: "Class 9",
      teacher: "Sarah Johnson",
      students: 25,
      avgScore: 78,
      highestScore: 95,
      lowestScore: 50,
      status: "Completed",
    },
  ]

  // Filter data based on selected class and subject
  const filteredData = examData.filter((exam) => {
    const classMatch = selectedClass === "all" || exam.class === selectedClass
    const subjectMatch = selectedSubject === "all" || exam.subject === selectedSubject
    return classMatch && subjectMatch
  })

  // Group data by status
  const activeExams = filteredData.filter((exam) => exam.status === "Active" || exam.status === "Scheduled")
  const completedExams = filteredData.filter((exam) => exam.status === "Completed")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Analytics</CardTitle>
        <CardDescription>Analyze exam performance across classes and subjects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-full sm:w-1/2">
            <Label htmlFor="class-filter">Filter by Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger id="class-filter">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="Class 8">Class 8</SelectItem>
                <SelectItem value="Class 9">Class 9</SelectItem>
                <SelectItem value="Class 10">Class 10</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-1/2">
            <Label htmlFor="subject-filter">Filter by Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger id="subject-filter">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="History">History</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Exams</TabsTrigger>
            <TabsTrigger value="completed">Completed Exams</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredData.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeExams.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedExams.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {completedExams.length > 0
                      ? Math.round(completedExams.reduce((sum, exam) => sum + exam.avgScore, 0) / completedExams.length)
                      : 0}
                    %
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance by Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Mathematics", "Science", "English"].map((subject) => {
                    const subjectExams = completedExams.filter((exam) => exam.subject === subject)
                    const avgScore =
                      subjectExams.length > 0
                        ? Math.round(subjectExams.reduce((sum, exam) => sum + exam.avgScore, 0) / subjectExams.length)
                        : 0

                    return (
                      <div key={subject} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{subject}</p>
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
          </TabsContent>

          <TabsContent value="active" className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeExams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No active exams found
                    </TableCell>
                  </TableRow>
                ) : (
                  activeExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.title}</TableCell>
                      <TableCell>{exam.subject}</TableCell>
                      <TableCell>{exam.class}</TableCell>
                      <TableCell>{exam.teacher}</TableCell>
                      <TableCell>{exam.students}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            exam.status === "Active" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {exam.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="completed" className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Avg. Score</TableHead>
                  <TableHead>Highest</TableHead>
                  <TableHead>Lowest</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedExams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      No completed exams found
                    </TableCell>
                  </TableRow>
                ) : (
                  completedExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.title}</TableCell>
                      <TableCell>{exam.subject}</TableCell>
                      <TableCell>{exam.class}</TableCell>
                      <TableCell>{exam.teacher}</TableCell>
                      <TableCell>{exam.students}</TableCell>
                      <TableCell>{exam.avgScore}%</TableCell>
                      <TableCell>{exam.highestScore}%</TableCell>
                      <TableCell>{exam.lowestScore}%</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
