"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default function ExamManagement() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data
  const activeExams = [
    {
      id: 1,
      title: "Mathematics - Chapter 3",
      subject: "Mathematics",
      class: "Class 8",
      startDate: "Apr 25, 2025",
      endDate: "May 2, 2025",
      attempts: { current: 12, max: 5 * 20 }, // 20 students with 5 attempts each
      status: "Active",
    },
    {
      id: 2,
      title: "Science - Quiz 4",
      subject: "Science",
      class: "Class 8",
      startDate: "Apr 28, 2025",
      endDate: "May 5, 2025",
      attempts: { current: 8, max: 5 * 20 },
      status: "Active",
    },
    {
      id: 3,
      title: "English - Grammar Test",
      subject: "English",
      class: "Class 8",
      startDate: "May 1, 2025",
      endDate: "May 8, 2025",
      attempts: { current: 0, max: 5 * 20 },
      status: "Scheduled",
    },
  ]

  const completedExams = [
    {
      id: 4,
      title: "Mathematics - Chapter 2",
      subject: "Mathematics",
      class: "Class 8",
      startDate: "Apr 10, 2025",
      endDate: "Apr 17, 2025",
      attempts: { current: 87, max: 5 * 20 },
      avgScore: 76,
      status: "Completed",
    },
    {
      id: 5,
      title: "Science - Quiz 3",
      subject: "Science",
      class: "Class 8",
      startDate: "Apr 5, 2025",
      endDate: "Apr 12, 2025",
      attempts: { current: 92, max: 5 * 20 },
      avgScore: 82,
      status: "Completed",
    },
    {
      id: 6,
      title: "English - Vocabulary Test",
      subject: "English",
      class: "Class 8",
      startDate: "Mar 25, 2025",
      endDate: "Apr 1, 2025",
      attempts: { current: 85, max: 5 * 20 },
      avgScore: 79,
      status: "Completed",
    },
  ]

  // Filter exams based on search query
  const filteredActiveExams = activeExams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredCompletedExams = completedExams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Management</CardTitle>
        <CardDescription>Manage your exams and view results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div className="relative w-64">
            <Input
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Button asChild>
            <Link href="/dashboard/teacher?tab=create">Create New Exam</Link>
          </Button>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Exams</TabsTrigger>
            <TabsTrigger value="completed">Completed Exams</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 pt-4">
            {filteredActiveExams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No active exams found</div>
            ) : (
              filteredActiveExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-4"
                >
                  <div className="space-y-1 mb-4 md:mb-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-lg">{exam.title}</p>
                      <Badge variant={exam.status === "Active" ? "default" : "secondary"}>{exam.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Subject: {exam.subject} | {exam.class}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Available: {exam.startDate} to {exam.endDate}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Attempts: {exam.attempts.current}/{exam.attempts.max}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/exam/${exam.id}/edit`}>Edit</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/exam/${exam.id}/results`}>View Results</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500">
                      Deactivate
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 pt-4">
            {filteredCompletedExams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No completed exams found</div>
            ) : (
              filteredCompletedExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-4"
                >
                  <div className="space-y-1 mb-4 md:mb-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-lg">{exam.title}</p>
                      <Badge variant="secondary">{exam.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Subject: {exam.subject} | {exam.class}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Period: {exam.startDate} to {exam.endDate}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Attempts: {exam.attempts.current}/{exam.attempts.max} | Avg. Score: {exam.avgScore}%
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/exam/${exam.id}/results`}>View Results</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/exam/${exam.id}/duplicate`}>Duplicate</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500">
                      Archive
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
