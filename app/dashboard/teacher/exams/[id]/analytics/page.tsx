"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, BarChart2, Users, Clock, BookOpen, Loader2 } from "lucide-react"
import QuestionAnalysis from "@/components/question-analysis"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function ExamAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [examData, setExamData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("questions")
  
  const examId = params.id as string

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(`${API_URL}/exams/${examId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch exam data')
        }
        
        const data = await response.json()
        setExamData(data.data || data)
      } catch (error) {
        console.error('Error fetching exam data:', error)
        setError('Failed to load exam data. Please try again later.')
        toast({
          title: "Error",
          description: "Failed to load exam data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchExamData()
  }, [examId, toast])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-4" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !examData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <Loader2 className="h-12 w-12 mx-auto animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Exam</h2>
          <p className="text-gray-600 mb-6">
            {error || "Failed to load exam data. Please try again later."}
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Link href="/dashboard/teacher/exams">Back to Exams</Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Format dates
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (e) {
      return 'Invalid date'
    }
  }

  // Get class name
  const className = typeof examData.class === 'object' 
    ? `${examData.class.name} ${examData.class.section}` 
    : examData.class

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Button variant="ghost" size="sm" className="mr-4" asChild>
            <Link href="/dashboard/teacher/exams">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exams
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Exam Analytics</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/teacher/exams/${examId}`}>
              View Exam Details
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/teacher/exams/${examId}/results`}>
              View Results
            </Link>
          </Button>
        </div>
      </div>

      <Card className="mb-6 overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white p-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{examData.title}</h1>
              <p className="text-indigo-200">
                {examData.subject} • {className}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Badge className="bg-white text-indigo-800 px-3 py-1 text-sm">
                {examData.status.charAt(0).toUpperCase() + examData.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                <h4 className="font-medium">Total Questions</h4>
              </div>
              <p className="text-3xl font-bold">
                {examData.questions?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {examData.questions?.length > 0 
                  ? `${examData.questions.filter((q: any) => q.difficulty === 'Easy').length} Easy, 
                     ${examData.questions.filter((q: any) => q.difficulty === 'Medium').length} Medium, 
                     ${examData.questions.filter((q: any) => q.difficulty === 'Hard').length} Hard`
                  : 'No questions available'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 mr-2 text-purple-500" />
                <h4 className="font-medium">Duration</h4>
              </div>
              <p className="text-3xl font-bold">{examData.duration} min</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(examData.startDate)} - {formatDate(examData.endDate)}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center mb-2">
                <BarChart2 className="h-5 w-5 mr-2 text-green-500" />
                <h4 className="font-medium">Attempts</h4>
              </div>
              <p className="text-3xl font-bold">
                {examData.attempts?.current || 0}/{examData.attempts?.max || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {examData.attempts?.current > 0 
                  ? `${examData.attempts.current} attempts made so far` 
                  : 'No attempts yet'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="questions" className="text-sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Question Analysis
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-sm">
            <BarChart2 className="h-4 w-4 mr-2" />
            Performance Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions">
          <QuestionAnalysis examId={examId} />
        </TabsContent>

        <TabsContent value="performance">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription>Overall performance metrics for this exam</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <p className="text-slate-500">
                  {examData.attempts?.current > 0 
                    ? 'Performance analysis will be available soon' 
                    : 'No attempts have been made for this exam yet'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
