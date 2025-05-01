"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Clock, AlertCircle, CheckCircle, XCircle, HelpCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { authService } from "@/lib/services/auth"
import { useToast } from "@/hooks/use-toast"
import { Exam, Question } from "@/lib/types"

// Default exam structure to use while loading
const defaultExam = {
  _id: "",
  title: "Loading Exam...",
  subject: "",
  class: "",
  duration: 60,
  totalQuestions: 0,
  questions: [],
  status: "active",
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  attempts: {
    current: 0,
    max: 1
  },
  createdBy: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export default function ExamPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [questionTime, setQuestionTime] = useState<number>(30) // Default time in seconds
  const [timeLeft, setTimeLeft] = useState<number>(30)
  const [totalTimeLeft, setTotalTimeLeft] = useState<number>(0) // Total exam time left
  const [isSkipping, setIsSkipping] = useState<boolean>(false)
  const [adaptiveTimeReduction, setAdaptiveTimeReduction] = useState<number>(0) // For SCQ adaptive timing
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [examStarted, setExamStarted] = useState(false)
  const [fillUpAnswer, setFillUpAnswer] = useState("")
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0])) // Start with first question as visited
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use refs to track timer intervals to prevent double invocation
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch exam data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true)
        const user = authService.getCurrentUser()

        if (!user || user.role !== "student") {
          toast({
            title: "Error",
            description: "You must be logged in as a student to take an exam",
            variant: "destructive"
          })
          router.push("/login?role=student")
          return
        }

        // Fetch exam details
        const examResponse = await api.get<Exam>(`/exams/${params.id}`)
        if (!examResponse.data) {
          throw new Error("Exam not found")
        }

        const examData = examResponse.data

        // Check if exam is available
        const now = new Date()
        const startDate = new Date(examData.startDate)
        const endDate = new Date(examData.endDate)

        if (examData.status !== "active" || now < startDate || now > endDate) {
          toast({
            title: "Exam Unavailable",
            description: "This exam is not currently available for taking",
            variant: "destructive"
          })
          router.push("/dashboard/student?tab=exams")
          return
        }

        // Check if student has reached maximum attempts
        if (examData.attempts && examData.attempts.current >= examData.attempts.max) {
          toast({
            title: "Maximum Attempts Reached",
            description: `You have already used all ${examData.attempts.max} attempts for this exam`,
            variant: "destructive"
          })
          router.push("/dashboard/student?tab=exams")
          return
        }

        setExam(examData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching exam:", error)
        setError("Failed to load exam data. Please try again later.")
        setLoading(false)
        toast({
          title: "Error",
          description: "Failed to load exam data. Please try again later.",
          variant: "destructive"
        })
      }
    }

    fetchExam()
  }, [params.id, router, toast])

  // Calculate total exam time based on per-question timers or use the exam duration
  const calculateTotalExamTime = () => {
    if (!exam || !exam.questions || exam.questions.length === 0) {
      return exam?.duration ? exam.duration * 60 : 60 * 60; // Default to exam duration or 60 minutes
    }

    return exam.questions.reduce((total: number, question: any) => {
      return total + (question.time || (question.type === "multiple-choice" ? 30 : 10))
    }, 0)
  }

  // Format time left as MM:SS
  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getQuestionTime = (questionIndex: number) => {
    if (!exam || !exam.questions || !exam.questions[questionIndex]) {
      return 30; // Default time
    }

    const question = exam.questions[questionIndex];
    // Determine base time based on question type
    let baseTime = question.type === "multiple-choice" ? 30 : 10

    // For non-MCQ, apply adaptive timing reduction
    if (question.type !== "multiple-choice" && adaptiveTimeReduction > 0) {
      baseTime = Math.max(5, baseTime - adaptiveTimeReduction)
    }

    // Check if the question has a custom time setting
    return question.time || baseTime
  }

  // Get time color based on remaining time percentage
  const getTimeColor = (current: number, total: number) => {
    const percentLeft = (current / total) * 100

    if (percentLeft > 50) return "bg-green-600"
    if (percentLeft > 25) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Start the total exam timer
  useEffect(() => {
    if (!examStarted) return

    // Calculate total exam time
    const totalTime = calculateTotalExamTime()
    setTotalTimeLeft(totalTime)

    // Clear any existing timer
    if (totalTimerRef.current) {
      clearInterval(totalTimerRef.current)
    }

    // Start the total timer
    totalTimerRef.current = setInterval(() => {
      setTotalTimeLeft((prev) => {
        if (prev <= 1) {
          if (totalTimerRef.current) {
            clearInterval(totalTimerRef.current)
          }
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (totalTimerRef.current) {
        clearInterval(totalTimerRef.current)
      }
    }
  }, [examStarted])

  // Timer effect for individual question timing
  useEffect(() => {
    if (!examStarted || !exam || !exam.questions || exam.questions.length === 0) return

    // Set the time for the current question
    const newTime = getQuestionTime(currentQuestion)
    setQuestionTime(newTime)
    setTimeLeft(newTime)

    // Clear any existing timer
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current)
    }

    // Start the question timer
    questionTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (questionTimerRef.current) {
            clearInterval(questionTimerRef.current)
          }
          // Auto-skip or submit if time runs out
          if (exam && exam.questions && currentQuestion < exam.questions.length - 1) {
            handleNext()
          } else {
            handleSubmit()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current)
      }
    }
  }, [currentQuestion, examStarted, adaptiveTimeReduction, exam])

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: value,
    }))
  }

  const handleFillUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFillUpAnswer(e.target.value)
  }

  const handleFillUpBlur = () => {
    if (fillUpAnswer.trim()) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion]: fillUpAnswer,
      }))
    }
  }

  const handleNext = () => {
    if (!exam || !exam.questions) return;

    if (currentQuestion < exam.questions.length - 1) {
      // Mark current question as visited/locked
      setVisitedQuestions((prev) => {
        const updated = new Set(prev)
        updated.add(currentQuestion)
        updated.add(currentQuestion + 1) // Also mark the next question as visited
        return updated
      })

      // If current question is not multiple-choice and was skipped, increase adaptive time reduction
      const currentQuestionType = exam.questions[currentQuestion].type
      if (currentQuestionType !== "multiple-choice" && !answers[currentQuestion]) {
        setAdaptiveTimeReduction((prev) => Math.min(5, prev + 1))
      }

      setCurrentQuestion((prev) => prev + 1)

      // Reset fill-up answer when moving to next question
      if (exam.questions[currentQuestion + 1].type === "fill-in-blank") {
        setFillUpAnswer(answers[currentQuestion + 1] || "")
      }
    }
  }

  const handleSubmit = async () => {
    if (!exam || !exam.questions) return;

    // Check if all questions are answered
    if (Object.keys(answers).length < exam.questions.length) {
      setShowWarning(true)
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate score (for client-side display only)
      let score = 0
      let totalAnswered = 0
      const totalPoints = exam.questions.length * 10;

      Object.entries(answers).forEach(([questionIndex, answer]) => {
        totalAnswered++
        const question = exam.questions[Number.parseInt(questionIndex)]
        if (question.correctAnswer === answer) {
          score += question.points || 10
        }
      })

      const percentage = Math.round((score / totalPoints) * 100)

      // Determine rating based on percentage
      let rating = "Needs Improvement"
      if (percentage >= 90) rating = "Excellent"
      else if (percentage >= 75) rating = "Good"
      else if (percentage >= 60) rating = "Satisfactory"

      // Send the exam submission to the backend
      const submissionData = {
        examId: params.id,
        answers,
        timeSpent: calculateTotalExamTime() - totalTimeLeft,
      }

      const response = await api.post('/results', submissionData)

      if (response.data) {
        // Update exam attempts count
        if (exam.attempts) {
          await api.put(`/exams/${params.id}/attempts`, {
            attempts: {
              current: (exam.attempts.current || 0) + 1,
              max: exam.attempts.max
            }
          })
        }

        // Redirect to results page
        setTimeout(() => {
          router.push(`/result/${response.data._id}`)
        }, 1000)
      } else {
        throw new Error("Failed to submit exam")
      }
    } catch (error) {
      console.error("Error submitting exam:", error)
      toast({
        title: "Error",
        description: "Failed to submit exam. Please try again.",
        variant: "destructive"
      })
      setIsSubmitting(false)
    }
  }

  const startExam = () => {
    setExamStarted(true)
    setShowInstructions(false)

    // Start the total exam timer
    setTotalTimeLeft(calculateTotalExamTime())
  }

  // Get current question or use a placeholder if exam is not loaded
  const question = exam && exam.questions && exam.questions[currentQuestion]
    ? exam.questions[currentQuestion]
    : { text: "Loading question...", type: "multiple-choice", options: [], difficulty: "Medium" }

  // Calculate progress
  const progress = exam && exam.questions
    ? ((currentQuestion + 1) / exam.questions.length) * 100
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-gradient-to-r from-indigo-800 to-indigo-700 text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <span className="bg-white text-indigo-800 rounded-lg p-1 mr-2">TA</span>
            Tech Anubhavi
          </h1>
          {examStarted && (
            <div className="flex items-center gap-4">
              <div
                className={`${getTimeColor(totalTimeLeft, calculateTotalExamTime())} px-4 py-2 rounded-md flex items-center shadow-md`}
              >
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-mono font-bold">Total Time Left: {formatTimeLeft(totalTimeLeft)}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading exam data...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <p className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {error}
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : showInstructions ? (
          <div className="max-w-4xl mx-auto">
            <Card className="mb-4 border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl">{exam?.title || "Exam"}</CardTitle>
                    <CardDescription className="text-indigo-200">
                      {exam?.subject || "Subject"} | Class {exam?.class || ""}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Exam Instructions</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        This exam contains <strong>{exam?.questions?.length || 0} questions</strong> of various types (Multiple Choice,
                        Fill-in-the-blanks, True/False).
                      </li>
                      <li>
                        Total time allowed is <strong>{formatTimeLeft(calculateTotalExamTime())}</strong> based on the
                        sum of all question timers.
                      </li>
                      <li>
                        Each question is worth <strong>10 points</strong>, for a total of {(exam?.questions?.length || 0) * 10}{" "}
                        points.
                      </li>
                      <li>You cannot go back to previous questions once answered.</li>
                      <li>The exam will automatically submit when the time expires.</li>
                      <li>You can see your progress in the navigation bar at the bottom.</li>
                      <li>Questions will be randomized to prevent cheating.</li>
                      <li>
                        <strong>You can attempt this exam up to {exam?.attempts?.max || 1} times.</strong>
                        This is attempt {(exam?.attempts?.current || 0) + 1} of {exam?.attempts?.max || 1}.
                      </li>
                      <li>Your highest score from all attempts will be considered for your final grade.</li>
                    </ul>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 text-indigo-800">Exam Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-indigo-600">Subject</p>
                        <p className="font-medium">{exam?.subject || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-indigo-600">Class</p>
                        <p className="font-medium">{exam?.class || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-indigo-600">Total Time</p>
                        <p className="font-medium">{formatTimeLeft(calculateTotalExamTime())}</p>
                      </div>
                      <div>
                        <p className="text-sm text-indigo-600">Total Questions</p>
                        <p className="font-medium">{exam?.questions?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-indigo-600">Maximum Score</p>
                        <p className="font-medium">{(exam?.questions?.length || 0) * 10} points</p>
                      </div>
                      <div>
                        <p className="text-sm text-indigo-600">Passing Score</p>
                        <p className="font-medium">60%</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Important Note</h4>
                        <p className="text-yellow-700 text-sm">
                          Once you start the exam, the timer will begin and cannot be paused. Make sure you have a
                          stable internet connection and enough time to complete the exam.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-4 bg-slate-50 border-t">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  onClick={startExam}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                >
                  Start Exam
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card className="mb-4 border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{exam?.title || "Exam"}</CardTitle>
                    <CardDescription className="text-indigo-200">
                      {exam?.subject || "Subject"} | Class {exam?.class || ""} | Question {currentQuestion + 1} of{" "}
                      {exam?.questions?.length || 0}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-white text-indigo-800 px-3 py-1">10 points</Badge>
                    <div
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        timeLeft < 5 ? "bg-red-500" : timeLeft < 10 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                    >
                      Question Time: {timeLeft}s
                    </div>
                  </div>
                </div>
                <Progress value={progress} className="h-2 mt-4" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        question.difficulty === "Easy"
                          ? "border-green-500 text-green-700 bg-green-50"
                          : question.difficulty === "Medium"
                            ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                            : "border-red-500 text-red-700 bg-red-50"
                      }
                    >
                      {question.difficulty}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        question.type === "MCQ"
                          ? "border-blue-500 text-blue-700 bg-blue-50"
                          : question.type === "Fill-up"
                            ? "border-purple-500 text-purple-700 bg-purple-50"
                            : "border-green-500 text-green-700 bg-green-50"
                      }
                    >
                      {question.type}
                    </Badge>
                    <div className="text-lg font-medium">{question.text}</div>
                  </div>

                  {question.type === "MCQ" && (
                    <RadioGroup
                      value={answers[currentQuestion] || ""}
                      onValueChange={handleAnswerChange}
                      className="space-y-3"
                    >
                      {question.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => handleAnswerChange(option.id)}
                        >
                          <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                          <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === "Fill-up" && (
                    <div className="space-y-2">
                      <Label htmlFor="fill-answer">Your Answer</Label>
                      <input
                        id="fill-answer"
                        type="text"
                        value={fillUpAnswer}
                        onChange={handleFillUpChange}
                        onBlur={handleFillUpBlur}
                        placeholder="Type your answer here"
                        className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  )}

                  {question.type === "True/False" && (
                    <RadioGroup
                      value={answers[currentQuestion] || ""}
                      onValueChange={handleAnswerChange}
                      className="space-y-3"
                    >
                      <div
                        className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => handleAnswerChange("True")}
                      >
                        <RadioGroupItem value="True" id="true" />
                        <Label htmlFor="true" className="flex-1 cursor-pointer">
                          True
                        </Label>
                      </div>
                      <div
                        className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => handleAnswerChange("False")}
                      >
                        <RadioGroupItem value="False" id="false" />
                        <Label htmlFor="false" className="flex-1 cursor-pointer">
                          False
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-4 bg-slate-50 border-t">
                <Button variant="outline" className="flex items-center gap-1" onClick={() => setShowInstructions(true)}>
                  <HelpCircle className="h-4 w-4" />
                  Instructions
                </Button>

                <div className="flex gap-2 ml-auto">
                  {exam && exam.questions && currentQuestion < exam.questions.length - 1 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsSkipping(true)
                        handleNext()
                      }}
                    >
                      Skip
                    </Button>
                  )}
                  {exam && exam.questions && currentQuestion === exam.questions.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Exam"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                    >
                      Next
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-sm font-medium mb-3 text-slate-600">Question Navigator</h3>
              <div className="flex items-center mb-2">
                <div className="flex items-center mr-4">
                  <div className="w-4 h-4 bg-slate-100 border border-slate-300 mr-1"></div>
                  <span className="text-xs text-slate-600">Locked</span>
                </div>
                <div className="flex items-center mr-4">
                  <div className="w-4 h-4 bg-gradient-to-r from-indigo-500 to-indigo-600 mr-1"></div>
                  <span className="text-xs text-slate-600">Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 border border-slate-300 mr-1"></div>
                  <span className="text-xs text-slate-600">Current/Available</span>
                </div>
              </div>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {exam && exam.questions ? exam.questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={answers[index] ? "default" : "outline"}
                    className={`h-10 w-10 ${
                      answers[index]
                        ? "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
                        : index < currentQuestion
                          ? "border-slate-300 bg-slate-100 text-slate-400" // Styling for locked questions
                          : "border-slate-300"
                    } ${currentQuestion === index ? "ring-2 ring-offset-2 ring-indigo-500" : ""}`}
                    onClick={() => {
                      // Only allow navigation to current question
                      if (index === currentQuestion) {
                        setCurrentQuestion(index)
                      }
                    }}
                    disabled={index !== currentQuestion} // Disable all except current question
                  >
                    {index < currentQuestion ? (
                      <span className="relative">
                        {index + 1}
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="sr-only">Locked</span>
                          <span className="h-4 w-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50">
                            🔒
                          </span>
                        </span>
                      </span>
                    ) : (
                      index + 1
                    )}
                  </Button>
                )) : null}
              </div>
            </div>

            {showWarning && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Unanswered Questions</h4>
                  <p className="text-amber-700 text-sm">
                    You have {exam && exam.questions ? exam.questions.length - Object.keys(answers).length : 0} unanswered questions. Are you
                    sure you want to submit?
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowWarning(false)}
                      className="border-amber-300 text-amber-800 hover:bg-amber-100"
                    >
                      Continue Exam
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowWarning(false)
                        setIsSubmitting(true)
                        handleSubmit()
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      Submit Anyway
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {timeLeft <= 5 && (
          <div className="absolute bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md animate-pulse shadow-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Time running out!</span>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Dialog for Leaving Exam */}
      <Dialog open={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Exam?</DialogTitle>
            <DialogDescription>Are you sure you want to leave the exam? Your progress will be lost.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline">
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button variant="destructive">
              <CheckCircle className="h-4 w-4 mr-2" />
              Leave Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
