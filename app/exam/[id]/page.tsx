"use client"

import React, { useState, useEffect, useRef, use } from "react"
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
import { Clock, AlertCircle, CheckCircle, XCircle, HelpCircle, Loader2, AlertTriangle } from "lucide-react"
import { api } from "@/lib/api"
import { authService } from "@/lib/services/auth"
import { resultService } from "@/lib/services/result-service"
import { attemptService } from "@/lib/services/attempt"
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
  // Unwrap params using use() to handle the Promise
  const resolvedParams = use(params)
  const examId = resolvedParams.id

  const router = useRouter()
  const { toast } = useToast()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [questionTime, setQuestionTime] = useState<number>(30) // Default time in seconds
  const [timeLeft, setTimeLeft] = useState<number>(30)
  // Removed isSkipping state as it's not needed
  const [adaptiveTimeReduction, setAdaptiveTimeReduction] = useState<number>(0) // For SCQ adaptive timing
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [examStarted, setExamStarted] = useState(false)
  const [fillUpAnswer, setFillUpAnswer] = useState("")
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [questionTimings, setQuestionTimings] = useState<Array<{
    questionId: string;
    startTime: Date;
    endTime?: Date;
    timeSpent?: number;
  }>>([])
  const [currentQuestionStartTime, setCurrentQuestionStartTime] = useState<Date | null>(null)
  const [currentAttemptId, setCurrentAttemptId] = useState<string>("")

  // Use refs to track timer intervals and prevent double invocation
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null)
  // Use a ref to track if we're currently advancing to the next question
  const isAdvancingRef = useRef<boolean>(false)

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
        const examResponse = await api.get<any>(`/exams/${examId}`)
        if (!examResponse || !examResponse.data) {
          throw new Error("Exam not found")
        }

        // Cast the response data to Exam type
        const examData = (examResponse.data as any).data as Exam

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
        // We need to fetch the student's attempts for this exam
        try {
          const attemptsResponse = await api.get<any[]>(`/attempts/exam/${examId}`);
          const studentAttempts = attemptsResponse.data || [];

          if (examData.attempts && studentAttempts.length >= examData.attempts.max) {
            toast({
              title: "Maximum Attempts Reached",
              description: `You have already used all ${examData.attempts.max} attempts for this exam`,
              variant: "destructive"
            })
            router.push("/dashboard/student?tab=exams")
            return
          }
        } catch (attemptsError) {
          // Continue without checking attempts - the backend will enforce the limit
          toast({
            title: "Error",
            description: "Failed to check exam attempts. Please try again.",
            variant: "destructive"
          })
        }

        setExam(examData)
        setLoading(false)
      } catch (error) {
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
  }, [examId, router, toast])

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

  // No total exam timer - using per-question timers only

  // Timer effect for individual question timing
  useEffect(() => {
    if (!examStarted || !exam || !exam.questions || exam.questions.length === 0) return

    // Set the time for the current question
    const newTime = getQuestionTime(currentQuestion)
    setQuestionTime(newTime)
    setTimeLeft(newTime)

    // Record the start time for the current question
    const now = new Date()
    setCurrentQuestionStartTime(now)

    // Add this question to the timings array if it doesn't exist yet
    if (exam.questions[currentQuestion] && exam.questions[currentQuestion]._id) {
      const questionId = exam.questions[currentQuestion]._id
      setQuestionTimings(prev => {
        // Check if we already have a timing for this question
        const existingIndex = prev.findIndex(t => t.questionId === questionId)
        if (existingIndex === -1) {
          // Add new timing
          console.log(`Adding timing for question ${questionId} at ${now.toISOString()}`);
          // Add new timing
          return [...prev, {
            questionId,
            startTime: now
          }]
        }
        return prev
      })
    }

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

          // No total timer to update

          // Record end time for current question
          if (currentQuestionStartTime && exam?.questions && exam.questions[currentQuestion] && exam.questions[currentQuestion]._id) {
            const now = new Date();
            const questionId = exam.questions[currentQuestion]._id;
            const timeSpent = Math.floor((now.getTime() - currentQuestionStartTime.getTime()) / 1000);

            console.log(`Time over for question ${questionId}. Recording end time: ${now.toISOString()}, time spent: ${timeSpent}s`);

            setQuestionTimings(prev => {
              return prev.map(timing => {
                if (timing.questionId === questionId) {
                  return {
                    ...timing,
                    endTime: now,
                    timeSpent
                  };
                }
                return timing;
              });
            });
          }

          // Auto-skip or submit if time runs out
          // Use isAdvancingRef to prevent double advancement
          if (!isAdvancingRef.current) {
            isAdvancingRef.current = true;
            if (exam && exam.questions && currentQuestion < exam.questions.length - 1) {
              handleNext()
            } else {
              // Force submit when time expires for the last question
              handleSubmit(true)
            }
            // Reset the advancing flag after a short delay
            setTimeout(() => {
              isAdvancingRef.current = false;
            }, 500);
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
  // We're using isAdvancingRef to prevent double advancement, so we can safely include all dependencies
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, examStarted, adaptiveTimeReduction, exam])

  const handleAnswerChange = (value: string) => {
    // Prevent updating state if the value hasn't changed
    if (answers[currentQuestion] === value) {
      return;
    }

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

    // Set the advancing flag to prevent double advancement
    isAdvancingRef.current = true;

    if (currentQuestion < exam.questions.length - 1) {
      // Record end time for current question
      if (currentQuestionStartTime && exam.questions[currentQuestion]._id) {
        const now = new Date();
        const questionId = exam.questions[currentQuestion]._id;

        // Calculate time spent on this question
        const timeSpent = Math.floor((now.getTime() - currentQuestionStartTime.getTime()) / 1000);

        console.log(`Moving from question ${questionId}. Recording end time: ${now.toISOString()}, time spent: ${timeSpent}s`);

        // Check if we went over the allocated time for this question
        const allocatedTime = getQuestionTime(currentQuestion);
        const timeOverflow = Math.max(0, timeSpent - allocatedTime);

        // Log time overflow but no total timer to update
        if (timeOverflow > 0) {
          console.log(`Time overflow: ${timeOverflow}s.`);
        }

        setQuestionTimings(prev => {
          return prev.map(timing => {
            if (timing.questionId === questionId) {
              return {
                ...timing,
                endTime: now,
                timeSpent
              };
            }
            return timing;
          });
        });
      }

      // No need to track visited questions anymore

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

      // Reset the advancing flag after a short delay
      setTimeout(() => {
        isAdvancingRef.current = false;
      }, 500);
    } else {
      // Reset the advancing flag if we're not advancing
      isAdvancingRef.current = false;
    }
  }

  const handleSubmit = async (force: boolean = false) => {
    if (!exam || !exam.questions) return;

    // Check if all questions are answered, unless force=true
    if (!force && Object.keys(answers).length < exam.questions.length) {
      setShowWarning(true)
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate score for client-side tracking
      let score = 0
      let totalAnswered = 0

      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(([questionIndex, answer]) => {
        // We already checked that exam.questions exists at the beginning of the function
        const question = exam.questions![Number.parseInt(questionIndex)]
        const questionId = question._id

        // Check if the answer is correct based on question type
        let isCorrect = false
        if (question.type === "multiple-choice") {
          // For multiple choice, compare with correctAnswer which could be a string or array
          if (Array.isArray(question.correctAnswer)) {
            isCorrect = question.correctAnswer.includes(answer)
          } else {
            isCorrect = question.correctAnswer === answer
          }
        } else if (question.type === "true-false") {
          // For true/false, direct comparison works
          isCorrect = question.correctAnswer === answer
        } else if (question.type === "short-answer") {
          // For short answers, do case-insensitive comparison
          isCorrect = String(question.correctAnswer).toLowerCase() === String(answer).toLowerCase()
        } else if (question.type === "fill-in-blank") {
          // For fill-in-blank, do case-insensitive comparison
          isCorrect = String(question.correctAnswer).toLowerCase() === String(answer).toLowerCase()
        } else {
          // For descriptive questions or any other types, we'll let the backend handle scoring
          // as it might require manual grading or more complex evaluation
          isCorrect = false // Default to false, will be evaluated by teacher
        }

        // Add to score if correct - always use actual points
        if (isCorrect) {
          score += question.points
        }

        totalAnswered++

        return {
          questionId,
          answer: answer, // Changed from selectedOption to answer to match the expected type
          isCorrect
        }
      })

      // Calculate percentage - always use actual points
      let totalPoints = exam.questions.reduce((total, question) => total + question.points, 0);

      // Validate total points calculation
      if (totalPoints === 0) {
        console.warn('Warning: Total points calculated as zero. Using fallback calculation.');
        totalPoints = exam.questions.length * 10; // Fallback calculation
      }

      // Calculate percentage score
      const percentage = Math.round((score / totalPoints) * 100);
      console.log(`Score: ${score}/${totalPoints} = ${percentage}%`);

      // Record end time for the last question
      if (currentQuestionStartTime && exam.questions[currentQuestion]._id) {
        const now = new Date();
        const questionId = exam.questions[currentQuestion]._id;
        const timeSpent = Math.floor((now.getTime() - currentQuestionStartTime.getTime()) / 1000);

        setQuestionTimings(prev => {
          return prev.map(timing => {
            if (timing.questionId === questionId) {
              return {
                ...timing,
                endTime: now,
                timeSpent
              };
            }
            return timing;
          });
        });
      }

      // Finalize question timings
      const finalQuestionTimings = questionTimings.map(timing => {
        // If a question doesn't have an end time, set it to now
        if (!timing.endTime) {
          const now = new Date();
          const timeSpent = Math.floor((now.getTime() - timing.startTime.getTime()) / 1000);
          return {
            ...timing,
            endTime: now,
            timeSpent
          };
        }
        return timing;
      });

      // Prepare submission data for the backend
      const formattedAnswersForSubmission = formattedAnswers.map(answer => {
        // For descriptive questions, we need to handle them specially
        // Just check if the answer is long (more than 100 characters) to determine if it's descriptive
        const isDescriptiveQuestion = answer.answer && answer.answer.length > 100 ? true : false;

        return {
          questionId: answer.questionId,
          selectedOption: answer.answer,
          // Include a flag to indicate this is a descriptive answer
          isDescriptive: isDescriptiveQuestion
        };
      });

      // Calculate total time spent from question timings
      const timeSpentValue = finalQuestionTimings.reduce((total, timing) => {
        return total + (timing.timeSpent || 0);
      }, 0);


      // First, submit the attempt to update its status to 'completed'
      if (!currentAttemptId) {
        throw new Error("No active attempt ID found");
      }

      // Submit to the attempt endpoint to update the attempt status
      const updatedAttempt = await attemptService.submitAttempt(
        currentAttemptId,
        formattedAnswersForSubmission,
        finalQuestionTimings,
        timeSpentValue
      );


      if (updatedAttempt) {
        // Log the attempt ID for debugging
        console.log('Exam submitted successfully. Attempt ID:', updatedAttempt._id || updatedAttempt.id);

        // Check if the response includes a resultId (from our backend modification)
        if (updatedAttempt.resultId) {
          console.log('Result ID found in response:', updatedAttempt.resultId);

          // Redirect to results page with result ID
          setTimeout(() => {
            router.push(`/result/${updatedAttempt.resultId}`);
          }, 1000);
        } else {
          // Fallback to using attempt ID if no result ID is available
          console.log('No Result ID found in response, using attempt ID instead');

          // Make sure we have a valid ID before redirecting
          const attemptId = updatedAttempt._id || updatedAttempt.id;
          if (attemptId) {
            router.push(`/result/${attemptId}`);
          } else {
            // Fallback to dashboard if no ID is available
            router.push("/dashboard/student?tab=results");
          }
        }
      } else {
        throw new Error("Failed to submit exam");
      }
    } catch (error) {
      // Check if the error indicates the exam has reached maximum attempts
      if (error instanceof Error && error.message.includes("Maximum attempts reached")) {
        toast({
          title: "Maximum Attempts Reached",
          description: "You have already used all available attempts for this exam. Redirecting to your best result.",
          variant: "default"
        })

        // Check if we have a result object from the error (it might be in the error object)
        const errorObj = error as any;
        if (errorObj.existingResults && errorObj.existingResults.length > 0) {
          // Find the best result (highest score)
          const bestResult = errorObj.existingResults.reduce(
            (best: any, current: any) => current.marks > best.marks ? current : best,
            errorObj.existingResults[0]
          );

          // Redirect to the specific result page
          setTimeout(() => {
            router.push(`/result/${bestResult._id}`)
          }, 1000)
        } else {
          // Fallback to the results tab if we don't have a specific result ID
          setTimeout(() => {
            router.push("/dashboard/student?tab=results")
          }, 2000)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to submit exam. Please try again.",
          variant: "destructive"
        })
      }

      setIsSubmitting(false)
    }
  }

  const startExam = async () => {
    try {
      // Create a new attempt in the backend using the attempt service
      const attempt = await attemptService.startAttempt(examId);

      // Store the attempt ID for later use when submitting
      const attemptId = attempt._id || attempt.id;
      console.log('Started attempt with ID:', attemptId);

      // Store the attempt ID in state
      setCurrentAttemptId(attemptId);

      // Start the exam UI
      setExamStarted(true);
      setShowInstructions(false);
    } catch (error: any) {
      // Check if the error is due to maximum attempts reached
      if (error.response && error.response.data && error.response.data.message === 'Maximum attempts reached') {
        toast({
          title: "Maximum Attempts Reached",
          description: `You have already used all ${exam?.attempts?.max || 1} attempts for this exam`,
          variant: "destructive"
        });
        router.push("/dashboard/student?tab=exams");
        return;
      }

      // Handle other errors
      toast({
        title: "Error",
        description: "Failed to start exam. Please try again.",
        variant: "destructive"
      });
    }
  }

  // Get current question or use a placeholder if exam is not loaded
  const question = exam && exam.questions && exam.questions[currentQuestion]
    ? exam.questions[currentQuestion]
    : { text: "Loading question...", type: "multiple-choice", options: [], difficulty: "Medium", points: 10 }

  // Calculate progress
  const progress = exam && exam.questions
    ? ((currentQuestion + 1) / exam.questions.length) * 100
    : 0


  return (
    <div className="min-h-screen bg-gradient-page">
      <header className="header-gradient py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <span className="bg-white text-indigo-800 rounded-lg p-1 mr-2">TA</span>
            Tech Anubhavi
          </h1>
          {/* No total timer display */}
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
              <CardHeader className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-foreground">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl">{exam?.title || "Exam"}</CardTitle>
                    <CardDescription className="text-indigo-200">
                      {exam?.subject || "Subject"} | Class {typeof exam?.class === 'object' ?
                        `${exam.class.name} ${exam.class.section || ''}`.trim() :
                        exam?.class || ""}
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
                        Short Answer, Descriptive).
                      </li>
                      <li>
                        Each question has its own time limit. You must answer within the time limit for each question.
                      </li>
                      <li>
                        Each question has its own point value based on difficulty, for a total of {
                          exam?.questions?.reduce((total, q) => total + (q.points || 0), 0) || 0
                        } points.
                      </li>
                      <li>You cannot go back to previous questions once answered.</li>
                      <li>Each question will automatically advance when its time expires.</li>
                      <li>You can see your progress in the navigation bar at the bottom.</li>
                      <li>Questions will be randomized to prevent cheating.</li>
                      <li>
                        <strong>You can attempt this exam up to {exam?.attempts?.max || 1} times.</strong>
                        {/* We don't use exam.attempts.current anymore since it's a global counter */}
                        {/* Instead, we'll rely on the backend to enforce the limit */}
                      </li>
                      <li>Your highest score from all attempts will be considered for your final grade.</li>
                    </ul>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 text-indigo-800">Exam Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-indigo-600">
                      <div>
                        <p className="text-sm text-muted/80">Subject</p>
                        <p className="font-medium ">{exam?.subject || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted/80">Class</p>
                        <p className="font-medium">
                          {typeof exam?.class === 'object' ?
                            `${exam.class.name} ${exam.class.section || ''}`.trim() :
                            exam?.class || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted/80">Question Time</p>
                        <p className="font-medium">Varies by question type</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted/80">Total Questions</p>
                        <p className="font-medium">{exam?.questions?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted/80">Maximum Score</p>
                        <p className="font-medium">{exam?.questions?.reduce((total, q) => total + (q.points || 0), 0) || 0} points</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted/80">Passing Score</p>
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
                          Once you start the exam, each question's timer will begin and cannot be paused. Make sure you have a
                          stable internet connection and enough time to complete all questions.
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
                  className="btn-gradient"
                >
                  Start Exam
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card className="mb-4 border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-foreground">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{exam?.title || "Exam"}</CardTitle>
                    <CardDescription className="text-indigo-200">
                      {exam?.subject || "Subject"} | Class {typeof exam?.class === 'object' ?
                        `${exam.class.name} ${exam.class.section || ''}`.trim() :
                        exam?.class || ""} | Question {currentQuestion + 1} of{" "}
                      {exam?.questions?.length || 0}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-white text-indigo-800 px-3 py-1">{question.points || 0} points</Badge>
                    <div
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        timeLeft < 5 ? "bg-red-500" : timeLeft < 10 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                    >
                      Question Time: {formatTimeLeft(timeLeft)}
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
                        question.type === "multiple-choice"
                          ? "border-blue-500 text-blue-700 bg-blue-50"
                          : question.type === "short-answer"
                            ? "border-purple-500 text-purple-700 bg-purple-50"
                            : question.type === "descriptive"
                              ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                              : question.type === "fill-in-blank"
                                ? "border-amber-500 text-amber-700 bg-amber-50"
                                : "border-green-500 text-green-700 bg-green-50"
                      }
                    >
                      {question.type === "multiple-choice" ? "Multiple Choice" :
                       question.type === "short-answer" ? "Short Answer" :
                       question.type === "descriptive" ? "Descriptive" :
                       question.type === "fill-in-blank" ? "Fill in the Blank" :
                       question.type === "true-false" ? "True/False" : question.type}
                    </Badge>
                    <div className="text-lg font-medium">{question.text}</div>
                  </div>

                  {question.type === "multiple-choice" && (
                    <RadioGroup
                      value={answers[currentQuestion] || ""}
                      onValueChange={handleAnswerChange}
                      className="space-y-3"
                    >
                      {question.options && Array.isArray(question.options) && question.options.map((option, index) => {
                        // Handle both string options and object options with id/text properties
                        const optionId = typeof option === 'string' ? option : option.id;
                        const optionText = typeof option === 'string' ? option : option.text;
                        const optionKey = typeof option === 'string' ? `option-${index}` : option.id;

                        return (
                          <div
                            key={optionKey}
                            className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <RadioGroupItem value={optionId} id={`option-${optionKey}`} />
                            <Label htmlFor={`option-${optionKey}`} className="flex-1 cursor-pointer">
                              {optionText}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  )}

                  {question.type === "short-answer" && (
                    <div className="space-y-2">
                      <Label htmlFor="short-answer">Your Answer</Label>
                      <input
                        id="short-answer"
                        type="text"
                        value={answers[currentQuestion] || ""}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        placeholder="Type your answer here"
                        className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  )}

                  {question.type === "descriptive" && (
                    <div className="space-y-2">
                      <Label htmlFor="descriptive-answer">Your Answer</Label>
                      <textarea
                        id="descriptive-answer"
                        value={answers[currentQuestion] || ""}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        placeholder="Type your detailed answer here"
                        rows={6}
                        className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-vertical"
                      />
                    </div>
                  )}

                  {question.type === "fill-in-blank" && (
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

                  {question.type === "true-false" && (
                    <RadioGroup
                      value={answers[currentQuestion] || ""}
                      onValueChange={handleAnswerChange}
                      className="space-y-3"
                    >
                      <div
                        className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <RadioGroupItem value="True" id="true" />
                        <Label htmlFor="true" className="flex-1 cursor-pointer">
                          True
                        </Label>
                      </div>
                      <div
                        className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
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
                      onClick={handleNext}
                    >
                      Skip
                    </Button>
                  )}
                  {exam && exam.questions && currentQuestion === exam.questions.length - 1 ? (
                    <Button
                      onClick={() => handleSubmit()}
                      disabled={isSubmitting}
                      className="status-success"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Exam"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="btn-gradient"
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
                        ? "btn-gradient"
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
                        // Force submission even with unanswered questions
                        handleSubmit(true)
                      }}
                      className="status-warning"
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
          <div className="absolute bottom-4 right-4 status-error px-4 py-2 rounded-md animate-pulse shadow-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Question time running out! {formatTimeLeft(timeLeft)} left</span>
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


