"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/dashboard-layout"
import { Search, Download, Eye, BarChart3, FileText } from "lucide-react"

export default function ResultsManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")

  // Mock data
  const examResults = [
    {
      id: 1,
      name: "Mathematics - Chapter 3",
      class: "Class 8",
      subject: "Mathematics",
      date: "Apr 25, 2025",
      students: 32,
      avgScore: 76,
      highestScore: 95,
      lowestScore: 45,
      teacher: "John Smith",
    },
    {
      id: 2,
      name: "Science - Quiz 4",
      class: "Class 8",
      subject: "Science",
      date: "Apr 28, 2025",
      students: 30,
      avgScore: 82,
      highestScore: 98,
      lowestScore: 60,
      teacher: "Sarah Johnson",
    },
    {
      id: 3,
      name: "English - Grammar Test",
      class: "Class 8",
      subject: "English",
      date: "May 5, 2025",
      students: 31,
      avgScore: 79,
      highestScore: 94,
      lowestScore: 55,
      teacher: "Michael Brown",
    },
    {
      id: 4,
      name: "History - Chapter 4",
      class: "Class 9",
      subject: "History",
      date: "Apr 20, 2025",
      students: 28,
      avgScore: 74,
      highestScore: 92,
      lowestScore: 48,
      teacher: "Emily Davis",
    },
    {
      id: 5,
      name: "Mathematics - Final Exam",
      class: "Class 10",
      subject: "Mathematics",
      date: "Apr 15, 2025",
      students: 25,
      avgScore: 72,
      highestScore: 90,
      lowestScore: 42,
      teacher: "John Smith",
    },
    {
      id: 6,
      name: "Science - Final Exam",
      class: "Class 10",
      subject: "Science",
      date: "Apr 10, 2025",
      students: 25,
      avgScore: 78,
      highestScore: 95,
      lowestScore: 50,
      teacher: "Sarah Johnson",
    },
  ]

  // Filter results based on search query, class, and subject
  const filteredResults = examResults.filter(
    (result) =>
      (result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.teacher.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedClass === "all" || result.class === selectedClass) &&
      (selectedSubject === "all" || result.subject === selectedSubject),
  )

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
    const avgScore = Math.round(results.reduce((sum, result) => sum + result.avgScore, 0) / results.length)
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
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                    </select>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="all">All Subjects</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                      <option value="History">History</option>
                    </select>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Students</TableHead>
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
                            <Button variant="ghost" size="sm">
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
                            <TableHead>Students</TableHead>
                            <TableHead>Avg. Score</TableHead>
                            <TableHead>Highest</TableHead>
                            <TableHead>Lowest</TableHead>
                            <TableHead>Teacher</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.map((result) => (
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
    </DashboardLayout>
  )
}
