"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Exam, Question } from "@/lib/types"
import { examService } from "@/lib/services/exam"
import { authService } from "@/lib/services/auth"

export default function ExamManagement() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user || user.role !== "teacher") {
      router.push("/login")
      return
    }

    loadExams()
  }, [router])

  const loadExams = async () => {
    try {
      setLoading(true)
      const data = await examService.getExams()
      setExams(data)
    } catch (err) {
      setError("Failed to load exams")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateExam = async (examData: Partial<Exam>) => {
    try {
      const newExam = await examService.createExam(examData)
      setExams([...exams, newExam])
    } catch (err) {
      setError("Failed to create exam")
      console.error(err)
    }
  }

  const handleUpdateExam = async (id: string, examData: Partial<Exam>) => {
    try {
      const updatedExam = await examService.updateExam(id, examData)
      setExams(exams.map(exam => exam._id === id ? updatedExam : exam))
    } catch (err) {
      setError("Failed to update exam")
      console.error(err)
    }
  }

  const handleDeleteExam = async (id: string) => {
    try {
      await examService.deleteExam(id)
      setExams(exams.filter(exam => exam._id !== id))
    } catch (err) {
      setError("Failed to delete exam")
      console.error(err)
    }
  }

  const handleCreateQuestion = async (examId: string, questionData: Partial<Question>) => {
    try {
      const newQuestion = await examService.createQuestion({
        ...questionData,
        examId
      })
      const updatedExams = exams.map(exam => {
        if (exam._id === examId) {
          return {
            ...exam,
            questions: [...(exam.questions || []), newQuestion]
          }
        }
        return exam
      })
      setExams(updatedExams)
    } catch (err) {
      setError("Failed to create question")
      console.error(err)
    }
  }

  const handleUpdateQuestion = async (examId: string, questionId: string, questionData: Partial<Question>) => {
    try {
      const updatedQuestion = await examService.updateQuestion(questionId, questionData)
      const updatedExams = exams.map(exam => {
        if (exam._id === examId) {
          return {
            ...exam,
            questions: exam.questions?.map(q => q._id === questionId ? updatedQuestion : q)
          }
        }
        return exam
      })
      setExams(updatedExams)
    } catch (err) {
      setError("Failed to update question")
      console.error(err)
    }
  }

  const handleDeleteQuestion = async (examId: string, questionId: string) => {
    try {
      await examService.deleteQuestion(questionId)
      const updatedExams = exams.map(exam => {
        if (exam._id === examId) {
          return {
            ...exam,
            questions: exam.questions?.filter(q => q._id !== questionId)
          }
        }
        return exam
      })
      setExams(updatedExams)
    } catch (err) {
      setError("Failed to delete question")
      console.error(err)
    }
  }

  // Filter exams based on search query
  const filteredExams = exams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

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
            {filteredExams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No active exams found</div>
            ) : (
              filteredExams.map((exam) => (
                <div
                  key={exam._id}
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
                      <Link href={`/exam/${exam._id}/edit`}>Edit</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/exam/${exam._id}/results`}>View Results</Link>
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
            {exams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No completed exams found</div>
            ) : (
              exams.map((exam) => (
                <div
                  key={exam._id}
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
                      <Link href={`/exam/${exam._id}/results`}>View Results</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/exam/${exam._id}/duplicate`}>Duplicate</Link>
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
