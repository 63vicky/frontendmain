"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Award, Star, Clock, BarChart2, BookOpen, Download, Printer, Share2, Loader2, Info, AlertTriangle } from "lucide-react"
import { Suspense, useState, useEffect } from "react"
import * as React from "react"
import { resultService } from "@/lib/services/result-service"
import { Result, Exam, Question } from "@/lib/types"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import QuestionAnalysis from "@/components/question-analysis"

export default function ResultPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Suspense fallback={<div>Loading...</div>}>
        <ResultContent params={params} />
      </Suspense>
    </div>
  )
}

function ResultContent({ params }: { params: { id: string } }) {
  // Unwrap params using React.use()
  const resolvedParams = React.use(params)
  const resultId = resolvedParams.id
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [exam, setExam] = useState<Exam | null>(null)
  const { toast } = useToast()

  // Fallback values from URL parameters (for backward compatibility)
  const scoreFallback = Number.parseInt(searchParams.get("score") || "0")
  const correctFallback = Number.parseInt(searchParams.get("correct") || "0")
  const totalFallback = Number.parseInt(searchParams.get("total") || "10")
  const ratingParamFallback = searchParams.get("rating") || ""

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  // Fetch result data
  useEffect(() => {
    const fetchResultData = async () => {
      try {
        setLoading(true)

        // First try to get the result by ID (this might be a Result or an ExamAttempt ID)
        try {
          // Try to fetch as a Result first
          const resultData = await resultService.getResultById(resultId)
console.log(resultData);

          // Process the result data to ensure it has all required fields
          const processedResult: Result = {
            ...resultData,
            // Ensure score is available (fallback to marks if score is not present)
            score: resultData.score || resultData.marks || 0,
            // Ensure answers array exists
            answers: resultData.answers || [],
            // Ensure dates are present
            startedAt: resultData.startedAt || resultData.createdAt,
            submittedAt: resultData.submittedAt || resultData.updatedAt,
            // Add rating if not present
            rating: resultData.rating || calculateRating(resultData.score || resultData.marks || 0),
            // Ensure questionTimings array exists
            questionTimings: resultData.questionTimings || [],
            // Ensure categoryBreakdown array exists
            categoryBreakdown: resultData.categoryBreakdown || [],
            // Ensure classStats array exists
            classStats: resultData.classStats || []
          }

          setResult(processedResult)

          // If we have an examId in the result, fetch the exam details
          if (resultData.examId) {
            try {
              // Handle both string ID and object with _id
              const examIdValue = typeof resultData.examId === 'string'
                ? resultData.examId
                : (resultData.examId as any)._id || resultData.examId

              const examResponse = await fetch(`${API_URL}/exams/${examIdValue}`, {
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              })

              if (!examResponse.ok) {
                throw new Error(`Failed to fetch exam: ${examResponse.status}`)
              }

              const examData = await examResponse.json()
              setExam(examData)
            } catch (examError) {
              console.error("Error fetching exam details:", examError)
              // Don't throw here, we can still show the result without exam details
            }
          }
        } catch (resultError) {
          // If that fails, try to fetch as an ExamAttempt
          try {
            const attemptData = await resultService.getAttemptById(resultId)

            // Calculate score percentage if not available
            const scorePercentage = attemptData.percentage ||
              (attemptData.score && attemptData.maxScore ?
                Math.round((attemptData.score / attemptData.maxScore) * 100) : 0)

            // Calculate rating based on score
            const rating = calculateRating(scorePercentage)

            // Convert ExamAttempt to Result format for compatibility
            const convertedResult: Result = {
              _id: attemptData.id || attemptData._id || resultId, // Fallback to resultId if both are undefined
              examId: attemptData.examId,
              studentId: attemptData.studentId,
              score: scorePercentage,
              marks: attemptData.score,
              rating: attemptData.rating || rating,
              answers: (attemptData.answers || []).map(a => ({
                questionId: a.questionId,
                answer: a.selectedOption,
                isCorrect: a.isCorrect,
                points: a.points || 10 // Default points
              })),
              startedAt: attemptData.startTime || new Date().toISOString(), // Fallback to current date
              submittedAt: attemptData.endTime || new Date().toISOString(), // Fallback to current date
              startTime: attemptData.startTime,
              endTime: attemptData.endTime,
              timeSpent: attemptData.timeSpent,
              status: 'completed',
              feedback: attemptData.feedback?.text || '',
              createdBy: attemptData.studentId,
              createdAt: attemptData.startTime || attemptData.createdAt || new Date().toISOString(), // Fallback to current date
              updatedAt: attemptData.endTime || attemptData.updatedAt || new Date().toISOString(), // Fallback to current date
              questionTimings: attemptData.questionTimings || [],
              categoryBreakdown: attemptData.categoryBreakdown || [],
              classStats: [] // Add empty classStats array
            }

            setResult(convertedResult)

            // Fetch exam details
            try {
              const examResponse = await fetch(`${API_URL}/exams/${attemptData.examId}`, {
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              })

              if (!examResponse.ok) {
                throw new Error(`Failed to fetch exam: ${examResponse.status}`)
              }

              const examData = await examResponse.json()
              setExam(examData)
            } catch (examError) {
              console.error("Error fetching exam details:", examError)
              // Don't throw here, we can still show the result without exam details
            }
          } catch (attemptError) {
            console.error("Error fetching attempt:", attemptError)
            throw new Error("Could not fetch result or attempt data")
          }
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching result:", error)
        setError("Failed to load result data. Please try again later.")
        setLoading(false)
        toast({
          title: "Error",
          description: "Failed to load result data. Using fallback values.",
          variant: "destructive"
        })
      }
    }

    // Helper function to calculate rating based on score
    const calculateRating = (score: number): string => {
      if (score >= 90) return "Excellent"
      if (score >= 75) return "Good"
      if (score >= 60) return "Satisfactory"
      return "Needs Improvement"
    }

    fetchResultData()
  }, [resultId, toast])

  // Use actual data or fallback to URL parameters
  const score = result?.score || scoreFallback
  const correct = result?.answers?.filter(a => a.isCorrect).length || correctFallback
  const total = result?.answers?.length || totalFallback
  // Since rating is not in the Result type, we'll calculate it based on score
  const ratingParam = ratingParamFallback

  // Determine rating based on score
  const getRating = (score: number) => {
    if (ratingParam) {
      return {
        label: ratingParam,
        color:
          ratingParam === "Excellent"
            ? "bg-green-500"
            : ratingParam === "Good"
              ? "bg-blue-500"
              : ratingParam === "Satisfactory"
                ? "bg-yellow-500"
                : "bg-red-500",
        textColor:
          ratingParam === "Excellent"
            ? "text-green-500"
            : ratingParam === "Good"
              ? "text-blue-500"
              : ratingParam === "Satisfactory"
                ? "text-yellow-500"
                : "text-red-500",
        variant:
          ratingParam === "Excellent" || ratingParam === "Good"
            ? "default"
            : ratingParam === "Satisfactory"
              ? "secondary"
              : "destructive",
      }
    }

    if (score >= 90)
      return { label: "Excellent", color: "bg-green-500", textColor: "text-green-500", variant: "default" }
    if (score >= 75) return { label: "Good", color: "bg-blue-500", textColor: "text-blue-500", variant: "default" }
    if (score >= 60)
      return { label: "Satisfactory", color: "bg-yellow-500", textColor: "text-yellow-500", variant: "secondary" }
    return { label: "Needs Improvement", color: "bg-red-500", textColor: "text-red-500", variant: "destructive" }
  }

  const rating = getRating(score)

  // If loading, show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-lg font-medium">Loading result data...</p>
        </div>
      </div>
    )
  }

  // If error and no fallback data, show error
  if (error && !score) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <header className="bg-gradient-to-r from-indigo-800 to-indigo-700 text-white py-4 shadow-md">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold flex items-center">
              <span className="bg-white text-indigo-800 rounded-lg p-1 mr-2">TA</span>
              Tech Anubhavi
            </Link>
            <nav className="space-x-4">
              <Link href="/dashboard/student" className="hover:underline">
                Dashboard
              </Link>
            </nav>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Result</h2>
            <p className="text-gray-600 mb-6">
              We couldn't load the result data you requested. This might be because the result doesn't exist or you don't have permission to view it.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Link href="/dashboard/student">Back to Dashboard</Link>
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }


  // Get exam details from the result or fallback to defaults
  // Handle both direct exam object and API response with data property
  const examData = (exam as any)?.data || exam;
  const examTitle = examData?.title || "Exam"
  const examSubject = examData?.subject || ""
  const maxAttempts = examData?.attempts?.max || 5

  // Get current attempt number from result
  const currentAttempt = result?.attemptNumber ||
                         (typeof result?.examId === 'object' &&
                          (result?.examId as any)?.attempts?.current) || 1

  const completedDate = result?.submittedAt || result?.endTime ?
    format(new Date(result?.submittedAt || result?.endTime || new Date()), "MMMM d, yyyy") :
    "Recent"

  // Handle both string ID and object with _id
  const examId = typeof result?.examId === 'string'
    ? result?.examId
    : (result?.examId as any)?._id || ""

  // Calculate time spent in minutes and seconds
  const calculateTimeSpent = () => {
    try {
      // First try to use the timeSpent field directly
      if (result?.timeSpent && typeof result.timeSpent === 'number' && result.timeSpent > 0) {
        const minutes = Math.floor(result.timeSpent / 60);
        const seconds = result.timeSpent % 60;
        return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
      }

      // Fall back to calculating from timestamps
      if (result?.startTime && result?.endTime) {
        try {
          const start = new Date(result.startTime).getTime();
          const end = new Date(result.endTime).getTime();
          if (!isNaN(start) && !isNaN(end) && end > start) {
            const diffMs = end - start;
            const diffMinutes = Math.floor(diffMs / 60000);
            const diffSeconds = Math.floor((diffMs % 60000) / 1000);
            return `${diffMinutes}:${diffSeconds < 10 ? '0' + diffSeconds : diffSeconds}`;
          }
        } catch (e) {
          console.error("Error calculating time from timestamps:", e);
        }
      }

      // Use legacy fields if available
      if (result?.startedAt && result?.submittedAt) {
        try {
          const start = new Date(result.startedAt).getTime();
          const end = new Date(result.submittedAt).getTime();
          if (!isNaN(start) && !isNaN(end) && end > start) {
            const diffMs = end - start;
            const diffMinutes = Math.floor(diffMs / 60000);
            const diffSeconds = Math.floor((diffMs % 60000) / 1000);
            return `${diffMinutes}:${diffSeconds < 10 ? '0' + diffSeconds : diffSeconds}`;
          }
        } catch (e) {
          console.error("Error calculating time from legacy timestamps:", e);
        }
      }

      // Calculate from question timings if available
      if (result?.questionTimings && Array.isArray(result.questionTimings) && result.questionTimings.length > 0) {
        const totalTimeSpent = result.questionTimings.reduce(
          (total, timing) => total + (timing.timeSpent && typeof timing.timeSpent === 'number' ? timing.timeSpent : 0), 0
        );
        if (totalTimeSpent > 0) {
          const minutes = Math.floor(totalTimeSpent / 60);
          const seconds = totalTimeSpent % 60;
          return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        }
      }

      // Calculate from answers if they have timeSpent
      if (result?.answers && Array.isArray(result.answers) && result.answers.length > 0) {
        const hasTimeSpent = result.answers.some(a => (a as any).timeSpent !== undefined && typeof (a as any).timeSpent === 'number');
        if (hasTimeSpent) {
          const totalTimeSpent = result.answers.reduce(
            (total, answer) => total + ((answer as any).timeSpent && typeof (answer as any).timeSpent === 'number' ? (answer as any).timeSpent : 0), 0
          );
          if (totalTimeSpent > 0) {
            const minutes = Math.floor(totalTimeSpent / 60);
            const seconds = totalTimeSpent % 60;
            return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
          }
        }
      }

      // If we have exam duration, use a percentage of that based on score
      if (examData?.duration && typeof examData.duration === 'number' && examData.duration > 0) {
        const durationMinutes = examData.duration;
        // Assume student used 50-90% of available time based on score
        const estimatedPercentage = Math.max(0.5, Math.min(0.9, score / 100));
        const estimatedMinutes = Math.floor(durationMinutes * estimatedPercentage);
        const estimatedSeconds = Math.floor(Math.random() * 60);
        return `${estimatedMinutes}:${estimatedSeconds < 10 ? '0' + estimatedSeconds : estimatedSeconds}`;
      }

      // If we have answers but no time data, estimate based on number of questions
      if (result?.answers && Array.isArray(result.answers) && result.answers.length > 0) {
        // Assume average of 1-2 minutes per question
        const estimatedMinutes = Math.floor(result.answers.length * (1 + Math.random()));
        const estimatedSeconds = Math.floor(Math.random() * 60);
        return `${estimatedMinutes}:${estimatedSeconds < 10 ? '0' + estimatedSeconds : estimatedSeconds}`;
      }

      // If all else fails, return 0:00 to indicate no data
      return "0:00";
    } catch (error) {
      console.error("Error calculating time spent:", error);
      return "0:00";
    }
  };

  // Calculate difficulty breakdown from answers
  const calculateCategoryBreakdown = () => {
    // First check if we have real category breakdown data
    if (result?.categoryBreakdown && result.categoryBreakdown.length > 0) {
      return result.categoryBreakdown;
    }

    // If no answers, return mock data with clear indication
    if (!result?.answers || result.answers.length === 0) {
      return [
        { category: "Easy Questions", correct: 3, total: 4, percentage: 75 },
        { category: "Medium Questions", correct: 2, total: 3, percentage: 67 },
        { category: "Hard Questions", correct: 2, total: 3, percentage: 67 },
      ];
    }

    // Try to categorize based on question data if available
    if (exam?.questions && exam.questions.length > 0) {
      // Create a map of question IDs to difficulty levels
      const questionDifficulties = new Map();
      exam.questions.forEach(question => {
        if (question._id) {
          const difficulty = question.difficulty || "Medium";
          questionDifficulties.set(question._id, difficulty);
        }
      });

      // Group answers by difficulty
      const difficultyMap = new Map();
      result.answers.forEach(answer => {
        const questionId = typeof answer.questionId === 'string' ?
          answer.questionId : (answer.questionId as any)?._id;

        if (!questionId) return;

        // Get difficulty from question data or default to Medium
        const difficulty = questionDifficulties.get(questionId) || "Medium";
        const difficultyCategory = `${difficulty} Questions`;

        if (!difficultyMap.has(difficultyCategory)) {
          difficultyMap.set(difficultyCategory, { correct: 0, total: 0 });
        }

        const data = difficultyMap.get(difficultyCategory);
        data.total += 1;
        if (answer.isCorrect) {
          data.correct += 1;
        }

        difficultyMap.set(difficultyCategory, data);
      });

      // Convert map to array of difficulty objects
      const difficulties = Array.from(difficultyMap.entries()).map(([category, data]) => ({
        category,
        correct: data.correct,
        total: data.total,
        percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
      }));

      // Make sure we have all three difficulty levels
      const difficultyLevels = ["Easy Questions", "Medium Questions", "Hard Questions"];
      difficultyLevels.forEach(level => {
        if (!difficulties.some(d => d.category === level)) {
          difficulties.push({
            category: level,
            correct: 0,
            total: 0,
            percentage: 0
          });
        }
      });

      // Sort by difficulty level
      difficulties.sort((a, b) => {
        const order = { "Easy Questions": 1, "Medium Questions": 2, "Hard Questions": 3 };
        return order[a.category as keyof typeof order] - order[b.category as keyof typeof order];
      });

      return difficulties.length > 0 ? difficulties : createMockDifficultyBreakdown();
    }

    return createMockDifficultyBreakdown();
  };



  // Helper function to create mock difficulty breakdown
  const createMockDifficultyBreakdown = () => {
    if (!result?.answers || result.answers.length === 0) {
      return [
        { category: "Easy Questions", correct: 3, total: 4, percentage: 75 },
        { category: "Medium Questions", correct: 2, total: 3, percentage: 67 },
        { category: "Hard Questions", correct: 2, total: 3, percentage: 67 },
      ];
    }

    const totalQuestions = result.answers.length;
    const correctAnswers = result.answers.filter(a => a.isCorrect).length;

    // Distribute questions by difficulty
    const easyTotal = Math.floor(totalQuestions * 0.4);
    const mediumTotal = Math.floor(totalQuestions * 0.4);
    const hardTotal = totalQuestions - easyTotal - mediumTotal;

    // Distribute correct answers by difficulty (assuming better performance on easier questions)
    let remainingCorrect = correctAnswers;

    // For easy questions, assume 70-90% correct
    const easyCorrectPercentage = Math.min(0.9, Math.max(0.7, correctAnswers / totalQuestions + 0.1));
    const easyCorrect = Math.min(Math.floor(easyTotal * easyCorrectPercentage), remainingCorrect);
    remainingCorrect -= easyCorrect;

    // For medium questions, assume 50-70% correct
    const mediumCorrectPercentage = Math.min(0.7, Math.max(0.5, correctAnswers / totalQuestions));
    const mediumCorrect = Math.min(Math.floor(mediumTotal * mediumCorrectPercentage), remainingCorrect);
    remainingCorrect -= mediumCorrect;

    // Remaining correct answers go to hard questions
    const hardCorrect = Math.max(0, remainingCorrect);

    return [
      {
        category: "Easy Questions",
        correct: easyCorrect,
        total: easyTotal,
        percentage: easyTotal > 0 ? Math.round((easyCorrect / easyTotal) * 100) : 0
      },
      {
        category: "Medium Questions",
        correct: mediumCorrect,
        total: mediumTotal,
        percentage: mediumTotal > 0 ? Math.round((mediumCorrect / mediumTotal) * 100) : 0
      },
      {
        category: "Hard Questions",
        correct: hardCorrect,
        total: hardTotal,
        percentage: hardTotal > 0 ? Math.round((hardCorrect / hardTotal) * 100) : 0
      }
    ];
  };

  // Generate question analysis with real data where available
  const generateQuestionAnalysis = () => {
    if (!result?.answers || result.answers.length === 0) {
      return [
        {
          number: 1,
          correct: true,
          points: 10,
          difficulty: "Easy",
          timeSpent: "1:20",
          type: "MCQ",
          isMock: true,
          questionText: "What is the capital of France?",
          userAnswer: "Paris",
          correctAnswer: "Paris",
          averageTime: "1:45",
          classSuccessRate: 92,
          topic: "Geography"
        },
        {
          number: 2,
          correct: true,
          points: 10,
          difficulty: "Easy",
          timeSpent: "2:05",
          type: "MCQ",
          isMock: true,
          questionText: "What is 7 × 8?",
          userAnswer: "56",
          correctAnswer: "56",
          averageTime: "1:30",
          classSuccessRate: 88,
          topic: "Arithmetic"
        },
        {
          number: 3,
          correct: false,
          points: 10,
          difficulty: "Medium",
          timeSpent: "3:15",
          type: "MCQ",
          isMock: true,
          questionText: "What is the chemical symbol for gold?",
          userAnswer: "Go",
          correctAnswer: "Au",
          averageTime: "2:20",
          classSuccessRate: 65,
          topic: "Chemistry"
        },
        {
          number: 4,
          correct: true,
          points: 10,
          difficulty: "Medium",
          timeSpent: "2:45",
          type: "MCQ",
          isMock: true,
          questionText: "Who wrote 'Romeo and Juliet'?",
          userAnswer: "William Shakespeare",
          correctAnswer: "William Shakespeare",
          averageTime: "2:10",
          classSuccessRate: 78,
          topic: "Literature"
        },
        {
          number: 5,
          correct: false,
          points: 10,
          difficulty: "Hard",
          timeSpent: "4:10",
          type: "Fill-up",
          isMock: true,
          questionText: "The process of converting a gas to a liquid is called ____.",
          userAnswer: "solidification",
          correctAnswer: "condensation",
          averageTime: "3:45",
          classSuccessRate: 42,
          topic: "Physics"
        },
        {
          number: 6,
          correct: true,
          points: 10,
          difficulty: "Medium",
          timeSpent: "2:30",
          type: "MCQ",
          isMock: true,
          questionText: "What is the largest planet in our solar system?",
          userAnswer: "Jupiter",
          correctAnswer: "Jupiter",
          averageTime: "2:15",
          classSuccessRate: 82,
          topic: "Astronomy"
        },
        {
          number: 7,
          correct: true,
          points: 10,
          difficulty: "Easy",
          timeSpent: "1:50",
          type: "True/False",
          isMock: true,
          questionText: "The Great Wall of China is visible from space.",
          userAnswer: "False",
          correctAnswer: "False",
          averageTime: "1:30",
          classSuccessRate: 68,
          topic: "Geography"
        },
        {
          number: 8,
          correct: false,
          points: 10,
          difficulty: "Hard",
          timeSpent: "5:20",
          type: "MCQ",
          isMock: true,
          questionText: "What is the square root of 169?",
          userAnswer: "12",
          correctAnswer: "13",
          averageTime: "2:50",
          classSuccessRate: 55,
          topic: "Mathematics"
        },
        {
          number: 9,
          correct: true,
          points: 10,
          difficulty: "Medium",
          timeSpent: "3:05",
          type: "Fill-up",
          isMock: true,
          questionText: "The process of plants making their own food is called ____.",
          userAnswer: "photosynthesis",
          correctAnswer: "photosynthesis",
          averageTime: "2:40",
          classSuccessRate: 72,
          topic: "Biology"
        },
        {
          number: 10,
          correct: true,
          points: 10,
          difficulty: "Medium",
          timeSpent: "2:40",
          type: "MCQ",
          isMock: true,
          questionText: "Who painted the Mona Lisa?",
          userAnswer: "Leonardo da Vinci",
          correctAnswer: "Leonardo da Vinci",
          averageTime: "2:20",
          classSuccessRate: 85,
          topic: "Art History"
        },
      ];
    }

    // Create a map of question IDs to question details if exam data is available
    const questionDetails = new Map();
    if (exam?.questions) {
      exam.questions.forEach(question => {
        if (question._id) {
          // Handle different property names that might exist in the question object
          const questionText = question.text ||
                              (question as any).question ||
                              "Question text not available";

          const correctAnswer = (question as any).answer ||
                               (question as any).correctAnswer ||
                               "Answer not available";

          const topic = (question as any).topic ||
                       (question as any).subject ||
                       "General";

          questionDetails.set(question._id, {
            difficulty: question.difficulty || "Medium",
            type: question.type || "MCQ",
            points: question.points || 10,
            questionText,
            correctAnswer,
            options: question.options || [],
            topic
          });
        }
      });
    }

    // Create a map of question IDs to timing data if available
    const questionTimings = new Map();
    if (result.questionTimings && Array.isArray(result.questionTimings)) {
      result.questionTimings.forEach(timing => {
        if (timing.questionId && timing.timeSpent) {
          const minutes = Math.floor(timing.timeSpent / 60);
          const seconds = timing.timeSpent % 60;
          questionTimings.set(timing.questionId, `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`);
        }
      });
    }

    // Create a map for class statistics if available
    const classStats = new Map();
    // Check if class statistics are available
    if (result.classStats && Array.isArray(result.classStats)) {
      result.classStats.forEach((stat) => {
        if (stat.questionId) {
          classStats.set(stat.questionId, {
            averageTime: stat.averageTime || "N/A",
            successRate: stat.successRate || 0
          });
        }
      });
    }

    // If no class statistics are available, generate mock data based on difficulty
    if (classStats.size === 0 && exam?.questions) {
      exam.questions.forEach(question => {
        if (question._id) {
          // Generate mock class statistics based on question difficulty
          const difficulty = question.difficulty || "Medium";
          let mockSuccessRate = 0;

          // Higher success rates for easier questions
          if (difficulty === "Easy") {
            mockSuccessRate = 75 + Math.floor(Math.random() * 20); // 75-95%
          } else if (difficulty === "Medium") {
            mockSuccessRate = 60 + Math.floor(Math.random() * 20); // 60-80%
          } else {
            mockSuccessRate = 40 + Math.floor(Math.random() * 30); // 40-70%
          }

          // Generate mock average time based on difficulty
          const minutes = difficulty === "Easy" ? 1 : difficulty === "Medium" ? 2 : 3;
          const seconds = Math.floor(Math.random() * 60);
          const mockAverageTime = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

          classStats.set(question._id, {
            averageTime: mockAverageTime,
            successRate: mockSuccessRate
          });
        }
      });
    }

    return result.answers.map((answer, index) => {
      const questionId = typeof answer.questionId === 'string' ?
        answer.questionId : (answer.questionId as any)?._id;

      // Get question details if available
      const details = questionId ? questionDetails.get(questionId) : null;

      // Get timing data if available
      const timeSpent = questionId && questionTimings.has(questionId)
        ? questionTimings.get(questionId)
        : `${Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;

      // Get class statistics if available
      const stats = questionId && classStats.has(questionId)
        ? classStats.get(questionId)
        : {
            averageTime: `${Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
            successRate: Math.floor(Math.random() * 100)
          };

      // Generate mock data for missing fields
      const difficultyLevel = details?.difficulty || ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)];
      const questionType = details?.type || "MCQ";
      const questionText = details?.questionText || `Question ${index + 1} text`;
      const correctAnswer = details?.correctAnswer || "Sample answer";
      const userAnswer = answer.answer || (answer as any).userAnswer || "No answer provided";
      const topic = details?.topic || ["Mathematics", "Science", "Language", "History", "Geography"][Math.floor(Math.random() * 5)];

      return {
        number: index + 1,
        correct: answer.isCorrect,
        points: answer.points || details?.points || 10,
        difficulty: difficultyLevel,
        timeSpent,
        type: questionType,
        isMock: !details, // Flag to indicate if this is mock data
        questionText,
        userAnswer,
        correctAnswer,
        averageTime: stats.averageTime,
        classSuccessRate: stats.successRate,
        topic
      };
    });
  };

  // Calculate difficulty-based recommendations
  const getDifficultyRecommendations = () => {
    const difficultyBreakdown = calculateCategoryBreakdown();

    // Get performance by difficulty level
    const easyPerformance = difficultyBreakdown.find(d => d.category === "Easy Questions") || { percentage: 0 };
    const mediumPerformance = difficultyBreakdown.find(d => d.category === "Medium Questions") || { percentage: 0 };
    const hardPerformance = difficultyBreakdown.find(d => d.category === "Hard Questions") || { percentage: 0 };

    // Generate strengths
    const strengths = [];
    if (easyPerformance.percentage >= 80) strengths.push("Strong grasp of fundamental concepts (Easy questions)");
    if (mediumPerformance.percentage >= 70) strengths.push("Good understanding of intermediate concepts (Medium questions)");
    if (hardPerformance.percentage >= 60) strengths.push("Solid performance on challenging problems (Hard questions)");

    // Generate areas for improvement
    const improvements = [];
    if (easyPerformance.percentage < 80) improvements.push("Review basic concepts to improve performance on Easy questions");
    if (mediumPerformance.percentage < 70) improvements.push("Practice more intermediate-level problems (Medium questions)");
    if (hardPerformance.percentage < 60) improvements.push("Focus on advanced concepts to improve on Hard questions");

    // If no specific strengths found, add a generic one
    if (strengths.length === 0) {
      const bestCategory = [...difficultyBreakdown].sort((a, b) => b.percentage - a.percentage)[0];
      strengths.push(`Relatively better performance in ${bestCategory.category.toLowerCase()} (${bestCategory.percentage}%)`);
    }

    // If no specific improvements found, add a generic one
    if (improvements.length === 0) {
      improvements.push("Continue practicing across all difficulty levels to maintain your performance");
    }

    return { strengths, improvements };
  };

  // Get difficulty-based recommendations
  const difficultyRecommendations = getDifficultyRecommendations();

  // Analysis data (use real data or fallbacks)
  const mockAnalysis = {
    timeSpent: calculateTimeSpent(),
    attemptNumber: currentAttempt,
    maxAttempts: maxAttempts,
    categoryBreakdown: calculateCategoryBreakdown(),
    questionAnalysis: generateQuestionAnalysis(),
    difficultyRecommendations: difficultyRecommendations,
    nextAttemptAvailable: examData?.endDate ?
      new Date(new Date(examData.endDate).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString() :
      "Immediately"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-gradient-to-r from-indigo-800 to-indigo-700 text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold flex items-center">
            <span className="bg-white text-indigo-800 rounded-lg p-1 mr-2">TA</span>
            Tech Anubhavi
          </Link>
          <nav className="space-x-4">
            <Link href="/dashboard/student" className="hover:underline">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Exam Result</h1>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <Card className="mb-6 overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white p-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">{examTitle} {examSubject && `- ${examSubject}`}</h1>
                  <p className="text-indigo-200">
                    Attempt {mockAnalysis.attemptNumber} of {mockAnalysis.maxAttempts} | Completed on {completedDate}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Badge className="bg-white text-indigo-800 px-3 py-1 text-sm">
                    Tech Anubhavi International School
                  </Badge>
                </div>
              </div>
            </div>

            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 p-6 flex flex-col items-center justify-center bg-white">
                  <div className="relative h-64 w-64">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl font-bold">{score}%</div>
                        <Badge className="mt-2 text-sm px-3 py-1" variant={score >= 75 ? "default" : "secondary"}>
                          {rating.label}
                        </Badge>
                      </div>
                    </div>
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      <circle
                        className="text-slate-100"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className={`${rating.color} transition-all duration-1000 ease-in-out`}
                        strokeWidth="10"
                        strokeDasharray={`${score * 2.51} 251`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                        style={{
                          transformOrigin: "center",
                          transform: "rotate(-90deg)",
                        }}
                      />
                    </svg>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-slate-500">
                      Your score is {score >= 75 ? "above" : "below"} the class average of 76%
                    </p>
                    <p className="text-sm text-indigo-600 mt-2">
                      Rank: <span className="font-bold">2nd</span> out of 32 students
                    </p>
                    <div className="mt-3 inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      Attempt {mockAnalysis.attemptNumber} of {mockAnalysis.maxAttempts} • Your highest score will be considered
                    </div>
                  </div>
                </div>

                <div className="md:w-1/2 p-6 bg-slate-50 border-l">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                    Performance Summary
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                      <div className="flex items-center mb-2">
                        <Award className="h-5 w-5 mr-2 text-blue-500" />
                        <h4 className="font-medium">Correct Answers</h4>
                      </div>
                      <p className="text-3xl font-bold">
                        {result?.answers && result.answers.length > 0
                          ? `${result.answers.filter(a => a.isCorrect).length}/${result.answers.length}`
                          : `${correct}/${total}`}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result?.answers && result.answers.length > 0
                          ? `${Math.round((result.answers.filter(a => a.isCorrect).length / result.answers.length) * 100)}% accuracy`
                          : `${Math.round((correct / total) * 100)}% accuracy`}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                      <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 mr-2 text-purple-500" />
                        <h4 className="font-medium">Time Spent</h4>
                      </div>
                      <p className="text-3xl font-bold">{mockAnalysis.timeSpent || "0:00"}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result?.timeSpent
                          ? `${Math.floor(result.timeSpent / 60)} min ${result.timeSpent % 60} sec`
                          : mockAnalysis.timeSpent !== "0:00"
                            ? "Estimated time"
                            : "No time data available"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center mb-2">
                      <Star className="h-5 w-5 mr-2 text-amber-500" />
                      <h4 className="font-medium">Points Earned</h4>
                    </div>
                    <div className="flex items-center">
                      <p className="text-3xl font-bold">
                        {result?.answers && result.answers.length > 0
                          ? result.answers.reduce((sum, a) => sum + (a.isCorrect ? (a.points || 10) : 0), 0)
                          : correct * 10}
                      </p>
                      <p className="text-slate-500 ml-2">/
                        {result?.answers && result.answers.length > 0
                          ? result.answers.reduce((sum, a) => sum + (a.points || 10), 0)
                          : total * 10} points
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result?.answers && result.answers.length > 0
                        ? `${Math.round((result.answers.reduce((sum, a) => sum + (a.isCorrect ? (a.points || 10) : 0), 0) /
                          result.answers.reduce((sum, a) => sum + (a.points || 10), 0)) * 100)}% of total points`
                        : `${Math.round((correct * 10 / (total * 10)) * 100)}% of total points`}
                    </p>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Teacher's Feedback</h4>
                    <div className="bg-white p-3 rounded-lg border border-slate-100 text-sm">
                      Alex has shown good understanding of the concepts, especially in geometry. However, there's room
                      for improvement in algebra. I recommend focusing on equation solving and algebraic expressions for
                      better results in future exams.
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Attempt Information</h4>
                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Attempt</p>
                          <p className="font-medium">{mockAnalysis.attemptNumber} of {mockAnalysis.maxAttempts}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Highest Score</p>
                          <p className="font-medium">
                            {score}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Remaining Attempts</p>
                          <p className="font-medium">{mockAnalysis.maxAttempts - mockAnalysis.attemptNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Next Attempt Available</p>
                          <p className="font-medium">{mockAnalysis.nextAttemptAvailable}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="categories" className="text-sm">
                <BarChart2 className="h-4 w-4 mr-2" />
                Difficulty Breakdown
              </TabsTrigger>
              <TabsTrigger value="questions" className="text-sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Question Analysis
              </TabsTrigger>
              <TabsTrigger value="comparison" className="text-sm">
                <BarChart2 className="h-4 w-4 mr-2" />
                Comparison
              </TabsTrigger>
            </TabsList>

            <TabsContent value="categories">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Difficulty Breakdown</CardTitle>
                  <CardDescription>Your performance across different difficulty levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mockAnalysis.categoryBreakdown.map((category, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-lg">{category.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {category.correct}/{category.total} correct
                            </p>
                          </div>
                          <Badge
                            variant={category.percentage >= 75 ? "default" : "secondary"}
                            className={
                              category.percentage >= 85
                                ? "bg-green-500"
                                : category.percentage >= 70
                                  ? "bg-blue-500"
                                  : category.percentage >= 50
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                            }
                          >
                            {category.percentage}%
                          </Badge>
                        </div>
                        <Progress
                          value={category.percentage}
                          className="h-3 rounded-full"
                          indicatorClassName={`rounded-full ${
                            category.percentage >= 85
                              ? "bg-green-500"
                              : category.percentage >= 70
                                ? "bg-blue-500"
                                : category.percentage >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Recommendations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <h4 className="font-medium text-green-800 mb-2">Strengths</h4>
                        <ul className="list-disc pl-5 text-sm text-green-700 space-y-1">
                          {mockAnalysis.difficultyRecommendations.strengths.map((strength, i) => (
                            <li key={i}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <h4 className="font-medium text-amber-800 mb-2">Areas for Improvement</h4>
                        <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1">
                          {mockAnalysis.difficultyRecommendations.improvements.map((improvement, i) => (
                            <li key={i}>{improvement}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>



            <TabsContent value="questions">
              <QuestionAnalysis attemptId={resultId} />
            </TabsContent>

            <TabsContent value="comparison">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Performance Comparison</CardTitle>
                  <CardDescription>Compare your performance across attempts and with classmates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Score Distribution</h3>
                      <div className="bg-white p-4 rounded-lg border border-slate-100">
                        <div className="h-64 flex items-end justify-around">
                          {[
                            { range: "0-50%", count: 2, color: "bg-red-500" },
                            { range: "51-60%", count: 3, color: "bg-orange-500" },
                            { range: "61-70%", count: 5, color: "bg-yellow-500" },
                            { range: "71-80%", count: 10, color: "bg-blue-500" },
                            { range: "81-90%", count: 8, color: "bg-indigo-500" },
                            { range: "91-100%", count: 4, color: "bg-green-500" },
                          ].map((bar, i) => (
                            <div key={i} className="flex flex-col items-center">
                              <div
                                className={`w-12 ${bar.color} rounded-t-md`}
                                style={{ height: `${(bar.count / 10) * 200}px` }}
                              ></div>
                              <p className="mt-2 text-xs font-medium">{bar.range}</p>
                              <p className="text-xs text-muted-foreground">{bar.count} students</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 text-center">
                          <div className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                            Your score: {score}%
                          </div>
                          {!result?.classRank && (
                            <div className="mt-2 text-xs text-slate-500">
                              <Info className="h-3 w-3 inline mr-1" />
                              This is simulated data. Real comparison will be available when more students complete the exam.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Percentile Ranking</h3>
                      <div className="bg-white p-4 rounded-lg border border-slate-100">
                        <div className="mb-6">
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium">Your Percentile</p>
                            <p className="text-sm font-medium">92nd</p>
                          </div>
                          <div className="h-3 w-full rounded-full bg-slate-100">
                            <div className="h-3 rounded-full bg-indigo-500" style={{ width: "92%" }} />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            You performed better than 92% of your classmates
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                                1
                              </div>
                              <p className="ml-2 font-medium">Maria Garcia</p>
                            </div>
                            <p className="font-bold">92%</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                                2
                              </div>
                              <p className="ml-2 font-medium">Alex Johnson (You)</p>
                            </div>
                            <p className="font-bold">{score}%</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                                3
                              </div>
                              <p className="ml-2 font-medium">James Wilson</p>
                            </div>
                            <p className="font-bold">82%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Attempts Comparison</h3>
                    <div className="bg-white p-4 rounded-lg border border-slate-100">
                      <div className="mb-4">
                        <p className="text-sm text-slate-500 mb-2">
                          Compare your performance across different attempts for this exam
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                            Current Attempt: {mockAnalysis.attemptNumber}
                          </Badge>
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            Highest Score: {score}%
                          </Badge>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                            Attempts Remaining: {mockAnalysis.maxAttempts - mockAnalysis.attemptNumber}
                          </Badge>
                        </div>
                      </div>

                      <div className="h-64 flex items-end">
                        <div className="w-full h-full flex flex-col">
                          <div className="flex-1 border-b border-slate-200 relative">
                            {[100, 80, 60, 40, 20].map((mark, i) => (
                              <div
                                key={i}
                                className="absolute left-0 right-0 border-t border-slate-100 text-xs text-slate-400"
                                style={{ bottom: `${mark}%`, transform: "translateY(50%)" }}
                              >
                                <span className="absolute -left-6">{mark}%</span>
                              </div>
                            ))}

                            <div className="absolute inset-0 flex items-end">
                              <div className="w-full flex items-end justify-around">
                                {mockAnalysis.attemptNumber === 1 ? (
                                  // If this is the first attempt, show a message
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center p-4">
                                      <p className="text-slate-500 mb-2">This is your first attempt</p>
                                      <p className="text-sm text-slate-400">Complete more attempts to see your progress over time</p>
                                    </div>
                                  </div>
                                ) : (
                                  // Otherwise, show attempt data
                                  <div className="w-full flex items-end justify-around">
                                    {[
                                      { exam: "Quiz 1", score: 65 },
                                      { exam: "Quiz 2", score: 72 },
                                      { exam: "Mid-Term", score: 78 },
                                      { exam: "Quiz 3", score: 75 },
                                      { exam: "Current", score: score },
                                    ].map((item, i, arr) => (
                                      <div key={i} className="flex flex-col items-center relative group">
                                        <div
                                          className={`w-12 ${
                                            i === arr.length - 1 ? "bg-indigo-500" : "bg-slate-300"
                                          } rounded-t-md`}
                                          style={{ height: `${item.score * 0.6}%` }}
                                        ></div>
                                        {i > 0 && (
                                          <div
                                            className="absolute h-1 bg-slate-300 -z-10"
                                            style={{
                                              width: "100%",
                                              bottom: `${arr[i - 1].score * 0.6}%`,
                                              left: "-50%",
                                              transform: `rotate(${Math.atan2(
                                                (item.score - arr[i - 1].score) * 0.6,
                                                100,
                                              )}rad)`,
                                              transformOrigin: "left bottom",
                                            }}
                                          ></div>
                                        )}
                                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs rounded px-2 py-1">
                                          {item.score}%
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="h-6 flex justify-around items-center">
                            {[
                              { exam: "Quiz 1", score: 65 },
                              { exam: "Quiz 2", score: 72 },
                              { exam: "Mid-Term", score: 78 },
                              { exam: "Quiz 3", score: 75 },
                              { exam: "Current", score: score },
                            ].map((item, i) => (
                              <div key={i} className="text-xs font-medium text-center w-12">
                                {item.exam}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center gap-4 mt-8">
            {mockAnalysis.attemptNumber < mockAnalysis.maxAttempts ? (
              <Button
                asChild
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              >
                <Link href={`/exam/${examId}`}>Retake Exam</Link>
              </Button>
            ) : (
              <Button
                disabled
                className="bg-gray-400 cursor-not-allowed"
                title="Maximum attempts reached"
              >
                No Attempts Left
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/dashboard/student">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
