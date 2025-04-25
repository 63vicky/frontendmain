"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Award, Star, Clock, BarChart2, BookOpen, Download, Printer, Share2 } from "lucide-react"
import { Suspense } from "react"

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
  const searchParams = useSearchParams()
  const score = Number.parseInt(searchParams.get("score") || "0")
  const correct = Number.parseInt(searchParams.get("correct") || "0")
  const total = Number.parseInt(searchParams.get("total") || "10")
  const ratingParam = searchParams.get("rating") || ""

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

  // Mock data for detailed analysis
  const mockAnalysis = {
    timeSpent: "45:30",
    attemptNumber: 1,
    maxAttempts: 5,
    categoryBreakdown: [
      { category: "Algebra", correct: 3, total: 4, percentage: 75 },
      { category: "Geometry", correct: 2, total: 3, percentage: 67 },
      { category: "Arithmetic", correct: 2, total: 3, percentage: 67 },
    ],
    questionAnalysis: [
      { number: 1, correct: true, points: 10, difficulty: "Easy", timeSpent: "1:20", type: "MCQ" },
      { number: 2, correct: true, points: 10, difficulty: "Easy", timeSpent: "2:05", type: "MCQ" },
      { number: 3, correct: false, points: 10, difficulty: "Medium", timeSpent: "3:15", type: "MCQ" },
      { number: 4, correct: true, points: 10, difficulty: "Medium", timeSpent: "2:45", type: "MCQ" },
      { number: 5, correct: false, points: 10, difficulty: "Hard", timeSpent: "4:10", type: "Fill-up" },
      { number: 6, correct: true, points: 10, difficulty: "Medium", timeSpent: "2:30", type: "MCQ" },
      { number: 7, correct: true, points: 10, difficulty: "Easy", timeSpent: "1:50", type: "True/False" },
      { number: 8, correct: false, points: 10, difficulty: "Hard", timeSpent: "5:20", type: "MCQ" },
      { number: 9, correct: true, points: 10, difficulty: "Medium", timeSpent: "3:05", type: "Fill-up" },
      { number: 10, correct: true, points: 10, difficulty: "Medium", timeSpent: "2:40", type: "MCQ" },
    ],
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
                  <h1 className="text-2xl font-bold">Mathematics - Chapter 3</h1>
                  <p className="text-indigo-200">
                    Attempt {mockAnalysis.attemptNumber} of {mockAnalysis.maxAttempts} | Completed on April 25, 2025
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
                      Attempt 1 of 5 • Your highest score will be considered
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
                        {correct}/{total}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                      <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 mr-2 text-purple-500" />
                        <h4 className="font-medium">Time Spent</h4>
                      </div>
                      <p className="text-3xl font-bold">{mockAnalysis.timeSpent}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center mb-2">
                      <Star className="h-5 w-5 mr-2 text-amber-500" />
                      <h4 className="font-medium">Points Earned</h4>
                    </div>
                    <div className="flex items-center">
                      <p className="text-3xl font-bold">{correct * 10}</p>
                      <p className="text-slate-500 ml-2">/ {total * 10} points</p>
                    </div>
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
                          <p className="font-medium">1 of 5</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Highest Score</p>
                          <p className="font-medium">{score}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Remaining Attempts</p>
                          <p className="font-medium">4</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Next Attempt Available</p>
                          <p className="font-medium">Immediately</p>
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
                Category Breakdown
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
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>Your performance across different topics</CardDescription>
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
                          <li>Strong understanding of geometry concepts</li>
                          <li>Good at solving basic algebra problems</li>
                          <li>Excellent performance on true/false questions</li>
                        </ul>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <h4 className="font-medium text-amber-800 mb-2">Areas for Improvement</h4>
                        <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1">
                          <li>Complex algebraic expressions</li>
                          <li>Fill-in-the-blank questions</li>
                          <li>Time management on difficult questions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Question Analysis</CardTitle>
                  <CardDescription>Detailed breakdown of your performance on each question</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockAnalysis.questionAnalysis.map((question, i) => (
                      <div
                        key={i}
                        className={`border rounded-xl p-4 ${
                          question.correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold ${
                                question.correct ? "bg-green-500" : "bg-red-500"
                              }`}
                            >
                              {question.number}
                            </div>
                            <div className="ml-3">
                              <p className="font-medium">Question {question.number}</p>
                              <div className="flex gap-2 mt-1">
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
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={question.correct ? "outline" : "secondary"}
                            className={`${question.correct ? "border-green-500 text-green-700" : "border-red-500 text-red-700"}`}
                          >
                            {question.points} pts
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center mt-3 text-sm">
                          <div className={`${question.correct ? "text-green-700" : "text-red-700"} font-medium`}>
                            {question.correct ? "Correct" : "Incorrect"}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-slate-500" />
                            <span className="text-slate-600">{question.timeSpent}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Performance Comparison</CardTitle>
                  <CardDescription>How you compare with your classmates</CardDescription>
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

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Progress Over Time</h3>
                    <div className="bg-white p-4 rounded-lg border border-slate-100">
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
            <Button
              asChild
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
            >
              <Link href={`/exam/${params.id}`}>Retake Exam</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/student">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
