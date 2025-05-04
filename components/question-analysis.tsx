"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Clock, CheckCircle, XCircle, AlertTriangle, BarChart2, BookOpen } from "lucide-react"
import { api } from "@/lib/api"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface QuestionAnalysisProps {
  examId?: string
  attemptId?: string
  initialData?: QuestionData[]
}

interface QuestionData {
  id: string
  text: string
  type: string
  difficulty: string
  points: number
  correctAnswer: string | string[]
  options?: string[]
  isCorrect?: boolean
  userAnswer?: string | string[]
  timeSpent?: number
  totalAttempts?: number
  correctAttempts?: number
  averageTimeSpent?: number
  successRate?: number
  difficultyRating?: number
  answerDistribution?: Record<string, number>
}

interface AnalyticsData {
  examId: string
  examTitle: string
  subject?: string
  totalAttempts?: number
  attemptId?: string
  studentId?: string
  score?: number
  percentage?: number
  startTime?: string
  endTime?: string
  timeSpent?: number
  questions: QuestionData[]
}

export default function QuestionAnalysis({ examId, attemptId, initialData }: QuestionAnalysisProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(!initialData)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    initialData ? {
      examId: examId || attemptId || '',
      examTitle: 'Exam Results',
      questions: initialData
    } : null
  )
  const [activeTab, setActiveTab] = useState("questions")

  useEffect(() => {
    if (initialData) {
      console.log('QuestionAnalysis component - Using provided initial data');
      return;
    }

    if (examId || attemptId) {
      console.log('QuestionAnalysis component - Fetching data with:', { examId, attemptId });
      fetchAnalyticsData();
    } else {
      console.log('QuestionAnalysis component - No examId or attemptId provided');
    }
  }, [examId, attemptId, initialData])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      let endpoint = '';

      if (examId) {
        endpoint = `/question-analytics/exam/${examId}`;
        console.log('Fetching exam analytics from:', endpoint);
      } else if (attemptId) {
        endpoint = `/question-analytics/attempt/${attemptId}`;
        console.log('Fetching attempt analytics from:', endpoint);
      } else {
        throw new Error('Either examId or attemptId must be provided');
      }

      // First try using the API client
      try {
        console.log('Attempting to fetch analytics using API client');
        const response = await api.get<any>(endpoint);
        console.log('Analytics data received from API client:', response.data);
        setAnalyticsData(response.data.data);
      } catch (apiError) {
        console.error('Error using API client, falling back to fetch:', apiError);

        // Fallback to fetch if API client fails
        const token = localStorage.getItem('token');
        console.log('Using token:', token ? 'Token exists' : 'No token found');

        const url = `${API_URL}${endpoint}`;
        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch question analytics: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('Analytics data received from fetch:', data);
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error('Error fetching question analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch question analytics data. See console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple-choice': return 'MCQ'
      case 'short-answer': return 'Short Answer'
      case 'descriptive': return 'Descriptive'
      case 'fill-in-blank': return 'Fill in Blank'
      case 'true-false': return 'True/False'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Question Analysis</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p>No question analysis data is available for this exam or attempt.</p>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for charts
  const successRateData = analyticsData.questions.map((q, index) => ({
    name: `Q${index + 1}`,
    successRate: q.successRate || 0,
    difficulty: q.difficulty
  }))

  const timeSpentData = analyticsData.questions.map((q, index) => ({
    name: `Q${index + 1}`,
    averageTime: q.averageTimeSpent || q.timeSpent || 0,
    difficulty: q.difficulty
  }))

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>{analyticsData.examTitle} - Question Analysis</CardTitle>
        <CardDescription>
          {attemptId
            ? 'Detailed breakdown of your performance on each question'
            : `Analysis of ${analyticsData.totalAttempts} student attempts`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="questions" className="text-sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="success" className="text-sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Success Rate
            </TabsTrigger>
            <TabsTrigger value="time" className="text-sm">
              <Clock className="h-4 w-4 mr-2" />
              Time Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <div className="grid grid-cols-1 gap-6">
              {analyticsData.questions.map((question, i) => (
                <div
                  key={i}
                  className={`border rounded-xl p-5 ${
                    attemptId && question.isCorrect !== undefined
                      ? question.isCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex items-start">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${
                          attemptId && question.isCorrect !== undefined
                            ? question.isCorrect
                              ? "bg-green-500"
                              : "bg-red-500"
                            : "bg-blue-500"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="ml-4">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                          <Badge variant="outline">{getTypeLabel(question.type)}</Badge>
                          {question.points && (
                            <Badge variant="outline">{question.points} pts</Badge>
                          )}
                          {question.successRate !== undefined && (
                            <Badge
                              className={
                                question.successRate > 70
                                  ? "bg-green-100 text-green-800"
                                  : question.successRate > 40
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {question.successRate}% Success
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-lg mb-2">{question.text}</h3>

                        {/* Show user answer for attempt view */}
                        {attemptId && question.userAnswer && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-500">Your Answer:</p>
                            <p className="font-medium">
                              {Array.isArray(question.userAnswer)
                                ? question.userAnswer.join(', ')
                                : question.userAnswer}
                            </p>
                          </div>
                        )}

                        {/* Show correct answer */}
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-500">Correct Answer:</p>
                          <p className="font-medium">
                            {Array.isArray(question.correctAnswer)
                              ? question.correctAnswer.join(', ')
                              : question.correctAnswer}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end">
                      {/* Time spent */}
                      <div className="flex items-center mb-2">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span>
                          {attemptId
                            ? `Time: ${formatTime(question.timeSpent || 0)}`
                            : `Avg Time: ${formatTime(question.averageTimeSpent || 0)}`}
                        </span>
                      </div>

                      {/* Success rate for exam view */}
                      {!attemptId && question.totalAttempts !== undefined && (
                        <div className="text-sm text-gray-500">
                          {question.correctAttempts} / {question.totalAttempts} correct
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="success">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={successRateData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="successRate" name="Success Rate (%)" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="time">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeSpentData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="averageTime" name="Time Spent (seconds)" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
